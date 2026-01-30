/**
 * Network Status Monitor
 * Detecta e exibe o estado da conexão de rede (online/offline)
 */

(function() {
  'use strict';
  
  const statusContainer = document.getElementById('network-status-container');
  const statusIconOnline = document.getElementById('status-icon-online');
  const statusIconOffline = document.getElementById('status-icon-offline');
  
  if (!statusContainer || !statusIconOnline || !statusIconOffline) {
    console.warn('Network status elements not found in DOM');
    return;
  }
  
  /**
   * Atualiza o status visual baseado na conexão de rede
   */
  function updateNetworkStatus() {
    if (navigator.onLine) {
      // Online: mostra ícone verde, esconde vermelho
      statusIconOnline.style.display = 'block';
      statusIconOffline.style.display = 'none';
      console.log('✓ Conexão de rede ativa');
    } else {
      // Offline: mostra ícone vermelho, esconde verde
      statusIconOnline.style.display = 'none';
      statusIconOffline.style.display = 'block';
      console.warn('✗ Conexão de rede perdida');
    }
  }
  
  /**
   * Verifica a conectividade real fazendo um ping
   * Útil para detectar quando o navegador diz "online" mas não há internet real
   */
  async function checkRealConnectivity() {
    if (!navigator.onLine) {
      updateNetworkStatus();
      return;
    }
    
    try {
      // Tenta fazer um pedido pequeno para verificar conectividade real
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      
      // Se chegou aqui, há conexão real
      updateNetworkStatus();
    } catch (error) {
      // Se falhou, pode estar "online" mas sem internet real
      console.warn('Navegador indica online mas sem conectividade real:', error);
      statusIconOnline.style.display = 'none';
      statusIconOffline.style.display = 'block';
    }
  }
  
  // Event Listeners para mudanças de status
  window.addEventListener('online', () => {
    updateNetworkStatus();
    // Verifica conectividade real após 1 segundo
    setTimeout(checkRealConnectivity, 1000);
  });
  
  window.addEventListener('offline', updateNetworkStatus);
  
  // Verifica periodicamente a conectividade real (a cada 30 segundos)
  setInterval(checkRealConnectivity, 30000);
  
  // Inicialização: verifica o status ao carregar a página
  window.addEventListener('DOMContentLoaded', () => {
    updateNetworkStatus();
    // Faz uma verificação real após 2 segundos
    setTimeout(checkRealConnectivity, 2000);
  });
  
  // Se o DOM já estiver carregado, executa imediatamente
  if (document.readyState === 'loading') {
    // Já configurado acima
  } else {
    updateNetworkStatus();
    setTimeout(checkRealConnectivity, 2000);
  }
  
})();
