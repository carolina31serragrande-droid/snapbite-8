/* SnapBite — app.js
   Auth, Carrinho, Cookies, Toasts, Modal
   Login local, horários de compra e envio de e-mail do pedido
*/

'use strict';

// ────────────────────────────────────────
// ESTADO GLOBAL
// ────────────────────────────────────────
const App = {
  usuario: JSON.parse(localStorage.getItem('snapbite_user') || 'null'),
  carrinho: [],
  pendingProduct: null,
  metodoPagamento: null,
  pixChaveAtual: null,
  codigoResgate: null,
};
window.App = App;

function getIdentificadorUsuario(usuario = App.usuario) {
  if (!usuario) return null;
  return usuario.uid || usuario.email || null;
}

function getPerfisSalvos() {
  return JSON.parse(localStorage.getItem('snapbite_profiles') || '{}');
}

function salvarPerfisSalvos(perfis) {
  localStorage.setItem('snapbite_profiles', JSON.stringify(perfis));
}

function getPerfilUsuario(usuario = App.usuario) {
  const id = getIdentificadorUsuario(usuario);
  if (!id || !usuario) return null;

  const perfis = getPerfisSalvos();
  const perfil = perfis[id] || {};

  const nomeBase = perfil.nome || usuario.nome || 'Usuário SnapBite';
  const fotoBase = perfil.foto || usuario.foto || usuario.avatar || '';

  return {
    nome: nomeBase,
    email: usuario.email || '',
    foto: fotoBase,
    descricao: perfil.descricao || '',
    experiencia: perfil.experiencia || '',
    inicial: nomeBase.trim().charAt(0).toUpperCase() || 'U'
  };
}

function salvarPerfilUsuario(dados, usuario = App.usuario) {
  const id = getIdentificadorUsuario(usuario);
  if (!id) return null;

  const perfis = getPerfisSalvos();
  const atual = getPerfilUsuario(usuario) || {};

  const perfilFinal = {
    ...atual,
    ...dados,
  };

  perfis[id] = perfilFinal;
  salvarPerfisSalvos(perfis);

  return perfilFinal;
}

function sincronizarMenuAutenticado() {
  const linkCriarConta = document.querySelector('[data-open-cadastro]');
  const linkPerfil = document.querySelector('[data-menu-perfil]');

  if (linkCriarConta) {
    linkCriarConta.style.display = App.usuario ? 'none' : '';
  }

  if (linkPerfil) {
    linkPerfil.style.display = App.usuario ? '' : 'none';
  }
}

// ────────────────────────────────────────
// UTILIDADES
// ────────────────────────────────────────
function formatBRL(valor) {
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
}

function getChaveCarrinho() {
  const id = getIdentificadorUsuario();
  return id ? `snapbite_cart_${id}` : 'snapbite_cart_guest';
}

function carregarCarrinhoUsuario() {
  App.carrinho = JSON.parse(localStorage.getItem(getChaveCarrinho()) || '[]');
  atualizarBadgeCarrinho();
  renderizarCarrinho();
}

function salvarCarrinho() {
  localStorage.setItem(getChaveCarrinho(), JSON.stringify(App.carrinho));
}

function atualizarBadgeCarrinho() {
  const badges = document.querySelectorAll('.carrinho-badge');
  const total = App.carrinho.reduce((acc, i) => acc + i.qtd, 0);

  badges.forEach((badge) => {
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  });
}

// ────────────────────────────────────────
// HORÁRIO DE COMPRA
// ────────────────────────────────────────
function estaNoHorarioDeCompra() {
  const agora = new Date();
  const dia = agora.getDay(); // 0 domingo, 6 sábado

  if (dia === 0 || dia === 6) return false;

  const totalMin = agora.getHours() * 60 + agora.getMinutes();

  const inicioManha = 7 * 60;        // 07:00
  const fimManha = 8 * 60 + 30;      // 08:30
  const inicioTarde = 11 * 60;       // 11:00
  const fimTarde = 12 * 60 + 30;     // 12:30

  const dentroManha = totalMin >= inicioManha && totalMin <= fimManha;
  const dentroTarde = totalMin >= inicioTarde && totalMin <= fimTarde;

  return dentroManha || dentroTarde;
}

function getMensagemHorarioCompra() {
  return 'Compras liberadas somente de 07:00 às 08:30 e de 11:00 às 12:30.';
}

function atualizarEstadoDosBotoesCompra() {
  const liberado = estaNoHorarioDeCompra();

  const botoes = document.querySelectorAll('.btn-add, .prod-add-btn, .btn-finalizar');

  botoes.forEach((btn) => {
    btn.disabled = !liberado;
    btn.style.opacity = liberado ? '1' : '0.55';
    btn.style.cursor = liberado ? 'pointer' : 'not-allowed';
    btn.title = liberado ? '' : getMensagemHorarioCompra();
  });
}

// ────────────────────────────────────────
// GERADORES
// ────────────────────────────────────────
function gerarChavePix() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const seg = (n) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

  return `snp-${seg(4)}-${seg(4)}@pix.senai.br`;
}

function gerarCodigoResgate() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = (n) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

  return `SB-${seg(4)}-${seg(4)}`;
}

// ────────────────────────────────────────
// COPIAR
// ────────────────────────────────────────
function copiarTexto(texto, mensagemSucesso, mensagemErro) {
  if (!texto) return;

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(texto)
      .then(() => showToast(mensagemSucesso, 'success'))
      .catch(() => showToast(mensagemErro, 'warning'));
    return;
  }

  const el = document.createElement('textarea');
  el.value = texto;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  showToast(mensagemSucesso, 'success');
}

