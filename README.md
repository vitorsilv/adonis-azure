# AdonisJs API com Serviço de Aplicativo Azure e CI com GitHub

Este repositório utiliza o framework [AdonisJs](https://adonisjs.com/) que agiliza diversos processos do denvolvimento de uma aplicação, esse exemplo coleta dados de um banco SQL Azure e o transforma em JSON pronto para ser consumido.

**Esse projeto foi aperfeiçoado até funcionar com base em tentativa x erro, pois nem a Microsoft(Azure) nem a comunidade do AdonisJs documentou algum projeto usando as mesmas tecnologias, caso essa situação já tenha se resolvido e a documentação esteja disponivel em sites e repositórios dos mesmos por favor utilize-os.**

Caso não tenha o NodeJs instalado por favor instale-o [clicando aqui](https://nodejs.org/pt-br/)

Vamos instalar a nossa [CLI](https://pt.stackoverflow.com/questions/242032/o-que-%C3%A9-exatamente-uma-cli) do Adonis com o comando `npm i -g @adonisjs/cli`.  
Após a instalação podemos executar o comando para criar a estrutura da nossa API `adonis new nomedoseuprojeto --api-only`

Agora podemos começar as configurações para a nossa API ser hospedada no Serviço de Aplivativo Azure, começando localmente.
### Configurações locais
1. Habilitar o Orgin: true
   
  Dentro da pasta config criada pelo AdonisJs tem o arquivo **cors.js**, ao abrir ele podemos ver dentro de `modules.exports{}` a linha de código `origin: false`, mude-a para `true`.

2. Tirar o .env do .gitignore
   
  O Azure utiliza o **.env** para enviar alguns parâmetros, então é preciso enviar o arquivo **.env** ao repositório git.
  Entre no arquivo .gitignore e comente (# comenta) ou retire a linha com o .env do arquivo. 

3. Criando um Model e Controller
   
  Como já foi dito o Adonis abstrai grande parte da complexidade da criação de API's e para provar isso criaremos um model e um controller com apenas um comando `adonis make:model Exemplo -c`, dentro da pasta App ele criou Exemplo.js e ExemploController.js cada um em suas respectivas pastas.

4. Configurando a Model
   
  Como vamos pegar uma tabela de um banco existente crie com base no seu banco SQL
  ```javascript
  static get table(){
    return 'NomeDaTabela';
  }
  static get primaryKey(){
    return 'idTabela';
  }
  ```
5. Configurando a Controller
   
  Primeiro vamos importar nossa model, pode ser na primeira linha da nossa controller
  `const Exemplo = use('App/Models/Exemplo')`

  Precisamos configurar o comando para pegar os dados do banco SQL e retornar o JSON, como vamos fazer um tipo de SELECT sem WHERE vamos criar na funcão index que geralmente é utilizada para requisições sem parâmetro.
  ```javascript
  async index ({ request, response, view }) {
    const retornoSQL = await Exemplo.all();
    return retornoSQL;
  }
  ```
  note que utilizamos nossa model que acabou de ser importada seguida da função `all();` para pegar todos os dados da tabela `NomeDaTabela` que foi definida na model **Exemplo.js** quando criamos o código `static get table(){return 'NomeDaTabela';}`.

6. Configuração do routes
   
  Dentro da pasta start temos o arquivo **routes.js** onde ficam todas as rotas da nossa API, vamos criar uma para o que acabamos de fazer
  `Route.resource("/api","ExemploController").apiOnly();`
  o primeiro argumento que o `Route.resource()` solicita é o caminho da nossa URL ou seja, quando essa API for para o Azure o nossa URL para retornar todos os dados da tabela `NomeDaTabela` ficará algo similar a: https://nomedasuaapi.azurewebsites.net/api ou https://127.0.0.1:3333/api
  o segundo argumento é a nossa controller, note que novamente o Adonis faz por conta própria o caminho todo até a pasta /app/Controllers/Http.

7. Configuração do Banco

  Novamente na pasta **config**, agora no arquivo **database.js**.

  Dentro do `module.exports{}` temos a linha de conexão padrão, vamos configura-la da seguinte forma ` connection: Env.get('DB_CONNECTION', 'mssql'),`
  e logo abaixo temos todos os bancos aceitos pelo Adonis, vamos precisar usar um que não vem pre-inserido neste arquivo, então logo abaixo do nosso ultimo banco que no meu caso é o `pg: {}` vamos colocar uma `,` e colocar essas configurações
  ```javascript
  mssql: {
    client: "mssql",
    connection: {
      host: Env.get("APPSETTING_DB_HOST", "srvSeuServidor.database.windows.net"),
      user: Env.get("APPSETTING_DB_USER", "seuUsuario"),
      password: Env.get("APPSETTING_DB_PASSWORD", "suaSenha"),
      database: Env.get("APPSETTING_DB_DATABASE", "seuBanco"),
      options: {
        encrypt: true
      }
    }
  }
  ```
  esse "APPSETTING" é configurado mais tarde no Azure, não se preocupe, essas configurações utilizam o **.env** por isso é necessáraio retiramos o **.env** do arquivo **.gitignore**.

8. Instalando dependências
   
  Vamos precisar instalar a dependência do MSSQL para utilizarmos o banco, então rode o comando `npm install mssql@4.1.0`, tentamos instalar a versão mais recente da dependência mas o próprio Adonis diz que só aceita a versão 4.1.0. 
  
  Depois da instalação verifique no arquivo **package.json** se a dependência está como `"mssql": "4.1.0"`, caso esteja `"mssql": "^4.1.0"` retire o `^` para evitar problemas ao executar um outro `npm install` futuramente.

9. Gerando a APP_KEY
    
  Para gerar a APP_KEY no nosso arquivo .env basta executar o comando `adonis key:generate`.

10. Modificar .env
  
  Dentro do arquivo **.env** temos que apagar a linha contem o DB_CONNECTION=sqlite ou mudar de `sqlite` para `mssql` para que o projeto funcione localmente

11. Crie um repositório
    
  Crie um repositório no GitHub e envie esse projeto.

**Caso queira rodar o projeto localmente execute** `adonis serve --dev`

### Configurações do Azure

1. Criar um Serviço de Aplicativos
  * Para criar um Serviço de Aplicativos basta ir no menu lateral do Azure ou na barra de pesquisa superior e procurar por Serviços de Aplicativos ou App Service caso seu Azure esteja em inglês.
  * Adicione um novo Serviço de Aplicativos no botão Adicionar ou Add.
  * Configure os campos com a sua assinatura, grupo de recursos, nome do aplicativo web, região e plano do serviço de sua preferência
  o único campo deve ser configurado com base nos nossos testes é a **Pilha de tempo de execução** como **Node 10.14**.
  * Logo após preencher todos esse campos clique no botão **Examinar + criar** e aguarde a implantação do serviço.
2. Habilitar CORS
  * Entre no seu Serviço de Aplicativos recém criado, na barra lateral procure pela categoria API e dentro da categoria o CORS, clique no mesmo.
  * Na area de **Origens Permitidas** especifique a origem que deseja ou deixe como `*` para permitir todas as origens e salve na parte superior.
3. Configurações da Aplicação
   
  Lembra do APPSETTING?! Então, é aqui que vamos configurar ele
  * Selecione no menu lateral na categoria **Configurações** a opção **Configuração**
  * Selecione **Advanced edit** com um ícone de lápis ao lado
  
  Aqui vamos colocar um JSON com as configurações
  ````javascript
  [
  {
    "name": "DB_DATABASE",
    "value": "seuBanco",
    "slotSetting": true
  },
  {
    "name": "DB_HOST",
    "value": "srvSeuServidor.database.windows.net",
    "slotSetting": true
  },
  {
    "name": "DB_PASSWORD",
    "value": "suaSenha",
    "slotSetting": true
  },
  {
    "name": "DB_PORT",
    "value": "3306",
    "slotSetting": true
  },
  {
    "name": "DB_USER",
    "value": "seuUsuario",
    "slotSetting": true
  },
  {
    "name": "ENV_SILENT",
    "value": "true",
    "slotSetting": true
  },
  {
    "name": "HOST",
    "value": "0.0.0.0",
    "slotSetting": true
  },
  {
    "name": "PORT",
    "value": "80",
    "slotSetting": true
  },
  {
    "name": "WEBSITE_HTTPLOGGING_RETENTION_DAYS",
    "value": "2",
    "slotSetting": false
  }
  ]
  ````
  percebeu que algumas configurações são as mesmas que a que fizemos no ariquivo **database.js**? isso é para que o projeto funcione tanto localmente quanto no Serviço de Aplicativos.

4. Configurar CI
  * Para integrar com o GitHub ou o a plataforma de hospetagem de código-fonte de sua preferência basta procurar no menu lateral pela categoria **Implantação** e a opção **Centro de Implantação**.
  * Selecione o GitHub e autorize o Azure a ler seus repositórios.
  * Selecione o Azure Pipelines.
  * Selecione a sua organização e repositório que enviou o projeto e  selecione a branch master.
  * Selecione ou crie a organização e o projeto que vai ficar responsável pelo pipepline que está criando para a CI.
  * Selecione **Node.JS** na opção Web Applicaiton Framework.
  * Selecione a version **Node.js 10.14**.
  * Em Startup command deixe como `pm2 start server.js`.
  * Avance para a próxima pagina e clique em Finish.

Tudo pronto!

Para acessar sua API procure no menu lateral a opção Visão Geral(geralmente é a primeira opção da barra lateral) e clique na URL assim você será redirecionado a API.
