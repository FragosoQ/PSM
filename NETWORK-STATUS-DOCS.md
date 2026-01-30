# 🌐 Indicador de Status de Rede

## 📋 Descrição

Sistema de monitorização de conexão de rede em tempo real que exibe visualmente o status da conectividade usando um ícone dinâmico no canto superior esquerdo da aplicação.

## ✨ Funcionalidades

- ✅ **Detecção automática** do status de rede (online/offline)
- ✅ **Verificação real** de conectividade via ping periódico
- ✅ **Feedback visual instantâneo** com mudança de cor e efeitos
- ✅ **Animação de pulso** quando offline para alertar o utilizador
- ✅ **Posicionamento responsivo** que se adapta a diferentes tamanhos de ecrã
- ✅ **Verificações periódicas** automáticas a cada 30 segundos

## 🎨 Estados Visuais

### Online (Conectado)
- **Cor:** Branco brilhante
- **Efeito:** Brilho verde suave (drop-shadow verde)
- **Significado:** Conexão ativa e estável

### Offline (Desconectado)
- **Cor:** Vermelho intenso
- **Efeito:** Animação de pulso + brilho vermelho
- **Significado:** Sem conexão de rede

## 📁 Arquivos Implementados

### 1. HTML (`index.html`)
```html
<!-- Network Status Indicator -->
<div id="network-status-container">
  <img id="status-icon" src="https://static.wixstatic.com/media/a6967f_0272a6a92096406b938cc5496ec41597~mv2.png" alt="Network Status" />
</div>
```

### 2. CSS (`styles/index.css`)
- Estilos para o contentor do indicador
- Filtros CSS para estados online/offline
- Animação de pulso para estado offline
- Media queries para responsividade mobile

### 3. JavaScript (`scripts/network-status.js`)
- Detecção usando `navigator.onLine`
- Event listeners para `online` e `offline`
- Verificação real via `fetch()` com ping
- Checagem periódica a cada 30 segundos
- Logs no console para debug

## 🧪 Como Testar

### Opção 1: DevTools (Recomendado)
1. Abrir DevTools (F12 ou Ctrl+Shift+I)
2. Ir para tab **Network**
3. Mudar **Throttling** para **Offline**
4. Observar o ícone mudar para vermelho pulsante
5. Retornar para **No throttling**
6. Observar o ícone voltar a branco com brilho verde

### Opção 2: Página de Teste
```bash
# Abrir no navegador
file:///workspaces/PSM/test-network-status.html
```

A página de teste inclui:
- Visualização do indicador
- Botões de simulação
- Log de eventos em tempo real
- Instruções detalhadas de teste

### Opção 3: Teste Físico
1. Desligar o Wi-Fi do computador
2. Observar o ícone mudar
3. Religar o Wi-Fi
4. Observar o ícone retornar ao normal

### Opção 4: Docker/Dev Container
```bash
# Desconectar rede do container
docker network disconnect bridge <container_id>

# Reconectar rede do container
docker network connect bridge <container_id>
```

## 📐 Posicionamento

### Desktop
- **Posição:** Fixo no canto superior esquerdo
- **Top:** Logo abaixo do logo principal (`calc(2vh + logo_height + 1.5vh)`)
- **Left:** Alinhado com o logo (`2vw`)
- **Tamanho:** 40-60px (responsivo com `clamp()`)

### Mobile (< 768px)
- **Posição:** Mantém-se no canto superior esquerdo
- **Top:** `calc(10px + 60px + 8px)` (abaixo do logo mobile)
- **Left:** `10px`
- **Tamanho:** `35px` (mais compacto)

## 🔧 Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Animações, filtros e responsividade
- **JavaScript (ES6+)** - Lógica de detecção
- **Navigator API** - `navigator.onLine`
- **Fetch API** - Verificação real de conectividade
- **CSS Filters** - Efeitos visuais (brightness, hue-rotate, drop-shadow)

## 🎯 Lógica de Funcionamento

```javascript
1. Página carrega
   ↓
2. Script verifica navigator.onLine
   ↓
3. Aplica classe 'online' ou 'offline'
   ↓
4. CSS aplica filtros correspondentes
   ↓
5. Event listeners ficam ativos
   ↓
6. Verificação periódica a cada 30s
   ↓
7. Se houver mudança, atualiza visual instantaneamente
```

## 🔍 Logs de Console

O script emite logs úteis para debug:

```javascript
✓ Conexão de rede ativa          // Quando online
✗ Conexão de rede perdida         // Quando offline
⚠️ Navegador indica online mas sem conectividade real  // Quando ping falha
```

## 🌐 Compatibilidade

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ✅ Opera
- ✅ Brave

## 📝 Notas Técnicas

### Limitação do `navigator.onLine`
- Indica apenas se há interface de rede ativa
- Não garante conectividade real com a internet
- Por isso implementámos verificação real via `fetch()`

### Verificação Real
- Faz ping para `google.com/favicon.ico`
- Usa `mode: 'no-cors'` para evitar problemas de CORS
- Executa a cada 30 segundos automaticamente
- Também executa após eventos de `online`

### Performance
- Script leve (~2KB)
- Sem dependências externas
- Não impacta performance da aplicação principal
- Animações CSS hardware-accelerated

## 🚀 Implementação em Outros Projetos

Para usar em outro projeto:

1. Copiar `scripts/network-status.js`
2. Adicionar HTML do indicador
3. Copiar estilos CSS relevantes
4. Incluir script no final do `<body>`
5. Ajustar posicionamento conforme necessário

## 📞 Suporte

Para questões ou problemas:
- Verificar console do navegador para erros
- Confirmar que elementos HTML têm IDs corretos
- Validar que script está carregado após DOM
- Testar em diferentes navegadores

## 📄 Licença

Parte do projeto PSM - SOMENGIL

---

**Última atualização:** 30 de Janeiro de 2026
