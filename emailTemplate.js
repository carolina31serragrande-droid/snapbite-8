function formatBRL(valor) {
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
}

function escapeHtml(texto = '') {
  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function gerarHtmlEmailPedido({
  nomeCliente,
  numeroPedido,
  itens,
  total,
  imagemLoja,
}) {
  const itensHtml = itens
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee;">
            <div style="font-weight:700;color:#1C1410;">${escapeHtml(item.nome)}</div>
            <div style="font-size:13px;color:#8C8070;">
              Quantidade: ${Number(item.qtd)} • Valor unitário: ${formatBRL(item.preco)}
            </div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:#7D1D3F;">
            ${formatBRL(item.preco * item.qtd)}
          </td>
        </tr>
      `
    )
    .join('');

  const blocoImagem = imagemLoja
    ? `<img src="${escapeHtml(imagemLoja)}" alt="SnapBite" style="max-width:160px;height:auto;display:block;margin:0 auto 16px;">`
    : '';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Pedido concluído - SnapBite</title>
      </head>
      <body style="margin:0;padding:0;background:#FDFAF4;font-family:Arial,Helvetica,sans-serif;color:#1C1410;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:700px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #EAE0CC;">
                <tr>
                  <td style="background:#2D2420;padding:28px 32px;text-align:center;">
                    ${blocoImagem}
                    <div style="font-size:28px;font-weight:800;color:#C8952A;">SnapBite</div>
                    <div style="font-size:14px;color:#d4c4a8;margin-top:6px;">
                      Pedido concluído com sucesso
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 12px;font-size:16px;">
                      Olá, <strong>${escapeHtml(nomeCliente)}</strong>!
                    </p>

                    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4A3E38;">
                      Seu pedido foi concluído com sucesso. Obrigado por comprar com a SnapBite!
                    </p>

                    <div style="background:#F5EFE0;border:1px solid #EAE0CC;border-radius:14px;padding:18px 20px;margin-bottom:24px;">
                      <div style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#8C8070;margin-bottom:8px;">
                        Número do pedido
                      </div>
                      <div style="font-size:28px;font-weight:900;color:#7D1D3F;letter-spacing:2px;">
                        ${escapeHtml(numeroPedido)}
                      </div>
                    </div>

                    <h2 style="margin:0 0 14px;font-size:20px;color:#1C1410;">Resumo do pedido</h2>

                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
                      ${itensHtml}
                    </table>

                    <div style="text-align:right;margin:8px 0 24px;">
                      <span style="font-size:14px;color:#8C8070;">Total</span><br>
                      <span style="font-size:28px;font-weight:900;color:#7D1D3F;">
                        ${formatBRL(total)}
                      </span>
                    </div>

                    <div style="background:#fff8ec;border:1px solid #F2D97A;border-radius:12px;padding:16px 18px;margin-bottom:20px;">
                      <p style="margin:0;font-size:14px;line-height:1.7;color:#4A3E38;">
                        Seu pedido ficará disponível para retirada no balcão da loja no horário informado.
                      </p>
                    </div>

                    <p style="margin:0;font-size:13px;line-height:1.7;color:#8C8070;">
                      Se tiver qualquer dúvida, fale com a equipe da SnapBite.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="background:#2D2420;padding:18px 24px;text-align:center;">
                    <div style="font-size:12px;color:#A09080;">
                      © SnapBite • Feito por estudantes do SENAI
                    </div>
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