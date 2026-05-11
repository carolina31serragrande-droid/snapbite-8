import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  updateProfile,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
  sendEmailVerification,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  linkWithCredential
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';

const firebaseConfig = {
  apiKey:            "AIzaSyCPQuK79XDc8B5bgr8tVSUwcLkSHlVJU6c",
  authDomain:        "snapbite-85943.firebaseapp.com",
  projectId:         "snapbite-85943",
  storageBucket:     "snapbite-85943.firebasestorage.app",
  messagingSenderId: "839470161933",
  appId:             "1:839470161933:web:fc3fe935406a2406e13544",
  measurementId:     "G-CXMLLXPZLP"
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();

// ─────────────────────────────────────────────────────
// PERSISTÊNCIA:
//   "lembrar" marcado → browserLocalPersistence  (sobrevive ao fechar)
//   padrão            → browserSessionPersistence (some ao fechar o navegador)
// ─────────────────────────────────────────────────────
const lembrarLogin = localStorage.getItem('snapbite_lembrar') === '1';
setPersistence(auth, lembrarLogin ? browserLocalPersistence : browserSessionPersistence)
  .catch(console.error);

function getCadastroExtra(uid) {
  const extras = JSON.parse(localStorage.getItem('snapbite_auth_extras') || '{}');
  return extras[uid] || null;
}

function salvarCadastroExtra(uid, dados) {
  const extras = JSON.parse(localStorage.getItem('snapbite_auth_extras') || '{}');
  extras[uid] = dados;
  localStorage.setItem('snapbite_auth_extras', JSON.stringify(extras));
}

function syncUsuarioFirebase(user) {
  if (!user) return null;

  const extra = getCadastroExtra(user.uid);
  const email = (user.email || '').toLowerCase();
  const perfis = JSON.parse(localStorage.getItem('snapbite_profiles') || '{}');

  const perfilPorUid   = perfis[user.uid] || null;
  const perfilPorEmail = perfis[email]     || null;
  const perfilExistente = perfilPorUid || perfilPorEmail || {};

  if (perfilPorEmail && !perfilPorUid) {
    perfis[user.uid] = perfilPorEmail;
    localStorage.setItem('snapbite_profiles', JSON.stringify(perfis));
  }

  const usuario = {
    uid:              user.uid,
    nome:             perfilExistente.nome || user.displayName || 'Usuário SnapBite',
    email:            email,
    foto:             perfilExistente.foto || user.photoURL || '',
    provider:         user.providerData?.[0]?.providerId || 'firebase',
    telefone:         extra?.telefone || '',
    aceitouTermos:    !!extra?.aceitouTermos,
    senhaCriada:      user.providerData?.some(p => p.providerId === 'password') || !!extra?.senhaCriada,
    twoFactorEnabled: !!extra?.twoFactorEnabled,
    cadastroCompleto: !!(extra?.telefone && extra?.aceitouTermos &&
                        (user.providerData?.some(p => p.providerId === 'password') || extra?.senhaCriada))
  };

  localStorage.setItem('snapbite_user', JSON.stringify(usuario));
  if (window.App) window.App.usuario = usuario;
  window.atualizarNavAuth?.();
  window.dispatchEvent(new CustomEvent('snapbite:login', { detail: usuario }));
  return usuario;
}

function abrirModalCompletarCadastro() {
  window.closeModal?.('modal-login');
  window.openModal?.('modal-completar-cadastro');
}

async function loginComGoogleReal() {
  try {
    const result  = await signInWithPopup(auth, provider);
    const usuario = syncUsuarioFirebase(result.user);

    if (!usuario.cadastroCompleto) {
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
      set('extra-nome', usuario.nome || '');
      set('extra-email', usuario.email || '');
      set('extra-telefone', usuario.telefone || '');
      const termEl = document.getElementById('extra-termos');
      if (termEl) termEl.checked = !!usuario.aceitouTermos;
      const nomeEl = document.getElementById('extra-nome');
      if (nomeEl) nomeEl.readOnly = false;
      abrirModalCompletarCadastro();
      return { ok: false, precisaCompletar: true };
    }

    window.closeModal?.('modal-login');
    const twoFA = await exigirTwoFactorSeAtivo(usuario);
    if (!twoFA.ok) return twoFA;

    window.showToast?.(`Bem-vindo(a), ${usuario.nome.split(' ')[0]}! 🎉`, 'success');
    if (window.App?.pendingProduct && typeof window.adicionarAoCarrinho === 'function') {
      const p = window.App.pendingProduct;
      window.App.pendingProduct = null;
      window.adicionarAoCarrinho(p);
    }
    _redirecionarAposLogin();
    return { ok: true };
  } catch (error) {
    const msgs = {
      'auth/account-exists-with-different-credential': 'Esse e-mail já existe. Entre com e-mail e senha primeiro.',
      'auth/popup-closed-by-user': 'Login cancelado.',
      'auth/popup-blocked': 'O navegador bloqueou a janela do Google. Permita pop-ups.'
    };
    window.showToast?.(msgs[error.code] || 'Não foi possível entrar com Google.', 'error');
    return { ok: false, msg: msgs[error.code] || 'Não foi possível entrar com Google.' };
  }
}

function _redirecionarAposLogin() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  const destino = redirect && !redirect.startsWith('http') && !redirect.includes('://')
    ? redirect : 'index.html';

  window.atualizarNavAuth?.();
  window.dispatchEvent(new CustomEvent('snapbite:auth-ok'));

  const path = window.location.pathname || '';
  if (path.endsWith('login.html') || path.endsWith('/login') || path.includes('login')) {
    window.location.replace(destino);
  }
}

