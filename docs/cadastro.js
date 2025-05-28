document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-receita');
  const tituloForm = document.getElementById('form-title');
  const idInput = document.getElementById('receita-id');
  
  // Verifica se estamos editando uma receita existente
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  
  if (id) {
    tituloForm.textContent = 'Editar Receita';
    carregarReceitaParaEdicao(id);
  }
  
  // Configura o envio do formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const receita = {
      titulo: document.getElementById('titulo').value,
      descricao: document.getElementById('descricao').value,
      imagem: document.getElementById('imagem').value,
      autor: document.getElementById('autor').value,
      data: document.getElementById('data').value,
      conteudo: document.getElementById('conteudo').value,
      dica: document.getElementById('dica').value || null
    };
    
    if (id) {
      receita.id = parseInt(id);
      atualizarReceita(receita);
    } else {
      cadastrarReceita(receita);
    }
  });
});

// Carrega os dados de uma receita para edição
async function carregarReceitaParaEdicao(id) {
  try {
    const resposta = await fetch(`http://localhost:3001/receitas/${id}`);
    if (!resposta.ok) throw new Error('Receita não encontrada');
    
    const receita = await resposta.json();
    
    // Preenche o formulário com os dados da receita
    document.getElementById('titulo').value = receita.titulo;
    document.getElementById('descricao').value = receita.descricao;
    document.getElementById('imagem').value = receita.imagem;
    document.getElementById('autor').value = receita.autor;
    document.getElementById('data').value = receita.data;
    document.getElementById('conteudo').value = receita.conteudo;
    document.getElementById('dica').value = receita.dica || '';
    document.getElementById('receita-id').value = receita.id;
    
  } catch (error) {
    console.error('Erro ao carregar receita:', error);
    alert('Erro ao carregar receita para edição');
  }
}

// Cadastra uma nova receita
async function cadastrarReceita(receita) {
  try {
    const resposta = await fetch('http://localhost:3001/receitas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(receita)
    });
    
    if (resposta.ok) {
      alert('Receita cadastrada com sucesso!');
      window.location.href = 'index.html';
    } else {
      throw new Error('Falha ao cadastrar receita');
    }
  } catch (error) {
    console.error('Erro ao cadastrar receita:', error);
    alert('Erro ao cadastrar receita');
  }
}

// Atualiza uma receita existente
async function atualizarReceita(receita) {
  try {
    const resposta = await fetch(`http://localhost:3001/receitas/${receita.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(receita)
    });
    
    if (resposta.ok) {
      alert('Receita atualizada com sucesso!');
      window.location.href = 'index.html';
    } else {
      throw new Error('Falha ao atualizar receita');
    }
  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
    alert('Erro ao atualizar receita');
  }
}