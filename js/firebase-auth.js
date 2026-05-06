# js/firebase-auth.js

```javascript
import {
  getAuth,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { app } from "./firebase-config.js";

const auth = getAuth(app);

// =========================
// ESQUECI A SENHA
// =========================

const forgotForm = document.getElementById("forgot-password-form");

if (forgotForm) {
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("reset-email").value;

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/recuperar-senha.html`,
        handleCodeInApp: false,
      });

      alert("Email de redefinição enviado com sucesso! 📩");

    } catch (error) {
      console.error(error);

      alert("Erro ao enviar email de redefinição.");
    }
  });
}

// =========================
// ALTERAR SENHA REAL
// =========================

const newPasswordForm = document.getElementById("new-password-form");

if (newPasswordForm) {

  const params = new URLSearchParams(window.location.search);
  const oobCode = params.get("oobCode");

  verifyPasswordResetCode(auth, oobCode)
    .then(() => {
      console.log("Código válido.");
    })
    .catch(() => {
      alert("Link inválido ou expirado.");
      window.location.href = "login.html";
    });

  newPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password.length < 8) {
      alert("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    try {

      await confirmPasswordReset(auth, oobCode, password);

      alert("Senha redefinida com sucesso! 🚀");

      window.location.href = "login.html";

    } catch (error) {
      console.error(error);
      alert("Erro ao redefinir senha.");
    }
  });
}
```

---

# backend/emailTemplate.js

```javascript
export function passwordResetTemplate(resetLink) {
  return `

  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinição de Senha</title>
  </head>

  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.1);">

            <tr>
              <td style="background:linear-gradient(135deg,#d90429,#ef233c);padding:40px;text-align:center;">

                <h1 style="color:white;margin:0;font-size:34px;">
                  SnapBite 🔒
                </h1>

                <p style="color:#ffe5e5;margin-top:15px;font-size:16px;">
                  Recuperação de senha
                </p>

              </td>
            </tr>

            <tr>
              <td>
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop"
                  width="100%"
                  style="height:250px;object-fit:cover;display:block;"
                >
              </td>
            </tr>

            <tr>
              <td style="padding:40px;">

                <h2 style="color:#111827;">
                  Olá, estudante 👋
                </h2>

                <p style="color:#4b5563;line-height:1.7;font-size:16px;">
                  Recebemos uma solicitação para redefinir sua senha.
                </p>

                <p style="color:#4b5563;line-height:1.7;font-size:16px;">
                  Clique no botão abaixo para criar uma nova senha.
                </p>

                <div style="text-align:center;margin:35px 0;">

                  <a
                    href="${resetLink}"
                    style="display:inline-block;padding:18px 35px;background:#ef233c;color:white;text-decoration:none;border-radius:14px;font-size:18px;font-weight:bold;"
                  >
                    🔒 REDEFINIR SENHA
                  </a>

                </div>

                <div style="background:#fff5f5;border-left:5px solid #ef233c;padding:20px;border-radius:12px;">

                  <p style="margin:0;color:#7f1d1d;line-height:1.7;">
                    ⚠️ Este link expira em alguns minutos.
                    <br><br>
                    Se não for você, ignore essa mensagem!
                  </p>

                </div>

              </td>
            </tr>

            <tr>
              <td style="background:#111827;padding:25px;text-align:center;">
                <p style="margin:0;color:#9ca3af;">
                  © 2026 SnapBite • SENAI
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>

  `;
}
```

---

# recuperar-senha.html

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Senha - SnapBite</title>

  <style>

    *{
      margin:0;
      padding:0;
      box-sizing:border-box;
      font-family:Arial, Helvetica, sans-serif;
    }

    body{
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      background:
      linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),
      url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1400&auto=format&fit=crop');
      background-size:cover;
      background-position:center;
      padding:20px;
    }

    .container{
      width:100%;
      max-width:1000px;
      display:flex;
      overflow:hidden;
      border-radius:30px;
      background:rgba(255,255,255,.12);
      backdrop-filter:blur(12px);
      border:1px solid rgba(255,255,255,.2);
      box-shadow:0 15px 50px rgba(0,0,0,.4);
    }

    .left{
      flex:1;
      background:linear-gradient(135deg,#d90429,#ef233c);
      color:white;
      padding:60px;
      display:flex;
      flex-direction:column;
      justify-content:center;
    }

    .left h1{
      font-size:52px;
      margin-bottom:20px;
    }

    .left p{
      line-height:1.8;
      font-size:18px;
    }

    .right{
      flex:1;
      background:white;
      padding:50px;
      display:flex;
      align-items:center;
      justify-content:center;
    }

    form{
      width:100%;
      max-width:400px;
    }

    h2{
      font-size:38px;
      margin-bottom:15px;
      color:#111827;
    }

    .desc{
      color:#6b7280;
      margin-bottom:30px;
      line-height:1.6;
    }

    .input-group{
      margin-bottom:20px;
    }

    label{
      display:block;
      margin-bottom:8px;
      font-weight:bold;
      color:#374151;
    }

    input{
      width:100%;
      padding:18px;
      border-radius:15px;
      border:2px solid #e5e7eb;
      font-size:16px;
      outline:none;
      transition:.3s;
    }

    input:focus{
      border-color:#ef233c;
      box-shadow:0 0 0 5px rgba(239,35,60,.15);
    }

    button{
      width:100%;
      padding:18px;
      border:none;
      border-radius:16px;
      background:linear-gradient(135deg,#d90429,#ef233c);
      color:white;
      font-size:18px;
      font-weight:bold;
      cursor:pointer;
      margin-top:10px;
      transition:.3s;
    }

    button:hover{
      transform:translateY(-3px);
      box-shadow:0 12px 25px rgba(239,35,60,.35);
    }

    .alert{
      margin-top:25px;
      background:#fff5f5;
      border-left:5px solid #ef233c;
      padding:18px;
      border-radius:12px;
      color:#7f1d1d;
      line-height:1.7;
      font-size:14px;
    }

    @media(max-width:900px){
      .container{
        flex-direction:column;
      }

      .left{
        padding:40px;
      }

      .left h1{
        font-size:38px;
      }
    }

  </style>
</head>
<body>

  <div class="container">

    <div class="left">

      <h1>SnapBite 🚀</h1>

      <p>
        Crie sua nova senha e volte a pedir seus lanches sem filas.
        <br><br>
        Plataforma dos estudantes SENAI.
      </p>

    </div>

    <div class="right">

      <form id="new-password-form">

        <h2>Nova senha</h2>

        <p class="desc">
          Escolha uma senha forte para proteger sua conta.
        </p>

        <div class="input-group">
          <label>Nova senha</label>
          <input
            type="password"
            id="new-password"
            placeholder="Digite sua nova senha"
            required
          >
        </div>

        <div class="input-group">
          <label>Confirmar senha</label>
          <input
            type="password"
            id="confirm-password"
            placeholder="Confirme sua senha"
            required
          >
        </div>

        <button type="submit">
          ALTERAR SENHA
        </button>

        <div class="alert">
          ⚠️ Se não foi você quem solicitou isso, ignore esta página.
        </div>

      </form>

    </div>

  </div>

  <script type="module" src="./js/firebase-auth.js"></script>

</body>
</html>
```

---

# HTML DO FORMULÁRIO “ESQUECI A SENHA”

```html
<form id="forgot-password-form">

  <input
    type="email"
    id="reset-email"
    placeholder="Digite seu email"
    required
  >

  <button type="submit">
    Enviar email de recuperação
  </button>

</form>
```