function initCadastroExtra() {
  const form = document.getElementById('form-completar-cadastro');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) { window.showToast?.('Sessão não encontrada. Tente novamente.', 'error'); return; }

    const nome          = document.getElementById('extra-nome')?.value.trim();
    const telefone      = document.getElementById('extra-telefone')?.value.trim();
    const senha         = document.getElementById('extra-senha')?.value || '';
    const senhaConf     = document.getElementById('extra-senha-confirmar')?.value || '';
    const aceitouTermos = document.getElementById('extra-termos')?.checked;

    if (!nome || nome.length < 2) { window.showToast?.('Digite seu nome.', 'warning'); return; }
    if (!telefone) { window.showToast?.('Digite seu telefone.', 'warning'); return; }
    if (!currentUser.providerData?.some(p => p.providerId === 'password')) {
      if (senha.length < 6) { window.showToast?.('Senha com mínimo 6 caracteres.', 'warning'); return; }
      if (senha !== senhaConf) { window.showToast?.('As senhas não coincidem.', 'warning'); return; }
    }
    if (!aceitouTermos) { window.showToast?.('Aceite os termos para continuar.', 'warning'); return; }

    try {
      await updateProfile(currentUser, { displayName: nome });
      if (!currentUser.providerData?.some(p => p.providerId === 'password')) {
        await linkWithCredential(currentUser, EmailAuthProvider.credential(currentUser.email, senha));
      }
      salvarCadastroExtra(currentUser.uid, { telefone, aceitouTermos: true, senhaCriada: true });
    } catch (err) {
      const msgs = {
        'auth/provider-already-linked': 'Essa conta já possui senha.',
        'auth/email-already-in-use': 'E-mail já cadastrado em outra conta.',
        'auth/weak-password': 'Senha muito fraca.',
        'auth/requires-recent-login': 'Entre novamente com Google e tente de novo.'
      };
      window.showToast?.(msgs[err.code] || 'Erro ao concluir cadastro.', 'error');
      return;
    }

    const usuario = syncUsuarioFirebase(auth.currentUser);
    window.closeModal?.('modal-completar-cadastro');
    window.showToast?.(`Conta concluída, ${usuario.nome.split(' ')[0]}! ✅`, 'success');
    if (window.App?.pendingProduct && typeof window.adicionarAoCarrinho === 'function') {
      const p = window.App.pendingProduct;
      window.App.pendingProduct = null;
      window.adicionarAoCarrinho(p);
    }
    _redirecionarAposLogin();
  });
}

// Flag para evitar que onAuthStateChanged re-logue após logout intencional
let _fazendoLogout = false;

