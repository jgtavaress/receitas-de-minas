document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Carrega as receitas
    const receitas = await carregarReceitas();
    
    // Verifica se há receitas
    if (receitas.length === 0) {
      document.getElementById('categoriaChart').parentElement.innerHTML = 
        '<div class="alert alert-warning text-center py-4">Nenhuma receita cadastrada para gerar estatísticas.</div>';
      document.getElementById('tempoChart').parentElement.innerHTML = '';
      document.getElementById('dataChart').parentElement.innerHTML = '';
      return;
    }

    // Atualiza os cards de informação
    document.getElementById('total-receitas').textContent = receitas.length;
    
    // Encontra a receita mais recente
    const receitaRecente = receitas.reduce((a, b) => 
      new Date(a.data) > new Date(b.data) ? a : b
    );
    document.getElementById('receita-recente').textContent = receitaRecente.titulo;
    
    // Função auxiliar para parsear o tempo de preparo (versão melhorada)
function parseTempoPreparo(tempo) {
  if (typeof tempo === 'number') {
    return tempo; // Já está em minutos
  }
  
  if (typeof tempo === 'string') {
    // Caso 1: Formato "X horas" ou "Xh"
    const horasMatch = tempo.match(/(\d+)\s*h(?:oras?)?/i);
    if (horasMatch) {
      return parseInt(horasMatch[1]) * 60; // Converte horas para minutos
    }
    
    // Caso 2: Formato "X horas Y minutos" ou "Xh Ymin"
    const horasMinutosMatch = tempo.match(/(\d+)\s*h(?:oras?)?\s*(\d+)\s*m(?:in(?:utos?)?)?/i);
    if (horasMinutosMatch) {
      return parseInt(horasMinutosMatch[1]) * 60 + parseInt(horasMinutosMatch[2]);
    }
    
    // Caso 3: Formato "X a Y minutos" (pega o valor médio)
    const intervaloMatch = tempo.match(/(\d+)\s*a\s*(\d+)\s*m(?:in(?:utos?)?)?/i);
    if (intervaloMatch) {
      return Math.round((parseInt(intervaloMatch[1]) + parseInt(intervaloMatch[2])) / 2);
    }
    
    // Caso 4: Apenas números (minutos)
    const minutosMatch = tempo.match(/(\d+)\s*m?(?:in(?:utos?)?)?/i);
    if (minutosMatch) {
      return parseInt(minutosMatch[1]);
    }
  }
  
  return null; // Se não conseguir parsear
}

// Cálculo do tempo médio atualizado
const temposValidos = receitas
  .map(r => parseTempoPreparo(r.tempoPreparo))
  .filter(tempo => tempo !== null && !isNaN(tempo));

const tempoMedio = temposValidos.length > 0 
  ? Math.round(temposValidos.reduce((a, b) => a + b, 0) / temposValidos.length)
  : 0;
  
document.getElementById('tempo-medio').textContent = `${tempoMedio} min`;

    // Categoriza as receitas
    const categorias = {
      'Doces': receitas.filter(r => r.categoria && r.categoria.toLowerCase().includes('doce')).length,
      'Salgados': receitas.filter(r => r.categoria && r.categoria.toLowerCase().includes('salgado')).length,
      'Bebidas': receitas.filter(r => r.categoria && r.categoria.toLowerCase().includes('bebida')).length,
      'Outros': receitas.filter(r => !r.categoria || 
                !['doce', 'salgado', 'bebida'].some(cat => r.categoria.toLowerCase().includes(cat))).length
    };

    // Tempo de preparo para o gráfico
    const tempos = {
      'Rápido (<30min)': receitas.filter(r => {
        const tempo = parseTempoPreparo(r.tempoPreparo);
        return tempo !== null && tempo < 30;
      }).length,
      'Médio (30-60min)': receitas.filter(r => {
        const tempo = parseTempoPreparo(r.tempoPreparo);
        return tempo !== null && tempo >= 30 && tempo <= 60;
      }).length,
      'Demorado (>60min)': receitas.filter(r => {
        const tempo = parseTempoPreparo(r.tempoPreparo);
        return tempo !== null && tempo > 60;
      }).length,
      'Não especificado': receitas.filter(r => {
        const tempo = parseTempoPreparo(r.tempoPreparo);
        return tempo === null;
      }).length
    };

    // Função auxiliar para parsear o tempo de preparo
    function parseTempoPreparo(tempo) {
      if (typeof tempo === 'number') {
        return tempo;
      }
      
      if (typeof tempo === 'string') {
        const match = tempo.match(/(\d+)/);
        if (match) {
          return parseInt(match[0]);
        }
      }
      
      return null;
    }

    // Receitas por data (últimos 6 meses)
    const hoje = new Date();
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(hoje.getMonth() - 6);
    
    const receitasPorMes = {};
    for (let i = 0; i < 6; i++) {
      const data = new Date();
      data.setMonth(hoje.getMonth() - i);
      const mesAno = `${data.toLocaleString('pt-BR', { month: 'short' })}/${data.getFullYear()}`;
      receitasPorMes[mesAno] = 0;
    }
    
    receitas.forEach(r => {
      if (r.data) {
        const dataReceita = new Date(r.data);
        if (dataReceita >= seisMesesAtras) {
          const mesAno = `${dataReceita.toLocaleString('pt-BR', { month: 'short' })}/${dataReceita.getFullYear()}`;
          if (receitasPorMes[mesAno] !== undefined) {
            receitasPorMes[mesAno]++;
          }
        }
      }
    });
    
    // Ordena os meses cronologicamente
    const mesesOrdenados = Object.keys(receitasPorMes).reverse();

    // Gráfico de pizza para categorias
    const ctx1 = document.getElementById('categoriaChart').getContext('2d');
    new Chart(ctx1, {
      type: 'doughnut',
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
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        aspectRatio: 2.5,
        maintainAspectRatio: true,
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                family: 'Poppins',
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        cutout: '70%',
        animation: {
          animateScale: true,
          animateRotate: true
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
          backgroundColor: 'rgba(255, 111, 0, 0.7)',
          borderColor: 'rgba(255, 111, 0, 1)',
          borderWidth: 1
        }]
      },
      options: {
        aspectRatio: 2.5,
        maintainAspectRatio: true,
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: {
                family: 'Poppins'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: 'Poppins'
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.raw}`;
              }
            }
          }
        }
      }
    });

    // Gráfico de linha para receitas por data
    const ctx3 = document.getElementById('dataChart').getContext('2d');
    new Chart(ctx3, {
      type: 'line',
      data: {
        labels: mesesOrdenados,
        datasets: [{
          label: 'Receitas Cadastradas',
          data: mesesOrdenados.map(mes => receitasPorMes[mes]),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: 'rgba(75, 192, 192, 1)',
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        aspectRatio: 2.5,
        maintainAspectRatio: true,
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: {
                family: 'Poppins'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: 'Poppins'
              }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              font: {
                family: 'Poppins',
                size: 12
              }
            }
          }
        }
      }
    });

  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
    document.getElementById('categoriaChart').parentElement.innerHTML = 
      '<div class="alert alert-danger text-center py-4">Erro ao carregar estatísticas. Tente recarregar a página.</div>';
    document.getElementById('tempoChart').parentElement.innerHTML = '';
    document.getElementById('dataChart').parentElement.innerHTML = '';
  }
});