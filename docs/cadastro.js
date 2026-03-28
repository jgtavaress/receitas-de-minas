document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-receita');
  const tituloForm = document.getElementById('form-title');
  
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  
  if (id) {
    tituloForm.textContent = 'Editar Receita';
    carregarReceitaParaEdicao(parseInt(id));
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const receita = {
      titulo: document.getElementById('titulo').value,
      descricao: document.getElementById('descricao').value,
      imagem: document.getElementById('imagem').value,
      autor: document.getElementById('autor').value,
      data: document.getElementById('data').value,
      conteudo: document.getElementById('conteudo').value,
      dica: document.getElementById('dica').value || null,
      categoria: document.getElementById('categoria').value,
      tempoPreparo: parseInt(document.getElementById('tempoPreparo').value) || null
    };
    
    if (id) {
      receita.id = parseInt(id);
      await atualizarReceita(receita);
    } else {
      await cadastrarReceita(receita);
    }
  });
});

async function carregarReceitas() {
  try {
    const resposta = await fetch('docs/db/db.json');
    if (!resposta.ok) throw new Error('Erro ao carregar receitas');
    const data = await resposta.json();
    return data.receitas;
  } catch (error) {
    const localReceitas = localStorage.getItem('receitas');
    return localReceitas ? JSON.parse(localReceitas) : [];
  }
}

async function salvarReceitas(receitas) {
  localStorage.setItem('receitas', JSON.stringify(receitas));
}

async function carregarReceitaParaEdicao(id) {
  try {
    const receitas = await carregarReceitas();
    const receita = receitas.find(r => r.id === id);
    
    if (!receita) throw new Error('Receita não encontrada');
    
    document.getElementById('titulo').value = receita.titulo;
    document.getElementById('descricao').value = receita.descricao;
    document.getElementById('imagem').value = receita.imagem;
    document.getElementById('autor').value = receita.autor;
    document.getElementById('data').value = receita.data;
    document.getElementById('conteudo').value = receita.conteudo;
    document.getElementById('dica').value = receita.dica || '';
    document.getElementById('receita-id').value = receita.id;
    document.getElementById('categoria').value = receita.categoria || 'Salgado';
    document.getElementById('tempoPreparo').value = receita.tempoPreparo || '';
    
  } catch (error) {
    console.error('Erro ao carregar receita:', error);
    alert('Erro ao carregar receita para edição');
  }
}

async function cadastrarReceita(receita) {
  try {
    const receitas = await carregarReceitas();
    const novoId = Math.max(...receitas.map(r => r.id), 0) + 1;
    receita.id = novoId;
    receitas.push(receita);
    await salvarReceitas(receitas);
    
    alert('Receita cadastrada com sucesso!');
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Erro ao cadastrar receita:', error);
    alert('Erro ao cadastrar receita');
  }
}

async function atualizarReceita(receita) {
  try {
    let receitas = await carregarReceitas();
    const index = receitas.findIndex(r => r.id === receita.id);
    if (index !== -1) {
      receitas[index] = receita;
      await salvarReceitas(receitas);
    }
    
    alert('Receita atualizada com sucesso!');
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
    alert('Erro ao atualizar receita');
  }
}