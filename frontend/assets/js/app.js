const mensagens = document.querySelector('#messages');
const formulario = document.querySelector('#chatForm');
const campo = document.querySelector('#messageInput');
const recentes = document.querySelector('#recentList');
const busca = document.querySelector('#searchInput');

const API_URL = 'http://127.0.0.1:8000';

/* ========================= */
/* SUPABASE                  */
/* ========================= */

const SUPABASE_URL = 'https://ttawjrbcrvizciydcldn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hk3TQhTWVNdMHxG0-rl_ww_wXwdjzSZ';

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let usuarioAtual = null;
let conversaAtual = null;
let conversas = [];
let mensagensAtuais = [];


/* ========================= */
/* FUNÇÕES GERAIS            */
/* ========================= */

function horaAgora() {
  return new Date().toLocaleTimeString(
    'pt-BR',
    {
      hour: '2-digit',
      minute: '2-digit'
    }
  );
}


function formatarHora(data) {
  if (!data) {
    return horaAgora();
  }

  return new Date(data).toLocaleTimeString(
    'pt-BR',
    {
      hour: '2-digit',
      minute: '2-digit'
    }
  );
}


function escaparHTML(texto) {
  const elemento = document.createElement('div');

  elemento.textContent = texto || '';

  return elemento.innerHTML;
}


function formatarResposta(texto) {
  return `
    <p>
      ${
        escaparHTML(texto)
          .replace(/\n/g, '<br>')
      }
    </p>
  `;
}


function mensagemInicial() {
  return `
    <h3>Olá! Sou o Movi! 👋</h3>

    <p>
      Estou aqui para te ajudar com dúvidas sobre fisioterapia,
      exercícios, prevenção de lesões, reabilitação, postura e
      muito mais.
    </p>

    <p>
      O que você gostaria de saber hoje?
    </p>
  `;
}


function mensagemSemLogin() {
  return `
    <div class="message-row">

      <div class="bot-avatar">

        <img
          src="assets/img/3.png"
          alt="Movi"
          onerror="this.style.display='none'; this.parentElement.textContent='🦫'"
        >

      </div>

      <div class="message-column">

        <div class="bubble">

          <h3>Olá! Sou o Movi! 👋</h3>

          <p>
            Entre na sua conta para conversar comigo e manter
            suas conversas salvas.
          </p>

        </div>

      </div>

    </div>
  `;
}


function avatarMovi() {
  return `
    <div class="bot-avatar">

      <img
        src="assets/img/3.png"
        alt="Movi"
        onerror="this.style.display='none'; this.parentElement.textContent='🦫'"
      >

    </div>
  `;
}


/* ========================= */
/* CONVERSAS NO SUPABASE     */
/* ========================= */

async function carregarConversas() {
  if (!usuarioAtual) {
    conversas = [];
    conversaAtual = null;

    renderizarRecentes();
    renderizarMensagens();

    return;
  }

  const {
    data,
    error
  } =
    await supabaseClient
      .from('conversations')
      .select('*')
      .order(
        'updated_at',
        {
          ascending: false
        }
      );

  if (error) {
    console.error(
      'Erro ao carregar conversas:',
      error
    );

    return;
  }

  conversas = data || [];

  if (conversas.length > 0) {
    conversaAtual = conversas[0].id;

    await carregarMensagens(
      conversaAtual
    );
  } else {
    conversaAtual = null;
    mensagensAtuais = [];

    renderizarMensagens();
  }

  renderizarRecentes();
}


async function criarConversa() {
  if (!usuarioAtual) {
    abrirAuth('login');
    return;
  }

  const {
    data,
    error
  } =
    await supabaseClient
      .from('conversations')
      .insert({
        user_id: usuarioAtual.id,
        title: 'Nova conversa'
      })
      .select()
      .single();

  if (error) {
    console.error(
      'Erro ao criar conversa:',
      error
    );

    alert(
      'Não foi possível criar uma nova conversa.'
    );

    return;
  }

  conversaAtual = data.id;
  mensagensAtuais = [];

  conversas.unshift(data);

  renderizarRecentes();
  renderizarMensagens();

  campo.focus();
}


async function selecionarConversa(id) {
  conversaAtual = id;

  await carregarMensagens(id);

  renderizarRecentes();
}


