/**
 * skeleton.js — SnapBite
 * Sistema de carregamento animado (splash + skeleton + progress bar)
 */

'use strict';

// ─────────────────────────────────────────────────────
// PROGRESS BAR NO TOPO (aparece em toda navegação)
// ─────────────────────────────────────────────────────
const TopBar = (() => {
  let bar = null;
  let timer = null;
  let current = 0;

  function init() {
    bar = document.createElement('div');
    bar.id = 'sk-topbar';
    document.body.prepend(bar);
  }

  function set(pct) {
    current = pct;
    if (bar) bar.style.width = pct + '%';
  }

  function start() {
    set(0);
    bar.style.opacity = '1';
    // Avança rápido até 85%, depois para e espera o finish()
    let progress = 0;
    clearInterval(timer);
    timer = setInterval(() => {
      const step = progress < 50 ? 8 : progress < 75 ? 3 : 0.5;
      progress = Math.min(progress + step, 85);
      set(progress);
      if (progress >= 85) clearInterval(timer);
    }, 120);
  }

  function finish() {
    clearInterval(timer);
    set(100);
    setTimeout(() => {
      if (bar) bar.style.opacity = '0';
      setTimeout(() => set(0), 400);
    }, 300);
  }

  return { init, start, finish };
})();

// ─────────────────────────────────────────────────────
// SPLASH SCREEN (só na primeira carga da sessão)
// ─────────────────────────────────────────────────────
function criarSplash() {
  const splash = document.createElement('div');
  splash.id = 'snapbite-splash';
  splash.innerHTML = `
    <div class="splash-logo">Snap<em>Bite</em></div>
    <div class="splash-bar-wrap">
      <div class="splash-bar" id="splash-bar-fill"></div>
    </div>
    <div class="splash-tagline">Preparando seu cardápio...</div>
  `;
  document.body.prepend(splash);
  return splash;
}

function animarSplash(splash) {
  return new Promise((resolve) => {
    const fill = document.getElementById('splash-bar-fill');
    const taglines = [
      'Preparando seu cardápio...',
      'Aquecendo a chapa...',
      'Quase pronto...',
    ];
    const tagEl = splash.querySelector('.splash-tagline');
    let idx = 0;

    // Avança a barra em etapas
    const steps = [15, 40, 70, 90, 100];
    const delays = [100, 300, 500, 700, 900];

    steps.forEach((w, i) => {
      setTimeout(() => {
        fill.style.width = w + '%';
        if (taglines[idx]) {
          tagEl.textContent = taglines[Math.min(idx, taglines.length - 1)];
          idx++;
        }
      }, delays[i]);
    });

    // Esconde após a animação completa
    setTimeout(() => {
      splash.classList.add('hidden');
      setTimeout(resolve, 500);
    }, 1200);
  });
}

// ─────────────────────────────────────────────────────
// SKELETON: GRID DE PRODUTOS (cardápio)
// ─────────────────────────────────────────────────────
function skProdCard() {
  const el = document.createElement('div');
  el.className = 'sk-prod-card';
  el.innerHTML = `
    <div class="sk sk-prod-img"></div>
    <div class="sk-prod-body">
      <div class="sk sk-prod-nome"></div>
      <div class="sk sk-prod-desc1"></div>
      <div class="sk sk-prod-desc2"></div>
      <div class="sk-prod-foot">
        <div class="sk sk-prod-preco"></div>
        <div class="sk sk-prod-btn"></div>
      </div>
    </div>
  `;
  return el;
}

function injetarSkeletonGrid(containerSelector, count = 4) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'sk-wrap';

  // Layer do skeleton por cima
  const layer = document.createElement('div');
  layer.className = 'sk-layer';

  const grid = document.createElement('div');
  grid.className = 'prods-grid';
  grid.style.padding = '0';

  for (let i = 0; i < count; i++) {
    grid.appendChild(skProdCard());
  }

  layer.appendChild(grid);

  // Envolve o container real
  container.parentNode.insertBefore(wrapper, container);
  wrapper.appendChild(container);
  wrapper.appendChild(layer);

  return wrapper;
}

