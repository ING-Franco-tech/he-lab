/* ══════════════════════════════════════════
   HE-Lab — composition.js
   Módulo 2: Base de datos de aceros y análisis composicional
   ══════════════════════════════════════════ */

const ELEMENTS = ['C','Mn','Si','Cr','Ni','Mo','V','Nb','Ti','Cu','W','Co','N','S','P','Al','B'];

const STEELS_DB = {
  // ── Aceros al carbono ──
  carbon: {
    'AISI 1018': { C:0.18, Mn:0.75, Si:0.25, S:0.035, P:0.03 },
    'AISI 1020': { C:0.20, Mn:0.45, Si:0.25, S:0.035, P:0.03 },
    'AISI 1040': { C:0.40, Mn:0.75, Si:0.25, S:0.035, P:0.03 },
    'AISI 1045': { C:0.45, Mn:0.75, Si:0.25, S:0.035, P:0.03 },
    'AISI 1060': { C:0.60, Mn:0.75, Si:0.25, S:0.035, P:0.03 },
    'AISI 1080': { C:0.80, Mn:0.75, Si:0.25, S:0.035, P:0.03 },
    'AISI 1095': { C:0.95, Mn:0.40, Si:0.25, S:0.035, P:0.03 },
  },
  // ── Baja aleación ──
  'low-alloy': {
    'AISI 4130': { C:0.30, Mn:0.50, Si:0.25, Cr:0.95, Mo:0.20 },
    'AISI 4140': { C:0.40, Mn:0.88, Si:0.25, Cr:0.95, Mo:0.20 },
    'AISI 4340': { C:0.40, Mn:0.70, Si:0.25, Cr:0.80, Ni:1.80, Mo:0.25 },
    'AISI 4150': { C:0.50, Mn:0.88, Si:0.25, Cr:0.95, Mo:0.20 },
    'AISI 8620': { C:0.20, Mn:0.80, Si:0.25, Cr:0.50, Ni:0.55, Mo:0.20 },
    '42CrMo4':   { C:0.42, Mn:0.75, Si:0.30, Cr:1.05, Mo:0.22 },
  },
  // ── Inoxidables austeníticos ──
  'stainless-austenitic': {
    'AISI 304':  { C:0.06, Mn:1.50, Si:0.50, Cr:18.5, Ni:9.0, N:0.05 },
    'AISI 304L': { C:0.025,Mn:1.50, Si:0.50, Cr:18.5, Ni:9.5, N:0.05 },
    'AISI 316':  { C:0.06, Mn:1.50, Si:0.50, Cr:17.0, Ni:11.0, Mo:2.25, N:0.05 },
    'AISI 316L': { C:0.025,Mn:1.50, Si:0.50, Cr:17.0, Ni:11.5, Mo:2.25, N:0.05 },
    'AISI 321':  { C:0.06, Mn:1.50, Si:0.50, Cr:18.0, Ni:10.5, Ti:0.40 },
    'AISI 347':  { C:0.06, Mn:1.50, Si:0.50, Cr:18.0, Ni:11.0, Nb:0.70 },
  },
  // ── Inoxidables ferríticos ──
  'stainless-ferritic': {
    'AISI 430':  { C:0.08, Mn:0.75, Si:0.40, Cr:17.0 },
    'AISI 446':  { C:0.12, Mn:1.00, Si:0.60, Cr:25.0, N:0.15 },
    'AISI 409':  { C:0.03, Mn:0.50, Si:0.40, Cr:11.0, Ti:0.20 },
  },
  // ── Inoxidables dúplex ──
  'stainless-duplex': {
    'SAF 2205 (S31803)': { C:0.025, Mn:1.50, Si:0.50, Cr:22.0, Ni:5.5, Mo:3.0, N:0.17 },
    'SAF 2507 (S32750)': { C:0.025, Mn:0.80, Si:0.40, Cr:25.0, Ni:7.0, Mo:4.0, N:0.28 },
    'SAF 2304 (S32304)': { C:0.025, Mn:1.50, Si:0.50, Cr:23.0, Ni:4.5, Mo:0.30, N:0.10 },
  },
  // ── Inoxidables martensíticos ──
  'stainless-martensitic': {
    'AISI 410':  { C:0.12, Mn:0.60, Si:0.40, Cr:12.5 },
    'AISI 420':  { C:0.35, Mn:0.60, Si:0.40, Cr:13.0 },
    'AISI 440C': { C:1.05, Mn:0.50, Si:0.40, Cr:17.0, Mo:0.50 },
  },
  // ── Aceros de tubería API 5L ──
  pipeline: {
    'API 5L X42':  { C:0.22, Mn:1.30, Si:0.35, Nb:0.04, V:0.05, Ti:0.04, S:0.015, P:0.025 },
    'API 5L X52':  { C:0.16, Mn:1.40, Si:0.35, Nb:0.05, V:0.06, Ti:0.04, S:0.010, P:0.020 },
    'API 5L X60':  { C:0.12, Mn:1.45, Si:0.35, Nb:0.05, V:0.08, Ti:0.04, Cr:0.15, S:0.008, P:0.018 },
    'API 5L X65':  { C:0.10, Mn:1.50, Si:0.30, Nb:0.05, V:0.08, Ti:0.02, Cr:0.20, Mo:0.10, S:0.005, P:0.015 },
    'API 5L X70':  { C:0.09, Mn:1.60, Si:0.30, Nb:0.06, V:0.08, Ti:0.02, Cr:0.25, Mo:0.15, Ni:0.15, S:0.005, P:0.015 },
    'API 5L X80':  { C:0.07, Mn:1.85, Si:0.30, Nb:0.06, V:0.06, Ti:0.02, Cr:0.25, Mo:0.20, Ni:0.25, Cu:0.20, S:0.003, P:0.012 },
  },
  // ── HSLA / Microaleados ──
  hsla: {
    'ASTM A572 Gr.50':  { C:0.23, Mn:1.35, Si:0.30, Nb:0.02, V:0.05, S:0.035, P:0.03 },
    'ASTM A588 (Corten)':{ C:0.15, Mn:1.00, Si:0.35, Cr:0.50, Ni:0.30, Cu:0.35, V:0.05, P:0.03 },
    'S355J2':            { C:0.18, Mn:1.50, Si:0.40, Nb:0.03, V:0.05, Ti:0.03, S:0.020, P:0.025 },
  }
};