async function atualizarTituloConversa(
  id,
  titulo
) {
  const {
    error
  } =
    await supabaseClient
      .from('conversations')
      .update({
        title: titulo,
        updated_at: new Date().toISOString()
      })
      .eq(
        'id',
        id
      );

  if (error) {
    console.error(
      'Erro ao atualizar título:',
      error
    );

    return;
  }

  const conversa =
    conversas.find(
      item =>
        item.id === id
    );

  if (conversa) {
    conversa.title = titulo;
    conversa.updated_at =
      new Date().toISOString();
  }

  renderizarRecentes();
}


async function atualizarDataConversa(id) {
  const dataAtual =
    new Date().toISOString();

  const {
    error
  } =
    await supabaseClient
      .from('conversations')
      .update({
        updated_at: dataAtual
      })
      .eq(
        'id',
        id
      );

  if (error) {
    console.error(
      'Erro ao atualizar conversa:',
      error
    );

    return;
  }

  const conversa =
    conversas.find(
      item =>
        item.id === id
    );

  if (conversa) {
    conversa.updated_at = dataAtual;
  }
}


/* ========================= */
/* EXCLUIR CONVERSA          */
/* ========================= */

async function excluirConversa(id) {
  if (!usuarioAtual) {
    return;
  }

  const conversa =
    conversas.find(
      item =>
        item.id === id
    );

  if (!conversa) {
    return;
  }

  const confirmar =
    window.confirm(
      `Deseja excluir a conversa "${conversa.title}"?`
    );

  if (!confirmar) {
    return;
  }

  const {
    error
  } =
    await supabaseClient
      .from('conversations')
      .delete()
      .eq(
        'id',
        id
      );

  if (error) {
    console.error(
      'Erro ao excluir conversa:',
      error
    );

    alert(
      'Não foi possível excluir a conversa.'
    );

    return;
  }

  conversas =
    conversas.filter(
      item =>
        item.id !== id
    );

  if (conversaAtual === id) {
    if (conversas.length > 0) {
      conversaAtual =
        conversas[0].id;

      await carregarMensagens(
        conversaAtual
      );
    } else {
      conversaAtual = null;
      mensagensAtuais = [];

      renderizarMensagens();
    }
  }

  renderizarRecentes();
}


/* ========================= */
/* MENSAGENS NO SUPABASE     */
/* ========================= */

async function carregarMensagens(
  conversaId
) {
  if (!usuarioAtual) {
    return;
  }

  const {
    data,
    error
  } =
    await supabaseClient
      .from('messages')
      .select('*')
      .eq(
        'conversation_id',
        conversaId
      )
      .order(
        'created_at',
        {
          ascending: true
        }
      );

  if (error) {
    console.error(
      'Erro ao carregar mensagens:',
      error
    );

    mensagensAtuais = [];

    renderizarMensagens();

    return;
  }

  mensagensAtuais = data || [];

  renderizarMensagens();
}


async function salvarMensagem(
  conversaId,
  role,
  content
) {
  const {
    data,
    error
  } =
    await supabaseClient
      .from('messages')
      .insert({
        conversation_id:
          conversaId,

        user_id:
          usuarioAtual.id,

        role:
          role,

        content:
          content
      })
      .select()
      .single();

  if (error) {
    console.error(
      'Erro ao salvar mensagem:',
      error
    );

    throw error;
  }

  return data;
}


/* ========================= */
/* RENDERIZAÇÃO              */
/* ========================= */

function renderizarRecentes() {
  recentes.innerHTML = '';

  if (!usuarioAtual) {
    return;
  }

  conversas
    .slice(0, 7)
    .forEach(conversa => {
      const item =
        document.createElement(
          'div'
        );

      item.className =
        'recent-item-wrapper';

      item.style.display =
        'flex';

      item.style.alignItems =
        'center';

      item.style.gap =
        '6px';

      const botao =
        document.createElement(
          'button'
        );

      botao.className =
        'recent-item';

      botao.textContent =
        conversa.title;

      botao.style.flex =
        '1';

      botao.style.minWidth =
        '0';

      if (
        conversa.id ===
        conversaAtual
      ) {
        botao.classList.add(
          'active'
        );
      }

      botao.addEventListener(
        'click',
        () => {
          selecionarConversa(
            conversa.id
          );
        }
      );

      const excluir =
        document.createElement(
          'button'
        );

      excluir.type = 'button';

      excluir.className =
        'delete-conversation-btn';

      excluir.textContent = '🗑️';

      excluir.title =
        'Excluir conversa';

      excluir.setAttribute(
        'aria-label',
        `Excluir conversa ${conversa.title}`
      );

      excluir.style.border =
        'none';

      excluir.style.background =
        'transparent';

      excluir.style.cursor =
        'pointer';

      excluir.style.padding =
        '6px';

      excluir.style.flexShrink =
        '0';

      excluir.addEventListener(
        'click',
        event => {
          event.stopPropagation();

          excluirConversa(
            conversa.id
          );
        }
      );

      item.appendChild(
        botao
      );

      item.appendChild(
        excluir
      );

      recentes.appendChild(
        item
      );
    });
}


