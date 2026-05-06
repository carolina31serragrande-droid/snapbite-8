export function passwordResetTemplate(resetLink) {
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
