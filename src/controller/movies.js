// classe para manipular somente mensagens a serem enviadas e recebidas pelo bot
class MoviesController {

    estados = {}
    generos = []

    constructor(bot) {

        const RequestsController = require('./requests.js')

        // define o requests controller para o bot pegar os dados nas APIs
        this.requests = new RequestsController()

        this.bot = bot

        // define o comportamento do bot ao ocorrer erro de polling
        bot.on('polling_error', (error) => {
            console.log(error)
        })

        console.log('O BOT ESTÁ RODANDO!')
    }

    /**
     * Inicia a função de escuta e resposta de mensagens do bot
     */
    ouvirMensagens() {

        // define os comportamentos do bot ao receber qualquer tipo de mensagem
        this.bot.on('message', async (msg) => {

            // pega o ID do chat que recebeu mensagem
            const chatId = msg.chat.id
            const texto = msg.text

            // realiza a apresentação se for primeira vez ou bater timeout
            if (this.estados[chatId]?.estado === undefined || this.verificarTimeOutChat(chatId)) {

                await this.apresentacao(chatId)
                this.atualizarEstadoChat(chatId, 'generos_filme')
            }

            do {

                // apresenta os generos de filme
                if (this.estados[chatId]?.estado === 'generos_filme') {

                    await this.mostrarGeneros(chatId)
                    this.atualizarEstadoChat(chatId, 'genero_especifico')
                }

                // valida o genero escolhido e o confirma
                else if (this.estados[chatId]?.estado === 'genero_especifico') {

                    const regex = /\d+/
                    const match = regex.exec(texto) || 0

                    const num_genero = parseInt(match[0])

                    // nao encontrou o numero do genero devido erro ou estar fora do array
                    if (isNaN(num_genero) || num_genero > this.generos.length || num_genero <= 0)
                        this.atualizarEstadoChat(chatId, 'genero_invalido')

                    else {

                        await this.confirmarGenero(chatId, num_genero)
                        this.atualizarEstadoChat(chatId, 'perguntar_data')
                    }
                }

                // apresenta mensagem de erro caso o genero tenha sido invalido
                if (this.estados[chatId]?.estado === 'genero_invalido') {

                    await this.generoInvalido(chatId)
                    this.atualizarEstadoChat(chatId, 'generos_filme')
                }

                // enquanto não escolher um genero corretamente irá tentar novamente
            } while (this.estados[chatId]?.estado === 'generos_filme')

            do {

                // pergunta qual data o usuário quer buscar para os filmes
                if (this.estados[chatId]?.estado === 'perguntar_data') {

                    await this.perguntarData(chatId)
                    this.atualizarEstadoChat(chatId, 'buscar_por_data')
                }

                // valida a data escolhida e a confirma
                else if (this.estados[chatId]?.estado === 'buscar_por_data') {

                    const moment = require('moment')

                    const regex = /\d{4}/
                    const match = regex.exec(texto) || 0

                    const ano_lancamento = parseInt(match[0])
                    const ano_atual = moment().year()

                    // nao encontrou o ano de lancamento devido erro ou ser maior que o atual ou preenchimento incorreto do usuario
                    if (isNaN(ano_lancamento) || ano_lancamento > ano_atual || ano_lancamento <= 0)
                        this.atualizarEstadoChat(chatId, 'data_invalida')

                    else {

                        await this.confirmarDataEscolhida(chatId, ano_lancamento)
                        this.atualizarEstadoChat(chatId, 'filmes_por_data_genero')
                    }
                }

                // apresenta mensagem de erro caso a data tenha sido invalida
                if (this.estados[chatId]?.estado === 'data_invalida') {

                    await this.dataInvalida(chatId)
                    this.atualizarEstadoChat(chatId, 'perguntar_data')
                }

                // enquanto não escolher uma data corretamente irá tentar novamente
            } while (this.estados[chatId]?.estado === 'perguntar_data')

            do {

                // apresenta recomendacoes de filmes pelo genero escolhido e data 
                if (this.estados[chatId]?.estado === 'filmes_por_data_genero') {

                    this.estados[chatId].pagina = 1
                    this.estados[chatId].outras_opcoes = 0

                    const dados = {
                        genero: this.estados[chatId]?.genero,
                        ano_lancamento: this.estados[chatId]?.ano_lancamento
                    }

                    await this.filmesPorGeneroData(chatId, dados)
                    this.atualizarEstadoChat(chatId, 'interesse_usuario')
                }

                // valida a opcao escolhida pelo usuario e age de acordo
                else if (this.estados[chatId]?.estado === 'interesse_usuario') {

                    const regex = /\d+/
                    const match = regex.exec(texto) || 0

                    const num_opcao = parseInt(match[0])

                    const qntd_filmes = this.estados[chatId].filmes.length
                    const max_opcoes = qntd_filmes + 2

                    // nao encontrou a opcao desejada devido erro ou preenchimento incorreto do usuario
                    if (isNaN(num_opcao) || num_opcao > max_opcoes || num_opcao <= 0)
                        this.atualizarEstadoChat(chatId, 'opcao_interesse_invalida')

                    // quer ver sobre um filme especifico
                    else if (num_opcao <= qntd_filmes) {

                        await this.buscarFilmeEscolhido(chatId, num_opcao)
                        this.atualizarEstadoChat(chatId, 'filme_especifico')
                    }

                    // quer mudar os criterios
                    else if (num_opcao - 1 === max_opcoes - 1) {

                        await this.recomecarEscolhaCriterios(chatId)
                        await this.mostrarGeneros(chatId)
                        this.atualizarEstadoChat(chatId, 'genero_especifico')
                    }

                    // quer ver mais opcoes de filmes para o genêro e data escolhidos
                    else {

                        this.estados[chatId].outras_opcoes += 3

                        const dados = {
                            genero: this.estados[chatId]?.genero,
                            ano_lancamento: this.estados[chatId]?.ano_lancamento
                        }

                        await this.filmesPorGeneroData(chatId, dados, this.estados[chatId])
                        this.atualizarEstadoChat(chatId, 'interesse_usuario')
                    }
                }

                // apresenta mensagem de erro caso a data tenha sido invalida
                if (this.estados[chatId]?.estado === 'opcao_interesse_invalida') {

                    await this.opcaoInvalida(chatId)
                    this.atualizarEstadoChat(chatId, 'filmes_por_data_genero')
                }

            } while (this.estados[chatId]?.estado === 'filmes_por_data_genero')

            // apresenta o filme escolhido pelo usuário
            if (this.estados[chatId]?.estado === 'filme_especifico') {

                const filme = this.estados[chatId]?.filme

                await this.apresentarFilme(chatId, filme)
                this.atualizarEstadoChat(chatId, 'perguntar_continuar')
            }

            do {

                if (this.estados[chatId]?.estado === 'perguntar_continuar') {

                    await this.perguntarSeQuerContinuar(chatId)
                    this.atualizarEstadoChat(chatId, 'quer_continuar')
                }

                else if (this.estados[chatId]?.estado === 'quer_continuar') {

                    const regex = /\d+/
                    const match = regex.exec(texto) || 0

                    const num_opcao = parseInt(match[0])

                    // nao encontrou a opcao desejada devido erro ou preenchimento incorreto do usuario
                    if (isNaN(num_opcao) || num_opcao > 2 || num_opcao <= 0)
                        this.atualizarEstadoChat(chatId, 'opcao_menu_invalida')

                    // reinicia busca por outros filmes
                    else if (num_opcao === 1) {

                        await this.recomecarEscolhaCriterios(chatId)
                        await this.mostrarGeneros(chatId)
                        this.atualizarEstadoChat(chatId, 'genero_especifico')
                    }

                    // encerra e agradece o uso
                    else {

                        await this.encerrarChat(chatId)
                        this.atualizarEstadoChat(chatId, undefined)
                    }
                }

                // apresenta mensagem de erro caso a opcao tenha sido invalida
                if (this.estados[chatId]?.estado === 'opcao_menu_invalida') {

                    await this.opcaoInvalida(chatId)
                    this.atualizarEstadoChat(chatId, 'perguntar_continuar')
                }

            } while (this.estados[chatId]?.estado === 'perguntar_continuar')
        })
    }