function renderizarMensagens() {
  if (!usuarioAtual) {
    mensagens.innerHTML =
      mensagemSemLogin();

    campo.disabled = true;

    return;
  }

  campo.disabled = false;

  if (!conversaAtual) {
    mensagens.innerHTML = `
      <div class="message-row">

        ${avatarMovi()}

        <div class="message-column">

          <div class="bubble">

            ${mensagemInicial()}

          </div>

          <div class="time">
            ${horaAgora()}
          </div>

        </div>

      </div>
    `;

    return;
  }

  let html = `
    <div class="message-row">

      ${avatarMovi()}

      <div class="message-column">

        <div class="bubble">

          ${mensagemInicial()}

        </div>

      </div>

    </div>
  `;

  mensagensAtuais
    .forEach(msg => {
      if (
        msg.role === 'user'
      ) {
        html += `
          <div class="message-row user">

            <div class="message-column">

              <div class="bubble">

                ${escaparHTML(
                  msg.content
                )}

              </div>

              <div class="time">

                ${formatarHora(
                  msg.created_at
                )}

                &nbsp;✓✓

              </div>

            </div>

          </div>
        `;
      } else {
        html += `
          <div class="message-row">

            ${avatarMovi()}

            <div class="message-column">

              <div class="bubble">

                ${formatarResposta(
                  msg.content
                )}

              </div>

              <div class="time">

                ${formatarHora(
                  msg.created_at
                )}

              </div>

            </div>

          </div>
        `;
      }
    });

  mensagens.innerHTML = html;

  mensagens.scrollTop =
    mensagens.scrollHeight;
}


/* ========================= */
/* HISTÓRICO PARA O RAG      */
/* ========================= */

function montarHistorico() {
  return mensagensAtuais.map(
    msg => ({
      role: msg.role,
      content: msg.content
    })
  );
}


/* ========================= */
/* BACKEND MOVI              */
/* ========================= */

async function perguntarMovi(
  pergunta,
  historico
) {
  const resposta =
    await fetch(
      `${API_URL}/chat`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body: JSON.stringify({
          pergunta:
            pergunta,

          historico:
            historico
        })
      }
    );

  if (!resposta.ok) {
    const erro =
      await resposta
        .json()
        .catch(
          () => null
        );

    throw new Error(
      erro?.detail ||
      'Não foi possível consultar o Movi.'
    );
  }

  return await resposta.json();
}


/* ========================= */
/* ENVIAR MENSAGEM           */
/* ========================= */

formulario.addEventListener(
  'submit',
  async event => {
    event.preventDefault();

    if (!usuarioAtual) {
      abrirAuth('login');
      return;
    }

    const texto =
      campo.value.trim();

    if (!texto) {
      return;
    }

    if (!conversaAtual) {
      await criarConversa();
    }

    if (!conversaAtual) {
      return;
    }

    const historico =
      montarHistorico();

    campo.value = '';
    campo.disabled = true;

    try {
      const mensagemUsuario =
        await salvarMensagem(
          conversaAtual,
          'user',
          texto
        );

      mensagensAtuais.push(
        mensagemUsuario
      );

      const conversa =
        conversas.find(
          item =>
            item.id ===
            conversaAtual
        );

      if (
        conversa &&
        conversa.title ===
          'Nova conversa'
      ) {
        const titulo =
          texto.slice(
            0,
            28
          );

        await atualizarTituloConversa(
          conversaAtual,
          titulo
        );
      }

      await atualizarDataConversa(
        conversaAtual
      );

renderizarMensagens();

mostrarMoviDigitando();

const dados =
  await perguntarMovi(
    texto,
    historico
  );

removerMoviDigitando();

      const mensagemMovi =
        await salvarMensagem(
          conversaAtual,
          'assistant',
          dados.resposta
        );

      mensagensAtuais.push(
        mensagemMovi
      );

      await atualizarDataConversa(
        conversaAtual
      );

      renderizarMensagens();

    } catch (erro) {
      console.error(
        'Erro:',
        erro
      );

      mensagensAtuais.push({
        id:
          `erro-${Date.now()}`,

        role:
          'assistant',

        content:
          `Não consegui responder agora. ${erro.message}`,

        created_at:
          new Date().toISOString()
      });

      renderizarMensagens();

    } finally {
      campo.disabled = false;
      campo.focus();
    }
  }
);


