document.addEventListener('DOMContentLoaded', async function() {
  // Carrega as receitas
  const receitas = await carregarReceitas();
  
  // Categoriza as receitas (você precisará adicionar um campo 'categoria' no db.json)
  const categorias = {
    'Doces': receitas.filter(r => r.categoria === 'Doce').length,
    'Salgados': receitas.filter(r => r.categoria === 'Salgado').length,
    'Bebidas': receitas.filter(r => r.categoria === 'Bebida').length,
    'Outros': receitas.filter(r => !r.categoria || !['Doce', 'Salgado', 'Bebida'].includes(r.categoria)).length
  };

  // Tempo de preparo (agrupa em faixas)
  const tempos = {
    'Rápido (<30min)': receitas.filter(r => r.tempoPreparo && r.tempoPreparo < 30).length,
    'Médio (30-60min)': receitas.filter(r => r.tempoPreparo && r.tempoPreparo >= 30 && r.tempoPreparo <= 60).length,
    'Demorado (>60min)': receitas.filter(r => r.tempoPreparo && r.tempoPreparo > 60).length,
    'Não especificado': receitas.filter(r => !r.tempoPreparo).length
  };

  // Gráfico de pizza para categorias
  const ctx1 = document.getElementById('categoriaChart').getContext('2d');
  new Chart(ctx1, {
    type: 'pie',
    data: {
      labels: Object.keys(categorias),
      datasets: [{
        data: Object.values(categorias),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'Distribuição de Receitas por Categoria'
        }
      }
    }
  });

  // Gráfico de barras para tempo de preparo
  const ctx2 = document.getElementById('tempoChart').getContext('2d');
  new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: Object.keys(tempos),
      datasets: [{
        label: 'Quantidade de Receitas',
        data: Object.values(tempos),
        backgroundColor: 'rgba(255, 159, 64, 0.7)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Receitas por Tempo de Preparo'
        }
      }
    }
  });
});