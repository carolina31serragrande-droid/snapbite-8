(function () {
  /* Carrega biblioteca QRCode dinamicamente */
  const qrScript = document.createElement('script');
  qrScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  document.head.appendChild(qrScript);

/* ── NAVBAR ── */
document.body.insertAdjacentHTML('afterbegin', `
  <nav class="navbar" id="navbar">
    <div class="navbar-inner navbar-inner-modern">

      <div class="navbar-side navbar-side-left">
        <button class="hamburger" id="hamburger" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu-mobile">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div class="navbar-logo-wrap">
        <img src="https://www.greenindustryplatform.org/sites/default/files/styles/scale_width/public/2022-07/FirjanSENAI-01.png" alt="SENAI" class="navbar-senai-logo" />
        <span class="navbar-logo-divider">/</span>
        <a href="index.html" class="navbar-logo">Snap<em>Bite</em></a>
      </div>

      <div class="navbar-side navbar-side-right">
        <div id="nav-auth-area"></div>

        <a href="carrinho.html" class="carrinho-link">
          <button class="btn-carrinho" type="button">
            <i class="fa-solid fa-cart-shopping"></i>
            <span class="btn-carrinho-text">Carrinho</span>
            <span class="carrinho-badge" style="display:none">0</span>
          </button>
        </a>
      </div>
    </div>

    <!-- ── MENU MOBILE REDESENHADO ── -->
    <aside class="menu-mobile menu-left" id="menu-mobile" aria-hidden="true">

      <!-- Cabeçalho do menu -->
      <div class="menu-header">
        <div class="menu-brand">
          <span class="menu-logo">Snap<em>Bite</em></span>
          <span class="menu-tagline">SENAI · Lanchonete</span>
        </div>
      </div>

      <!-- Seção: Principal -->
      <div class="menu-section">
        <span class="menu-section-label">Principal</span>
        <a href="index.html" class="menu-item">
          <span class="menu-item-icon">
            <i class="fa-solid fa-house"></i>
          </span>
          <span class="menu-item-text">Home</span>
          <span class="menu-item-arrow">›</span>
        </a>
        <a href="cardapio.html" class="menu-item">
          <span class="menu-item-icon">
            <i class="fa-solid fa-utensils"></i>
          </span>
          <span class="menu-item-text">Cardápio</span>
          <span class="menu-item-arrow">›</span>
        </a>
        <a href="promocoes.html" class="menu-item">
          <span class="menu-item-icon">
            <i class="fa-solid fa-tag"></i>
          </span>
          <span class="menu-item-text">Promoções</span>
          <span class="menu-item-badge">HOT</span>
        </a>
      </div>

      <!-- Seção: Fidelidade — destaque -->
      <div class="menu-section menu-section-fidelidade">
        <a href="fidelidade.html" class="menu-item-fidelidade">
          <span class="menu-fid-icon">
            <i class="fa-solid fa-star"></i>
          </span>
          <div class="menu-fid-info">
            <span class="menu-fid-titulo">Cartão Fidelidade</span>
            <span class="menu-fid-sub">Acumule pontos e ganhe prêmios</span>
          </div>
          <span class="menu-fid-arrow">›</span>
        </a>
      </div>

      <!-- Seção: Explorar -->
      <div class="menu-section">
        <span class="menu-section-label">Explorar</span>
        <a href="IA.html" class="menu-item">
          <span class="menu-item-icon">
            <i class="fa-solid fa-robot"></i>
          </span>
          <span class="menu-item-text">IA SnapBite</span>
          <span class="menu-item-badge menu-item-badge--new">NOVO</span>
        </a>
        <a href="Sobreapp.html" class="menu-item">
          <span class="menu-item-icon">
            <i class="fa-solid fa-mobile"></i>
          </span>
          <span class="menu-item-text">Sobre o App</span>
          <span class="menu-item-badge menu-item-badge--new">NOVO</span>
        </a>
        <a href="localizacao.html" class="menu-item">
          <span class="menu-item-icon">
            <i class="fa-solid fa-location-dot"></i>
          </span>
          <span class="menu-item-text">Localização</span>
          <span class="menu-item-arrow">›</span>
        </a>
      </div>

      <!-- Seção: Institucional -->
      <div class="menu-section">
        <span class="menu-section-label">Institucional</span>
        <a href="sobre.html" class="menu-item">
          <span class="menu-item-icon">
            <i class="fa-solid fa-circle-info"></i>
          </span>
          <span class="menu-item-text">Sobre Nós</span>
          <span class="menu-item-arrow">›</span>
        </a>
        <a href="contato.html" class="menu-item">
          <span class="menu-item-icon">
            <i class="fa-solid fa-envelope"></i>
          </span>
          <span class="menu-item-text">Contato</span>
          <span class="menu-item-arrow">›</span>
        </a>
      </div>

      <!-- Rodapé do menu -->
      <div class="menu-footer">
        <a href="login.html?aba=cadastro" data-open-cadastro class="menu-btn-conta">
          <i class="fa-solid fa-user-plus"></i>
          Criar conta
        </a>
        <div class="menu-footer-horario">
          <i class="fa-regular fa-clock"></i>
          Seg–Sex · 07:00–08:30 e 11:00–12:30
        </div>
      </div>

    </aside>

    <div class="menu-overlay" id="menu-overlay"></div>
  </nav>

<style>

.modal-pagamento-box {
  max-width: 540px;
  border-top: 4px solid var(--mostarda);
}

.pag-topo {
  margin-bottom: 18px;
}

.pag-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(0,51,153,0.08);
  color: var(--vinho);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.modal-pagamento-box h2 {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  line-height: 1.08;
  margin-bottom: 10px;
  color: var(--preto-q);
}

.metodos-grid-bonito {
  margin-top: 18px;
}

.metodo-btn {
  background: #fff;
  border: 1.5px solid var(--cinza-borda);
  border-radius: 16px;
  padding: 18px 16px;
  transition: border-color .2s, box-shadow .2s, transform .2s, background .2s;
}

.metodo-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(0,51,153,0.35);
  box-shadow: 0 10px 28px rgba(0,51,153,0.08);
}

.metodo-btn.ativo {
  border-color: var(--vinho);
  box-shadow: 0 0 0 3px rgba(0,51,153,0.08);
  background: #fff;
}

.metodo-check {
  opacity: 0;
  transition: opacity .2s ease;
  color: var(--vinho);
  font-weight: 900;
}

.metodo-btn.ativo .metodo-check {
  opacity: 1;
}

.pag-card-box,
.pag-pix-box,
.pag-wallet-box {
  margin-top: 18px;
  background: linear-gradient(180deg, #eef2ff 0%, #f5f7ff 100%);
  border: 1px solid #d6dcf5;
  border-radius: 18px;
  padding: 20px;
}

.pag-extra-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}

.pag-extra-head strong {
  color: var(--preto-q);
  font-size: 1rem;
}

.pag-extra-head span {
  color: var(--cinza-q);
  font-size: 0.88rem;
}

.pag-resumo-aviso {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: rgba(255,255,255,0.72);
  border-radius: 14px;
  padding: 14px;
  color: var(--cinza-q);
  line-height: 1.6;
}

.pag-resumo-aviso i {
  color: var(--vinho);
  margin-top: 2px;
}

.pix-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 90px;
  color: var(--cinza-q);
  font-weight: 600;
}

.pix-loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0,51,153,0.18);
  border-top-color: var(--vinho);
  border-radius: 50%;
  animation: pixSpin .75s linear infinite;
}

@keyframes pixSpin {
  to { transform: rotate(360deg); }
}

.pix-head {
  text-align: center;
  margin-bottom: 14px;
}

.pix-head strong {
  display: block;
  color: var(--preto-q);
  margin-bottom: 4px;
}

.pix-head span {
  color: var(--cinza-q);
  font-size: 0.85rem;
}

.pix-qrcode-box {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 180px;
  background: #fff;
  border: 1px solid var(--cinza-borda);
  border-radius: 16px;
  margin-bottom: 14px;
}

.pix-placeholder-text {
  font-size: 0.85rem;
  color: var(--cinza-q);
}

.pix-chave-wrap label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--cinza-q);
}

.pix-chave-box {
  font-family: 'DM Mono', monospace;
  font-size: 0.82rem;
  color: var(--preto-q);
  background: #fff;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid var(--cinza-borda);
  word-break: break-all;
  line-height: 1.5;
}

.pix-copy-btn {
  margin-top: 12px;
  width: 100%;
  background: var(--mostarda);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-weight: 800;
  font-size: 0.88rem;
  cursor: pointer;
  transition: transform .18s, opacity .18s;
}

.pix-copy-btn:hover {
  transform: translateY(-1px);
  opacity: .95;
}

.pix-note {
  font-size: 0.82rem;
  color: var(--cinza-q);
  text-align: center;
  line-height: 1.7;
  margin-top: 12px;
}

.pag-wallet-box {
  text-align: center;
}

.wallet-emoji {
  font-size: 2.3rem;
  margin-bottom: 10px;
}

.wallet-msg {
  color: var(--cinza-q);
  line-height: 1.75;
}

.btn-confirmar-pag {
  margin-top: 18px;
  width: 100%;
  border-radius: 14px;
  padding: 15px 20px;
  font-size: 0.98rem;
  font-weight: 800;
  background: var(--vinho);
  color: #fff;
  border: none;
  transition: transform .18s, opacity .18s, background .18s;
}

.btn-confirmar-pag:hover:not(:disabled) {
  transform: translateY(-1px);
  background: var(--vinho-cl);
}

.btn-confirmar-pag:disabled {
  opacity: .55;
  cursor: not-allowed;
}
  
  /* ── MENU MOBILE STYLES ── */
  
  .menu-mobile.menu-left {
    width: 500px;
    max-width: 88vw;
    background: #f7f9ff;
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0;
    overflow-y: auto;
    overflow-x: hidden;
    border-right: 1px solid #d6dcf5;
    box-shadow: 18px 0 40px rgba(0, 26, 102, 0.18);
  }

  /* Cabeçalho */
  .menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 20px 16px;
    border-bottom: 1.5px solid rgba(255,255,255,0.08);
    background: linear-gradient(135deg, #001a66 0%, #003399 100%);
    flex-shrink: 0;
  }

  .menu-brand {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .menu-logo {
    font-size: 1.4rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.5px;
  }

  .menu-logo em {
    color: #ff4d57;
    font-style: normal;
  }

  .menu-tagline {
    font-size: 0.68rem;
    color: rgba(255,255,255,0.68);
    font-weight: 500;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .menu-close-btn {
    background: rgba(255,255,255,0.12);
    border: none;
    color: #fff;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, transform 0.2s;
    flex-shrink: 0;
  }

  .menu-close-btn:hover {
    background: rgba(255,255,255,0.22);
    transform: scale(1.04);
  }

  /* Seções */
  .menu-section {
    padding: 14px 12px 8px;
    border-bottom: 1px solid #e4e9f8;
  }

  .menu-section:last-of-type {
    border-bottom: none;
  }

  .menu-section-label {
    display: block;
    font-size: 0.63rem;
    font-weight: 800;
    color: #5f6f9e;
    text-transform: uppercase;
    letter-spacing: 1.6px;
    padding: 0 8px;
    margin-bottom: 8px;
  }

  /* Item de menu */
  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 10px;
    border-radius: 10px;
    text-decoration: none;
    color: #0a0f1e !important;
    font-weight: 700;
    font-size: 0.92rem;
    transition: background 0.15s, color 0.15s, transform 0.15s;
    position: relative;
  }

  .menu-item:hover {
    background: rgba(227, 6, 19, 0.08);
    color: #c4002a !important;
    transform: translateX(2px);
  }

  .menu-item-icon {
    width: 34px;
    height: 34px;
    background: #eef2ff;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    color: #003399;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    border: 1px solid #d6dcf5;
  }

  .menu-item:hover .menu-item-icon {
    background: rgba(227, 6, 19, 0.12);
    color: #c4002a;
    border-color: rgba(227, 6, 19, 0.18);
  }

  .menu-item-text {
    flex: 1;
    color: inherit !important;
  }

  .menu-item-arrow {
    color: #7f8db5;
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1;
  }

  .menu-item-badge {
    font-size: 0.58rem;
    font-weight: 800;
    letter-spacing: 0.8px;
    padding: 2px 7px;
    border-radius: 20px;
    background: #e30613;
    color: #fff;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .menu-item-badge--new {
    background: #003399;
  }

  /* Bloco Fidelidade — destaque */
  .menu-section-fidelidade {
    padding: 12px 12px;
    background: linear-gradient(135deg, rgba(227,6,19,0.06), rgba(0,51,153,0.08));
    border-top: 1px solid #dfe5f7;
    border-bottom: 1px solid #dfe5f7;
  }

  .menu-item-fidelidade {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 12px;
    text-decoration: none;
    background: linear-gradient(135deg, #e30613, #003399);
    color: #fff !important;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 8px 20px rgba(0, 51, 153, 0.18);
  }

  .menu-item-fidelidade:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(0, 51, 153, 0.24);
  }

  .menu-fid-icon {
    width: 38px;
    height: 38px;
    background: rgba(255,255,255,0.18);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
    color: #fff;
  }

  .menu-fid-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .menu-fid-titulo {
    font-size: 0.88rem;
    font-weight: 700;
    color: #fff !important;
  }

  .menu-fid-sub {
    font-size: 0.7rem;
    color: rgba(255,255,255,0.84) !important;
    font-weight: 500;
  }

  .menu-fid-arrow {
    color: rgba(255,255,255,0.78);
    font-size: 1.1rem;
  }

  /* Rodapé do menu */
  .menu-footer {
    margin-top: auto;
    padding: 16px 16px 24px;
    border-top: 1.5px solid #e4e9f8;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #f7f9ff;
  }

  .menu-btn-conta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 11px 16px;
    background: linear-gradient(135deg, #003399, #0047cc);
    color: #fff;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 700;
    font-size: 0.88rem;
    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 6px 18px rgba(0, 51, 153, 0.16);
  }

  .menu-btn-conta:hover {
    background: linear-gradient(135deg, #e30613, #c4002a);
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(196, 0, 42, 0.18);
  }

  .menu-footer-horario {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 0.72rem;
    color: #5c6680;
    justify-content: center;
  }
</style>
`);

  /* ── FOOTER ── */
  document.body.insertAdjacentHTML(
    'beforeend',
    `
    <footer class="footer">
      <div class="footer-main">
        <div class="footer-brand">
          <span class="footer-logo">Snap<em>Bite</em></span>
          <p>A lanchonete do SENAI feita por alunos pra alunos. Rápido, gostoso e do jeito que a galera gosta.</p>

          <div class="footer-socials">
            <div class="soc ig" title="Instagram">📸</div>
            <div class="soc tw" title="Twitter">🐦</div>
            <div class="soc wa" title="WhatsApp">💬</div>
          </div>
        </div>

        <div class="footer-col">
          <h4>Páginas</h4>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="cardapio.html">Cardápio</a></li>
            <li><a href="promocoes.html">Promoções</a></li>
            <li><a href="fidelidade.html">Cartão Fidelidade</a></li>
            <li><a href="sobre.html">Sobre Nós</a></li>
            <li><a href="contato.html">Contato</a></li>
            <li><a href="carrinho.html">Carrinho</a></li>
            <li><a href="localizacao.html">Localização</a></li>
            <li><a href="Sobreapp.html">Sobre o app</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Categorias</h4>
          <ul>
            <li><a href="cardapio.html">Lanches</a></li>
            <li><a href="cardapio.html">Combos</a></li>
            <li><a href="cardapio.html">Bebidas</a></li>
            <li><a href="cardapio.html">Sobremesas</a></li>
            <li><a href="promocoes.html">Promoções do Dia</a></li>
            <li><a href="localizacao.html">Localização</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Funcionamento</h4>
          <div class="horario-row">
            <span class="dia">Seg – Sex (Manhã)</span>
            <span class="hr">07:00 – 08:30</span>
          </div>
          <div class="horario-row">
            <span class="dia">Seg – Sex (Tarde)</span>
            <span class="hr">11:00 – 12:30</span>
          </div>
          <div class="horario-row off">
            <span class="dia">Sábado e Domingo</span>
            <span class="hr">Fechado</span>
          </div>
          <p style="margin-top:16px;font-size:0.8rem;color:#4A3E38;line-height:1.6">
            📍 SENAI · Bloco da Lanchonete<br>
            Retirada no balcão no intervalo
          </p>
        </div>
      </div>

      <div class="footer-bottom-bar">
        <span>© 2026 SnapBite — Todos os direitos reservados</span>
        <div style="display:flex;gap:20px;flex-wrap:wrap">
          <a href="termos.html">Termos de Uso</a>
          <a href="termos.html#privacidade">Privacidade</a>
          <a href="termos.html#cookies">Cookies</a>
        </div>
        <span>Feito com ❤️ por estudantes do SENAI</span>
      </div>
    </footer>
  `
  );

  /* ── MODAL LOGIN ── */
  document.body.insertAdjacentHTML(
    'beforeend',
    `

    <div class="modal-overlay" id="modal-completar-cadastro">
  <div class="modal-box">
    <button class="modal-close" data-modal="modal-completar-cadastro" type="button">✕</button>
    <h2>Complete seu cadastro</h2>
    <p class="modal-sub">Para usar Google e e-mail/senha na mesma conta, crie seu nome, senha do site e confirme os termos.</p>

    <form id="form-completar-cadastro">
      <div class="form-group">
        <label for="extra-nome">Nome</label>
        <input type="text" id="extra-nome" placeholder="Seu nome" required>
      </div>

      <div class="form-group">
        <label for="extra-email">E-mail</label>
        <input type="email" id="extra-email" readonly>
      </div>

      <div class="form-group">
        <label for="extra-telefone">Telefone</label>
        <input type="tel" id="extra-telefone" placeholder="(11) 99999-9999" required>
      </div>

      <div class="form-group">
        <label for="extra-senha">Senha do site</label>
        <input type="password" id="extra-senha" placeholder="Crie uma senha" minlength="6" autocomplete="new-password">
      </div>

      <div class="form-group">
        <label for="extra-senha-confirmar">Confirmar senha</label>
        <input type="password" id="extra-senha-confirmar" placeholder="Repita a senha" minlength="6" autocomplete="new-password">
      </div>

      <div class="form-group" style="display:flex;gap:10px;align-items:flex-start;">
        <input type="checkbox" id="extra-termos" style="margin-top:4px;">
        <label for="extra-termos" style="line-height:1.6;">
          Li e concordo com os <a href="termos.html" target="_blank">Termos de Uso</a>.
        </label>
      </div>

      <button type="submit" class="btn-primary" style="width:100%;justify-content:center;">
        Concluir cadastro
      </button>
    </form>
  </div>
</div>

    <div class="modal-overlay" id="modal-login">
      <div class="modal-box">
        <button class="modal-close" data-modal="modal-login" type="button">✕</button>
        <h2>Boas-vindas!</h2>
        <p class="modal-sub">Entre na sua conta para adicionar itens e finalizar seu pedido.</p>

        <div class="modal-tabs">
          <button class="modal-tab active" data-tab="tab-login" type="button">Entrar</button>
          <button class="modal-tab" data-tab="tab-cadastro" type="button">Criar conta</button>
        </div>

        <div class="social-btns">
           <button class="btn-soc" id="btn-google" type="button" onclick="loginComGoogleReal()">
            <img src="https://www.google.com/favicon.ico" alt="Google">
           Continuar com Google
           </button>

          <button class="btn-soc" id="btn-facebook" type="button">
            <img src="https://www.facebook.com/favicon.ico" alt="Facebook">
            Continuar com Facebook
          </button>
        </div>

        <div class="divider">ou use seu e-mail</div>

        <div class="tab-content active" id="tab-login">
          <form id="form-login">
            <div class="form-group">
              <label for="login-email">E-mail</label>
              <input type="email" id="login-email" placeholder="seu@email.com" required>
            </div>

            <div class="form-group">
              <label for="login-senha">Senha</label>
              <input type="password" id="login-senha" placeholder="••••••" required minlength="6">
            </div>

            <button type="submit" class="btn-primary" style="width:100%;justify-content:center;margin-top:8px">
              Entrar
            </button>

            <p style="margin-top:10px;text-align:right;">
              <button
                type="button"
                id="btn-esqueceu-senha"
                style="background:none;border:none;color:var(--mostarda);cursor:pointer;font-weight:600;"
              >
                Esqueci a senha
              </button>
            </p>
          </form>
        </div>

        <div class="tab-content" id="tab-cadastro">
          <form id="form-cadastro">
            <div class="form-group">
              <label for="cad-nome">Nome completo</label>
              <input type="text" id="cad-nome" placeholder="Seu nome" required>
            </div>

            <div class="form-group">
              <label for="cad-email">E-mail</label>
              <input type="email" id="cad-email" placeholder="seu@email.com" required>
            </div>

            <div class="form-group">
              <label for="cad-senha">Senha</label>
              <input type="password" id="cad-senha" placeholder="Mínimo 6 caracteres" required minlength="6">
            </div>

            <div class="form-group">
              <label for="cad-telefone">Telefone</label>
              <input type="tel" id="cad-telefone" placeholder="(11) 99999-9999">
            </div>

            <div class="form-group" style="display:flex;gap:10px;align-items:flex-start;">
              <input type="checkbox" id="cad-termos" style="margin-top:4px;" required>
              <label for="cad-termos" style="line-height:1.6;">
                Li e concordo com os <a href="termos.html" target="_blank">Termos de Uso</a>.
              </label>
            </div>

            <button type="submit" class="btn-primary" style="width:100%;justify-content:center;margin-top:8px">
              Criar conta
            </button>
          </form>
        </div>
      </div>
    </div>

<div class="modal-overlay" id="modal-pagamento">
  <div class="modal-box modal-pagamento-box">
    <button class="modal-close" data-modal="modal-pagamento" type="button">✕</button>

    <div class="pag-topo">
      <span class="pag-kicker">Pedido seguro</span>
      <h2>Escolha como deseja pagar</h2>
      <p class="modal-sub">
        Selecione a forma de pagamento do seu pedido. A confirmação do pedido acontece ao finalizar.
      </p>
    </div>

    <div class="pag-total-pill" id="pag-total-pill">Total: R$ 0,00</div>

    <div class="metodos-grid metodos-grid-bonito">
      <button class="metodo-btn" data-metodo="pix" onclick="selecionarPagamento(this)" type="button">
        <span class="metodo-icon">🟩</span>
        <div class="metodo-info">
          <span class="metodo-nome">PIX</span>
          <span class="metodo-desc">Pagamento antecipado</span>
        </div>
        <span class="metodo-check">✓</span>
      </button>

      <button class="metodo-btn" data-metodo="cartao" onclick="selecionarPagamento(this)" type="button">
        <span class="metodo-icon">💳</span>
        <div class="metodo-info">
          <span class="metodo-nome">Cartão</span>
          <span class="metodo-desc">Pagamento na retirada</span>
        </div>
        <span class="metodo-check">✓</span>
      </button>

      <button class="metodo-btn" data-metodo="paypal" onclick="selecionarPagamento(this)" type="button">
        <span class="metodo-icon">🅿️</span>
        <div class="metodo-info">
          <span class="metodo-nome">PayPal</span>
          <span class="metodo-desc">Pagamento na retirada</span>
        </div>
        <span class="metodo-check">✓</span>
      </button>

      <button class="metodo-btn" data-metodo="picpay" onclick="selecionarPagamento(this)" type="button">
        <span class="metodo-icon">🟢</span>
        <div class="metodo-info">
          <span class="metodo-nome">PicPay</span>
          <span class="metodo-desc">Pagamento na retirada</span>
        </div>
        <span class="metodo-check">✓</span>
      </button>
    </div>

    <div id="form-cartao" class="pag-extra pag-card-box" style="display:none">
      <div class="pag-extra-head">
        <strong>Pagamento com cartão</strong>
        <span>Os dados são informados no balcão no momento da retirada.</span>
      </div>

      <div class="pag-resumo-aviso">
        <i class="fa-regular fa-credit-card"></i>
        <span>Você escolheu pagar com cartão. O valor será cobrado presencialmente no SENAI.</span>
      </div>
    </div>

    <div id="info-pix" class="pag-extra pag-pix-box" style="display:none">
      <div class="pix-status" id="pix-status">
        <div class="pix-loader"></div>
        <span>Gerando cobrança PIX segura...</span>
      </div>

      <div id="pix-content" style="display:none">
        <div class="pix-head">
          <strong>QR Code PIX</strong>
          <span>Use seu banco para escanear ou copiar a chave.</span>
        </div>

        <div
          id="pix-qrcode"
          class="pix-qrcode-box"
        >
          <div class="pix-placeholder-text">Preparando QR Code...</div>
        </div>

        <div class="pix-chave-wrap">
          <label>Chave PIX</label>
          <div id="pix-chave" class="pix-chave-box">—</div>
        </div>

        <button onclick="copiarChavePix()" type="button" class="pix-copy-btn">
          📋 Copiar chave
        </button>

        <p class="pix-note">
          Após o pagamento, a liberação do pedido pode levar alguns instantes.
        </p>
      </div>
    </div>

    <div id="info-wallet" class="pag-extra pag-wallet-box" style="display:none">
      <div class="wallet-emoji" id="wallet-emoji">💳</div>
      <p class="wallet-msg" id="wallet-msg">
        O pagamento será processado na retirada no balcão do SENAI.
      </p>
    </div>

    <button class="btn-confirmar-pag" id="btn-confirmar-pag" onclick="confirmarPagamento()" type="button" disabled>
      Finalizar pedido
    </button>
  </div>
</div>
  `
  );

  /* ── COOKIE ── */
  document.body.insertAdjacentHTML(
    'beforeend',
    `
    <div class="cookie-banner" id="cookie-banner">
      <div class="cookie-inner">
        <p class="cookie-text">
          Usamos cookies para melhorar sua experiência — carrinho, sessão e preferências.
          Ao continuar, você concorda com nossa
          <a href="termos.html#cookies">Política de Cookies</a>
          e
          <a href="termos.html">Termos de Uso</a>.
        </p>

        <div class="cookie-btns">
          <button class="btn-ck-no" id="btn-recusar-cookies" type="button">Recusar</button>
          <button class="btn-ck-ok" id="btn-aceitar-cookies" type="button">Aceitar</button>
        </div>
      </div>
    </div>
  `);

  /* ── TOAST CONTAINER ── */
  document.body.insertAdjacentHTML(
    'beforeend',
    `<div class="toast-container" id="toast-container"></div>`
  );

  /* ── FECHAR MENU COM BOTÃO X ── */
  document.addEventListener('click', (e) => {
    if (e.target.closest('#menu-close-btn')) {
      const menu = document.getElementById('menu-mobile');
      const overlay = document.getElementById('menu-overlay');
      const hamburger = document.getElementById('hamburger');
      if (menu) { menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); }
      if (overlay) overlay.classList.remove('active');
      if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    }
  });
})();

// ── TEMA ──
(function () {
  const btn = document.getElementById('btn-theme');
  if (!btn) return;

  const icon = btn.querySelector('.theme-icon');

  function aplicarTema(theme) {
    const dark = theme === 'dark';

    document.body.classList.toggle('dark', dark);

    if (icon) {
      icon.innerHTML = dark 
        ? '<i class="fa-solid fa-sun" style="color: #c7952a;"></i>' 
        : '<i class="fa-solid fa-moon" style="color: #c7952a;"></i>';
    }

    localStorage.setItem('snapbite-theme', dark ? 'dark' : 'light');
  }

  const temaSalvo = localStorage.getItem('snapbite-theme');

  aplicarTema(temaSalvo === 'dark' ? 'dark' : 'light');

  btn.addEventListener('click', () => {
    const estaEscuro = document.body.classList.contains('dark');
    aplicarTema(estaEscuro ? 'light' : 'dark');
  });
})();
