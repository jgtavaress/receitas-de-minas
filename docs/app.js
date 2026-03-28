// Função para criar o navbar dinamicamente
function criarNavbar() {
  const navbar = document.querySelector('nav.navbar');
  if (!navbar) return;

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  navbar.innerHTML = `
    <div class="container">
      <a class="navbar-brand fw-bold" href="index.html">🍽️ Receitas de Minas</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link ${currentPage === 'index.html' ? 'active' : ''}" href="index.html">Início</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${currentPage === 'cadastro_receita.html' ? 'active' : ''}" href="cadastro_receita.html">Cadastrar Receita</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${currentPage === 'estatisticas.html' ? 'active' : ''}" href="estatisticas.html">Estatísticas</a>
          </li>
        </ul>
      </div>
    </div>
  `;
}

// CORRIGIDO: Caminho correto para o db.json
const DB_PATH = 'docs/db/db.json';

// Carrega todas as receitas
async function carregarReceitas() {
  try {
    console.log('Carregando receitas de:', DB_PATH);
    const resposta = await fetch(DB_PATH);
    if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
    const data = await resposta.json();
    console.log('Receitas carregadas:', data.receitas.length);
    return data.receitas;
  } catch (error) {
    console.error('Erro ao carregar receitas:', error);
    // Fallback para localStorage
    const localReceitas = localStorage.getItem('receitas');
    if (localReceitas) {
      console.log('Usando receitas do localStorage');
      return JSON.parse(localReceitas);
    }
    return [];
  }
}

// Salva receitas no localStorage (simulação)
async function salvarReceitasLocal(receitas) {
  localStorage.setItem('receitas', JSON.stringify(receitas));
  console.log('Receitas salvas no localStorage');
}

// Obtém o ID da receita a partir da URL
function obterIdDaUrl() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get("id"));
}

// Cria os cards dinamicamente na home
async function criarCards(filtro = "") {
  const container = document.getElementById("area-cards");
  if (!container) return;
  
  container.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-warning" role="status"></div><p class="mt-2">Carregando receitas...</p></div>';

  try {
    const receitas = await carregarReceitas();
    const receitasFiltradas = receitas.filter(item =>
      item.titulo.toLowerCase().includes(filtro.toLowerCase())
    );

    if (receitasFiltradas.length === 0) {
      container.innerHTML = '<div class="col-12 text-center py-4"><p>Nenhuma receita encontrada</p></div>';
      return;
    }

    container.innerHTML = '';
    receitasFiltradas.forEach((item) => {
      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-4 mb-4";

      const card = document.createElement("div");
      card.className = "card h-100";

      // Ajusta o caminho da imagem
      let imagemPath = item.imagem;
      if (imagemPath && !imagemPath.startsWith('http')) {
        imagemPath = `docs/db/${imagemPath}`;
      }

      card.innerHTML = `
        <img src="${imagemPath}" alt="${item.titulo}" class="card-img-top" style="height: 200px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/300x200?text=Imagem+Indisponível'">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${item.titulo}</h5>
          <p class="card-text flex-grow-1">${item.descricao.substring(0, 100)}${item.descricao.length > 100 ? '...' : ''}</p>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <small class="text-muted">⏱️ ${item.tempoPreparo} min</small>
            <small class="text-muted">🏷️ ${item.categoria}</small>
          </div>
          <div class="d-flex justify-content-between mt-3 gap-2">
            <a href="detalhes.html?id=${item.id}" class="btn btn-outline-warning flex-grow-1">Ver Receita</a>
            <button class="btn btn-outline-danger btn-excluir" data-id="${item.id}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `;

      col.appendChild(card);
      container.appendChild(col);
    });

    // Adiciona eventos de exclusão
    document.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const id = parseInt(btn.getAttribute('data-id'));
        if (confirm('Tem certeza que deseja excluir esta receita?')) {
          const receitas = await carregarReceitas();
          const novasReceitas = receitas.filter(r => r.id !== id);
          await salvarReceitasLocal(novasReceitas);
          alert('Receita excluída com sucesso!');
          criarCards(filtro);
        }
      });
    });
  } catch (error) {
    console.error('Erro ao criar cards:', error);
    container.innerHTML = '<div class="col-12 text-center py-4"><p class="text-danger">Erro ao carregar receitas. Verifique o console.</p></div>';
  }
}

