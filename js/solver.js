/* ══════════════════════════════════════════
   HE-Lab — solver.js
   Módulo 3: Difusión de H con trampas (McNabb-Foster)
   + criterio HEDE
   ══════════════════════════════════════════ */

const kB = 8.617e-5; // eV/K (Boltzmann)
const R_gas = 8.314;  // J/(mol·K)
const VH = 2.0e-6;    // m³/mol — partial molar volume of H in Fe

// ── RUN SIMULATION ──
function runSimulation() {
  // Read parameters
  const DL    = parseFloat(document.getElementById('sim-DL').value);    // cm²/s
  const C0    = parseFloat(document.getElementById('sim-C0').value);    // wt ppm
  const T     = parseFloat(document.getElementById('sim-T').value);     // K
  const Etrap = parseFloat(document.getElementById('sim-Etrap').value); // eV
  const NT    = parseFloat(document.getElementById('sim-NT').value);    // sites/cm³
  const L     = parseFloat(document.getElementById('sim-L').value);     // mm
  const nodes = parseInt(document.getElementById('sim-nodes').value);
  const tTotal= parseFloat(document.getElementById('sim-time').value);  // s
  const sigma = parseFloat(document.getElementById('sim-stress').value);// MPa

  // Derived
  const Lcm   = L * 0.1;       // mm → cm
  const dx    = Lcm / (nodes - 1);
  const NL    = 8.46e22;        // lattice sites/cm³ for BCC Fe

  // Trapping rate constant k and release rate p (McNabb-Foster)
  const k_trap = DL / (dx * dx); // simplified capture rate
  const p_trap = k_trap * Math.exp(-Etrap / (kB * T)); // thermal release

  // Stability: dt < dx² / (2·DL)
  let dt = 0.4 * dx * dx / DL;
  const nSteps = Math.ceil(tTotal / dt);
  dt = tTotal / nSteps;

  // Check CFL
  const CFL = DL * dt / (dx * dx);
  if (CFL > 0.5) {
    alert(`Inestabilidad numérica: CFL = ${CFL.toFixed(3)} > 0.5. Reduce el tiempo o aumenta los nodos.`);
    return;
  }

  // Initialize arrays
  const CL = new Float64Array(nodes); // lattice H concentration
  const CT = new Float64Array(nodes); // trapped H concentration
  const thetaT = new Float64Array(nodes); // trap occupancy fraction

  // Boundary condition: C(x=0, t) = C0 (constant surface concentration)
  CL[0] = C0;

  // Stress-assisted diffusion factor
  // J = -D·(dC/dx - C·VH·σ/(RT))
  const stressFactor = sigma > 0 ? (VH * sigma * 1e6) / (R_gas * T) : 0; // 1/m → need to convert

  // Time stepping (FTCS explicit)
  const snapTimes = [0.1, 0.25, 0.5, 0.75, 1.0].map(f => Math.round(f * nSteps));
  const snapshots = [];
  const timePoints = [];
  const maxCL_history = [];
  const maxCT_history = [];

  for (let step = 0; step < nSteps; step++) {
    // Save snapshots
    if (snapTimes.includes(step) || step === nSteps - 1) {
      snapshots.push({
        CL: Array.from(CL),
        CT: Array.from(CT),
        time: (step * dt).toFixed(1)
      });
    }

    // Record max values for time plot
    if (step % Math.max(1, Math.floor(nSteps / 200)) === 0) {
      timePoints.push(step * dt);
      maxCL_history.push(Math.max(...CL));
      maxCT_history.push(Math.max(...CT));
    }

    // Update lattice concentration (Fick's 2nd law + stress)
    const CLnew = new Float64Array(nodes);
    CLnew[0] = C0; // boundary

    for (let i = 1; i < nodes - 1; i++) {
      const d2C = (CL[i+1] - 2*CL[i] + CL[i-1]) / (dx * dx);
      const dC  = (CL[i+1] - CL[i-1]) / (2 * dx);

      // McNabb-Foster: dCL/dt = DL·d²CL/dx² - dCT/dt
      // dCT/dt = k·CL·(1 - θT) - p·θT
      thetaT[i] = NT > 0 ? CT[i] / NT : 0;
      if (thetaT[i] > 1) thetaT[i] = 1;
      if (thetaT[i] < 0) thetaT[i] = 0;

      const dCTdt = k_trap * CL[i] * (1 - thetaT[i]) - p_trap * thetaT[i];
      CLnew[i] = CL[i] + dt * (DL * d2C - dCTdt);

      // Update trapped
      CT[i] += dt * dCTdt;
      if (CT[i] < 0) CT[i] = 0;
      if (CT[i] > NT) CT[i] = NT;
    }

    // Zero-flux boundary at x = L
    CLnew[nodes-1] = CLnew[nodes-2];

    // Copy
    CL.set(CLnew);
  }

  // Final snapshot
  if (snapshots.length === 0) {
    snapshots.push({ CL: Array.from(CL), CT: Array.from(CT), time: tTotal.toFixed(1) });
  }

  // ── HEDE criterion ──
  // σ_c(C_H) = σ_c0 · (1 - χ · C_H / C_crit)
  // Simplified: σ_c0 = 1500 MPa (cohesive strength of Fe grain boundary)
  // χ = 1, C_crit = 5 wt ppm (typical for high-strength steels)
  const sigma_c0 = 1500; // MPa
  const C_crit = 5.0;    // wt ppm
  const maxC = Math.max(...CL) + Math.max(...CT.map((ct, i) => ct > 0 ? ct / NT * C0 : 0));
  const sigma_c = sigma_c0 * (1 - Math.min(maxC / C_crit, 1));
  const hedeFail = sigma > 0 && sigma >= sigma_c;

  // ── DISPLAY RESULTS ──
  displaySimResults(snapshots, nodes, Lcm, dt, nSteps, sigma_c, hedeFail, sigma, maxC, CFL, timePoints, maxCL_history, maxCT_history);
}

