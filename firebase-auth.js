import { sendEmailVerification } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut,
  sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';

// ─────────────────────────────────────────────────────
//  🔑  SUBSTITUA os valores abaixo pelas credenciais
//  do seu projeto Firebase real (console.firebase.google.com)
//
//  PASSOS para ativar o Google Login:
//  1. Acesse https://console.firebase.google.com
//  2. Selecione (ou crie) seu projeto
//  3. Authentication → Sign-in method → Ative "Google"
//  4. Authentication → Settings → Authorized domains →
//     adicione o domínio do seu site (ex: seliga.jovem)
//  5. Copie as credenciais do projeto (Project settings → General)
//     e cole no objeto abaixo.
// ─────────────────────────────────────────────────────
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

// Persistência local: login sobrevive a fechar o browser
setPersistence(auth, browserLocalPersistence).catch(console.error);

// ─────────────────────────────────────────────────────
// Helpers: dados extras (telefone, termos) no localStorage
// ─────────────────────────────────────────────────────
function getCadastroExtra(uid) {
  const extras = JSON.parse(localStorage.getItem('snapbite_auth_extras') || '{}');
  return extras[uid] || null;
}

function salvarCadastroExtra(uid, dados) {
  const extras = JSON.parse(localStorage.getItem('snapbite_auth_extras') || '{}');
  extras[uid] = dados;
  localStorage.setItem('snapbite_auth_extras', JSON.stringify(extras));
}

// ─────────────────────────────────────────────────────
// Sincroniza usuário Firebase → App.usuario + localStorage
// ─────────────────────────────────────────────────────
function syncUsuarioFirebase(user) {
  if (!user) return null;

  const extra = getCadastroExtra(user.uid);

  const email = (user.email || '').toLowerCase();
  const perfis = JSON.parse(localStorage.getItem('snapbite_profiles') || '{}');

  const perfilPorUid = perfis[user.uid] || null;
  const perfilPorEmail = perfis[email] || null;
  const perfilExistente = perfilPorUid || perfilPorEmail || {};

  if (perfilPorEmail && !perfilPorUid) {
    perfis[user.uid] = perfilPorEmail;
    localStorage.setItem('snapbite_profiles', JSON.stringify(perfis));
  }

  const usuario = {
    uid: user.uid,
    nome: perfilExistente.nome || user.displayName || 'Usuário SnapBite',
    email: email,
    foto: perfilExistente.foto || user.photoURL || '',
    provider: user.providerData?.[0]?.providerId || 'firebase',
    telefone: extra?.telefone || '',
    aceitouTermos: !!extra?.aceitouTermos,
    cadastroCompleto: !!(extra?.telefone && extra?.aceitouTermos)
  };

  localStorage.setItem('snapbite_user', JSON.stringify(usuario));

  if (window.App) window.App.usuario = usuario;

  window.atualizarNavAuth?.();
  window.dispatchEvent(new CustomEvent('snapbite:login', { detail: usuario }));

  return usuario;
}

// ─────────────────────────────────────────────────────
// Abre modal para completar cadastro (telefone + termos)
// ─────────────────────────────────────────────────────
function abrirModalCompletarCadastro() {
  window.closeModal?.('modal-login');
  window.openModal?.('modal-completar-cadastro');
}

// ─────────────────────────────────────────────────────
// Login com Google (popup)
// ─────────────────────────────────────────────────────
async function loginComGoogleReal() {
  try {
    const result  = await signInWithPopup(auth, provider);
    const user    = result.user;
    const usuario = syncUsuarioFirebase(user);

    if (!usuario.cadastroCompleto) {
      // Preenche campos do modal de completar cadastro
      const nomeEl  = document.getElementById('extra-nome');
      const emailEl = document.getElementById('extra-email');
      const telEl   = document.getElementById('extra-telefone');
      const termEl  = document.getElementById('extra-termos');

      if (nomeEl)  nomeEl.value  = usuario.nome   || '';
      if (emailEl) emailEl.value = usuario.email  || '';
      if (telEl)   telEl.value   = usuario.telefone || '';
      if (termEl)  termEl.checked = !!usuario.aceitouTermos;

      abrirModalCompletarCadastro();
    } else {
      window.closeModal?.('modal-login');
      window.showToast?.(`Bem-vindo(a), ${usuario.nome.split(' ')[0]}! 🎉`, 'success');

      // Se tinha produto pendente, adiciona ao carrinho
      if (window.App?.pendingProduct && typeof window.adicionarAoCarrinho === 'function') {
        const produto = window.App.pendingProduct;
        window.App.pendingProduct = null;
        window.adicionarAoCarrinho(produto);
      }

      // Redireciona da welcome.html para o home
      _redirecionarSeWelcome();
    }
  } catch (error) {
    console.error('Firebase Google Auth error:', error);
    window.showToast?.('Não foi possível entrar com Google.', 'error');
  }
}

// ─────────────────────────────────────────────────────
// Se o usuário estiver na welcome.html, redireciona
// ─────────────────────────────────────────────────────
function _redirecionarSeWelcome() {
  if (window.location.pathname.endsWith('welcome.html') ||
      window.location.pathname === '/' ||
      window.location.pathname === '') {

    const usuario = JSON.parse(localStorage.getItem('snapbite_user') || 'null');
    if (usuario?.cadastroCompleto) {
      window.location.replace('index.html');
    }
  }
}