/* ========================= */
/* NOVA CONVERSA             */
/* ========================= */

document
  .querySelector(
    '#newChatBtn'
  )
  .addEventListener(
    'click',
    criarConversa
  );


/* ========================= */
/* TEMA                      */
/* ========================= */

document
  .querySelector(
    '#themeBtn'
  )
  .addEventListener(
    'click',
    () => {
      document.body
        .classList
        .toggle('dark');
    }
  );


/* ========================= */
/* BUSCA                     */
/* ========================= */

busca.addEventListener(
  'input',
  () => {
    const termo =
      busca.value
        .toLowerCase();

    document
      .querySelectorAll(
        '.bubble'
      )
      .forEach(
        balao => {
          balao.style.opacity =
            !termo ||

            balao.textContent
              .toLowerCase()
              .includes(termo)

              ? '1'

              : '.22';
        }
      );
  }
);


/* ========================= */
/* PERFIL                    */
/* ========================= */

const profileBtn =
  document.querySelector(
    '#profileBtn'
  );

const profileMenu =
  document.querySelector(
    '#profileMenu'
  );

const profileAvatarLetter =
  document.querySelector(
    '#profileAvatarLetter'
  );

const profileAvatarImage =
  document.querySelector(
    '#profileAvatarImage'
  );

const profileBtnLetter =
  document.querySelector(
    '#profileBtnLetter'
  );

const profileBtnImage =
  document.querySelector(
    '#profileBtnImage'
  );

const profileName =
  document.querySelector(
    '#profileName'
  );

const profileEmail =
  document.querySelector(
    '#profileEmail'
  );

const loggedOutActions =
  document.querySelector(
    '#loggedOutActions'
  );

const loggedInActions =
  document.querySelector(
    '#loggedInActions'
  );

const logoutBtn =
  document.querySelector(
    '#logoutBtn'
  );


/* ========================= */
/* MODAL DE AUTENTICAÇÃO     */
/* ========================= */

const authOverlay =
  document.querySelector(
    '#authOverlay'
  );

const authClose =
  document.querySelector(
    '#authClose'
  );

const authForm =
  document.querySelector(
    '#authForm'
  );

const authTitle =
  document.querySelector(
    '#authTitle'
  );

const authSubtitle =
  document.querySelector(
    '#authSubtitle'
  );

const authSubmit =
  document.querySelector(
    '#authSubmit'
  );

const authSwitchText =
  document.querySelector(
    '#authSwitchText'
  );

const authSwitchBtn =
  document.querySelector(
    '#authSwitchBtn'
  );

const authPassword =
  document.querySelector(
    '#authPassword'
  );

const googleLoginBtn =
  document.querySelector(
    '#googleLoginBtn'
  );

let authMode =
  'login';


/* ========================= */
/* INTERFACE DO USUÁRIO      */
/* ========================= */

function mostrarUsuario(
  usuario
) {
  usuarioAtual =
    usuario;

  const nome =
    usuario
      .user_metadata
      ?.full_name ||

    usuario
      .user_metadata
      ?.name ||

    usuario.email
      ?.split('@')[0] ||

    'Usuário';

  const foto =
    usuario
      .user_metadata
      ?.avatar_url ||

    usuario
      .user_metadata
      ?.picture ||

    null;

  const inicial =
    nome
      .charAt(0)
      .toUpperCase();

  profileName.textContent =
    nome;

  profileEmail.textContent =
    usuario.email ||
    'Conta conectada';

  if (foto) {
    profileAvatarImage.src =
      foto;

    profileBtnImage.src =
      foto;

    profileAvatarImage.hidden =
      false;

    profileBtnImage.hidden =
      false;

    profileAvatarLetter.hidden =
      true;

    profileBtnLetter.hidden =
      true;
  } else {
    profileAvatarImage.hidden =
      true;

    profileBtnImage.hidden =
      true;

    profileAvatarLetter.hidden =
      false;

    profileBtnLetter.hidden =
      false;

    profileAvatarLetter.textContent =
      inicial;

    profileBtnLetter.textContent =
      inicial;
  }

  loggedOutActions.hidden =
    true;

  loggedInActions.hidden =
    false;
}


