const produtos = [
  { nome: "Amaciante (5L)", preco: 15 },
  { nome: "Sabão Líquido Roupas (5L)", preco: 20 },
  { nome: "Detergente Neutro (5L)", preco: 15 },
  { nome: "Água Sanitária (5L)", preco: 10 },
  { nome: "Desinfetante (5L)", preco: 12 },
  { nome: "Sabonete Líquido Mãos (1L)", preco: 10 },
  { nome: "Desengordurante (1L)", preco: 15 },
  { nome: "Limpa Vidros (1L)", preco: 8 },
  { nome: "Limpa Báu (1L)", preco: 10 }, // Corrigido de "Limpa Báu" para "Limpa Baú" se necessário
  { nome: "Limpa Alumínio (1L)", preco: 5 } // Corrigido de "Limpa Alúminio" para "Limpa Alumínio" se necessário
];

function preencherTabela() {
  const tabela = document.getElementById('produtosTable');
  produtos.forEach((prod, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${prod.nome}</td>
      <td><input type="number" min="0" value="0" data-index="${i}" class="qtd" style="width: 60px; text-align: center;"></td>
      <td>R$ ${prod.preco.toFixed(2)}</td>
      <td><span class="total-item">R$ 0.00</span></td>
    `;
    tabela.appendChild(row);
  });
}

function calcularTotais() {
  let totalGeral = 0;
  document.querySelectorAll('.qtd').forEach(input => {
    const index = parseInt(input.dataset.index);
    const qtd = parseInt(input.value) || 0;
    const precoUnitario = produtos[index].preco;
    const total = qtd * precoUnitario;
    // Atualiza o span na linha da tabela
    input.parentElement.parentElement.querySelector('.total-item').textContent = `R$ ${total.toFixed(2)}`;
    totalGeral += total;
  });
  // Atualiza o total geral no final do formulário
  document.getElementById('totalGeral').textContent = totalGeral.toFixed(2);
}

function gerarPDF(cliente, contato, endereco, itens, totalGeral) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20; // Posição inicial Y

  // Cabeçalho do Recibo
  doc.setFontSize(16);
  doc.setTextColor(6, 57, 112); // Azul escuro E C Limpeza
  doc.text("E C Limpeza - Recibo de Compra", doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
  y += 10;

  // Informações do Cliente
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0); // Preto para o texto normal
  doc.text(`Data: ${(new Date()).toLocaleDateString('pt-BR')}`, 20, y);
  y += 7;
  doc.text(`Cliente: ${cliente}`, 20, y);
  y += 7;
  doc.text(`Contato: ${contato}`, 20, y);
  y += 7;
  doc.text(`Endereço: ${endereco}`, 20, y);
  y += 15; // Mais espaço antes da tabela

  // --- Tabela de Produtos no PDF ---
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  const tableStartY = y;
  const colProduto = 20;
  const colQtde = 120;    // Posição X para Quantidade
  const colUnit = 145;   // Posição X para Preço Unitário
  const colTotal = 175;  // Posição X para Preço Total

  // Cabeçalho da Tabela
  doc.text("Produto", colProduto, y);
  doc.text("Qtde", colQtde, y, { align: 'right' });
  doc.text("Unit. (R$)", colUnit, y, { align: 'right' });
  doc.text("Total (R$)", colTotal, y, { align: 'right' });
  y += 2; // Linha fina abaixo do cabeçalho
  doc.setLineWidth(0.2);
  doc.line(20, y, 190, y); // Linha horizontal (de margem 20 a 190)
  y += 5;

  doc.setFont("helvetica", "normal"); // Fonte normal para os itens

  itens.forEach(item => {
    const precoUnitario = item.preco; // Preço unitário já está no item
    const subtotal = item.total;      // Subtotal já está no item

    // Quebra de linha para nome do produto longo
    const maxProductNameWidth = 95; // Largura máxima em mm para o nome do produto
    const productNameLines = doc.splitTextToSize(item.nome, maxProductNameWidth);

    // Imprime a primeira linha (ou única linha) do produto
    doc.text(productNameLines[0], colProduto, y); // Nome do produto
    doc.text(item.qtd.toString(), colQtde, y, { align: 'right' }); // Quantidade
    doc.text(precoUnitario.toFixed(2).replace('.', ','), colUnit, y, { align: 'right' }); // Preço Unitário
    doc.text(subtotal.toFixed(2).replace('.', ','), colTotal, y, { align: 'right' }); // Subtotal

    // Se o nome do produto foi quebrado, imprime as linhas restantes
    if (productNameLines.length > 1) {
        for (let i = 1; i < productNameLines.length; i++) {
            y += 4; // Avança Y para a próxima linha do mesmo produto
            doc.text(productNameLines[i], colProduto, y);
        }
    }

    y += 6; // Espaçamento para o próximo produto

    // Adiciona nova página se necessário (antes do rodapé)
    if (y > 260) {
       doc.addPage();
       y = 20; // Reseta Y
       // Readiciona cabeçalho da tabela na nova página
       doc.setFontSize(11);
       doc.setFont("helvetica", "bold");
       doc.text("Produto", colProduto, y);
       doc.text("Qtde", colQtde, y, { align: 'right' });
       doc.text("Unit. (R$)", colUnit, y, { align: 'right' });
       doc.text("Total (R$)", colTotal, y, { align: 'right' });
       y += 2;
       doc.setLineWidth(0.2);
       doc.line(20, y, 190, y);
       y += 5;
       doc.setFont("helvetica", "normal");
    }
  });

  // --- Linha do Total Geral ---
  y += 5;
  doc.setLineWidth(0.2);
  doc.line(20, y, 190, y); // Linha acima do total
  y += 7;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL GERAL: R$ ${totalGeral.toFixed(2).replace('.', ',')}`, colTotal, y, { align: 'right' });

  // --- Rodapé Azul com Marca d'água ---
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerHeight = 15; // Altura do rodapé pode ser ajustada se desejar
  const footerY = pageHeight - footerHeight;

  // Cor de fundo azul clara para o rodapé
  // Cor de fundo azul mais forte para o rodapé
  // Usando o azul primário (RGB: 10, 54, 157 que é #0A369D)
  doc.setFillColor(10, 54, 157);
  doc.rect(0, footerY, doc.internal.pageSize.getWidth(), footerHeight, 'F'); // 'F' para preencher com a cor definida


  // Salvar o PDF
  // Gera um nome de arquivo mais seguro, removendo espaços e caracteres especiais
  const safeClienteName = cliente.replace(/[^a-zA-Z0-9]/g, '_') || 'Cliente';
  doc.save(`Recibo_EC_Limpeza_${safeClienteName}.pdf`);
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  preencherTabela(); // Popula a tabela HTML
  // Adiciona listener para calcular totais quando a quantidade muda
  document.querySelectorAll('.qtd').forEach(el => {
    el.addEventListener('input', calcularTotais);
  });

  // Adiciona listener para o envio do formulário
  document.getElementById('pedidoForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Impede o envio padrão do formulário

    // Coleta os dados do cliente
    const cliente = document.getElementById('cliente').value;
    const contato = document.getElementById('contato').value;
    const endereco = document.getElementById('endereco').value;

    // Coleta os itens do pedido com quantidade > 0
    const itens = [];
    let totalGeral = 0;

    document.querySelectorAll('.qtd').forEach(input => {
      const index = parseInt(input.dataset.index);
      const qtd = parseInt(input.value) || 0;
      if (qtd > 0) {
        const produto = produtos[index];
        const subtotal = qtd * produto.preco;
        itens.push({
          nome: produto.nome,
          preco: produto.preco, // Inclui o preço unitário
          qtd: qtd,
          total: subtotal
        });
        totalGeral += subtotal;
      }
    });

    // Chama a função para gerar o PDF
    gerarPDF(cliente, contato, endereco, itens, totalGeral);
  });
});