// Mostra os detalhes da receita
async function mostrarDetalhesReceita() {
  const id = obterIdDaUrl();
  const container = document.getElementById("detalhes-receita");
  
  if (!container || !id) {
    if (container && !id) {
      container.innerHTML = "<p class='text-danger'>ID da receita não encontrado.</p>";
    }
    return;
  }
  
  container.innerHTML = '<div class="text-center"><div class="spinner-border text-warning" role="status"></div><p>Carregando receita...</p></div>';

  try {
    const receitas = await carregarReceitas();
    const receita = receitas.find(r => r.id === id);

    if (receita) {
      // Ajusta o caminho da imagem
      let imagemPath = receita.imagem;
      if (imagemPath && !imagemPath.startsWith('http')) {
        imagemPath = `docs/db/${imagemPath}`;
      }

      container.innerHTML = `
        <img src="${imagemPath}" alt="${receita.titulo}" class="receita-img" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 12px; margin-bottom: 20px;" onerror="this.src='https://via.placeholder.com/800x400?text=Imagem+Indisponível'">
        <h1 class="mb-3">${receita.titulo}</h1>
        <div class="meta mb-4 pb-2 border-bottom">
          <span class="me-3"><i class="bi bi-person"></i> ${receita.autor}</span>
          <span class="me-3"><i class="bi bi-calendar"></i> ${new Date(receita.data).toLocaleDateString('pt-BR')}</span>
          <span class="me-3"><i class="bi bi-clock"></i> ${receita.tempoPreparo} minutos</span>
          <span><i class="bi bi-tag"></i> ${receita.categoria}</span>
        </div>
        <div class="descricao mb-4">
          <h3>Descrição</h3>
          <p>${receita.descricao}</p>
        </div>
        <div class="conteudo mb-4">
          <h3>Modo de Preparo</h3>
          <p style="white-space: pre-line;">${receita.conteudo}</p>
        </div>
        ${receita.dica ? `
        <div class="dica p-3 bg-light rounded">
          <strong><i class="bi bi-lightbulb"></i> Dica:</strong> ${receita.dica}
        </div>
        ` : ''}
        <div class="mt-4">
          <a href="cadastro_receita.html?id=${receita.id}" class="btn btn-warning">✏️ Editar Receita</a>
          <a href="index.html" class="btn btn-outline-secondary ms-2">← Voltar</a>
        </div>
      `;
    } else {
      container.innerHTML = "<p class='text-danger'>Receita não encontrada.</p>";
    }
  } catch (error) {
    console.error('Erro ao mostrar detalhes:', error);
    container.innerHTML = "<p class='text-danger'>Erro ao carregar a receita.</p>";
  }
}

// Cria o carrossel de destaques
async function criarCarrossel() {
  const container = document.getElementById("carousel-inner");
  if (!container) return;

  try {
    const receitas = await carregarReceitas();
    const destaques = receitas.slice(0, 5);

    container.innerHTML = '';
    
    if (destaques.length === 0) {
      container.innerHTML = '<div class="carousel-item active"><div class="d-block w-100 bg-light" style="height: 400px;"><p class="text-center pt-5">Nenhuma receita disponível</p></div></div>';
      return;
    }

    destaques.forEach((item, index) => {
      const activeClass = index === 0 ? "active" : "";
      
      let imagemPath = item.imagem;
      if (imagemPath && !imagemPath.startsWith('http')) {
        imagemPath = `docs/db/${imagemPath}`;
      }
      
      const slide = document.createElement("div");
      slide.className = `carousel-item ${activeClass}`;
      slide.innerHTML = `
        <img src="${imagemPath}" class="d-block w-100" style="height: 400px; object-fit: cover;" alt="${item.titulo}" onerror="this.src='https://via.placeholder.com/1200x400?text=${item.titulo}'">
        <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-3">
          <h5>${item.titulo}</h5>
          <p>${item.descricao.substring(0, 100)}</p>
          <a href="detalhes.html?id=${item.id}" class="btn btn-outline-light btn-sm">Ver Receita</a>
        </div>
      `;
      container.appendChild(slide);
    });

    // Atualiza os indicadores do carrossel
    const indicatorsContainer = document.getElementById("carousel-indicators");
    if (indicatorsContainer) {
      indicatorsContainer.innerHTML = '';
      destaques.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('data-bs-target', '#carouselReceitas');
        btn.setAttribute('data-bs-slide-to', index);
        if (index === 0) btn.classList.add('active');
        indicatorsContainer.appendChild(btn);
      });
    }

    // Inicializa o carrossel
    if (typeof bootstrap !== 'undefined') {
      new bootstrap.Carousel(document.getElementById('carouselReceitas'));
    }
  } catch (error) {
    console.error('Erro ao criar carrossel:', error);
  }
}

// Configura a busca
function configurarBusca() {
  const input = document.getElementById("campo-busca");
  if (input) {
    input.addEventListener("input", (e) => {
      criarCards(e.target.value);
    });
  }
}

// Inicializa
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM carregado, inicializando...');
  criarNavbar();

  const currentPath = window.location.pathname;
  
  if (currentPath.includes('index.html') || currentPath === '/' || currentPath === '/index.html') {
    criarCards();
    criarCarrossel();
    configurarBusca();
  } 
  else if (currentPath.includes('detalhes.html')) {
    mostrarDetalhesReceita();
  }
});