function mostrarDesconectado() {
  usuarioAtual = null;
  conversaAtual = null;
  conversas = [];
  mensagensAtuais = [];

  profileName.textContent =
    'Minha conta';

  profileEmail.textContent =
    'Entre para salvar seu perfil';

  profileAvatarImage.hidden =
    true;

  profileBtnImage.hidden =
    true;

  profileAvatarLetter.hidden =
    false;

  profileBtnLetter.hidden =
    false;

  profileAvatarLetter.textContent =
    'M';

  profileBtnLetter.textContent =
    'M';

  loggedOutActions.hidden =
    false;

  loggedInActions.hidden =
    true;

  renderizarRecentes();
  renderizarMensagens();
}


/* ========================= */
/* CONFIGURAÇÃO DO MODAL     */
/* ========================= */

function configurarAuth(
  modo
) {
  authMode =
    modo;

  const cadastro =
    modo === 'register';

  authOverlay
    .classList
    .toggle(
      'register',
      cadastro
    );

  authTitle.textContent =
    cadastro
      ? 'Criar sua conta'
      : 'Entrar no Movi';

  authSubtitle.textContent =
    cadastro
      ? 'Crie uma conta para manter seu perfil e suas conversas organizadas.'
      : 'Acesse sua conta para manter suas conversas salvas.';

  authSubmit.textContent =
    cadastro
      ? 'Criar conta'
      : 'Entrar';

  authSwitchText.textContent =
    cadastro
      ? 'Já tem uma conta?'
      : 'Ainda não tem uma conta?';

  authSwitchBtn.textContent =
    cadastro
      ? 'Entrar'
      : 'Criar conta';

  authPassword.autocomplete =
    cadastro
      ? 'new-password'
      : 'current-password';

  document
    .querySelector(
      '#authName'
    )
    .required =
      cadastro;
}


function abrirAuth(
  modo
) {
  configurarAuth(
    modo
  );

  profileMenu
    .classList
    .remove('open');

  authOverlay
    .classList
    .add('open');

  authOverlay
    .setAttribute(
      'aria-hidden',
      'false'
    );

  setTimeout(
    () => {
      document
        .querySelector(
          modo ===
            'register'
            ? '#authName'
            : '#authEmail'
        )
        .focus();
    },
    50
  );
}


function fecharAuth() {
  authOverlay
    .classList
    .remove('open');

  authOverlay
    .setAttribute(
      'aria-hidden',
      'true'
    );
}


/* ========================= */
/* MENU DO PERFIL            */
/* ========================= */

profileBtn.addEventListener(
  'click',
  event => {
    event.stopPropagation();

    profileMenu
      .classList
      .toggle('open');
  }
);


document
  .querySelector(
    '#openLoginBtn'
  )
  .addEventListener(
    'click',
    () => {
      abrirAuth(
        'login'
      );
    }
  );


document
  .querySelector(
    '#openRegisterBtn'
  )
  .addEventListener(
    'click',
    () => {
      abrirAuth(
        'register'
      );
    }
  );


authClose.addEventListener(
  'click',
  fecharAuth
);


authSwitchBtn.addEventListener(
  'click',
  () => {
    configurarAuth(
      authMode ===
        'login'
        ? 'register'
        : 'login'
    );
  }
);


authOverlay.addEventListener(
  'click',
  event => {
    if (
      event.target ===
      authOverlay
    ) {
      fecharAuth();
    }
  }
);


document.addEventListener(
  'click',
  event => {
    if (
      !profileMenu
        .contains(
          event.target
        )

      &&

      event.target !==
        profileBtn
    ) {
      profileMenu
        .classList
        .remove('open');
    }
  }
);


document.addEventListener(
  'keydown',
  event => {
    if (
      event.key ===
      'Escape'
    ) {
      fecharAuth();
    }
  }
);


/* ========================= */
/* GOOGLE                    */
/* ========================= */

