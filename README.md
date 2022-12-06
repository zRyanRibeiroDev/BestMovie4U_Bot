# BestMovie4U_Bot

## Apresentação

Esse Bot possui como objetivo recomendar as melhores opções de filmes desde filmes infantis a filmes de ação e ficção.

### Programas necessários

- **Git**
  - Sistema de versionamento de código utilizado para a administração do projeto, permitindo um controle mais preciso do código a ser desenvolvido.
- **Node.js**
  - Ambiente de execução, permite executar rodar a linguagem de programação JavaScript fora do navegador, este possuí o mesmo motor V8 utilizado no browser Google Chrome.
  
### Dependências utilizadas

- **Axios**
  - Cliente HTTP responsável pelas requisições na web.
- **Moment**
  - Biblioteca que disponibiliza ferramentas para manusear dados de data e tempo.
- **DotEnv**
  - Pacote responsável por configurar as variáveis de ambiente.
- **TelegramBot Api**
  - Biblioteca de ferramentas para o manuseio do bot na rede do Telegram.
  
### Recursos necessários para o desenvolvimento
- **The Movie Database (TMDB)**
  - Banco de dados de diversos filmes onde conseguimos realizar as requisições necessárias, conseguindo assim as informações desejadas.
- **BotFather**
  - Ferramenta necessária para a criação do bot na plataforma do Telegram, onde é disponibilizado o token para criação, edições das informações e perfil do bot.

## Instalação

Numa pasta desejada execute o comando abaixo para clonar o projeto.
```
git clone https://github.com/zRyanRibeiroDev/BestMovie4U_Bot
```

Em seguida, acesse a pasta do repositório clonado e execute o seguinte comando para instalar todas as dependências.
```
npm install
```

## Inicialização

Inicie o bot com o comando abaixo.
```
npm run start
```

## Instruções
1. Após executar a aplicação o usuário pode iniciar o bate-papo com o bot enviando uma mensagem e então começará a interação.
2. O bot prosseguirá para a coleta das informações necessárias para a busca de recomendações de filmes, sendo eles o gênero e ano de lançamento desejados.
3. Serão apresentados três filmes com as melhores avaliações para o período e gênero selecionados.
4. O usuário poderá escolher se deseja obter mais informações sobre algum filme específico apresentado, alterar algum parametro ou visualizar mais opções.
5. Ao escolher um filme poderá ser apresentado informações sobre a escolha feita conforme disponibilidade sendo elas: o poster, nome, breve sinopse, nota, data de lançamento e plataforma(s) disponível(is) para assisti-lo, além de permitir reiniciar a interação ou buscar mais filmes.