// ── DISPLAY ──
function displaySimResults(snapshots, nodes, Lcm, dt, nSteps, sigma_c, hedeFail, sigma, maxC, CFL, timePoints, maxCL, maxCT) {
  const container = document.getElementById('sim-results');
  container.classList.remove('hidden');

  // X axis: position in mm
  const xData = Array.from({length: nodes}, (_, i) => (i * Lcm / (nodes - 1) * 10).toFixed(2));

  // Chart
  const ctx = document.getElementById('chart-diffusion');
  if (window._simChart) window._simChart.destroy();

  const datasets = snapshots.map((snap, idx) => ({
    label: `t = ${snap.time} s (red)`,
    data: snap.CL.map((v, i) => ({ x: parseFloat(xData[i]), y: v })),
    borderColor: `hsl(${210 + idx * 30}, 80%, ${55 + idx * 8}%)`,
    borderWidth: 1.5,
    pointRadius: 0,
    tension: 0.3,
    fill: false,
  }));

  // Add last trapped profile
  const lastSnap = snapshots[snapshots.length - 1];
  datasets.push({
    label: `C_T final (trampas)`,
    data: lastSnap.CT.map((v, i) => ({ x: parseFloat(xData[i]), y: v > 0 ? v / 1e20 : 0 })),
    borderColor: '#f59e0b',
    borderWidth: 1.5,
    borderDash: [5, 3],
    pointRadius: 0,
    tension: 0.3,
    fill: false,
  });

  window._simChart = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#b8b9c4', font: { family: 'JetBrains Mono', size: 10 } } },
        title: {
          display: true,
          text: 'Distribución de hidrógeno en red y trampas',
          color: '#f0f0f2',
          font: { family: 'JetBrains Mono', size: 13 }
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Posición (mm)', color: '#7d7e8c', font: { family: 'JetBrains Mono', size: 11 } },
          ticks: { color: '#7d7e8c', font: { family: 'JetBrains Mono', size: 10 } },
          grid: { color: 'rgba(255,255,255,0.04)' }
        },
        y: {
          title: { display: true, text: 'Concentración (wt ppm)', color: '#7d7e8c', font: { family: 'JetBrains Mono', size: 11 } },
          ticks: { color: '#7d7e8c', font: { family: 'JetBrains Mono', size: 10 } },
          grid: { color: 'rgba(255,255,255,0.04)' }
        }
      }
    }
  });

  // Metrics
  const metricsDiv = document.getElementById('sim-metrics');
  const hedeStatus = hedeFail
    ? `<span style="color:var(--red)">FALLA — σ (${sigma} MPa) ≥ σ_c (${sigma_c.toFixed(0)} MPa)</span>`
    : `<span style="color:var(--green)">SEGURO — σ_c = ${sigma_c.toFixed(0)} MPa</span>`;

  metricsDiv.innerHTML = `
    <div class="metric-card">
      <div class="metric-value">${maxC.toFixed(3)}</div>
      <div class="metric-label">$C_{max}$ (wt ppm)</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${sigma_c.toFixed(0)}</div>
      <div class="metric-label">$\\sigma_c$ HEDE (MPa)</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${CFL.toFixed(4)}</div>
      <div class="metric-label">CFL (estabilidad)</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${nSteps.toLocaleString()}</div>
      <div class="metric-label">Pasos de tiempo</div>
    </div>
    <div class="metric-card">
      <div class="metric-value" style="font-size:0.8rem">${hedeStatus}</div>
      <div class="metric-label">Criterio HEDE</div>
    </div>
  `;

  // Re-render KaTeX
  if (window.renderMathInElement) {
    renderMathInElement(container, {
      delimiters: [{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]
    });
  }
}

// ── RESET ──
function resetSimParams() {
  document.getElementById('sim-DL').value = '1e-4';
  document.getElementById('sim-C0').value = '1.0';
  document.getElementById('sim-T').value = '300';
  document.getElementById('sim-Etrap').value = '0.3';
  document.getElementById('sim-NT').value = '1e20';
  document.getElementById('sim-L').value = '10';
  document.getElementById('sim-nodes').value = '100';
  document.getElementById('sim-time').value = '3600';
  document.getElementById('sim-stress').value = '0';
  document.getElementById('sim-results').classList.add('hidden');
}