function logoutFirebaseReal() {
  _fazendoLogout = true;
  // Limpa "lembrar" e TODOS os dados de sessão ao sair
  localStorage.removeItem('snapbite_lembrar');
  localStorage.removeItem('snapbite_user');
  if (window.App) window.App.usuario = null;
  window.atualizarNavAuth?.();
  window.showToast?.('Você saiu da conta.', 'info');
  // Faz signOut do Firebase e redireciona para login
  signOut(auth).then(() => {
    _fazendoLogout = false;
    // Se não estiver na página de login, redireciona
    const path = window.location.pathname || '';
    if (!path.endsWith('login.html') && !path.endsWith('/login')) {
      window.location.href = 'login.html';
    }
  }).catch(err => {
    _fazendoLogout = false;
    console.error('Erro ao fazer logout:', err);
  });
}

onAuthStateChanged(auth, (user) => {
  // Ignora eventos de auth durante logout intencional
  if (_fazendoLogout) return;

  if (user) {
    const usuario = syncUsuarioFirebase(user);
    if (usuario.cadastroCompleto) {
      window.closeModal?.('modal-login');
      window.closeModal?.('modal-completar-cadastro');
      const path = window.location.pathname || '';
      if (path.endsWith('login.html') || path.endsWith('/login')) {
        _redirecionarAposLogin();
      }
    }
  } else {
    localStorage.removeItem('snapbite_user');
    if (window.App) window.App.usuario = null;
    window.atualizarNavAuth?.();
  }
});

// loginComEmailSenha aceita 3º argumento: lembrar (bool)
async function loginComEmailSenha(email, senha, lembrar = false) {
  try {
    await setPersistence(auth, lembrar ? browserLocalPersistence : browserSessionPersistence);
    if (lembrar) localStorage.setItem('snapbite_lembrar', '1');
    else         localStorage.removeItem('snapbite_lembrar');

    const result  = await signInWithEmailAndPassword(auth, email, senha);
    const usuario = syncUsuarioFirebase(result.user);
    window.showToast?.(`Bem-vindo(a), ${usuario.nome.split(' ')[0]}! 🎉`, 'success');
    if (window.App?.pendingProduct && typeof window.adicionarAoCarrinho === 'function') {
      const p = window.App.pendingProduct;
      window.App.pendingProduct = null;
      window.adicionarAoCarrinho(p);
    }
    _redirecionarAposLogin();
    return { ok: true };
  } catch (err) {
    const msgs = {
      'auth/user-not-found':     'E-mail não encontrado.',
      'auth/wrong-password':     'Senha incorreta.',
      'auth/invalid-email':      'E-mail inválido.',
      'auth/invalid-credential': 'E-mail ou senha incorretos. Se você entrou com Google antes, use o botão "Entrar com Google".',
      'auth/too-many-requests':  'Muitas tentativas. Tente mais tarde.',
    };
    return { ok: false, msg: msgs[err.code] || 'Erro ao entrar. Tente novamente.' };
  }
}

async function cadastrarComEmailSenha(nome, email, senha, telefone, aceitouTermos) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, senha);
    await updateProfile(result.user, { displayName: nome });
    await sendEmailVerification(result.user);
    salvarCadastroExtra(result.user.uid, { telefone, aceitouTermos });
    const usuario = syncUsuarioFirebase(result.user);
    window.showToast?.(`Conta criada! Bem-vindo(a), ${nome.split(' ')[0]}! ✅`, 'success');
    _redirecionarAposLogin();
    return { ok: true };
  } catch (err) {
    const msgs = {
      'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
      'auth/invalid-email':        'E-mail inválido.',
      'auth/weak-password':        'Senha muito fraca. Use ao menos 6 caracteres.',
    };
    return { ok: false, msg: msgs[err.code] || 'Erro ao criar conta. Tente novamente.' };
  }
}

// ─────────────────────────────────────────────────────
// RECUPERAR SENHA com rate limiting progressivo
//
//   1ª vez → envia imediatamente
//   2ª vez → espera 60s  (1 min)
//   3ª vez → espera 90s  (1 min 30s)
//   4ª vez → espera 240s (4 min) — LIMITE MÁXIMO
//   5ª+    → "Tente novamente mais tarde" (bloqueado)
//
//  Estado em sessionStorage → limpa ao fechar o browser
// ─────────────────────────────────────────────────────
const RESET_KEY      = 'snapbite_reset_rate';
const RESET_DELAYS   = [60_000, 90_000, 240_000]; // ms: após 1ª, 2ª, 3ª tentativa
const RESET_MAX      = 4;

function _getRR() { try { return JSON.parse(sessionStorage.getItem(RESET_KEY) || '{}'); } catch { return {}; } }
function _setRR(d) { sessionStorage.setItem(RESET_KEY, JSON.stringify(d)); }

