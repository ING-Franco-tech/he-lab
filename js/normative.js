/* ══════════════════════════════════════════
   HE-Lab — normative.js
   Módulo 5: Evaluador normativo ASME B31.12
   ══════════════════════════════════════════ */

// Material performance factors for H2 service (ASME B31.12 Table IX-5A)
const H_FACTORS = {
  'X42': { Hf: 0.54, Sy_min: 290, Su_min: 415 },
  'X52': { Hf: 0.54, Sy_min: 360, Su_min: 460 },
  'X60': { Hf: 0.54, Sy_min: 415, Su_min: 520 },
  'X65': { Hf: 0.54, Sy_min: 450, Su_min: 535 },
  'X70': { Hf: 0.54, Sy_min: 485, Su_min: 570 },
  'X80': { Hf: 0.50, Sy_min: 555, Su_min: 625 },
};

function evaluateASME() {
  const OD    = parseFloat(document.getElementById('norm-OD').value);   // mm
  const t     = parseFloat(document.getElementById('norm-t').value);    // mm
  const P     = parseFloat(document.getElementById('norm-P').value);    // MPa
  const Sy    = parseFloat(document.getElementById('norm-Sy').value);   // MPa
  const Su    = parseFloat(document.getElementById('norm-Su').value);   // MPa
  const grade = document.getElementById('norm-grade').value;

  const mat   = H_FACTORS[grade] || H_FACTORS['X60'];
  const Hf    = mat.Hf;

  // ── Calculations ──
  // Circumferential stress: σ_circ = P·D / (2·t)
  const sigma_circ = (P * OD) / (2 * t); // MPa

  // Design factor F (ASME B31.12 Option B, Location Class 1)
  const F = 0.72;

  // Maximum allowable pressure (ASME B31.12)
  // P_max = (2·S·t·F·E·Hf) / D
  // E = 1.0 (seamless or fully radiographed)
  const E = 1.0;
  const S = Math.min(Sy, Su); // Use the lower
  const P_max = (2 * S * t * F * E * Hf) / OD; // MPa

  // Minimum wall thickness
  const t_min = (P * OD) / (2 * S * F * E * Hf); // mm

  // Stress ratio σ_circ / σ_y
  const stressRatio = sigma_circ / Sy;

  // ── Checks ──
  const checks = [];

  // 1. Pressure check
  const pressOK = P <= P_max;
  checks.push({
    name: 'Presión de diseño',
    pass: pressOK,
    detail: `P = ${P.toFixed(1)} MPa ${pressOK ? '≤' : '>'} P_max = ${P_max.toFixed(1)} MPa`
  });

  // 2. Wall thickness check
  const wallOK = t >= t_min;
  checks.push({
    name: 'Espesor de pared',
    pass: wallOK,
    detail: `t = ${t.toFixed(1)} mm ${wallOK ? '≥' : '<'} t_min = ${t_min.toFixed(2)} mm`
  });

  // 3. Stress ratio < 40% Sy (ASME B31.12 simplified assessment)
  const ratioOK = stressRatio < 0.40;
  checks.push({
    name: 'Relación σ_circ / σ_y < 40%',
    pass: ratioOK,
    detail: `σ_circ/σ_y = ${(stressRatio * 100).toFixed(1)}% ${ratioOK ? '<' : '≥'} 40%`
  });

  // 4. If σ > 40% Sy → fracture mechanics evaluation required
  const needsFracture = !ratioOK;

  // 5. Hardness limit (ASME B31.12 / NACE MR0175: max 22 HRC ≈ 248 HV)
  // Estimate from composition
  const hardnessNote = Su > 800
    ? { pass: false, detail: 'UTS > 800 MPa → posible dureza > 22 HRC → verificar' }
    : { pass: true, detail: 'UTS ≤ 800 MPa → probablemente cumple límite de dureza' };
  checks.push({
    name: 'Límite de dureza (22 HRC / 248 HV)',
    pass: hardnessNote.pass,
    detail: hardnessNote.detail
  });

  // ── DISPLAY ──
  const container = document.getElementById('norm-results');
  container.classList.remove('hidden');

  const allPass = checks.every(c => c.pass);

  let html = `
    <div class="status-box ${allPass ? 'status-success' : 'status-danger'}" style="margin-bottom:1rem">
      <strong>${allPass ? '✓ APTO para servicio con H₂' : '✗ NO APTO — Requiere correcciones'}</strong>
      <br>Evaluación según ASME B31.12 Option B, grado ${grade}, $H_f$ = ${Hf}
    </div>
    <div class="sim-metrics" style="margin-bottom:1rem">
      <div class="metric-card">
        <div class="metric-value">${sigma_circ.toFixed(1)}</div>
        <div class="metric-label">$\\sigma_{circ}$ (MPa)</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${P_max.toFixed(1)}</div>
        <div class="metric-label">$P_{max}$ (MPa)</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${t_min.toFixed(2)}</div>
        <div class="metric-label">$t_{min}$ (mm)</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${(stressRatio * 100).toFixed(1)}%</div>
        <div class="metric-label">$\\sigma_{circ}/\\sigma_y$</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${Hf}</div>
        <div class="metric-label">$H_f$ (factor de material)</div>
      </div>
    </div>
  `;

  html += '<div style="margin-top:0.75rem">';
  checks.forEach(c => {
    const icon = c.pass ? '✓' : '✗';
    const color = c.pass ? 'var(--green)' : 'var(--red)';
    html += `<div style="padding:0.5rem 0;border-bottom:1px solid var(--border);font-size:0.85rem">
      <span style="color:${color};font-weight:600;margin-right:0.5rem">${icon}</span>
      <strong>${c.name}:</strong> ${c.detail}
    </div>`;
  });
  html += '</div>';

  if (needsFracture) {
    html += `<div class="status-box status-warning" style="margin-top:1rem">
      <strong>Evaluación fractomecánica requerida.</strong> $\\sigma_{circ}/\\sigma_y$ ≥ 40% →
      ASME B31.12 exige valores mínimos de Charpy y evaluación de $K_{IH}$ para este nivel de tensión.
    </div>`;
  }

  document.getElementById('norm-output').innerHTML = html;

  // Re-render KaTeX
  if (window.renderMathInElement) {
    renderMathInElement(container, {
      delimiters: [{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]
    });
  }
}
