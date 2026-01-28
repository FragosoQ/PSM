# 🌍 Integração Google Sheets - Guia Rápido

## ✅ Implementação Concluída

A aplicação agora carrega automaticamente dados do **separador PS1** do Google Sheets!

### 📌 URL da Planilha:
https://docs.google.com/spreadsheets/d/1GQUB52a2gKR429bjqJrNkbP5rjR7Z_4v85z9M7_Cr8Y/edit?usp=sharing

---

## 🎯 Como Funciona

### 1. **Dados Lidos da Planilha PS1**

O sistema lê as colunas:
- **País 1** - Primeiro país da encomenda
- **País 2** - Segundo país (opcional)
- **País 3** - Terceiro país (opcional)

### 2. **Processamento Automático**

✅ Extrai todos os países únicos  
✅ Busca coordenadas automaticamente  
✅ Cria conexões entre países relacionados  
✅ Adiciona Portugal como origem  
✅ Mostra tudo no globo 3D  

### 3. **Resultado no Globo**

- 🔴 Marcadores em cada país mencionado (País 1, País 2, País 3)
- 🔵 **Linhas de Portugal para cada país** (uma linha por país, por linha da planilha)
- 🟢 Portugal como ponto central de origem

**Exemplo:**
```
Linha 1: Angola, Brasil
→ Portugal → Angola
→ Portugal → Brasil

Linha 2: França, Alemanha, Itália
→ Portugal → França
→ Portugal → Alemanha
→ Portugal → Itália
```

Cada linha da planilha cria conexões **individuais** de Portugal para cada país mencionado.
**Linha 1:** Portugal → Angola, Portugal → Brasil (2 linhas separadas)
- **Linha 2:** Portugal → França, Portugal → Alemanha, Portugal → Itália (3 linhas)
- **Linha 3:** Portugal → Japão (1 linha)

**Total:** 6 linhas individuais de Portugal para os destinos

```
| Chave de Procura | País 1  | País 2   | País 3  | ... |
|------------------|---------|----------|---------|-----|
| PROJ-001         | Angola  | Brasil   |         | ... |
| PROJ-002         | França  | Alemanha | Itália  | ... |
| PROJ-003         | Japão   |          |         | ... |
```

**O que acontece:**
- Linha 1: Angola ↔ Brasil (conectados)
- Linha 2: França ↔ Alemanha ↔ Itália (todos conectados)
- Linha 3: Japão (sozinho)
- Portugal ↔ Todos (origem)

---

## 🚀 Como Usar

### Opção 1: Usar Diretamente
Simplesmente abra **index.html** no navegador!  
Os dados serão carregados automaticamente.

### Opção 2: Testar Antes
Abra **validate-sheets.html** para validar se tudo está correto.

---

## ⚙️ Configuração

### Alterar Planilha ou Separador

Edite **assets/data/googleSheets.js**:

```javascript
const SHEET_ID = '1GQUB52a2gKR429bjqJrNkbP5rjR7Z_4v85z9M7_Cr8Y';
const SHEET_NAME = 'PS1'; // Mude aqui para outro separador
```

### Adicionar Novos Países ao Mapeamento

Se um país não for reconhecido, adicione em **googleSheets.js**:

```javascript
const nameMapping = {
  'nome_na_planilha': 'Nome no Banco de Dados',
  'cabo verde': 'Cabo Verde',
  // ... adicione mais aqui
};
```

---

## ⚠️ Requisitos Importantes

### 1. **Planilha Pública**
A planilha DEVE estar com permissões:
- ✅ "Qualquer pessoa com o link pode ver"

### 2. **Colunas Corretas**
As colunas devem ter os nomes exatos:
- ✅ `País 1`
- ✅ `País 2`
- ✅ `País 3`

### 3. **Nomes de Países**
Use nomes reconhecidos:
- ✅ Portugal, Angola, Brasil, França, Alemanha
- ✅ EUA, Japão, China, Índia, México
- ❌ Evite abreviações estranhas

**Ver lista completa em:** GOOGLE_SHEETS_INTEGRATION.md

---

## 🐛 Resolver Problemas

### ❌ Erro: "Failed to fetch"
**Causa:** Planilha não está pública  
**Solução:** Partilhar → "Qualquer pessoa com o link"

### ❌ Erro: "Estrutura inválida"
**Causa:** Colunas "País 1", "País 2", "País 3" não existem  
**Solução:** Renomear colunas na planilha

### ⚠️ País não aparece no globo
**Causa:** País não reconhecido  
**Solução:** 
1. Abrir console (F12)
2. Ver lista de "países não encontrados"
3. Adicionar ao `nameMapping` em googleSheets.js

### 🔍 Ver o que está acontecendo
Abra o console do navegador (F12) e veja os logs:
```
📊 Iniciando carregamento...
🌐 Carregando dados do Google Sheets...
📋 Cabeçalhos encontrados: Chave de Procura, País 1, País 2...
✅ 156 linhas carregadas
🌍 12 países únicos encontrados: Angola, Brasil, França...
✅ Conversão completa: 12 países mapeados
```

---

## 📚 Arquivos Criados

1. **assets/data/googleSheets.js** - Funções principais
2. **test-sheets.html** - Página de teste interativa
3. **validate-sheets.html** - Validação completa
4. **GOOGLE_SHEETS_INTEGRATION.md** - Documentação técnica
5. **LEIA-ME-SHEETS.md** - Este guia (português)

---

## 🎉 Pronto para Usar!

Simplesmente abra **index.html** e veja seus dados do Google Sheets no globo 3D!

Qualquer dúvida, veja os logs no console ou consulte a documentação completa em **GOOGLE_SHEETS_INTEGRATION.md**.