function copiarChavePix() {
  copiarTexto(
    App.pixChaveAtual,
    'Chave PIX copiada! 📋',
    'Não foi possível copiar automaticamente.'
  );
}

function copiarCodigoResgate() {
  copiarTexto(
    App.codigoResgate,
    'Código copiado! 🎟️',
    'Não foi possível copiar automaticamente.'
  );
}

// ────────────────────────────────────────
// QR CODE PIX
// ────────────────────────────────────────
function renderizarQRCodePix(chave) {
  const qrEl = document.getElementById('pix-qrcode');
  if (!qrEl) return;

  qrEl.innerHTML = '';

  if (typeof QRCode !== 'undefined') {
    new QRCode(qrEl, {
      text: chave,
      width: 160,
      height: 160,
      colorDark: '#1A0F0A',
      colorLight: '#FFF8F0',
      correctLevel: QRCode.CorrectLevel.M,
    });
    return;
  }

  const encoded = encodeURIComponent(chave);
  const img = document.createElement('img');
  img.src = `https://chart.googleapis.com/chart?chs=160x160&cht=qr&chl=${encoded}&choe=UTF-8`;
  img.alt = 'QR Code PIX';
  img.style.cssText =
    'border-radius:8px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.12);';

  qrEl.appendChild(img);
}