// ── INIT COMPOSITION GRID ──
function initCompositionGrid() {
  const grid = document.getElementById('comp-grid');
  if (!grid) return;
  grid.innerHTML = ELEMENTS.map(el => `
    <div class="comp-cell">
      <label>${el}</label>
      <input type="number" id="comp-${el}" value="" placeholder="—" step="0.001" min="0">
    </div>
  `).join('');
}

// ── FILTER STEELS BY FAMILY ──
function filterSteels() {
  const family = document.getElementById('steel-family').value;
  const gradeSelect = document.getElementById('steel-grade');
  gradeSelect.innerHTML = '<option value="">— Seleccionar grado —</option>';

  if (family && STEELS_DB[family]) {
    Object.keys(STEELS_DB[family]).forEach(name => {
      gradeSelect.innerHTML += `<option value="${family}|${name}">${name}</option>`;
    });
  }
}

// ── LOAD COMPOSITION FROM DB ──
function loadComposition() {
  const val = document.getElementById('steel-grade').value;
  if (!val) return;
  const [family, name] = val.split('|');
  const comp = STEELS_DB[family][name];
  if (!comp) return;

  ELEMENTS.forEach(el => {
    const input = document.getElementById(`comp-${el}`);
    input.value = comp[el] !== undefined ? comp[el] : '';
  });
}

// ── CLEAR COMPOSITION ──
function clearComposition() {
  ELEMENTS.forEach(el => {
    document.getElementById(`comp-${el}`).value = '';
  });
  document.getElementById('comp-results').classList.add('hidden');
}