googleLoginBtn
  .addEventListener(
    'click',
    async () => {
      const {
        error
      } =
        await supabaseClient
          .auth
          .signInWithOAuth({
            provider:
              'google',

            options: {
              redirectTo:
                window.location.origin
            }
          });

      if (error) {
        console.error(
          'Erro ao entrar com Google:',
          error.message
        );

        alert(
          'Não foi possível entrar com Google.'
        );
      }
    }
  );


/* ========================= */
/* LOGOUT                    */
/* ========================= */

logoutBtn.addEventListener(
  'click',
  async () => {
    const {
      error
    } =
      await supabaseClient
        .auth
        .signOut();

    if (error) {
      console.error(
        'Erro ao sair:',
        error.message
      );

      alert(
        'Não foi possível sair da conta.'
      );

      return;
    }

    mostrarDesconectado();

    profileMenu
      .classList
      .remove('open');
  }
);


/* ========================= */
/* LOGIN POR E-MAIL          */
/* ========================= */

authForm.addEventListener(
  'submit',
  async event => {
    event.preventDefault();

    const nome =
      document
        .querySelector(
          '#authName'
        )
        .value
        .trim();

    const email =
      document
        .querySelector(
          '#authEmail'
        )
        .value
        .trim();

    const senha =
      authPassword.value;

    authSubmit.disabled =
      true;

    try {
      if (
        authMode ===
        'register'
      ) {
        const {
          data,
          error
        } =
          await supabaseClient
            .auth
            .signUp({
              email:
                email,

              password:
                senha,

              options: {
                data: {
                  full_name:
                    nome
                }
              }
            });

        if (error) {
          throw error;
        }

        if (
          data.session
        ) {
          fecharAuth();
        } else {
          alert(
            'Conta criada. Verifique seu e-mail para confirmar o cadastro.'
          );
        }
      } else {
        const {
          error
        } =
          await supabaseClient
            .auth
            .signInWithPassword({
              email:
                email,

              password:
                senha
            });

        if (error) {
          throw error;
        }

        fecharAuth();
      }

      authForm.reset();

    } catch (erro) {
      console.error(
        'Erro na autenticação:',
        erro
      );

      alert(
        erro.message ||
        'Não foi possível concluir a autenticação.'
      );

    } finally {
      authSubmit.disabled =
        false;

      configurarAuth(
        authMode
      );
    }
  }
);


/* ========================= */
/* SESSÃO                    */
/* ========================= */

async function iniciarSessao() {
  const {
    data: {
      session
    },
    error
  } =
    await supabaseClient
      .auth
      .getSession();

  if (error) {
    console.error(
      'Erro ao verificar sessão:',
      error.message
    );

    mostrarDesconectado();

    return;
  }

  if (
    session?.user
  ) {
    mostrarUsuario(
      session.user
    );

    await carregarConversas();
  } else {
    mostrarDesconectado();
  }
}


/* Quando login/logout mudar */

supabaseClient
  .auth
  .onAuthStateChange(
    (
      event,
      session
    ) => {
      setTimeout(
        async () => {
          if (
            session?.user
          ) {
            const mudouUsuario =
              usuarioAtual?.id !==
              session.user.id;

            mostrarUsuario(
              session.user
            );

            fecharAuth();

            if (
              mudouUsuario ||
              event ===
                'SIGNED_IN'
            ) {
              await carregarConversas();
            }
          } else {
            mostrarDesconectado();
          }
        },
        0
      );
    }
  );


/* ========================= */
/* INICIALIZAÇÃO             */
/* ========================= */

iniciarSessao();


function mostrarMoviDigitando() {

  removerMoviDigitando();

  const digitando =
    document.createElement(
      'div'
    );

  digitando.id =
    'moviDigitando';

  digitando.className =
    'message-row movi-typing';

  digitando.innerHTML = `
    <div class="bot-avatar typing-avatar">

      <img
        src="assets/img/3.png"
        alt="Movi"
        onerror="this.style.display='none'; this.parentElement.textContent='🦫'"
      >

    </div>

    <div class="message-column">

      <div class="bubble typing-bubble">

        <span class="typing-text">
          Movi está digitando
        </span>

        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>

      </div>

    </div>
  `;

  mensagens.appendChild(
    digitando
  );

  mensagens.scrollTop =
    mensagens.scrollHeight;
}


function removerMoviDigitando() {
  const digitando =
    document.querySelector(
      '#moviDigitando'
    );

  if (digitando) {
    digitando.remove();
  }
}