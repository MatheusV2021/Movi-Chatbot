const mensagens = document.querySelector('#messages');
const formulario = document.querySelector('#chatForm');
const campo = document.querySelector('#messageInput');
const recentes = document.querySelector('#recentList');

const CHAVE = 'movi_conversas';
let conversaAtual = null;

// não mexe aqui pelo amor de Deus
function carregarConversas() {
  return JSON.parse(localStorage.getItem(CHAVE) || '[]');
}

function salvarConversas(conversas) {
  localStorage.setItem(CHAVE, JSON.stringify(conversas));
}

function horaAgora() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function mensagemInicial() {
  return {
    tipo: 'bot',
    hora: horaAgora(),
    html: `<h3>Olá! Sou o Movi! 👋</h3>
      <p>Estou aqui para te ajudar com dúvidas sobre fisioterapia,<br>exercícios, prevenção de lesões, reabilitação, postura e<br>muito mais.</p>
      <p>O que você gostaria de saber hoje?</p>`
  };
}

function criarConversa() {
  const conversas = carregarConversas();
  const nova = { id: Date.now(), titulo: 'Nova conversa', mensagens: [mensagemInicial()] };
  conversas.unshift(nova);
  salvarConversas(conversas);
  conversaAtual = nova.id;
  renderizarTudo();
  campo.focus();
}

function renderizarRecentes() {
  recentes.innerHTML = '';
  carregarConversas().slice(0, 7).forEach(conversa => {
    const botao = document.createElement('button');
    botao.className = 'recent-item';
    botao.textContent = conversa.titulo;
    botao.onclick = () => { conversaAtual = conversa.id; renderizarMensagens(); };
    recentes.appendChild(botao);
  });
}

function avatarMovi() {
  return `<div class="bot-avatar"><img src="assets/img/3.png" alt="Movi" onerror="this.style.display='none'; this.parentElement.textContent='🦫'"></div>`;
}

function renderizarMensagens() {
  const conversa = carregarConversas().find(item => item.id === conversaAtual);
  if (!conversa) return;

  mensagens.innerHTML = conversa.mensagens.map(msg => {
    if (msg.tipo === 'user') {
      return `<div class="message-row user"><div class="message-column"><div class="bubble">${msg.texto}</div><div class="time">${msg.hora} &nbsp;✓✓</div></div></div>`;
    }
    return `<div class="message-row">${avatarMovi()}<div class="message-column"><div class="bubble">${msg.html}</div><div class="time">${msg.hora}</div></div></div>`;
  }).join('');

  mensagens.scrollTop = mensagens.scrollHeight;
}

function respostaTemporaria(pergunta) {
  // isso aqui é só pra tela já funcionar antes da API/RAG ficar pronta
  return `<p>Recebi sua pergunta: <strong>“${pergunta}”</strong></p>
    <p>O front do Movi já está funcionando. Quando o backend estiver pronto, a resposta real vai entrar aqui pela API.</p>`;
}

formulario.addEventListener('submit', event => {
  event.preventDefault();
  const texto = campo.value.trim();
  if (!texto) return;

  const conversas = carregarConversas();
  const conversa = conversas.find(item => item.id === conversaAtual);
  if (!conversa) return;

  conversa.mensagens.push({ tipo: 'user', texto, hora: horaAgora() });
  if (conversa.titulo === 'Nova conversa') conversa.titulo = texto.slice(0, 28);

  // depois é só trocar essa resposta temporária por um fetch pro backend
  conversa.mensagens.push({ tipo: 'bot', html: respostaTemporaria(texto), hora: horaAgora() });
  salvarConversas(conversas);
  campo.value = '';
  renderizarTudo();
});

document.querySelector('#newChatBtn').addEventListener('click', criarConversa);


function renderizarTudo() {
  renderizarRecentes();
  renderizarMensagens();
}

const existentes = carregarConversas();
if (existentes.length) {
  conversaAtual = existentes[0].id;
  renderizarTudo();
} else {
  criarConversa();
}
