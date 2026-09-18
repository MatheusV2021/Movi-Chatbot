const mensagens = document.querySelector('#messages');
const formulario = document.querySelector('#chatForm');
const campo = document.querySelector('#messageInput');
const recentes = document.querySelector('#recentList');
const busca = document.querySelector('#searchInput');

const CHAVE = 'movi_conversas';
let conversaAtual = null;


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

  conversa.mensagens.push({ tipo: 'bot', html: respostaTemporaria(texto), hora: horaAgora() });
  salvarConversas(conversas);
  campo.value = '';
  renderizarTudo();
});

document.querySelector('#newChatBtn').addEventListener('click', criarConversa);
document.querySelector('#themeBtn').addEventListener('click', () => document.body.classList.toggle('dark'));

busca.addEventListener('input', () => {
  const termo = busca.value.toLowerCase();
  document.querySelectorAll('.bubble').forEach(balao => {
    balao.style.opacity = !termo || balao.textContent.toLowerCase().includes(termo) ? '1' : '.22';
  });
});

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

const profileBtn = document.querySelector('#profileBtn');
const profileMenu = document.querySelector('#profileMenu');
const authOverlay = document.querySelector('#authOverlay');
const authClose = document.querySelector('#authClose');
const authForm = document.querySelector('#authForm');
const authTitle = document.querySelector('#authTitle');
const authSubtitle = document.querySelector('#authSubtitle');
const authSubmit = document.querySelector('#authSubmit');
const authSwitchText = document.querySelector('#authSwitchText');
const authSwitchBtn = document.querySelector('#authSwitchBtn');
const authPassword = document.querySelector('#authPassword');
let authMode = 'login';

function configurarAuth(modo) {
  authMode = modo;
  const cadastro = modo === 'register';
  authOverlay.classList.toggle('register', cadastro);
  authTitle.textContent = cadastro ? 'Criar sua conta' : 'Entrar no Movi';
  authSubtitle.textContent = cadastro ? 'Crie uma conta para manter seu perfil e suas conversas organizadas.' : 'Acesse sua conta para manter suas conversas salvas.';
  authSubmit.textContent = cadastro ? 'Criar conta' : 'Entrar';
  authSwitchText.textContent = cadastro ? 'Já tem uma conta?' : 'Ainda não tem uma conta?';
  authSwitchBtn.textContent = cadastro ? 'Entrar' : 'Criar conta';
  authPassword.autocomplete = cadastro ? 'new-password' : 'current-password';
  document.querySelector('#authName').required = cadastro;
}

function abrirAuth(modo) {
  configurarAuth(modo);
  profileMenu.classList.remove('open');
  authOverlay.classList.add('open');
  authOverlay.setAttribute('aria-hidden', 'false');
  setTimeout(() => document.querySelector(modo === 'register' ? '#authName' : '#authEmail').focus(), 50);
}

function fecharAuth() {
  authOverlay.classList.remove('open');
  authOverlay.setAttribute('aria-hidden', 'true');
}

profileBtn.addEventListener('click', event => {
  event.stopPropagation();
  profileMenu.classList.toggle('open');
});

document.querySelector('#openLoginBtn').addEventListener('click', () => abrirAuth('login'));
document.querySelector('#openRegisterBtn').addEventListener('click', () => abrirAuth('register'));
authClose.addEventListener('click', fecharAuth);
authSwitchBtn.addEventListener('click', () => configurarAuth(authMode === 'login' ? 'register' : 'login'));

authOverlay.addEventListener('click', event => {
  if (event.target === authOverlay) fecharAuth();
});

document.addEventListener('click', event => {
  if (!profileMenu.contains(event.target) && event.target !== profileBtn) profileMenu.classList.remove('open');
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') fecharAuth();
});

authForm.addEventListener('submit', event => {
  event.preventDefault();

  const dados = {
    nome: document.querySelector('#authName').value.trim(),
    email: document.querySelector('#authEmail').value.trim(),
    senha: authPassword.value
  };

// Não mexam aqui pelo amor de Deus
  console.log(`Auth aguardando backend: ${authMode}`, { ...dados, senha: '***' });
  authSubmit.textContent = authMode === 'register' ? 'Cadastro aguardando backend' : 'Login aguardando backend';
  setTimeout(() => configurarAuth(authMode), 1400);
});