function checkResetRate() {
  const d = _getRR(); const agora = Date.now();
  const tries = d.tries || 0; const freeAt = d.freeAt || 0;

  if (tries >= RESET_MAX) {
    if (agora < freeAt) return { allowed: false, waitMs: freeAt - agora, bloqueado: true };
    _setRR({}); return { allowed: true, waitMs: 0, bloqueado: false };
  }
  if (agora < freeAt) return { allowed: false, waitMs: freeAt - agora, bloqueado: false };
  return { allowed: true, waitMs: 0, bloqueado: false };
}

function registerResetAttempt() {
  const d = _getRR(); const tries = (d.tries || 0) + 1; const agora = Date.now();
  if (tries >= RESET_MAX) { _setRR({ tries, freeAt: agora + 240_000 }); return; }
  const delay = RESET_DELAYS[Math.min(tries - 1, RESET_DELAYS.length - 1)];
  _setRR({ tries, freeAt: agora + delay });
}

async function recuperarSenha(email) {
  const rate = checkResetRate();
  if (!rate.allowed) {
    if (rate.bloqueado) return { ok: false, msg: 'Muitas tentativas. Tente novamente mais tarde.' };
    const seg = Math.ceil(rate.waitMs / 1000);
    const min = Math.floor(seg / 60); const s = seg % 60;
    const txt = min > 0 ? `Aguarde ${min}min${s > 0 ? ' ' + s + 's' : ''} antes de solicitar novamente.`
                        : `Aguarde ${s}s antes de solicitar novamente.`;
    return { ok: false, msg: txt, waitMs: rate.waitMs };
  }
  try {
    await sendPasswordResetEmail(auth, email, {
      url: 'https://carolina31serragrande-droid.github.io/snapbite-8/recuperar-senha.html',
      handleCodeInApp: false
    });
    registerResetAttempt();
    return { ok: true };
  } catch (err) {
    const msgs = {
      'auth/user-not-found':    'Nenhuma conta com este e-mail.',
      'auth/invalid-email':     'E-mail inválido.',
      'auth/missing-email':     'Digite um e-mail válido.',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde e tente novamente.',
    };
    return { ok: false, msg: msgs[err.code] || 'Erro ao enviar e-mail. Tente novamente.' };
  }
}

// Expõe status do rate limit para o botão no login.html
window.getResetRateStatus = () => {
  const d = _getRR(); const agora = Date.now();
  return {
    tries: d.tries || 0, freeAt: d.freeAt || 0,
    waitMs: Math.max(0, (d.freeAt || 0) - agora),
    bloqueado: (d.tries || 0) >= RESET_MAX && agora < (d.freeAt || 0),
    max: RESET_MAX
  };
};

async function validarCodigoRedefinicaoSenha(oobCode) {
  try {
    const email = await verifyPasswordResetCode(auth, oobCode);
    return { ok: true, email };
  } catch (err) {
    const msgs = {
      'auth/expired-action-code': 'Este link expirou. Peça uma nova recuperação de senha.',
      'auth/invalid-action-code': 'Este link é inválido ou já foi utilizado.',
      'auth/user-disabled':       'Esta conta foi desativada.',
      'auth/user-not-found':      'Conta não encontrada.',
    };
    return { ok: false, msg: msgs[err.code] || 'Link inválido ou expirado.' };
  }
}

async function confirmarNovaSenha(oobCode, novaSenha) {
  // Usa sempre o oobCode passado como parâmetro (lido pela página recuperar-senha.html)
  // _oobCodeUrl era capturado no top-level do módulo, podendo causar conflitos
  const codigoFinal = oobCode || new URLSearchParams(window.location.search).get('oobCode');
  try {
    await confirmPasswordReset(auth, codigoFinal, novaSenha);
    return { ok: true };
  } catch (err) {
    const msgs = {
      'auth/expired-action-code': 'Este link expirou. Peça uma nova recuperação de senha.',
      'auth/invalid-action-code': 'Este link é inválido ou já foi utilizado.',
      'auth/weak-password':       'Senha muito fraca. Use pelo menos 6 caracteres.',
    };
    return { ok: false, msg: msgs[err.code] || 'Erro ao redefinir senha. Tente novamente.' };
  }
}

