function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function criarMensagem(tipo, texto) {
  const chatBox = document.getElementById('chat-box');
  if (!chatBox) return;

  const msg = document.createElement('div');
  msg.className = `msg ${tipo === 'user' ? 'msg-user' : 'msg-ia'}`;

  msg.innerHTML = `
    <div class="msg-avatar">${tipo === 'user' ? '🧑' : '🤖'}</div>
    <div class="msg-bubble">${escaparHTML(texto)}</div>
  `;

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function respostaComDelay(texto) {
  criarMensagem('ia', texto);
}

async function responderIA(texto) {
  criarMensagem('user', texto);

  try {
    const resposta = await fetch('https://snapbite-backend-1-3.onrender.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem: texto })
    });

    const dados = await resposta.json();
    respostaComDelay(dados.resposta);

  } catch (erro) {
    respostaComDelay('⚠️ Não consegui conectar com a IA em Python.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ia-form');
  const input = document.getElementById('ia-input');
  const btn = document.getElementById('btn-enviar-ia');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });

  btn.addEventListener('click', () => {
    const texto = input.value.trim();
    if (!texto) return;

    responderIA(texto);
    input.value = '';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const texto = input.value.trim();
      if (!texto) return;

      responderIA(texto);
      input.value = '';
    }
  });
});
