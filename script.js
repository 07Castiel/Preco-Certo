// Estrutura de dados
let compras = [];
const STORAGE_KEY = 'comprasSupermercado';

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    carregarDados();
    mostrarAba('cadastro');
    atualizarTabelaPesquisa();
    atualizarListaDeProdutos();
});

// Carregar dados do localStorage
function carregarDados() {
    const dadosSalvos = localStorage.getItem(STORAGE_KEY);
    if (dadosSalvos) {
        compras = JSON.parse(dadosSalvos);
        // Verificar e converter datas para objetos Date
        compras.forEach(item => {
            if (typeof item.data === 'string') {
                item.data = new Date(item.data);
            }
        });
    }
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compras));
}

// Controle de abas
function mostrarAba(aba) {
    document.querySelectorAll('.aba').forEach(div => div.style.display = 'none');
    document.getElementById(aba).style.display = 'block';
    
    // Atualizar dados específicos de cada aba quando mostrada
    if (aba === 'pesquisa') {
        atualizarTabelaPesquisa();
    } else if (aba === 'estimativa') {
        atualizarListaDeProdutos();
    }
}

// Gerar ID único
function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Exibir mensagem
function exibirMensagem(texto, tipo) {
    const mensagem = document.getElementById('mensagem');
    mensagem.textContent = texto;
    mensagem.className = 'mensagem ' + tipo;
    
    // Limpar a mensagem após 3 segundos
    setTimeout(() => {
        mensagem.className = 'mensagem';
        mensagem.textContent = '';
    }, 3000);
}

// === FUNCIONALIDADES DE CADASTRO ===
function registrarCompra() {
    const produto = document.getElementById('produto').value.trim();
    const categoria = document.getElementById('categoria').value;
    const quantidade = parseFloat(document.getElementById('quantidade').value);
    const preco = parseFloat(document.getElementById('preco').value);
    
    if (produto === '') {
        exibirMensagem('Por favor, insira o nome do produto.', 'erro');
        return;
    }
    
    if (categoria === '') {
        exibirMensagem('Por favor, selecione uma categoria.', 'erro');
        return;
    }
    
    if (isNaN(quantidade) || quantidade <= 0) {
        exibirMensagem('Por favor, insira uma quantidade válida.', 'erro');
        return;
    }
    
    if (isNaN(preco) || preco <= 0) {
        exibirMensagem('Por favor, insira um preço válido.', 'erro');
        return;
    }
    
    // Adicionar nova compra
    const novaCompra = {
        id: gerarId(),
        produto: produto,
        categoria: categoria,
        quantidade: quantidade,
        preco: preco,
        data: new Date()
    };
    
    compras.push(novaCompra);
    salvarDados();
    
    // Limpar campos
    document.getElementById('produto').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('quantidade').value = '';
    document.getElementById('preco').value = '';
    
    exibirMensagem('Produto registrado com sucesso!', 'sucesso');
    atualizarTabelaPesquisa();
    atualizarListaDeProdutos();
}

// === FUNCIONALIDADES DE PESQUISA ===
function atualizarTabelaPesquisa() {
    const tabela = document.getElementById('tabelaPesquisa').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';
    
    if (compras.length === 0) {
        const row = tabela.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 6;
        cell.textContent = 'Nenhum produto cadastrado.';
        cell.style.textAlign = 'center';
        return;
    }
    
    // Ordenar produtos por data (mais recentes primeiro)
    const produtosOrdenados = [...compras].sort((a, b) => new Date(b.data) - new Date(a.data));
    
    produtosOrdenados.forEach(item => {
        const row = tabela.insertRow();
        
        // Nome do produto
        const cellProduto = row.insertCell(0);
        cellProduto.textContent = item.produto;
        
        // Categoria
        const cellCategoria = row.insertCell(1);
        cellCategoria.textContent = item.categoria;
        
        // Preço unitário
        const cellPreco = row.insertCell(2);
        cellPreco.textContent = formatarMoeda(item.preco);
        
        // Quantidade
        const cellQuantidade = row.insertCell(3);
        cellQuantidade.textContent = formatarQuantidade(item.quantidade);
        
        // Data
        const cellData = row.insertCell(4);
        cellData.textContent = formatarData(item.data);
        
        // Ações
        const cellAcoes = row.insertCell(5);
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.className = 'btn-small btn-edit';
        btnEditar.onclick = () => abrirModalEdicao(item.id);
        
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.className = 'btn-small btn-delete';
        btnExcluir.onclick = () => confirmarExclusao(item.id);
        
        cellAcoes.appendChild(btnEditar);
        cellAcoes.appendChild(btnExcluir);
    });
}

function filtrarProdutos() {
    const filtroNome = document.getElementById('filtroNome').value.toLowerCase();
    const filtroCategoria = document.getElementById('filtroCategoria').value;
    
    const tabela = document.getElementById('tabelaPesquisa').getElementsByTagName('tbody')[0];
    const rows = tabela.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const nomeProduto = rows[i].cells[0]?.textContent.toLowerCase() || '';
        const categoria = rows[i].cells[1]?.textContent || '';
        
        // Verificar se o produto atende aos critérios de filtro
        const correspondeNome = nomeProduto.includes(filtroNome);
        const correspondeCategoria = filtroCategoria === '' || categoria === filtroCategoria;
        
        if (correspondeNome && correspondeCategoria) {
            rows[i].style.display = '';
        } else {
            rows[i].style.display = 'none';
        }
    }
}