// ── ANALYZE COMPOSITION ──
function analyzeComposition() {
  const comp = {};
  ELEMENTS.forEach(el => {
    const v = parseFloat(document.getElementById(`comp-${el}`).value);
    if (!isNaN(v) && v > 0) comp[el] = v;
  });

  if (Object.keys(comp).length === 0) {
    alert('Ingresa al menos un elemento.');
    return;
  }

  const results = [];

  // Carbon equivalent (IIW formula)
  const C  = comp.C  || 0;
  const Mn = comp.Mn || 0;
  const Cr = comp.Cr || 0;
  const Mo = comp.Mo || 0;
  const V  = comp.V  || 0;
  const Ni = comp.Ni || 0;
  const Cu = comp.Cu || 0;
  const Ceq = C + Mn/6 + (Cr + Mo + V)/5 + (Ni + Cu)/15;
  results.push(`<div class="metric-card"><div class="metric-value">${Ceq.toFixed(3)}</div><div class="metric-label">$C_{eq}$ (IIW)</div></div>`);

  // Pcm (for pipeline steels)
  const Si = comp.Si || 0;
  const B  = comp.B  || 0;
  const Pcm = C + Si/30 + (Mn + Cu + Cr)/20 + Ni/60 + Mo/15 + V/10 + 5*B;
  results.push(`<div class="metric-card"><div class="metric-value">${Pcm.toFixed(3)}</div><div class="metric-label">$P_{cm}$ (Ito-Bessyo)</div></div>`);

  // PREN (for stainless steels)
  const N = comp.N || 0;
  const W = comp.W || 0;
  if (Cr > 10) {
    const PREN = Cr + 3.3*(Mo + 0.5*W) + 16*N;
    results.push(`<div class="metric-card"><div class="metric-value">${PREN.toFixed(1)}</div><div class="metric-label">PREN</div></div>`);
  }

  // Cr equivalent and Ni equivalent (Schaeffler)
  if (Cr > 10) {
    const CrEq = Cr + Mo + 1.5*Si + 0.5*(comp.Nb || 0);
    const NiEq = Ni + 30*C + 0.5*Mn;
    results.push(`<div class="metric-card"><div class="metric-value">${CrEq.toFixed(1)}</div><div class="metric-label">$Cr_{eq}$ (Schaeffler)</div></div>`);
    results.push(`<div class="metric-card"><div class="metric-value">${NiEq.toFixed(1)}</div><div class="metric-label">$Ni_{eq}$ (Schaeffler)</div></div>`);
  }

  // HE susceptibility estimate
  let heSusc = 'Baja';
  let heColor = 'green';
  if (Ceq > 0.45 || C > 0.35) { heSusc = 'Alta'; heColor = 'red'; }
  else if (Ceq > 0.35 || C > 0.25) { heSusc = 'Media'; heColor = 'amber'; }

  // Special case: austenitic stainless (FCC) — generally resistant
  if (Ni > 8 && Cr > 16) { heSusc = 'Baja (FCC austenítico)'; heColor = 'green'; }
  // Duplex
  if (Ni > 4 && Ni < 8 && Cr > 20) { heSusc = 'Media (dúplex — fase ferrítica susceptible)'; heColor = 'amber'; }
  // Martensitic
  if (Cr > 11 && Cr < 18 && Ni < 2 && C > 0.1) { heSusc = 'Alta (martensítico)'; heColor = 'red'; }

  results.push(`<div class="metric-card"><div class="metric-value" style="color:var(--${heColor});font-size:0.95rem">${heSusc}</div><div class="metric-label">Susceptibilidad estimada a HE</div></div>`);

  // Weldability
  let weld = 'Buena';
  if (Ceq > 0.45) weld = 'Pobre — requiere precalentamiento';
  else if (Ceq > 0.40) weld = 'Regular — precalentamiento recomendado';
  results.push(`<div class="metric-card"><div class="metric-value" style="font-size:0.85rem">${weld}</div><div class="metric-label">Soldabilidad (por $C_{eq}$)</div></div>`);

  const container = document.getElementById('comp-results');
  container.classList.remove('hidden');
  document.getElementById('comp-output').innerHTML = `<div class="sim-metrics">${results.join('')}</div>`;

  // Re-render KaTeX
  if (window.renderMathInElement) {
    renderMathInElement(container, {
      delimiters: [{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]
    });
  }
}
