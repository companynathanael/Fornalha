# Fornalha

4º motor da Nathanael Industries: **motor de transformação** — tema preto e laranja.

> Numa fornalha, o metal derrete, se funde e é provado no fogo.

**Estado atual:** apenas a **aparência**, **zerada** (sem dados). Os dados vão chegar quando a Fornalha for conectada ao **Asafe**, junto com os outros motores.
As APIs vêm do Gather pelo Asafe; o back-end será construído depois.

Linha de produção: **Gather** (APIs) → **Fornalha** (funde e prova) → **Bezalel** (molda a IA) → IA pronta. O **Asafe** sustenta tudo.

## Abas

| Aba | O que mostra |
| --- | --- |
| **Painel geral** | Fornadas em andamento (derretendo → fundindo → prova de fogo → resfriando), habilidades fundidas, taxa de aprovação, alertas e a linha de produção. |
| **Fundição** | Escolha APIs do Gather, coloque no cadinho e funda em uma habilidade pronta (ex.: Cotação + Gráfico + Alerta → "Acompanhar ação"). |
| **Prova de fogo** | Fila de testes sob pressão (situações difíceis, erros, sobrecarga) com status Em prova / Aprovado / Reprovado e o motivo. |
| **Desempenho** | Velocidade (p95), eficiência e consumo; destaque para o que foi reprovado por lentidão ou desperdício. |
| **Submotores** | Fole (Continuidade), Fichário (Memória), Faísca (Autonomia) — em breve. |

**Não faz:** energia e infraestrutura (Asafe); criar IAs (Bezalel); criar APIs (Gather).

## Rodar

Site estático, sem build:

```bash
python3 -m http.server 8080
```

Depois abra http://localhost:8080 (ou abra `index.html` direto no navegador).

## Arquivos

- `index.html` — estrutura (mesmo padrão do Asafe: tela de carregamento, topo, abas, páginas, janela, avisos)
- `styles.css` — tema preto & laranja (base do Asafe com as cores trocadas + componentes da Fornalha)
- `app.js` — tela de carregamento, abas e telas vazias prontas para receber os dados do Asafe
- `assets/` — logo da Fornalha (símbolo branco, símbolo laranja, favicon e o original `fornalha-logo-original.jpg`)
