# Testes de Perfil Comportamental

Este diretório contém os componentes de teste interativo para descoberta de perfis comportamentais.

## Componentes Disponíveis

### 1. MBTITest.jsx
**Teste Myers-Briggs Type Indicator (MBTI)**

- **16 questões** divididas em 4 dimensões:
  - **E/I** (Extroversão vs Introversão) - 4 questões
  - **S/N** (Sensação vs Intuição) - 4 questões
  - **T/F** (Pensamento vs Sentimento) - 4 questões
  - **J/P** (Julgamento vs Percepção) - 4 questões

- **Resultados**: 16 tipos possíveis (INTJ, ENFP, ISTJ, etc.)
- **Tempo estimado**: 3-5 minutos

**Como funciona:**
1. Usuário responde questões escolhendo entre 2 opções
2. Sistema conta pontos para cada letra
3. Retorna o tipo MBTI baseado na maioria de cada dimensão

### 2. DISCTest.jsx
**Teste DISC (Dominância, Influência, Estabilidade, Conformidade)**

- **12 questões** sobre comportamento e preferências
- Cada questão tem 4 opções representando D, I, S ou C

- **Resultados**:
  - Tipo único (D, I, S, C) quando um tipo é claramente dominante
  - Tipo combinado (DI, DS, IS, etc.) quando há equilíbrio entre dois tipos

**Como funciona:**
1. Sistema conta pontos para cada tipo
2. Se o segundo tipo tem pelo menos 60% dos pontos do primeiro, retorna combinação
3. Caso contrário, retorna apenas o tipo dominante

### 3. EnneagramTest.jsx
**Teste Eneagrama (9 Tipos de Personalidade)**

- **12 questões** profundas sobre motivações, medos e valores
- 9 opções por questão representando cada tipo

- **Resultados**:
  - Tipo dominante (1-9)
  - Wing sugerido automaticamente (ex: 3w2, 7w6)

**Como funciona:**
1. Sistema conta pontos para cada tipo
2. Identifica o tipo dominante
3. Calcula o wing: tipo adjacente (±1) com maior pontuação
4. Retorna tipo + wing sugerido

## Uso nos Componentes

```jsx
import MBTITest from '../components/tests/MBTITest';
import DISCTest from '../components/tests/DISCTest';
import EnneagramTest from '../components/tests/EnneagramTest';

// No componente
const [showMBTITest, setShowMBTITest] = useState(false);

// Renderizar
{showMBTITest && (
  <MBTITest
    onClose={() => setShowMBTITest(false)}
    onResult={(mbtiType) => {
      // mbtiType será algo como 'INTJ', 'ENFP', etc.
      console.log('Resultado:', mbtiType);
    }}
  />
)}
```

## Características Comuns

### UI/UX:
- Modal fullscreen com overlay escuro
- Barra de progresso visual
- Navegação entre questões (Anterior/Próxima)
- Validação: não permite avançar sem responder
- Animação de conclusão

### Acessibilidade:
- Botões grandes e clicáveis
- Estados visuais claros (selecionado/não selecionado)
- Cores distintas para cada tipo de teste
- Scroll automático em listas longas

### Responsividade:
- Mobile-first design
- Grid adaptativo
- Overflow scroll para questões longas
- Tamanhos de fonte ajustáveis

## Integração com Backend

Os resultados dos testes são automaticamente aplicados ao perfil do usuário através do callback `onResult`:

```jsx
onResult={(mbtiType) => {
  handleChange('mbti_type', mbtiType);
}}
```

O perfil é então salvo via API POST para `/api/auth/profile/`.

## Personalização

Para adicionar mais questões ou modificar o algoritmo:

1. **MBTITest**: Adicione questões no array `questions`, mantendo o `id` com padrão `EI1`, `SN2`, etc.
2. **DISCTest**: Adicione questões com 4 opções (D/I/S/C)
3. **EnneagramTest**: Adicione questões com 9 opções (tipos 1-9)

## Validação Científica

**Nota**: Estes são testes simplificados para fins de descoberta rápida. Para resultados mais precisos, recomenda-se:
- MBTI oficial: https://www.16personalities.com/
- DISC certificado: https://www.discprofile.com/
- Eneagrama profissional: https://www.enneagraminstitute.com/

## Créditos

Baseado em frameworks de personalidade amplamente reconhecidos:
- MBTI: Katharine Cook Briggs e Isabel Briggs Myers
- DISC: William Moulton Marston
- Eneagrama: Oscar Ichazo e Claudio Naranjo
