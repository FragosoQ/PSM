# Destination Card - Estilos e Estrutura

Documentação dos estilos CSS utilizados para o card de destino e tags de países.

## Estrutura HTML

```html
<div class="destination-card">
  <div class="destination-title" id="destination-title">
    <span class="country-tag">FRANCE</span>
    <span class="country-tag">CROATIA</span>
  </div>
</div>
```

## CSS Styles

### Container Principal - `.destination-card`

```css
.destination-card {
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 20px 30px;
  background: rgba(15, 15, 35, 0.85);
  border: 2px solid rgba(5, 187, 237, 0.5);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  z-index: 1000;
  box-shadow: 0 0 10px rgba(5, 187, 237, 0.4), 0 0 20px rgba(5, 187, 237, 0.2);
  animation: glow-pulse 3s ease-in-out infinite;
  max-width: 300px;
}
```

**Características:**
- **Posição:** Fixo no canto superior esquerdo (top: 20px, left: 20px)
- **Fundo:** Semi-transparente escuro com blur effect
- **Borda:** Azul brilhante (rgba(5, 187, 237, 0.5))
- **Efeito:** Glow pulsante contínuo
- **Z-index:** 1000 (sempre visível por cima do globo)

### Container dos Países - `.destination-title`

```css
.destination-title {
  font-size: clamp(18px, 2.5vw, 28px);
  font-weight: bold;
  color: white;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
```

**Características:**
- **Layout:** Flexbox em coluna (vertical)
- **Fonte:** Responsiva entre 18px e 28px
- **Espaçamento:** 8px entre cada tag
- **Alinhamento:** Centralizado

### Tags de País - `.country-tag`

```css
.country-tag {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(5, 187, 237, 0.2);
  border: 2px solid rgba(5, 187, 237, 0.6);
  border-radius: 20px;
  font-size: clamp(14px, 2vw, 20px);
  color: white;
  box-shadow: 0 0 8px rgba(5, 187, 237, 0.3);
  transition: all 0.3s ease;
}

.country-tag:hover {
  background: rgba(5, 187, 237, 0.4);
  box-shadow: 0 0 15px rgba(5, 187, 237, 0.6);
  transform: scale(1.05);
}
```

**Características:**
- **Estilo:** Pill/badge design com bordas arredondadas
- **Fundo:** Azul semi-transparente
- **Borda:** Azul brilhante mais opaca
- **Efeitos:**
  - Hover: Aumenta background e glow
  - Transição suave de 0.3s
  - Scale 1.05 no hover

### Animação Glow Pulse

```css
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 10px rgba(5, 187, 237, 0.4); }
  50% { box-shadow: 0 0 20px rgba(5, 187, 237, 0.6); }
}
```

**Funcionamento:**
- Pulsa entre shadow de 10px e 20px
- Duração: 3 segundos
- Efeito infinito e suave

## Paleta de Cores

| Elemento | Cor | Uso |
|----------|-----|-----|
| Background card | rgba(15, 15, 35, 0.85) | Fundo escuro semi-transparente |
| Border card | rgba(5, 187, 237, 0.5) | Borda azul neon |
| Background tag | rgba(5, 187, 237, 0.2) | Fundo tag (normal) |
| Background tag hover | rgba(5, 187, 237, 0.4) | Fundo tag (hover) |
| Border tag | rgba(5, 187, 237, 0.6) | Borda tag |
| Text | white | Texto |

## JavaScript - Geração Dinâmica

```javascript
const updateDestination = () => {
    const destinationTitle = document.getElementById('destination-title');
    
    if (!destinationTitle) return;
    
    // Get unique countries from Portugal connections
    if (data.connections && data.connections.Portugal) {
        const uniqueCountries = [...new Set(data.connections.Portugal)];
        
        // Create HTML with tags for each country
        if (uniqueCountries.length > 0) {
            destinationTitle.innerHTML = uniqueCountries
                .map(country => `<span class="country-tag">${country.toUpperCase()}</span>`)
                .join('');
        } else {
            destinationTitle.textContent = 'No destinations';
        }
        
        console.log('Destination card updated with countries:', uniqueCountries);
    } else {
        destinationTitle.textContent = 'Loading...';
    }
};
```

**Funcionalidade:**
1. Lê países únicos das conexões de Portugal
2. Remove duplicados usando `Set`
3. Gera uma `<span class="country-tag">` para cada país único
4. Atualiza automaticamente quando dados do Google Sheets mudam

## Responsividade

- **Font-size:** Usa `clamp()` para adaptar entre dispositivos
- **Max-width:** 300px no card para evitar ocupar muito espaço
- **Layout:** Flexbox permite adaptação automática ao conteúdo

## Localização no Código

- **HTML:** `/workspaces/S1/index.html` (linhas 342-344, estilos 50-92)
- **JavaScript:** `/workspaces/S1/scripts/charts.js` (função `updateDestination`)
- **Trigger:** `/workspaces/S1/assets/data/googleSheets.js` (após carregar dados)