// ────────────────────────────────────────
// TOASTS
// ────────────────────────────────────────
function showToast(msg, tipo = 'success', duracao = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.innerHTML = `<span class="toast-icon">${icons[tipo] || '✅'}</span> ${msg}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s, transform 0.4s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(60px)';
    setTimeout(() => toast.remove(), 400);
  }, duracao);
}

// ────────────────────────────────────────
// MODAIS
// ────────────────────────────────────────
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  modal.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ────────────────────────────────────────
// NAVBAR
// ────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('menu-mobile');
  const overlay = document.getElementById('menu-overlay');
  const btnTheme = document.getElementById('btn-theme');
  const btnThemeMobile = document.getElementById('menu-theme-mobile');
  const themeIcons = document.querySelectorAll('.theme-icon, .theme-icon-mobile');

  if (!navbar) return;

  function atualizarIconesTema() {
    const dark = document.body.classList.contains('dark');

    themeIcons.forEach((icon) => {
      if (!icon) return;
      icon.innerHTML = dark
        ? '<i class="fa-solid fa-sun" style="color: #c7952a;"></i>'
        : '<i class="fa-solid fa-moon" style="color: #c7952a;"></i>';
    });
  }

  function aplicarTema(theme) {
    const dark = theme === 'dark';
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('snapbite-theme', dark ? 'dark' : 'light');
    atualizarIconesTema();
  }

  function abrirMenu() {
    if (!menu || !hamburger) return;
    menu.classList.add('open');
    overlay?.classList.add('show');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
  }

  function fecharMenu() {
    if (!menu || !hamburger) return;
    menu.classList.remove('open');
    overlay?.classList.remove('show');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  }

  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      if (menu.classList.contains('open')) {
        fecharMenu();
      } else {
        abrirMenu();
      }
    });
  }

  overlay?.addEventListener('click', fecharMenu);

  menu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (link.hasAttribute('data-open-cadastro')) {
        e.preventDefault();
        fecharMenu();
        window.location.href = 'login.html?aba=cadastro';
        return;
      }

      fecharMenu();
    });
  });

  const temaSalvo = localStorage.getItem('snapbite-theme');
  aplicarTema(temaSalvo === 'dark' ? 'dark' : 'light');

  btnTheme?.addEventListener('click', () => {
    const dark = document.body.classList.contains('dark');
    aplicarTema(dark ? 'light' : 'dark');
  });

  btnThemeMobile?.addEventListener('click', () => {
    const dark = document.body.classList.contains('dark');
    aplicarTema(dark ? 'light' : 'dark');
  });

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  atualizarNavAuth();
}

function atualizarNavAuth() {
  const areaLogin = document.getElementById('nav-auth-area');
  if (!areaLogin) return;

  sincronizarMenuAutenticado();

  if (App.usuario) {
    const perfil = getPerfilUsuario(App.usuario);
    const inicial = perfil?.inicial || 'U';
    const nomeCurto = (perfil?.nome || App.usuario.nome || 'Usuário').split(' ')[0];
    const fotoHtml = perfil?.foto
      ? `<img src="${perfil.foto}" alt="Perfil" class="nav-profile-avatar-img">`
      : `<span class="nav-profile-avatar-initial">${inicial}</span>`;

    areaLogin.innerHTML = `
      <a href="perfil.html" class="nav-profile-avatar" title="Meu perfil" aria-label="Meu perfil">
        ${fotoHtml}
      </a>

      <span style="color:#aaa;font-size:0.85rem;font-weight:700;">
        Olá, <strong style="color:var(--mostarda)">${nomeCurto}</strong>
      </span>

      <button onclick="logout()" class="btn-login-nav" style="border-color:var(--terracota);color:var(--terracota);">
        Sair
      </button>
    `;
    return;
  }

  areaLogin.innerHTML = `
    <a href="login.html"><button class="btn-login-nav" style="color:#fff;">Entrar</button></a>
    <a href="login.html?aba=cadastro"><button class="btn-login-nav">Criar conta</button></a>
  `;
}

// ────────────────────────────────────────
// AUTENTICAÇÃO
// ────────────────────────────────────────
function mockServerAuth(tipo, dados) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const usuarios = JSON.parse(localStorage.getItem('snapbite_usuarios') || '[]');

      if (tipo === 'google') {
        resolve({
          nome: 'Estudante Google',
          email: 'aluno@gmail.com',
          avatar: '🧑‍🎓',
          provider: 'google',
        });
        return;
      }

      if (tipo === 'facebook') {
        resolve({
          nome: 'Estudante Facebook',
          email: 'aluno@facebook.com',
          avatar: '📘',
          provider: 'facebook',
        });
        return;
      }

      if (tipo === 'cadastro') {
        const nome = dados.nome?.trim();
        const email = dados.email?.trim().toLowerCase();
        const senha = dados.senha?.trim();

        if (!nome || !email || !senha || senha.length < 6) {
          reject('Preencha todos os campos corretamente.');
          return;
        }

        const existe = usuarios.find((u) => u.email === email);
        if (existe) {
          reject('Este e-mail já está cadastrado.');
          return;
        }

        const novoUsuario = {
          nome,
          email,
          senha,
          avatar: '🎒',
          provider: 'site',
        };

        usuarios.push(novoUsuario);
        localStorage.setItem('snapbite_usuarios', JSON.stringify(usuarios));

        resolve({
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          avatar: novoUsuario.avatar,
          provider: novoUsuario.provider,
        });
        return;
      }

      if (tipo === 'login') {
        const email = dados.email?.trim().toLowerCase();
        const senha = dados.senha?.trim();

        if (!email || !senha) {
          reject('Preencha email e senha.');
          return;
        }

        const usuario = usuarios.find((u) => u.email === email && u.senha === senha);

        if (!usuario) {
          reject('Email ou senha inválidos.');
          return;
        }

        resolve({
          nome: usuario.nome,
          email: usuario.email,
          avatar: usuario.avatar,
          provider: usuario.provider,
        });
        return;
      }

      reject('Tipo de autenticação inválido.');
    }, 500);
  });
}

async function fazerLogin(tipo, dados = {}) {
  showToast('Conectando...', 'info', 1500);

  try {
    const user = await mockServerAuth(tipo, dados);
    App.usuario = user;
    localStorage.setItem('snapbite_user', JSON.stringify(user));
    carregarCarrinhoUsuario();
    closeModal('modal-login');
    atualizarNavAuth();
    showToast(`Bem-vindo(a), ${user.nome.split(' ')[0]}! 🎉`, 'success');

    if (App.pendingProduct) {
      const produtoPendente = App.pendingProduct;
      App.pendingProduct = null;
      adicionarAoCarrinho(produtoPendente);
    }
  } catch (erro) {
    showToast(erro || 'Erro ao fazer login. Tente novamente.', 'error');
  }
}

function logout() {
  App.carrinho = [];
  atualizarBadgeCarrinho();

  if (document.getElementById('carrinho-lista')) {
    renderizarCarrinho();
  }

  // Sempre usa o logout do Firebase para garantir que a sessão seja encerrada
  // (evita o bug de login persistindo após recarregar a página)
  if (typeof window.logoutFirebaseReal === 'function') {
    window.logoutFirebaseReal();
    return;
  }

  // Fallback caso Firebase ainda não tenha carregado
  App.usuario = null;
  localStorage.removeItem('snapbite_user');
  localStorage.removeItem('snapbite_lembrar');
  atualizarNavAuth();
  showToast('Você saiu da conta.', 'info');
  window.location.href = 'login.html';
}

function redefinirSenha(email, novaSenha) {
  const usuarios = JSON.parse(localStorage.getItem('snapbite_usuarios') || '[]');
  const emailLimpo = email.trim().toLowerCase();

  const index = usuarios.findIndex((u) => u.email === emailLimpo);

  if (index === -1) {
    throw new Error('E-mail não encontrado.');
  }

  usuarios[index].senha = novaSenha;
  localStorage.setItem('snapbite_usuarios', JSON.stringify(usuarios));
}

function initAuthForms() {
  document.querySelectorAll('.modal-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.modal-tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(tab.dataset.tab)?.classList.add('active');
    });
  });

  document.getElementById('form-login')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    await fazerLogin('login', { email, senha });
  });

  document.getElementById('form-cadastro')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('cad-nome').value;
    const email = document.getElementById('cad-email').value;
    const senha = document.getElementById('cad-senha').value;

    await fazerLogin('cadastro', { nome, email, senha });
  });

  document.getElementById('btn-google')?.addEventListener('click', () => {
    window.loginComGoogleReal?.();
  });
  
  document.getElementById('btn-facebook')?.addEventListener('click', () => {
    window.loginComFacebookReal?.();
  });

  document.querySelectorAll('.modal-close').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal(btn.dataset.modal || 'modal-login');
    });
  });

  document.getElementById('btn-esqueceu-senha')?.addEventListener('click', () => {
    closeModal('modal-login');
    openModal('modal-esqueceu-senha');
  });

  document.getElementById('form-esqueceu-senha')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('rec-email').value.trim();
    const senha = document.getElementById('rec-senha').value.trim();
    const senha2 = document.getElementById('rec-senha2').value.trim();

    if (senha.length < 6) {
      showToast('A senha precisa ter pelo menos 6 caracteres.', 'warning');
      return;
    }

    if (senha !== senha2) {
      showToast('As senhas não coincidem.', 'error');
      return;
    }

    try {
      redefinirSenha(email, senha);
      showToast('Senha redefinida com sucesso!', 'success');
      closeModal('modal-esqueceu-senha');
      openModal('modal-login');
    } catch (erro) {
      showToast(erro.message || 'Erro ao redefinir senha.', 'error');
    }
  });
}

// ────────────────────────────────────────
// CARRINHO
// ────────────────────────────────────────
function adicionarAoCarrinho(produto) {
  if (!estaNoHorarioDeCompra()) {
    showToast(getMensagemHorarioCompra(), 'warning', 4500);
    return;
  }

  if (!App.usuario) {
    App.pendingProduct = produto;
    showToast('⚠️ Você precisa fazer login para comprar!', 'warning', 4000);
    openModal('modal-login');
    return;
  }

  const existente = App.carrinho.find((i) => i.id === produto.id);

  if (existente) {
    existente.qtd += 1;
  } else {
    App.carrinho.push({ ...produto, qtd: 1 });
  }

  salvarCarrinho();
  atualizarBadgeCarrinho();
  renderizarCarrinho();
  showToast(`${produto.nome} adicionado ao carrinho! 🛒`, 'success');
}

function removerDoCarrinho(id) {
  App.carrinho = App.carrinho.filter((i) => i.id !== id);
  salvarCarrinho();
  renderizarCarrinho();
  atualizarBadgeCarrinho();
}

function alterarQtd(id, delta) {
  const item = App.carrinho.find((i) => i.id === id);
  if (!item) return;

  item.qtd += delta;

  if (item.qtd <= 0) {
    removerDoCarrinho(id);
    return;
  }

  salvarCarrinho();
  renderizarCarrinho();
  atualizarBadgeCarrinho();
}

function calcularTotais() {
  const subtotal = App.carrinho.reduce((acc, i) => acc + i.preco * i.qtd, 0);
  const taxa = 0;
  return { subtotal, taxa, total: subtotal + taxa };
}

function renderizarCarrinho() {
  const lista = document.getElementById('carrinho-lista');
  const subtotalEl = document.getElementById('resumo-subtotal');
  const totalEl = document.getElementById('resumo-total');
  const qtdEl = document.getElementById('resumo-qtd');

  if (!lista) return;

  if (App.carrinho.length === 0) {
    lista.innerHTML = `
      <div class="vazio">
        <div class="vazio-emoji">🛒</div>
        <h3>Carrinho vazio</h3>
        <p>Adicione seus lanches favoritos!</p>
        <a href="cardapio.html" class="btn-primary" style="margin-top:20px;display:inline-flex">Ver Cardápio</a>
      </div>
    `;
  } else {
    lista.innerHTML = App.carrinho
      .map(
        (item) => `
          <div class="c-item" data-id="${item.id}">
            <div class="c-emoji">${item.emoji}</div>
            <div class="c-info">
              <div class="c-nome">${item.nome}</div>
              <div class="c-desc">${item.desc || ''}</div>
            </div>
            <div class="c-qtd">
              <button class="qtd-b" onclick="alterarQtd('${item.id}', -1)">−</button>
              <span class="qtd-n">${item.qtd}</span>
              <button class="qtd-b" onclick="alterarQtd('${item.id}', 1)">+</button>
            </div>
            <div class="c-preco">${formatBRL(item.preco * item.qtd)}</div>
            <button class="c-rm" onclick="removerDoCarrinho('${item.id}')" title="Remover">✕</button>
          </div>
        `
      )
      .join('');
  }

  const { subtotal, total } = calcularTotais();
  const qtd = App.carrinho.reduce((acc, i) => acc + i.qtd, 0);

  if (subtotalEl) subtotalEl.textContent = formatBRL(subtotal);
  if (totalEl) totalEl.textContent = formatBRL(total);
  if (qtdEl) qtdEl.textContent = `${qtd} ${qtd === 1 ? 'item' : 'itens'}`;

  atualizarEstadoDosBotoesCompra();
}

// ────────────────────────────────────────
// E-MAIL DO PEDIDO
// ────────────────────────────────────────
async function enviarEmailPedidoConcluido(numeroPedido) {
  if (!App.usuario?.email) {
    console.warn('Usuário sem e-mail.');
    return null;
  }

  const { total } = calcularTotais();

  const payload = {
    nomeCliente: App.usuario.nome || 'Cliente',
    emailCliente: App.usuario.email,
    numeroPedido,
    itens: App.carrinho.map((item) => ({
      nome: item.nome,
      qtd: item.qtd,
      preco: item.preco,
    })),
    total,
  };

  const resposta = await fetch('https://snapbite-pxn6.onrender.com/api/enviar-email-pedido', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro ao enviar e-mail.');
  }

  return dados;
}

// ────────────────────────────────────────
// PAGAMENTO
// ────────────────────────────────────────
function finalizarPedido() {
  if (!estaNoHorarioDeCompra()) {
    showToast(getMensagemHorarioCompra(), 'warning', 4500);
    return;
  }

  if (!App.usuario) {
    showToast('⚠️ Você precisa fazer login!', 'warning');
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname.split('/').pop());
    return;
  }

  if (App.carrinho.length === 0) {
    showToast('Seu carrinho está vazio!', 'error');
    return;
  }

  const pillEl = document.getElementById('pag-total-pill');
  if (pillEl) {
    const { total } = calcularTotais();
    pillEl.textContent = `Total: ${formatBRL(total)}`;
  }

  document.querySelectorAll('.metodo-btn').forEach((b) => b.classList.remove('ativo'));
  document.querySelectorAll('.pag-extra').forEach((el) => {
    el.style.display = 'none';
  });

  const btnConf = document.getElementById('btn-confirmar-pag');
  if (btnConf) {
    btnConf.disabled = true;
    btnConf.textContent = 'Confirmar pagamento';
  }

  App.metodoPagamento = null;
  App.pixChaveAtual = null;

  const chaveEl = document.getElementById('pix-chave');
  const qrEl = document.getElementById('pix-qrcode');

  if (chaveEl) chaveEl.textContent = '—';
  if (qrEl) {
    qrEl.innerHTML =
      '<div style="font-size:0.8rem;color:var(--cinza-q)">Gerando QR Code...</div>';
  }
  openModal('modal-pagamento');
  
}

function selecionarPagamento(btn) {
  document.querySelectorAll('.metodo-btn').forEach((b) => b.classList.remove('ativo'));
  document.querySelectorAll('.pag-extra').forEach((el) => {
    el.style.display = 'none';
  });

  btn.classList.add('ativo');
  const metodo = btn.dataset.metodo;
  App.metodoPagamento = metodo;

  if (metodo === 'cartao') {
    document.getElementById('form-cartao')?.style.setProperty('display', 'block');
  } else if (metodo === 'pix') {
    const chave = gerarChavePix();
    App.pixChaveAtual = chave;

    const chaveEl = document.getElementById('pix-chave');
    if (chaveEl) chaveEl.textContent = chave;

    renderizarQRCodePix(chave);
    document.getElementById('info-pix')?.style.setProperty('display', 'block');
  } else if (metodo === 'paypal') {
    const emojiEl = document.getElementById('wallet-emoji');
    const msgEl = document.getElementById('wallet-msg');

    if (emojiEl) emojiEl.textContent = '🅿️';
    if (msgEl) {
      msgEl.textContent = 'Você será direcionado ao PayPal na retirada. Tenha sua conta pronta!';
    }

    document.getElementById('info-wallet')?.style.setProperty('display', 'block');
  } else if (metodo === 'picpay') {
    const emojiEl = document.getElementById('wallet-emoji');
    const msgEl = document.getElementById('wallet-msg');

    if (emojiEl) emojiEl.textContent = '🟢';
    if (msgEl) {
      msgEl.textContent =
        'Pague via PicPay na retirada usando o QR Code que será exibido no balcão.';
    }

    document.getElementById('info-wallet')?.style.setProperty('display', 'block');
  }

  const btnConf = document.getElementById('btn-confirmar-pag');
  if (btnConf) btnConf.disabled = false;
}

async function confirmarPagamento() {
  if (!estaNoHorarioDeCompra()) {
    showToast(getMensagemHorarioCompra(), 'warning', 4500);
    closeModal('modal-pagamento');
    return;
  }

  if (!App.metodoPagamento) {
    showToast('Selecione uma forma de pagamento.', 'warning');
    return;
  }

  const btn = document.getElementById('btn-confirmar-pag');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Processando...';
  }

  await new Promise((resolve) => setTimeout(resolve, 1200));

  const codigo = gerarCodigoResgate();
  App.codigoResgate = codigo;

  try {
    await enviarEmailPedidoConcluido(codigo);
    showToast('Pedido concluído! E-mail enviado 📩', 'success');
  } catch (erro) {
    console.error(erro);
    showToast('Pedido concluído, mas houve falha no envio do e-mail.', 'warning', 5000);
  }

  const codigoEl = document.getElementById('codigo-resgate');
  if (codigoEl) codigoEl.textContent = codigo;

  App.carrinho = [];
  salvarCarrinho();
  atualizarBadgeCarrinho();
  renderizarCarrinho();

  closeModal('modal-pagamento');
  setTimeout(() => openModal('modal-sucesso'), 250);

  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Confirmar pagamento';
  }
}

// ────────────────────────────────────────
// COOKIES
// ────────────────────────────────────────
function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  const aceito = localStorage.getItem('snapbite_cookies');
  if (aceito) {
    banner.classList.add('hidden');
    return;
  }

  document.getElementById('btn-aceitar-cookies')?.addEventListener('click', () => {
    localStorage.setItem('snapbite_cookies', 'aceito');
    banner.classList.add('hidden');
    showToast('Cookies aceitos! Obrigado 🍪', 'success', 2500);
  });

  document.getElementById('btn-recusar-cookies')?.addEventListener('click', () => {
    localStorage.setItem('snapbite_cookies', 'recusado');
    banner.classList.add('hidden');
  });
}

// ────────────────────────────────────────
// COUNTDOWN DE PROMOÇÕES
// ────────────────────────────────────────
function initCountdown() {
  const el = document.getElementById('promo-countdown');
  if (!el) return;

  const target = new Date();
  target.setHours(target.getHours() + 6, 30, 0, 0);

  function atualizar() {
    const agora = new Date();
    const diff = Math.max(0, target - agora);

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const pad = (n) => String(n).padStart(2, '0');

    const hEl = document.getElementById('cd-horas');
    const mEl = document.getElementById('cd-min');
    const sEl = document.getElementById('cd-seg');

    if (hEl) hEl.textContent = pad(h);
    if (mEl) mEl.textContent = pad(m);
    if (sEl) sEl.textContent = pad(s);
  }

  atualizar();
  setInterval(atualizar, 1000);
}

// ────────────────────────────────────────
// FILTROS DO CARDÁPIO
// ────────────────────────────────────────
function initFiltros() {
  const btns = document.querySelectorAll('.filtro-btn');
  const cards = document.querySelectorAll('.prod-card');

  if (!btns.length || !cards.length) return;

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      btns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filtro = btn.dataset.filtro;

      cards.forEach((card) => {
        if (filtro === 'todos' || card.dataset.categoria === filtro) {
          card.style.display = '';
          card.style.animation = 'fadeInCard 0.3s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  const buscaInput = document.getElementById('busca-cardapio');
  if (buscaInput) {
    buscaInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();

      cards.forEach((card) => {
        const nome = card.querySelector('.prod-nome')?.textContent.toLowerCase() || '';
        card.style.display = nome.includes(q) ? '' : 'none';
      });
    });
  }
}

// ────────────────────────────────────────
// FORMULÁRIO DE CONTATO
// ────────────────────────────────────────
function initContato() {
  const form = document.getElementById('form-contato');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Mensagem enviada com sucesso! Em breve retornaremos. 📬', 'success', 4000);
    form.reset();
  });
}


// ═══════════════════════════════════════════════════════════════
// SCROLL REVEAL - MAPA HERO
// Cola isso em uma tag <script> antes do fechamento </body>
// ═══════════════════════════════════════════════════════════════

function initPerfilPage() {
  const form = document.getElementById('perfil-form');
  if (!form) return;

  if (!App.usuario) {
    window.location.href = 'login.html?redirect=perfil.html';
    return;
  }

  const nomeEl = document.getElementById('perfil-nome');
  const emailEl = document.getElementById('perfil-email');
  const descEl = document.getElementById('perfil-descricao');
  const expEl = document.getElementById('perfil-experiencia');
  const fotoEl = document.getElementById('perfil-foto');
  const senhaEl = document.getElementById('perfil-nova-senha');
  const codigoEl = document.getElementById('perfil-codigo-email');
  const statusCodigoEl = document.getElementById('perfil-codigo-status');
  const btnEnviarCodigo = document.getElementById('btn-enviar-codigo-perfil');
  const btnVerificarCodigo = document.getElementById('btn-verificar-codigo-perfil');
  const previewEl = document.getElementById('perfil-preview');
  const iniciaisEl = document.getElementById('perfil-iniciais');

  const API_BASE = 'https://snapbite-pxn6.onrender.com';
  let codigoPerfilVerificado = false;

  function setStatusCodigo(msg, ok = false) {
    if (!statusCodigoEl) return;
    statusCodigoEl.textContent = msg;
    statusCodigoEl.style.color = ok ? '#15803d' : '#b91c1c';
  }

  let perfil = getPerfilUsuario();

  function atualizarPreview(src, nomeBase) {
    const nomeFinal = (nomeBase || 'Usuário').trim();
    const inicial = nomeFinal.charAt(0).toUpperCase() || 'U';

    if (src && src.length > 5) {
      previewEl.src = src;
      previewEl.style.display = 'block';
      iniciaisEl.style.display = 'none';
    } else {
      previewEl.removeAttribute('src');
      previewEl.style.display = 'none';
      iniciaisEl.textContent = inicial;
      iniciaisEl.style.display = 'flex';
    }
  }

  nomeEl.value = perfil.nome || '';
  emailEl.value = perfil.email || '';
  descEl.value = perfil.descricao || '';
  expEl.value = perfil.experiencia || '';

  atualizarPreview(perfil.foto, perfil.nome);

  nomeEl.addEventListener('input', () => {
    atualizarPreview(previewEl.dataset.foto || perfil.foto, nomeEl.value);
  });

  fotoEl.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Escolha uma imagem válida.', 'warning');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      previewEl.dataset.foto = reader.result;
      atualizarPreview(reader.result, nomeEl.value);
    };

    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = nomeEl.value.trim();
    const novoEmail = (emailEl.value || '').trim().toLowerCase();
    const novaSenha = senhaEl?.value || '';
    const novaFoto = previewEl.dataset.foto || perfil.foto || '';

    if (nome.length < 2) {
      showToast('Digite um nome válido.', 'warning');
      return;
    }

    if (!codigoPerfilVerificado) {
      showToast('Verifique o código enviado ao e-mail antes de salvar alterações.', 'warning');
      setStatusCodigo('Solicite e verifique o código antes de salvar.', false);
      return;
    }

    if (novaSenha && novaSenha.length < 6) {
      showToast('A nova senha precisa ter pelo menos 6 caracteres.', 'warning');
      return;
    }

    const resultadoAuth = await window.atualizarContaFirebasePerfil?.({
      nome,
      email: novoEmail,
      senha: novaSenha
    });

    if (resultadoAuth && !resultadoAuth.ok) {
      showToast(resultadoAuth.msg || 'Não foi possível atualizar os dados da conta.', 'error');
      return;
    }

    const dados = {
      nome,
      email: novoEmail || App.usuario.email || '',
      foto: novaFoto,
      descricao: descEl.value.trim(),
      experiencia: expEl.value.trim(),
    };

    const perfilSalvo = salvarPerfilUsuario(dados);

    App.usuario.nome = perfilSalvo.nome;
    App.usuario.email = perfilSalvo.email;
    App.usuario.foto = perfilSalvo.foto;
    App.usuario.avatar = perfilSalvo.foto || perfilSalvo.inicial;

    localStorage.setItem('snapbite_user', JSON.stringify(App.usuario));

    if (senhaEl) senhaEl.value = '';
    codigoPerfilVerificado = false;
    if (codigoEl) codigoEl.value = '';
    setStatusCodigo('Alteração salva. Peça outro código para alterar novamente.', true);

    atualizarNavAuth();
    showToast('Perfil salvo com segurança! ✅', 'success');

    perfil = getPerfilUsuario();
    atualizarPreview(perfil.foto, perfil.nome);
  });


  btnEnviarCodigo?.addEventListener('click', async () => {
    const emailAtual = App.usuario?.email;
    if (!emailAtual) {
      showToast('Não encontrei o e-mail da sua conta.', 'error');
      return;
    }

    btnEnviarCodigo.disabled = true;
    btnEnviarCodigo.textContent = 'Enviando...';

    try {
      const resp = await fetch(`${API_BASE}/api/enviar-codigo-perfil`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAtual, nome: App.usuario?.nome || 'Usuário SnapBite' })
      });
      const dados = await resp.json();

      if (!resp.ok || !dados.ok) throw new Error(dados.erro || 'Falha ao enviar código.');

      codigoPerfilVerificado = false;
      setStatusCodigo(`Código enviado para ${emailAtual}.`, true);
      showToast('Código enviado ao seu e-mail! 📩', 'success');
    } catch (err) {
      console.error(err);
      // Verifica se é erro de rede (backend offline) ou erro do servidor
      const isNetworkError = err instanceof TypeError && err.message.includes('fetch');
      const msg = isNetworkError
        ? 'Servidor offline. Aguarde alguns segundos e tente novamente (o Render pode estar iniciando).'
        : 'Não foi possível enviar o código. Tente novamente em instantes.';
      setStatusCodigo(msg, false);
      showToast('Erro ao enviar código de segurança.', 'error');
    } finally {
      btnEnviarCodigo.disabled = false;
      btnEnviarCodigo.textContent = 'Enviar código';
    }
  });

  btnVerificarCodigo?.addEventListener('click', async () => {
    const emailAtual = App.usuario?.email;
    const codigo = (codigoEl?.value || '').trim();

    if (!codigo || codigo.length !== 6) {
      showToast('Digite o código de 6 números.', 'warning');
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/api/verificar-codigo-perfil`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAtual, codigo })
      });
      const dados = await resp.json();

      if (!resp.ok || !dados.ok) throw new Error(dados.erro || 'Código inválido.');

      codigoPerfilVerificado = true;
      setStatusCodigo('Código verificado. Agora você pode salvar as alterações.', true);
      showToast('Código confirmado! 🔐', 'success');
    } catch (err) {
      console.error(err);
      codigoPerfilVerificado = false;
      setStatusCodigo(err.message || 'Código inválido ou expirado.', false);
      showToast('Código inválido ou expirado.', 'error');
    }
  });

  const btnEditarEmail = document.getElementById('btn-editar-email');