// ─────────────────────────────────────────────────────
// Completar cadastro (telefone + termos)
// ─────────────────────────────────────────────────────
function initCadastroExtra() {
  const form = document.getElementById('form-completar-cadastro');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const currentUser = auth.currentUser;
    if (!currentUser) {
      window.showToast?.('Sessão não encontrada. Tente entrar novamente.', 'error');
      return;
    }

    const telefone    = document.getElementById('extra-telefone')?.value.trim();
    const aceitouTermos = document.getElementById('extra-termos')?.checked;

    if (!telefone) {
      window.showToast?.('Digite seu telefone.', 'warning');
      return;
    }
    if (!aceitouTermos) {
      window.showToast?.('Você precisa aceitar os termos.', 'warning');
      return;
    }

    salvarCadastroExtra(currentUser.uid, { telefone, aceitouTermos: true });

    const usuario = syncUsuarioFirebase(currentUser);

    window.closeModal?.('modal-completar-cadastro');
    window.showToast?.(`Conta concluída, ${usuario.nome.split(' ')[0]}! ✅`, 'success');

    if (window.App?.pendingProduct && typeof window.adicionarAoCarrinho === 'function') {
      const produto = window.App.pendingProduct;
      window.App.pendingProduct = null;
      window.adicionarAoCarrinho(produto);
    }

    // Redireciona da welcome.html para o home
    _redirecionarSeWelcome();
  });
}

// ─────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────
function logoutFirebaseReal() {
  signOut(auth).catch(console.error);
  localStorage.removeItem('snapbite_user');

  if (window.App) window.App.usuario = null;

  window.atualizarNavAuth?.();
  window.showToast?.('Você saiu da conta.', 'info');
}

// ─────────────────────────────────────────────────────
// Observer de estado de autenticação
// ─────────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) {
    const usuario = syncUsuarioFirebase(user);
    if (usuario.cadastroCompleto) {
      window.closeModal?.('modal-login');
      window.closeModal?.('modal-completar-cadastro');
    }
  } else {
    localStorage.removeItem('snapbite_user');
    if (window.App) window.App.usuario = null;
    window.atualizarNavAuth?.();
  }
});

// ─────────────────────────────────────────────────────
// Login com e-mail + senha (Firebase)
// ─────────────────────────────────────────────────────
async function loginComEmailSenha(email, senha) {
  try {
    const result  = await signInWithEmailAndPassword(auth, email, senha);
    const usuario = syncUsuarioFirebase(result.user);

    window.showToast?.(`Bem-vindo(a), ${usuario.nome.split(' ')[0]}! 🎉`, 'success');

    if (window.App?.pendingProduct && typeof window.adicionarAoCarrinho === 'function') {
      const produto = window.App.pendingProduct;
      window.App.pendingProduct = null;
      window.adicionarAoCarrinho(produto);
    }

    _redirecionarSeWelcome();
    return { ok: true };
  } catch (err) {
    const msgs = {
      'auth/user-not-found':   'E-mail não encontrado.',
      'auth/wrong-password':   'Senha incorreta.',
      'auth/invalid-email':    'E-mail inválido.',
      'auth/invalid-credential': 'E-mail ou senha incorretos.',
      'auth/too-many-requests':'Muitas tentativas. Tente mais tarde.',
    };
    const msg = msgs[err.code] || 'Erro ao entrar. Tente novamente.';
    return { ok: false, msg };
  }
}

// ─────────────────────────────────────────────────────
// Cadastro com e-mail + senha (Firebase)
// ─────────────────────────────────────────────────────
async function cadastrarComEmailSenha(nome, email, senha, telefone, aceitouTermos) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, senha);
    const user   = result.user;

    // Salva nome no perfil Firebase
    await updateProfile(user, { displayName: nome });


    await sendEmailVerification(user);

    // Salva extras locais (telefone + termos)
    salvarCadastroExtra(user.uid, { telefone, aceitouTermos });

    const usuario = syncUsuarioFirebase(user);

    window.showToast?.(`Conta criada! Bem-vindo(a), ${nome.split(' ')[0]}! ✅`, 'success');
    _redirecionarSeWelcome();
    return { ok: true };
  } catch (err) {
    const msgs = {
      'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
      'auth/invalid-email':        'E-mail inválido.',
      'auth/weak-password':        'Senha muito fraca. Use ao menos 6 caracteres.',
    };
    const msg = msgs[err.code] || 'Erro ao criar conta. Tente novamente.';
    return { ok: false, msg };
  }
}

// ─────────────────────────────────────────────────────
// Recuperar senha por e-mail
// ─────────────────────────────────────────────────────
async function recuperarSenha(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { ok: true };
  } catch (err) {
    const msgs = {
      'auth/user-not-found': 'Nenhuma conta com este e-mail.',
      'auth/invalid-email':  'E-mail inválido.',
    };
    const msg = msgs[err.code] || 'Erro ao enviar e-mail. Tente novamente.';
    return { ok: false, msg };
  }
}

// ─────────────────────────────────────────────────────
// Expõe globalmente para os botões do HTML chamarem
window.loginComGoogleReal      = loginComGoogleReal;
window.logoutFirebaseReal      = logoutFirebaseReal;
window.loginComEmailSenha      = loginComEmailSenha;
window.cadastrarComEmailSenha  = cadastrarComEmailSenha;
window.recuperarSenha          = recuperarSenha;

window.alterarEmailFirebase = async (novoEmail) => {
  const user = auth.currentUser;

  if (!user) {
    window.showToast?.('Usuário não encontrado.', 'error');
    return;
  }

  try {
    await updateEmail(user, novoEmail);
    window.showToast?.('E-mail atualizado com sucesso! 📩', 'success');
  } catch (err) {
    console.error(err);
    window.showToast?.('Erro ao atualizar e-mail.', 'error');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initCadastroExtra();
});