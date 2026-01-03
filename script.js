const produtos = [
  { nome: "Amaciante (5L)", preco: 15 },
  { nome: "Sabão Líquido Roupas (5L)", preco: 20 },
  { nome: "Detergente Neutro (5L)", preco: 15 },
  { nome: "Água Sanitária (5L)", preco: 10 },
  { nome: "Desinfetante (5L)", preco: 12 },
  { nome: "Sabonete Líquido Mãos (1L)", preco: 10 },
  { nome: "Desengordurante (1L)", preco: 15 },
  { nome: "Limpa Vidros (1L)", preco: 8 },
  { nome: "Limpa Baú (1L)", preco: 10 },
  { nome: "Limpa Alumínio (1L)", preco: 5 }
];

// Carrega a logo do Pix
const pixLogo = new Image();
pixLogo.src = 'pix.png'; 

function preencherTabela() {
  const tabela = document.getElementById('produtosTable');
  tabela.innerHTML = ''; // Limpa a tabela para evitar duplicatas

  produtos.forEach((prod, i) => {
    const row = document.createElement('tr');
    // MUDANÇA 1: Adicionamos um input na coluna de preço (class="preco-unitario")
    row.innerHTML = `
      <td style="text-align: left; padding-left: 10px;">${prod.nome}</td>
      <td>
        <input type="number" min="0" value="0" data-index="${i}" class="qtd" style="width: 60px; text-align: center;">
      </td>
      <td>
        R$ <input type="number" step="0.50" min="0" value="${prod.preco.toFixed(2)}" class="preco-unitario" style="width: 70px; text-align: center;">
      </td>
      <td><span class="total-item">R$ 0.00</span></td>
    `;
    tabela.appendChild(row);
  });
}

function calcularTotais() {
  let totalGeral = 0;
  
  // MUDANÇA 2: O cálculo agora lê as linhas da tabela, não apenas o array fixo
  const linhas = document.querySelectorAll('#produtosTable tr');

  linhas.forEach(row => {
    const inputQtd = row.querySelector('.qtd');
    const inputPreco = row.querySelector('.preco-unitario');
    const spanTotal = row.querySelector('.total-item');

    // Pega os valores atuais que estão na tela
    const qtd = parseFloat(inputQtd.value) || 0;
    const precoUnitario = parseFloat(inputPreco.value) || 0;

    const total = qtd * precoUnitario;

    // Atualiza o total da linha
    spanTotal.textContent = `R$ ${total.toFixed(2)}`;
    totalGeral += total;
  });

  // Atualiza o total geral
  document.getElementById('totalGeral').textContent = totalGeral.toFixed(2);
}