// ─────────────────────────────────────────────────────
// SKELETON: HERO DA HOME
// ─────────────────────────────────────────────────────
function injetarSkeletonHeroHome() {
  const hero = document.querySelector('.hero-inner');
  if (!hero) return;

  const wrap = document.createElement('div');
  wrap.className = 'sk-wrap';
  hero.parentNode.insertBefore(wrap, hero);
  wrap.appendChild(hero);

  const layer = document.createElement('div');
  layer.className = 'sk-layer';
  layer.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 60px;
    max-width: var(--max-w);
    margin: 0 auto;
    padding: 80px var(--gutter);
    width: 100%;
  `;

  layer.innerHTML = `
    <div>
      <div class="sk sk-hero-tag"></div>
      <div class="sk sk-hero-h1-1"></div>
      <div class="sk sk-hero-h1-2"></div>
      <div class="sk sk-hero-p"></div>
      <div class="sk sk-hero-p2"></div>
      <div class="sk-hero-ctas">
        <div class="sk sk-hero-btn"></div>
        <div class="sk sk-hero-btn2"></div>
      </div>
      <div class="sk-hero-nums">
        <div class="sk-hero-num">
          <div class="sk sk-hero-num-val"></div>
          <div class="sk sk-hero-num-lab"></div>
        </div>
        <div class="sk-hero-num">
          <div class="sk sk-hero-num-val"></div>
          <div class="sk sk-hero-num-lab"></div>
        </div>
        <div class="sk-hero-num">
          <div class="sk sk-hero-num-val"></div>
          <div class="sk sk-hero-num-lab"></div>
        </div>
      </div>
    </div>
    <div class="sk-hero-card">
      <div class="sk sk-hero-card-img"></div>
      <div class="sk sk-hero-card-nome"></div>
      <div class="sk sk-hero-card-desc"></div>
      <div class="sk sk-hero-card-desc2"></div>
      <div class="sk-hero-card-row">
        <div class="sk sk-hero-card-preco"></div>
        <div class="sk sk-hero-card-btn"></div>
      </div>
    </div>
  `;

  wrap.appendChild(layer);
  return wrap;
}

// ─────────────────────────────────────────────────────
// SKELETON: DEPOIMENTOS
// ─────────────────────────────────────────────────────
function injetarSkeletonDepos() {
  const grid = document.querySelector('.depo-grid');
  if (!grid) return;

  const wrap = document.createElement('div');
  wrap.className = 'sk-wrap';
  grid.parentNode.insertBefore(wrap, grid);
  wrap.appendChild(grid);

  const layer = document.createElement('div');
  layer.className = 'sk-layer';

  const skGrid = document.createElement('div');
  skGrid.className = 'depo-grid';

  for (let i = 0; i < 3; i++) {
    skGrid.innerHTML += `
      <div class="sk-depo-card">
        <div class="sk sk-depo-stars"></div>
        <div class="sk sk-depo-t1"></div>
        <div class="sk sk-depo-t2"></div>
        <div class="sk sk-depo-t3"></div>
        <div class="sk-depo-autor">
          <div class="sk sk-depo-av"></div>
          <div class="sk-depo-info">
            <div class="sk sk-depo-nome"></div>
            <div class="sk sk-depo-cargo"></div>
          </div>
        </div>
      </div>
    `;
  }

  layer.appendChild(skGrid);
  wrap.appendChild(layer);
  return wrap;
}

// ─────────────────────────────────────────────────────
// SKELETON: PAGE HERO (cardápio, carrinho, etc.)
// ─────────────────────────────────────────────────────
function injetarSkeletonPageHero() {
  const hero = document.querySelector('.page-hero');
  if (!hero) return;

  const wrap = document.createElement('div');
  wrap.className = 'sk-wrap';
  hero.parentNode.insertBefore(wrap, hero);
  wrap.appendChild(hero);

  const layer = document.createElement('div');
  layer.className = 'sk-layer sk-page-hero';
  layer.innerHTML = `
    <div class="sk-page-hero-inner">
      <div class="sk sk-ph-eye"></div>
      <div class="sk sk-ph-h1"></div>
      <div class="sk sk-ph-p"></div>
    </div>
  `;

  wrap.appendChild(layer);
  return wrap;
}

// ─────────────────────────────────────────────────────
// REVELAR: remove o skeleton com fade suave
// ─────────────────────────────────────────────────────
function revelarConteudo(delay = 0) {
  setTimeout(() => {
    document.querySelectorAll('.sk-wrap').forEach((wrap) => {
      wrap.classList.add('loaded');
    });
    TopBar.finish();
  }, delay);
}

// ─────────────────────────────────────────────────────
// DETECTA PÁGINA ATUAL E APLICA OS SKELETONS CORRETOS
// ─────────────────────────────────────────────────────
function detectarPagina() {
  const path = window.location.pathname.toLowerCase();
  const filename = path.split('/').pop() || 'index.html';

  if (filename === 'index.html' || filename === '' || filename === '/') return 'home';
  if (filename === 'cardapio.html')  return 'cardapio';
  if (filename === 'carrinho.html')  return 'carrinho';
  if (filename === 'promocoes.html') return 'promocoes';
  if (filename === 'ia.html')        return 'ia';
  if (filename === 'contato.html')   return 'contato';
  if (filename === 'sobre.html')     return 'sobre';
  return 'generica';
}

function aplicarSkeletons(pagina) {
  switch (pagina) {
    case 'home':
      injetarSkeletonDepos();
      break;
    case 'cardapio':
      injetarSkeletonPageHero();
      injetarSkeletonGrid('#sec-lanches .prods-grid', 4);
      injetarSkeletonGrid('#sec-combos .prods-grid', 3);
      injetarSkeletonGrid('#sec-bebidas .prods-grid', 3);
      break;
    case 'carrinho':
    case 'promocoes':
    case 'contato':
    case 'sobre':
    case 'ia':
    case 'localizacao':
      injetarSkeletonPageHero();
      break;
    default:
      break;
  }
}

// ─────────────────────────────────────────────────────
// LINK INTERCEPT — progress bar ao navegar entre páginas
// ─────────────────────────────────────────────────────
function interceptarLinks() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    // Só dispara para links internos
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

    TopBar.start();
  });
}

// ─────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  TopBar.init();
  TopBar.start();

  const pagina = detectarPagina();
  const jaViu  = sessionStorage.getItem('sb_splash_shown');

  // Aplica skeletons antes de revelar
  aplicarSkeletons(pagina);

  // Mostra splash só uma vez por sessão (exceto welcome.html)
  if (!jaViu && pagina !== 'welcome') {
    sessionStorage.setItem('sb_splash_shown', '1');
    const splash = criarSplash();
    await animarSplash(splash);
  }

  // Revela conteúdo com um delay mínimo para dar tempo das fontes/imagens
  // O delay é curto — parece instantâneo mas evita flash
  revelarConteudo(180);
  interceptarLinks();
});

// Se a página já carregou (script defer/async tardio), revela imediatamente
if (document.readyState === 'complete') {
  revelarConteudo(0);
}