btnEditarEmail?.addEventListener('click', () => {
  const editando = !emailEl.readOnly;

  if (editando) {
    emailEl.readOnly = true;
    btnEditarEmail.textContent = 'Alterar';
  } else {
    emailEl.readOnly = false;
    emailEl.focus();
    btnEditarEmail.textContent = 'Bloquear';
  }
});


  // Segurança: código de dois fatores simples do SnapBite
  const segForm = document.getElementById('seguranca-form');
  const twoCodeEl = document.getElementById('two-factor-code');
  const twoStatusEl = document.getElementById('two-factor-status');
  const btnDesativar2FA = document.getElementById('btn-desativar-2fa');

  function atualizarStatus2FA() {
    const status = window.getTwoFactorStatus?.() || { enabled: false };
    if (twoStatusEl) {
      twoStatusEl.textContent = status.enabled
        ? 'Status: ativado ✅'
        : 'Status: desativado';
      twoStatusEl.style.color = status.enabled ? '#15803d' : 'var(--texto-suave)';
    }
  }

  atualizarStatus2FA();

  segForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const codigo = twoCodeEl?.value || '';
    const resultado = window.salvarTwoFactorCodigo?.(codigo);

    if (resultado?.ok) {
      showToast('Código de segurança ativado! 🔐', 'success');
      if (twoCodeEl) twoCodeEl.value = '';
      atualizarStatus2FA();
    } else {
      showToast(resultado?.msg || 'Não foi possível ativar o código.', 'warning');
    }
  });

  btnDesativar2FA?.addEventListener('click', () => {
    const resultado = window.desativarTwoFactor?.();
    if (resultado?.ok) {
      showToast('Código de segurança desativado.', 'info');
      atualizarStatus2FA();
    } else {
      showToast(resultado?.msg || 'Não foi possível desativar.', 'warning');
    }
  });

}

