(() => {
  const messagesEl = document.getElementById('messages');
  const form = document.getElementById('composerForm');
  const input = document.getElementById('messageInput');
  const newChatBtn = document.getElementById('newChatBtn');
  const recentList = document.getElementById('recentList');
  const searchInput = document.getElementById('searchInput');
  const themeToggle = document.getElementById('themeToggle');

  const botAvatarSVG = `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="#8B5E3C"/>
      <circle cx="14" cy="12" r="6" fill="#8B5E3C"/>
      <circle cx="34" cy="12" r="6" fill="#8B5E3C"/>
      <ellipse cx="24" cy="27" rx="15" ry="13" fill="#B98457"/>
      <ellipse cx="24" cy="30" rx="7" ry="6" fill="#EFDFC9"/>
      <circle cx="18" cy="22" r="2.4" fill="#2E2118"/>
      <circle cx="30" cy="22" r="2.4" fill="#2E2118"/>
      <ellipse cx="24" cy="29" rx="2" ry="1.6" fill="#2E2118"/>
    </svg>`;

  const userAvatarInitial = 'M';

  // Canned responses to keep the demo self-contained.
  const botReplies = [
    {
      match: /costa|lombar|coluna/i,
      html: `
        <p>Existem alguns exercícios que podem ajudar a aliviar a dor nas costas. Aqui estão algumas opções seguras e comuns:</p>
        <ol>
          <li>Alongamento da região lombar</li>
          <li>Mobilidade da coluna</li>
          <li>Fortalecimento do core</li>
          <li>Alongamento de isquiotibiais</li>
          <li>Exercícios de baixo impacto (ex.: caminhada, bicicleta ergométrica)</li>
        </ol>
        <p>Posso te mostrar o passo a passo de algum deles?</p>`
    },
    {
      match: /joelho/i,
      html: `<p>Para lesões de joelho, o ideal costuma ser fortalecer o quadríceps e os isquiotibiais de forma controlada, além de trabalhar mobilidade e propriocepção. Quer que eu monte uma rotina inicial?</p>`
    },
    {
      match: /ombro/i,
      html: `<p>Para mobilidade do ombro, exercícios de rotação externa/interna com faixa elástica e alongamento peitoral costumam ajudar bastante. Você sente dor ao levantar o braço acima da cabeça?</p>`
    }
  ];

  const defaultReply = `<p>Entendi! Pode me contar um pouco mais sobre o que você está sentindo, para eu te indicar os exercícios mais adequados?</p>`;

  function formatTime(date = new Date()) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function appendMessage({ sender, html, time, seen }) {
    const wrap = document.createElement('div');
    wrap.className = `msg ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.innerHTML = sender === 'bot' ? botAvatarSVG : userAvatarInitial;
    if (sender === 'user') {
      avatar.style.background = '#d8f0e2';
      avatar.style.color = '#145038';
      avatar.style.fontWeight = '700';
      avatar.style.fontSize = '13px';
    }

    const body = document.createElement('div');
    body.className = 'msg-body';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = html;

    const timeEl = document.createElement('div');
    timeEl.className = 'msg-time';
    timeEl.textContent = time || formatTime();
    if (sender === 'user') {
      timeEl.innerHTML += ' <span aria-hidden="true">✓✓</span>';
    }

    body.appendChild(bubble);
    body.appendChild(timeEl);
    wrap.appendChild(avatar);
    wrap.appendChild(body);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function seedConversation() {
    messagesEl.innerHTML = '';
    appendMessage({
      sender: 'bot',
      time: '10:24',
      html: `<p>Olá! Sou o Movi! 👋</p>
             <p>Estou aqui para te ajudar com dúvidas sobre fisioterapia, exercícios, prevenção de lesões, reabilitação, postura e muito mais.</p>
             <p>O que você gostaria de saber hoje?</p>`
    });
    appendMessage({
      sender: 'user',
      time: '10:25',
      html: `<p>Quais exercícios posso fazer para aliviar a dor nas costas?</p>`
    });
    appendMessage({
      sender: 'bot',
      time: '10:25',
      html: botReplies[0].html
    });
  }

  function botTyping(callback) {
    const wrap = document.createElement('div');
    wrap.className = 'msg bot';
    wrap.innerHTML = `
      <div class="msg-avatar">${botAvatarSVG}</div>
      <div class="msg-body">
        <div class="bubble"><p style="margin:0;">Digitando…</p></div>
      </div>`;
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    setTimeout(() => {
      wrap.remove();
      callback();
    }, 700);
  }

  function handleSend(text) {
    if (!text.trim()) return;
    appendMessage({ sender: 'user', html: `<p>${escapeHTML(text)}</p>` });

    const reply = botReplies.find(r => r.match.test(text));
    botTyping(() => {
      appendMessage({ sender: 'bot', html: reply ? reply.html : defaultReply });
    });
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value;
    input.value = '';
    handleSend(text);
  });

  newChatBtn.addEventListener('click', () => {
    document.querySelectorAll('.recent-item').forEach(li => li.classList.remove('active'));
    seedConversation();
    input.focus();
  });

  recentList.addEventListener('click', (e) => {
    const item = e.target.closest('.recent-item');
    if (!item) return;
    document.querySelectorAll('.recent-item').forEach(li => li.classList.remove('active'));
    item.classList.add('active');

    messagesEl.innerHTML = '';
    appendMessage({
      sender: 'bot',
      html: `<p>Continuando a conversa sobre <strong>${item.dataset.title.toLowerCase()}</strong>. Como posso ajudar?</p>`
    });
  });

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.trim().toLowerCase();
    document.querySelectorAll('.recent-item').forEach(li => {
      const match = li.dataset.title.toLowerCase().includes(term);
      li.style.display = match ? 'flex' : 'none';
    });
  });

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });

  seedConversation();
})();