function gerarPDF(cliente, contato, endereco, itens, totalGeral) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20; 

  // --- Cabeçalho ---
  doc.setFontSize(16);
  doc.setTextColor(6, 57, 112); 
  doc.text("E C Limpeza - Recibo de Compra", doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
  y += 10;

  // --- Dados do Cliente ---
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0); 
  doc.text(`Data: ${(new Date()).toLocaleDateString('pt-BR')}`, 20, y);
  y += 7;
  doc.text(`Cliente: ${cliente}`, 20, y);
  y += 7;
  doc.text(`Contato: ${contato}`, 20, y);
  y += 7;
  doc.text(`Endereço: ${endereco}`, 20, y);
  y += 15; 

  // --- Tabela Header ---
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  const colProduto = 20;
  const colQtde = 120;   
  const colUnit = 145;   
  const colTotal = 175;  

  doc.text("Produto", colProduto, y);
  doc.text("Qtde", colQtde, y, { align: 'right' });
  doc.text("Unit. (R$)", colUnit, y, { align: 'right' });
  doc.text("Total (R$)", colTotal, y, { align: 'right' });
  y += 2;
  doc.setLineWidth(0.2);
  doc.line(20, y, 190, y); 
  y += 5;

  doc.setFont("helvetica", "normal"); 

  // --- Itens ---
  itens.forEach(item => {
    // Verifica quebra de página
    if (y > 250) {
       doc.addPage();
       y = 20; 
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

    const maxProductNameWidth = 95; 
    const productNameLines = doc.splitTextToSize(item.nome, maxProductNameWidth);

    doc.text(productNameLines[0], colProduto, y); 
    doc.text(item.qtd.toString(), colQtde, y, { align: 'right' }); 
    doc.text(item.preco.toFixed(2).replace('.', ','), colUnit, y, { align: 'right' }); 
    doc.text(item.total.toFixed(2).replace('.', ','), colTotal, y, { align: 'right' }); 

    if (productNameLines.length > 1) {
        for (let i = 1; i < productNameLines.length; i++) {
            y += 4; 
            doc.text(productNameLines[i], colProduto, y);
        }
    }
    y += 6; 
  });

  // --- Total Geral ---
  y += 5;
  doc.setLineWidth(0.2);
  doc.line(20, y, 190, y); 
  y += 7;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL GERAL: R$ ${totalGeral.toFixed(2).replace('.', ',')}`, colTotal, y, { align: 'right' });

  // --- Rodapé ---
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerHeight = 30; 
  const footerY = pageHeight - footerHeight;

  doc.setFillColor(10, 54, 157);
  doc.rect(0, footerY, doc.internal.pageSize.getWidth(), footerHeight, 'F');

  doc.setFontSize(8); 
  doc.setTextColor(255, 255, 255); 
  const pixInfoX = 10;
  let pixInfoY = footerY + 5; 
  doc.text("Informações para Pagamento Pix:", pixInfoX, pixInfoY);
  doc.text(`- Chave: 86 98817-0867 - Francisco Campelo De Alencar (Bco do Brasil S.A)`, pixInfoX, pixInfoY + 5);
  doc.text(`- Chave: 86 98878-6328 - Eliete Pereira Campelo de Alencar (Bco do Brasil S.A)`, pixInfoX, pixInfoY + 10);

  // Logo Pix
  const logoWidth = 20; 
  const logoHeight = 15; 
  const logoX = doc.internal.pageSize.getWidth() - logoWidth - 10; 
  const logoY = footerY + (footerHeight - logoHeight) / 2; 

   if (pixLogo.complete && pixLogo.naturalHeight !== 0) { 
        try {
            doc.addImage(pixLogo, 'PNG', logoX, logoY, logoWidth, logoHeight);
        } catch (error) {
            console.error("Erro imagem PDF:", error);
        }
   }

  const safeClienteName = cliente.replace(/[^a-zA-Z0-9]/g, '_') || 'Cliente';
  doc.save(`Recibo_EC_Limpeza_${safeClienteName}.pdf`);
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  preencherTabela(); 

  // MUDANÇA 3: Listener global para recalcular se mudar Quantidade OU Preço
  document.getElementById('produtosTable').addEventListener('input', (e) => {
    if (e.target.classList.contains('qtd') || e.target.classList.contains('preco-unitario')) {
        calcularTotais();
    }
  });

  document.getElementById('pedidoForm').addEventListener('submit', function(e) {
    e.preventDefault(); 

    const cliente = document.getElementById('cliente').value;
    const contato = document.getElementById('contato').value;
    const endereco = document.getElementById('endereco').value;

    const itens = [];
    let totalGeral = 0;

    // MUDANÇA 4: Coleta os dados lendo os inputs da tela (pois o preço pode ter mudado)
    const linhas = document.querySelectorAll('#produtosTable tr');

    linhas.forEach((row, index) => {
        const inputQtd = row.querySelector('.qtd');
        const inputPreco = row.querySelector('.preco-unitario');
        
        const qtd = parseInt(inputQtd.value) || 0;
        const precoAtual = parseFloat(inputPreco.value) || 0; // Pega o preço digitado

        if (qtd > 0) {
            const subtotal = qtd * precoAtual;
            itens.push({
                nome: produtos[index].nome, // Nome vem do array original para garantir integridade
                preco: precoAtual,          // Preço vem do input editável
                qtd: qtd,
                total: subtotal
            });
            totalGeral += subtotal;
        }
    });

    gerarPDF(cliente, contato, endereco, itens, totalGeral);
  });
});
