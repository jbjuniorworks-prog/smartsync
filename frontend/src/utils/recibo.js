export const imprimirRecibo = (item, formatarMoeda) => {
  const estilos = [
    'body { font-family: sans-serif; padding: 40px; text-align: center; border: 2px solid #000; }',
    'h1 { margin-bottom: 5px; }',
    '.info { text-align: left; margin-top: 30px; line-height: 2; }',
    '.footer { margin-top: 50px; font-size: 12px; color: #666; }',
    '.assinatura { margin-top: 60px; border-top: 1px solid #000; width: 250px; display: inline-block; }'
  ].join(' ');

  const data = item.dataVenda
    ? item.dataVenda.split(',')[0]
    : new Date().toLocaleDateString('pt-BR');

  const html = '<html><head><title>Recibo - SmartSync</title><style>' + estilos + '</style></head>'
    + '<body>'
    + '<h1>SMARTSYNC MOBILE</h1>'
    + '<p>Comprovante de Venda / Garantia</p>'
    + '<div class="info">'
    + '<p><strong>CLIENTE:</strong> ' + item.cliente.toUpperCase() + '</p>'
    + '<p><strong>APARELHO:</strong> ' + item.aparelho + '</p>'
    + '<p><strong>IMEI:</strong> ' + item.imei + '</p>'
    + '<p><strong>DATA:</strong> ' + data + '</p>'
    + '<p><strong>VALOR:</strong> ' + formatarMoeda(item.preco) + '</p>'
    + '</div>'
    + '<div class="assinatura"><p>Assinatura da Loja</p></div>'
    + '<div class="footer"><p>Obrigado pela preferencia!</p></div>'
    + '</body></html>';

  const janela = window.open('', '', 'width=800,height=600');
  janela.document.write(html);
  janela.document.close();
  janela.print();
};
