const mensagens = document.querySelector('#messages');

function horaAgora() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}


mensagens.innerHTML = `
  <div class="message-row">
    <div class="bot-avatar"><img src="assets/img/3.png" alt="Movi"></div>
    <div class="message-column">
      <div class="bubble">
        <h3>Olá! Sou o Movi! 👋</h3>
        <p>Estou aqui para te ajudar com dúvidas sobre fisioterapia, exercícios, prevenção de lesões, reabilitação, postura e muito mais.</p>
        <p>O que você gostaria de saber hoje?</p>
      </div>
      <div class="time">${horaAgora()}</div>
    </div>
  </div>`;