    /**
     * Envia uma mensagem de acordo com o chatId e msg
     */
    async enviarMensagem(chatId, msg) {

        await this.bot.sendMessage(chatId, msg)
    }

    /**
     * Envia uma imagem de acordo com o chatId e imagem, legenda opcional
     */
    async enviarImagem(chatId, imagem, legenda) {

        try {

            await this.bot.sendPhoto(chatId, imagem, { caption: legenda })

        } catch (e) {

            await this.enviarMensagem(chatId, legenda)
        }
    }

    /**
     * Realiza a apresentação do bot para o usuario
     */
    async apresentacao(chatId) {

        const mensagens = [
            'Olá, sou o BestMovie4U_Bot.',
            'Sou capaz de recomendar o filme ideal para você, basta que me dê algumas informações.',
            'Ah, e não é só isso, também consigo te informar em quais plataformas ele se encontra disponível.',
            'Além da avaliação dos usuários sobre o filme.',
            'Vamos começar?']

        for (let msg of mensagens)
            await this.enviarMensagem(chatId, msg)
    }

    /**
     * Encerra o chat
     */
    async encerrarChat(chatId) {

        await this.enviarMensagem(chatId, `Ok, estarei sempre a disposição quando precisar, até a próxima. ;D`)
    }

    /**
     * Mensagem de recomeçar a selecionar criterios de genero e data
     */
    async recomecarEscolhaCriterios(chatId) {

        await this.enviarMensagem(chatId, `Certo, vamos recomeçar!`)
    }

