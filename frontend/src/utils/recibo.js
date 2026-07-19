// Nome da loja impresso no recibo. Ainda não definido — ajuste aqui,
// ou defina REACT_APP_LOJA_NOME no Vercel (não precisa mexer no código).
const NOME_LOJA = process.env.REACT_APP_LOJA_NOME || 'CenterCel';

// escapa texto do usuário antes de injetar no HTML da janela de impressão
const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const imprimirRecibo = (item, formatarMoeda) => {
  const estilos = [
    'body { font-family: sans-serif; padding: 40px; text-align: center; border: 2px solid #000; }',
    'h1 { margin-bottom: 5px; }',
    '.info { text-align: left; margin-top: 30px; line-height: 2; }',
    '.footer { margin-top: 50px; font-size: 12px; color: #666; }',
    '.assinatura { margin-top: 60px; border-top: 1px solid #000; width: 250px; display: inline-block; }'
  ].join(' ');

  const data = item.dataVenda
    ? new Date(item.dataVenda).toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR');

  const cliente = item.cliente ? item.cliente.toUpperCase() : 'NÃO INFORMADO';

  const html = '<html><head><title>Recibo - SmartSync</title><style>' + estilos + '</style></head>'
    + '<body>'
    + '<h1>' + esc(NOME_LOJA.toUpperCase()) + '</h1>'
    + '<p>Comprovante de Serviço / Garantia</p>'
    + '<div class="info">'
    + '<p><strong>CLIENTE:</strong> ' + esc(cliente) + '</p>'
    + '<p><strong>APARELHO:</strong> ' + esc(item.aparelho) + '</p>'
    + '<p><strong>IMEI:</strong> ' + esc(item.imei) + '</p>'
    + '<p><strong>DATA:</strong> ' + esc(data) + '</p>'
    + '<p><strong>VALOR:</strong> ' + esc(formatarMoeda(item.preco)) + '</p>'
    + '</div>'
    + '<div class="assinatura"><p>Assinatura da Loja</p></div>'
    + '<div class="footer"><p>Obrigado pela preferencia!</p></div>'
    + '</body></html>';

  const janela = window.open('', '', 'width=800,height=600');
  if (!janela) return; // popup bloqueado pelo navegador
  janela.document.write(html);
  janela.document.close();
  janela.print();
};