function initScrollReveal() {
  const elementos = [
    ...document.querySelectorAll('.strip-cats .cat-item'),
    ...document.querySelectorAll('.como-step'),
    ...document.querySelectorAll('.destaque-texto'),
    ...document.querySelectorAll('.destaque-card'),
    ...document.querySelectorAll('.depo-card'),
    ...document.querySelectorAll('.mais-card'),
    ...document.querySelectorAll('.porque-item'),
    ...document.querySelectorAll('.app-texto'),
    ...document.querySelectorAll('.app-mockup'),
    ...document.querySelectorAll('.val-card'),
    ...document.querySelectorAll('.func-card'),
    ...document.querySelectorAll('.comp-item'),
    ...document.querySelectorAll('.dep-card'),
    ...document.querySelectorAll('.num-box'),
    ...document.querySelectorAll('.membro'),
    ...document.querySelectorAll('.c-item'),
    ...document.querySelectorAll('.resumo')
  ];

  if (!elementos.length) return;

  elementos.forEach((el, index) => {
    if (
      el.classList.contains('destaque-texto') ||
      el.classList.contains('app-texto')
    ) {
      el.classList.add('reveal-left');
    } else if (
      el.classList.contains('destaque-card') ||
      el.classList.contains('app-mockup') ||
      el.classList.contains('resumo')
    ) {
      el.classList.add('reveal-right');
    } else {
      el.classList.add('reveal');
    }

    el.classList.add(`reveal-delay-${(index % 4) + 1}`);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.14,
    rootMargin: '0px 0px -40px 0px'
  });

  elementos.forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initAuthForms?.();
    initPerfilPage();
    atualizarBadgeCarrinho();
    atualizarEstadoDosBotoesCompra();
  });

  const mapaHero = document.querySelector('.mapa-hero');
  const mapaHeroScale = document.querySelector('.mapa-hero-scale');
  const mapaHeroContent = document.querySelector('.mapa-hero-content');
  const scrollIndicator = document.querySelector('.scroll-indicator');
  
  if (!mapaHero || !mapaHeroScale) return;

  window.addEventListener('scroll', function() {
    // Pegar a posição do topo do hero
    const heroRect = mapaHero.getBoundingClientRect();
    const heroTop = heroRect.top;
    const heroHeight = heroRect.height;
    
    // Calcular quanto já foi scrollado (0 a 1)
    const scrollProgress = Math.max(0, Math.min(1, -heroTop / heroHeight));
    
    // Scale começa em 1 (100%) e vai diminuindo até ~0.6 (60%)
    const scale = 1 - (scrollProgress * 0.4);
    
    // Aplicar o scale
    mapaHeroScale.style.transform = `scale(${scale})`;
    
    // Fade out do conteúdo textual
    if (scrollProgress > 0.2) {
      mapaHeroContent.classList.add('hide-on-scroll');
    } else {
      mapaHeroContent.classList.remove('hide-on-scroll');
    }
    
    // Fade out do scroll indicator
    if (scrollProgress > 0.15) {
      scrollIndicator.style.opacity = Math.max(0, 1 - scrollProgress * 4);
    } else {
      scrollIndicator.style.opacity = 1;
    }
  }, { passive: true });
  
  // Smooth scroll ao clicar no scroll indicator
  scrollIndicator.addEventListener('click', function() {
    window.scrollBy({
      top: window.innerHeight * 0.5,
      behavior: 'smooth'
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// SELEÇÃO DE UNIDADE (do seu código original)
// ═══════════════════════════════════════════════════════════════

function selecionarUnidade(card) {
  // Remove ativo de todos
  document.querySelectorAll('.unidade-card').forEach(c => c.classList.remove('ativo'));
  card.classList.add('ativo');

  const lat   = card.dataset.lat;
  const lng   = card.dataset.lng;
  const nome  = card.dataset.nome;
  const gmaps = card.dataset.gmaps;

  // Atualiza iframe
  const iframe = document.getElementById('mapa-iframe');
  if (iframe) {
    iframe.src = `https://maps.google.com/maps?q=${lat},${lng}&hl=pt&z=15&output=embed`;
  }

  // Atualiza caption
  const captionNome = document.getElementById('mapa-caption-nome');
  const captionLink = document.getElementById('mapa-caption-link');
  if (captionNome) captionNome.textContent = nome;
  if (captionLink) captionLink.href = gmaps;
}

// ═══════════════════════════════════════════════════════════════
// FAQ ACCORDION (do seu código original)
// ═══════════════════════════════════════════════════════════════

function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const estaAberto = item.classList.contains('aberto');

  // Fecha todos
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('aberto'));

  // Abre o clicado (se estava fechado)
  if (!estaAberto) item.classList.add('aberto');
}

// ────────────────────────────────────────
// INIT GERAL
// ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initAuthForms();
  initPerfilPage();
  initCookieBanner();
  initCountdown();
  initFiltros();
  initContato();
  carregarCarrinhoUsuario();
  atualizarEstadoDosBotoesCompra();

  setInterval(atualizarEstadoDosBotoesCompra, 30000);

  if (document.getElementById('carrinho-lista')) {
    renderizarCarrinho();
  }
});

// ────────────────────────────────────────
// EXPOR FUNÇÕES GLOBAIS
// ────────────────────────────────────────
window.removerDoCarrinho = removerDoCarrinho;
window.alterarQtd = alterarQtd;
window.finalizarPedido = finalizarPedido;
window.selecionarPagamento = selecionarPagamento;
window.confirmarPagamento = confirmarPagamento;
window.openModal = openModal;
window.closeModal = closeModal;
window.logout = logout;
window.showToast = showToast;
window.copiarChavePix = copiarChavePix;
window.copiarCodigoResgate = copiarCodigoResgate;
window.atualizarNavAuth = atualizarNavAuth;
window.adicionarAoCarrinho = adicionarAoCarrinho;
