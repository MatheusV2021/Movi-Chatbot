const mensagens = document.querySelector('#messages');
const formulario = document.querySelector('#chatForm');
const campo = document.querySelector('#messageInput');

function horaAgora() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function mensagemMovi(html) {
  mensagens.insertAdjacentHTML('beforeend', `<div class="message-row"><div class="bot-avatar"><img src="assets/img/3.png" alt="Movi"></div><div class="message-column"><div class="bubble">${html}</div><div class="time">${horaAgora()}</div></div></div>`);
}

mensagemMovi('<h3>Olá! Sou o Movi! 👋</h3><p>Estou aqui para te ajudar com dúvidas sobre fisioterapia, exercícios, prevenção de lesões, reabilitação, postura e muito mais.</p><p>O que você gostaria de saber hoje?</p>');

formulario.addEventListener('submit', event => {
  event.preventDefault();
  const texto = campo.value.trim();
  if (!texto) return;

  mensagens.insertAdjacentHTML('beforeend', `<div class="message-row user"><div class="message-column"><div class="bubble">${texto}</div><div class="time">${horaAgora()} &nbsp;✓✓</div></div></div>`);
  campo.value = '';

  // resposta temporária até ligar o RAG no backend
  mensagemMovi(`<p>Recebi sua pergunta: <strong>“${texto}”</strong></p><p>Quando o backend estiver pronto, a resposta real vai entrar aqui pela API.</p>`);
  mensagens.scrollTop = mensagens.scrollHeight;
});
