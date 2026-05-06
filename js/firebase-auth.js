import {
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
