/* ══════════════════════════════════════════
   HE-Lab — app.js
   Core UI: tabs, file upload, chat stub
   ══════════════════════════════════════════ */

// ── TAB SWITCHING ──
function switchTab(btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(btn.dataset.target).classList.add('active');
}

// ── FILE UPLOAD (Microstructure) ──
function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) processFile(file);
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = document.getElementById('preview-img');
    img.src = e.target.result;
    img.classList.remove('hidden');
    document.getElementById('upload-zone').style.display = 'none';
    window._imageBase64 = e.target.result.split(',')[1];
  };
  reader.readAsDataURL(file);
}

// ── ANALYZE IMAGE (requires API) ──
function analyzeImage() {
  if (!window._imageBase64) {
    alert('Primero sube una micrografía.');
    return;
  }
  const resultsDiv = document.getElementById('vision-results');
  const output = document.getElementById('vision-output');
  resultsDiv.classList.remove('hidden');
  output.innerHTML = '<div class="status-box status-warning"><strong>API no conectada.</strong> Cuando tengas los créditos de la API de Claude, conecta el Cloudflare Worker para habilitar el análisis con IA.</div>';
}

// ── CHAT (requires API) ──
function askChat(text) {
  document.getElementById('chat-input').value = text;
  sendChat();
}

function sendChat() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  const messages = document.getElementById('chat-messages');
  const welcome = messages.querySelector('.chat-welcome');
  if (welcome) welcome.remove();

  // User message
  messages.innerHTML += `
    <div class="chat-msg chat-msg-user">
      <div class="chat-bubble">${escapeHtml(text)}</div>
    </div>`;

  input.value = '';
  input.style.height = 'auto';

  // AI response (stub)
  messages.innerHTML += `
    <div class="chat-msg chat-msg-ai">
      <div class="chat-bubble">
        <strong>API no conectada.</strong> Cuando tengas los créditos de la API de Claude y el Cloudflare Worker configurado, RINCÓN IA podrá responder tus preguntas sobre fragilización por hidrógeno.
      </div>
    </div>`;

  messages.scrollTop = messages.scrollHeight;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initCompositionGrid();
});