    /**
     * Apresenta a lista de generos pro usuario
     */
    async mostrarGeneros(chatId) {

        this.generos = await this.requests.pegarGeneros(this.generos)

        let mensagem = `Selecione um dos generos abaixo de acordo com o seu número respectivo:\n\n`

        for (let i = 0; i < this.generos.length; i++)
            mensagem += `${i + 1} - ${this.generos[i].name}\n`

        await this.enviarMensagem(chatId, mensagem)
    }

    /**
     * Confirma o genero escolhido pelo usuario
     */
    async confirmarGenero(chatId, num_genero) {

        const genero_escolhido = this.generos[num_genero - 1].name

        // armazena o genero nos dados do usuario
        this.estados[chatId].genero = this.generos[num_genero - 1].id

        await this.enviarMensagem(chatId, `Boa escolha de gênero: ${genero_escolhido.toLowerCase()}.`)
    }

    /**
     * Informa um erro na escolha de genero
     */
    async generoInvalido(chatId) {

        await this.enviarMensagem(chatId, 'Parece que você digitou um valor incorreto.\n\nIrei mostrar a lista novamente.')
    }

    /**
     * Verifica o que o usuário deseja fazer
     */
    async perguntarSeQuerContinuar(chatId) {

        await this.enviarMensagem(chatId, `Gostaria de fazer outra busca?\n\n1 - Sim\n2 - Não`)
    }

    /**
     * Pergunta o ano de lançamento desejado pro usuario
     */
    async perguntarData(chatId) {

        await this.enviarMensagem(chatId, 'Insira o ano de lançamento desejado para as recomendações de filmes daquela data.')
    }

    /**
     * Confirma o ano de lançamento escolhido pelo usuario
     */
    async confirmarDataEscolhida(chatId, data) {

        // armazena o ano de lancamento nos dados do usuario
        this.estados[chatId].ano_lancamento = data

        await this.enviarMensagem(chatId, `Uau, ${data}?!\nDeixe me ver o que encontro de recomendação para você.`)
    }