function _getTwoFactorStore() { return JSON.parse(localStorage.getItem('snapbite_two_factor') || '{}'); }
function _getTwoFactorKey(u = JSON.parse(localStorage.getItem('snapbite_user') || 'null')) {
  return u?.uid || u?.email || auth.currentUser?.uid || auth.currentUser?.email || null;
}
function getTwoFactorStatus() { const k = _getTwoFactorKey(); return k ? (_getTwoFactorStore()[k] || { enabled: false }) : { enabled: false }; }
function salvarTwoFactorCodigo(codigo) {
  const k = _getTwoFactorKey(); if (!k) return { ok: false, msg: 'Entre na conta para configurar.' };
  const l = String(codigo || '').replace(/\D/g, ''); if (l.length !== 6) return { ok: false, msg: 'Código precisa ter 6 números.' };
  const s = _getTwoFactorStore(); s[k] = { enabled: true, code: l };
  localStorage.setItem('snapbite_two_factor', JSON.stringify(s)); return { ok: true };
}
function desativarTwoFactor() {
  const k = _getTwoFactorKey(); if (!k) return { ok: false, msg: 'Entre na conta.' };
  const s = _getTwoFactorStore(); delete s[k];
  localStorage.setItem('snapbite_two_factor', JSON.stringify(s)); return { ok: true };
}
async function exigirTwoFactorSeAtivo(usuario) {
  const cfg = _getTwoFactorStore()[_getTwoFactorKey(usuario)];
  if (!cfg?.enabled) return { ok: true };
  const d = prompt('Digite seu código de segurança SnapBite de 6 números:');
  if (String(d || '').replace(/\D/g, '') === cfg.code) return { ok: true };
  await signOut(auth).catch(console.error);
  localStorage.removeItem('snapbite_user');
  return { ok: false, msg: 'Código de segurança incorreto.' };
}

async function atualizarContaFirebasePerfil({ nome, email, senha }) {
  const user = auth.currentUser;
  if (!user) return { ok: false, msg: 'Entre novamente na conta para alterar o perfil.' };
  try {
    if (nome?.trim() && nome.trim() !== user.displayName) await updateProfile(user, { displayName: nome.trim() });
    const el = (email || '').trim().toLowerCase();
    if (el && el !== (user.email || '').toLowerCase()) await updateEmail(user, el);
    if (senha && senha.length >= 6) await updatePassword(user, senha);
    syncUsuarioFirebase(auth.currentUser);
    return { ok: true };
  } catch (err) {
    const msgs = {
      'auth/requires-recent-login': 'Por segurança, saia e entre novamente antes de alterar e-mail ou senha.',
      'auth/email-already-in-use':  'Este e-mail já está sendo usado.',
      'auth/invalid-email':         'E-mail inválido.',
      'auth/weak-password':         'Senha fraca. Use pelo menos 6 caracteres.',
    };
    return { ok: false, msg: msgs[err.code] || 'Não foi possível alterar os dados.' };
  }
}

window.loginComGoogleReal           = loginComGoogleReal;
window.logoutFirebaseReal           = logoutFirebaseReal;
window.loginComEmailSenha           = loginComEmailSenha;
window.cadastrarComEmailSenha       = cadastrarComEmailSenha;
window.recuperarSenha               = recuperarSenha;
window.validarCodigoRedefinicaoSenha = validarCodigoRedefinicaoSenha;
window.confirmarNovaSenha           = confirmarNovaSenha;
window.getTwoFactorStatus           = getTwoFactorStatus;
window.salvarTwoFactorCodigo        = salvarTwoFactorCodigo;
window.desativarTwoFactor           = desativarTwoFactor;
window.atualizarContaFirebasePerfil = atualizarContaFirebasePerfil;
window.alterarEmailFirebase = async (novoEmail) => {
  const u = auth.currentUser;
  if (!u) { window.showToast?.('Usuário não encontrado.', 'error'); return; }
  try { await updateEmail(u, novoEmail); window.showToast?.('E-mail atualizado! 📩', 'success'); }
  catch { window.showToast?.('Erro ao atualizar e-mail.', 'error'); }
};

window.snapbiteAuthReady = true;
window.dispatchEvent(new CustomEvent('snapbite:auth-ready'));
document.addEventListener('DOMContentLoaded', () => { initCadastroExtra(); });
