# Investimentos.js

> Esta é uma ideia de utilizar JavaScript para consolidar dados de investimentos financeiros e oferecer respostas para perguntas simples como "Este investimento esta mesmo rendendo mais que a poupança?". É uma ferramenta voltada para programadores, caso não tenha conhecimento continue utilizando planilhas. Não pretendo transformar isto em algo grande porque investimento financeiro é algo complexo e de infinitas interpretações, esta aqui expressa apenas as minhas necessidades. Resolvi criar porque apesar das planilhas serem simples e úteis, achei que deveria tentar ter algo mais amplo, sem as limitações dos aplicativos.

![Investimentos.js](https://github.com/edirpedro/investimentosjs/blob/main/assets/screenshot.png)

## Objetivos

1. Não ser um aplicativo, uma ferramenta complexa e empacotada que precise compilar e tudo mais. Quero agilidade para programar sem me preocupar com infraestrutura.
2. Ser um kit de funções para ler o extrato da B3, fazer coleta de dados e cálculos.
3. Utilizar JavaScript Baunilha com o mínimo de bibliotecas de apoio, quanto menos dependências melhor.
4. Widgets devem responder a uma pergunta, quanto mais direto ao ponto melhor.

### Documentação

Esta no próprio código, leia nos arquivos das funções como usa-las e nos arquivos de teste há também alguns exemplos. Para os componentes de páginas e widgets existe o arquivo `OlaMundo.js` que mostra o caminho.

## Instalação

- Instale algum servidor web com PHP;
- Baixe uma cópia deste repositório e coloque na pasta pública do seu servidor;
- Atualize seu arquivo extrato.csv conforme explicado logo abaixo;

> [!IMPORTANT]
> É muito provável que encontre bugs porque eu não tenho como testar todos os tipos de produtos financeiros existentes e operações possíveis na B3, faço apenas com os dados dos meus investimentos. Por favor tente corrigir os problemas e compartilhe a solução.

## Estrutura

### Pastas e Arquivos

- **/assets**: Ferramentas de apoio;
- **/database**: Arquivos .csv para armazenamento de dados;
- **/functions**: Arquivos de funções disponíveis para uso;
- **/pages**: Componentes que geram páginas completas, com ou sem uso de widgets, o que for mais conveniente;
- **/widgets**: Componentes que geram uma resposta para alguma pergunta, quanto mais direto ao ponto e menos complexo melhor;
- **/proxy**: Fornece acesso para conteúdo externo, evitando problemas com CORS;
- **/tests**: Alguns testes para garantir o bom funcionamento;
- **/app.js**: Arquivo principal que inícia a aplicação;
- **/config.js**: Arquivo de configurações, duplique o arquivo de exemplo e faça suas alterações;

### /database/extrato.csv

Este é o **extrato de movimentação** que você obtém na Área do Investidor na B3, baixe os dados completos de todos os anos de atividade e junte neste arquivo. Infelizmente não existe API nem um caminho fácil, os dados são brutos ou incompletos e você precisará corrigir o que estiver em desacordo com os valores do extrato da sua corretora, isto é o mesmo que você faria se estivesse usando planilhas. Realize as correções dos dados necessárias, incluindo dados adicionais de impostos e taxas que você obtém no extrato da sua corretora.

Taxas extras podem ser incluídas com a movimentação de nome `TAXAS` e impostos pagos com o nome `IR`. Demais colunas e tipos de movimentação seguem o padrão do extrato da B3, você pode simplesmente corrigi-los conforme valores no seu extrato da corretora.

### Ferramentas de terceiros

- [Bootstrap](https://getbootstrap.com/)
- [Luxon](https://moment.github.io/luxon/)
- [Apache ECharts](https://echarts.apache.org/)
- [Papa Parse](https://www.papaparse.com/)
- [Embedded JavaScript Templating](https://ejs.co/)
- [Mocha](https://mochajs.org/)
- [Expect](https://github.com/Automattic/expect.js)

## Informações

- Extrato de movimentações da B3 guarda apenas o consolidado das negociações, a data registrada na transferência não é a mesma da compra do ativo. Isto não parece atrapalhar os relatórios, mas para ter exatidão nos dados é necessário trabalhar com o extrato de negociações à parte, ou talvez simplesmente corrigir a data de negociação no extrato.