    /**
     * Informa um erro na escolha do ano de lançamento
     */
    async dataInvalida(chatId) {

        await this.enviarMensagem(chatId, `Parece que você digitou um ano de lançamento incorreto.`)
    }

    /**
     * Informa um erro na escolha da opção
     */
    async opcaoInvalida(chatId) {

        await this.enviarMensagem(chatId, `Parece que você digitou uma opção incorreta.`)
    }

    /**
     * Apresenta uma lista de filmes recomendados de acordo com o genero e data escolhida
     */
    async filmesPorGeneroData(chatId, dados, objUsuario) {

        const filmes = await this.requests.buscarPorGeneroData(dados.genero, dados.ano_lancamento, objUsuario)

        let mensagem = `Encontrei alguns filmes com maior popularidade para esse gênero e ano de lançamento escolhidos:\n\n`

        // armazena o ano de lancamento nos dados do usuario
        this.estados[chatId].filmes = []

        for (let i = 0; i < filmes.length; i++) {

            // armazena o id do filme nos dados do usuario
            this.estados[chatId].filmes.push(filmes[i].id)

            mensagem += `${i + 1} - ${filmes[i].title}\n`
        }

        // adiciona outras opcoes fora os filmes
        mensagem += `\n${filmes.length + 1} - Ver mais recomendações`
        mensagem += `\n${filmes.length + 2} - Recomeçar`

        await this.enviarMensagem(chatId, mensagem)
    }

    /**
     * Busca o filme escolhido de acordo com a opção que o usuário forneceu
     */
    async buscarFilmeEscolhido(chatId, num_opcao) {

        const idFilme = this.estados[chatId].filmes[num_opcao - 1]

        this.estados[chatId].filme = await this.requests.filmeEscolhido(idFilme)

        await this.enviarMensagem(chatId, `Só um momento, estou buscando os dados do filme!`)
    }

    /**
     * Apresenta o filme escolhido
     */
    async apresentarFilme(chatId, filme) {

        let mensagem = `Achei os seguintes dados sobre o filme que você escolheu:\n\n`

        for (const propriedade in filme.dados) {

            // se for um array e tiver algum elemento, ira apresentar eles juntos separados por virgula
            if (Array.isArray(filme.dados[propriedade]) && filme.dados[propriedade].length > 0)
                mensagem += `${propriedade}: ${filme.dados[propriedade].join(', ')}\n\n`

            // verifica se a propriedade possui alguma informação para exibi-la
            else if (!Array.isArray(filme.dados[propriedade]) && filme.dados[propriedade] !== '' && filme.dados[propriedade] !== undefined)
                mensagem += `${propriedade}: ${filme.dados[propriedade]}\n\n`
        }

        await this.enviarImagem(chatId, filme.poster, mensagem)
    }

    /**
     * Verifica se o horario atual em relação ao ultimo horario de conversa com o usuario ultrapassou o timeout definido
     */
    verificarTimeOutChat(chatId) {

        const moment = require('moment')

        const formato = 'DD/MM/YYYY HH:mm:ss'

        const atual = moment(moment().format(formato), formato)
        const antes = moment(this.estados[chatId].horario, formato)

        const diferença = moment.duration(atual.diff(antes)).asSeconds()

        return diferença >= parseInt(process.env.TIMEOUT)
    }

    /**
     * Atualiza o estado atual e horario do chat para o usuario
     */
    atualizarEstadoChat(chatId, estado) {

        const moment = require('moment')

        // atualiza somente o estado e horario e mantem outras propriedades do usuario
        this.estados[chatId] = {
            ...this.estados[chatId],
            estado: estado,
            horario: moment().format('DD/MM/YYYY HH:mm:ss')
        }
    }
}


module.exports = MoviesController