// === FUNCIONALIDADES DE ESTIMATIVA ===
let listaEstimativa = [];

function atualizarListaDeProdutos() {
    const datalist = document.getElementById('listaProdutos');
    datalist.innerHTML = '';
    
    // Criar conjunto para evitar produtos duplicados
    const produtosUnicos = new Set();
    
    compras.forEach(item => {
        if (!produtosUnicos.has(item.produto)) {
            produtosUnicos.add(item.produto);
            
            const option = document.createElement('option');
            option.value = item.produto;
            datalist.appendChild(option);
        }
    });
}

function adicionarProdutoEstimativa() {
    const produtoNome = document.getElementById('produtoEstimado').value.trim();
    const quantidadeDesejada = parseFloat(document.getElementById('quantidadeEstimada').value);
    
    if (produtoNome === '') {
        exibirMensagem('Por favor, insira o nome do produto.', 'erro');
        return;
    }
    
    if (isNaN(quantidadeDesejada) || quantidadeDesejada <= 0) {
        exibirMensagem('Por favor, insira uma quantidade válida.', 'erro');
        return;
    }
    
    // Encontrar o produto mais recente com este nome
    const produtosOrdenados = [...compras]
        .filter(item => item.produto.toLowerCase() === produtoNome.toLowerCase())
        .sort((a, b) => new Date(b.data) - new Date(a.data));
    
    if (produtosOrdenados.length === 0) {
        exibirMensagem('Produto não encontrado no histórico de compras.', 'erro');
        return;
    }
    
    const produtoEncontrado = produtosOrdenados[0];
    
    // Verificar se o produto já está na estimativa
    const produtoExistente = listaEstimativa.findIndex(
        item => item.produto.toLowerCase() === produtoNome.toLowerCase()
    );
    
    if (produtoExistente !== -1) {
        // Atualizar quantidade se já existe
        listaEstimativa[produtoExistente].quantidadeDesejada += quantidadeDesejada;
    } else {
        // Adicionar novo item
        listaEstimativa.push({
            id: gerarId(),
            produto: produtoEncontrado.produto,
            categoria: produtoEncontrado.categoria,
            quantidadeDesejada: quantidadeDesejada,
            precoUnitario: produtoEncontrado.preco
        });
    }
    
    // Limpar campos
    document.getElementById('produtoEstimado').value = '';
    document.getElementById('quantidadeEstimada').value = '';
    
    atualizarTabelaEstimativa();
}

function atualizarTabelaEstimativa() {
    const tabela = document.getElementById('tabelaEstimativa').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';
    
    if (listaEstimativa.length === 0) {
        const row = tabela.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 6;
        cell.textContent = 'Nenhum produto adicionado à estimativa.';
        cell.style.textAlign = 'center';
        document.getElementById('totalEstimativa').textContent = 'R$ 0,00';
        return;
    }
    
    let total = 0;
    
    listaEstimativa.forEach(item => {
        const row = tabela.insertRow();
        
        // Nome do produto
        const cellProduto = row.insertCell(0);
        cellProduto.textContent = item.produto;
        
        // Categoria
        const cellCategoria = row.insertCell(1);
        cellCategoria.textContent = item.categoria;
        
        // Quantidade
        const cellQuantidade = row.insertCell(2);
        cellQuantidade.textContent = formatarQuantidade(item.quantidadeDesejada);
        
        // Preço unitário
        const cellPreco = row.insertCell(3);
        cellPreco.textContent = formatarMoeda(item.precoUnitario);
        
        // Subtotal
        const subtotal = item.quantidadeDesejada * item.precoUnitario;
        total += subtotal;
        
        const cellSubtotal = row.insertCell(4);
        cellSubtotal.textContent = formatarMoeda(subtotal);
        
        // Ações
        const cellAcoes = row.insertCell(5);
        const btnRemover = document.createElement('button');
        btnRemover.textContent = 'Remover';
        btnRemover.className = 'btn-small btn-delete';
        btnRemover.onclick = () => removerItemEstimativa(item.id);
        
        cellAcoes.appendChild(btnRemover);
    });
    
    // Atualizar total
    document.getElementById('totalEstimativa').textContent = formatarMoeda(total);
}

function removerItemEstimativa(id) {
    listaEstimativa = listaEstimativa.filter(item => item.id !== id);
    atualizarTabelaEstimativa();
}

function limparEstimativa() {
    listaEstimativa = [];
    atualizarTabelaEstimativa();
}

// === FUNCIONALIDADES DE EDIÇÃO ===
function abrirModalEdicao(id) {
    const produto = compras.find(item => item.id === id);
    
    if (!produto) return;
    
    document.getElementById('editId').value = produto.id;
    document.getElementById('editProduto').value = produto.produto;
    document.getElementById('editCategoria').value = produto.categoria;
    document.getElementById('editQuantidade').value = produto.quantidade;
    document.getElementById('editPreco').value = produto.preco;
    
    document.getElementById('modalEdicao').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modalEdicao').style.display = 'none';
}

function salvarEdicao() {
    const id = document.getElementById('editId').value;
    const produto = document.getElementById('editProduto').value.trim();
    const categoria = document.getElementById('editCategoria').value;
    const quantidade = parseFloat(document.getElementById('editQuantidade').value);
    const preco = parseFloat(document.getElementById('editPreco').value);
    
    if (produto === '') {
        alert('Por favor, insira o nome do produto.');
        return;
    }
    
    if (categoria === '') {
        alert('Por favor, selecione uma categoria.');
        return;
    }
    
    if (isNaN(quantidade) || quantidade <= 0) {
        alert('Por favor, insira uma quantidade válida.');
        return;
    }
    
    if (isNaN(preco) || preco <= 0) {
        alert('Por favor, insira um preço válido.');
        return;
    }
    
    // Encontrar e atualizar o produto
    const index = compras.findIndex(item => item.id === id);
    
    if (index !== -1) {
        compras[index].produto = produto;
        compras[index].categoria = categoria;
        compras[index].quantidade = quantidade;
        compras[index].preco = preco;
        
        salvarDados();
        atualizarTabelaPesquisa();
        atualizarListaDeProdutos();
        fecharModal();
    }
}

function confirmarExclusao(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        compras = compras.filter(item => item.id !== id);
        salvarDados();
        atualizarTabelaPesquisa();
        atualizarListaDeProdutos();
    }
}

// === UTILITÁRIOS ===
function formatarMoeda(valor) {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

function formatarQuantidade(quantidade) {
    return Number.isInteger(quantidade) ? quantidade.toString() : quantidade.toFixed(2).replace('.', ',');
}

function formatarData(data) {
    if (!(data instanceof Date)) {
        data = new Date(data);
    }
    
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    
    return `${dia}/${mes}/${ano}`;
}

// Fechar o modal ao clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('modalEdicao');
    if (event.target === modal) {
        fecharModal();
    }
};

// Evento para tecla ESC fechar o modal
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        fecharModal();
    }
});

// Funcionalidade para exportar dados
function exportarDados() {
    if (compras.length === 0) {
        alert('Não há dados para exportar.');
        return;
    }
    
    const dadosJSON = JSON.stringify(compras, null, 2);
    const blob = new Blob([dadosJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compras_supermercado.json';
    a.click();
    
    URL.revokeObjectURL(url);
}

// Funcionalidade para importar dados
function importarDados() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const dadosImportados = JSON.parse(e.target.result);
                
                // Verificar se os dados têm o formato esperado
                if (!Array.isArray(dadosImportados)) {
                    throw new Error('Formato de arquivo inválido.');
                }
                
                // Verificar e converter datas
                dadosImportados.forEach(item => {
                    if (typeof item.data === 'string') {
                        item.data = new Date(item.data);
                    }
                    
                    // Adicionar ID se não existir
                    if (!item.id) {
                        item.id = gerarId();
                    }
                });
                
                // Perguntar se deseja substituir ou mesclar
                const opcao = confirm('Deseja substituir os dados atuais? Clique OK para substituir ou Cancelar para mesclar com os dados existentes.');
                
                if (opcao) {
                    // Substituir dados
                    compras = dadosImportados;
                } else {
                    // Mesclar dados (evitando duplicatas por ID)
                    const idsExistentes = new Set(compras.map(item => item.id));
                    
                    dadosImportados.forEach(item => {
                        if (!idsExistentes.has(item.id)) {
                            compras.push(item);
                            idsExistentes.add(item.id);
                        }
                    });
                }
                
                salvarDados();
                atualizarTabelaPesquisa();
                atualizarListaDeProdutos();
                
                alert('Dados importados com sucesso!');
            } catch (erro) {
                alert('Erro ao importar arquivo: ' + erro.message);
            }
        };
        reader.readAsText(file);
    });
    
    input.click();
}

// Funcionalidade para limpar todos os dados
function limparTodosDados() {
    if (confirm('ATENÇÃO: Esta ação irá apagar TODOS os produtos cadastrados. Deseja continuar?')) {
        if (confirm('Tem certeza? Esta ação não pode ser desfeita.')) {
            compras = [];
            listaEstimativa = [];
            salvarDados();
            atualizarTabelaPesquisa();
            atualizarListaDeProdutos();
            atualizarTabelaEstimativa();
            alert('Todos os dados foram removidos.');
        }
    }
}

// Adicionar funcionalidade de pesquisa por voz (se disponível no navegador)
function iniciarPesquisaPorVoz() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        
        recognition.onresult = function(event) {
            const resultado = event.results[0][0].transcript.toLowerCase();
            document.getElementById('produtoEstimado').value = resultado;
        };
        
        recognition.start();
    } else {
        alert('Seu navegador não suporta reconhecimento de voz.');
    }
}