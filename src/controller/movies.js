const get = require('../api/get.js')

class MoviesController {

    estados = {}
    generos = []

    constructor(bot) {

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

                this.bot.sendMessage(chatId, this.apresentacao())
                this.atualizarEstadoChat(chatId, 'generos_filme')
            }

            do {

                // apresenta os generos de filme
                if (this.estados[chatId]?.estado === 'generos_filme') {

                    this.bot.sendMessage(chatId, await this.mostrarGeneros())
                    this.atualizarEstadoChat(chatId, 'genero_especifico')
                }

                // apresenta filmes pelo genero escolhido
                else if (this.estados[chatId]?.estado === 'genero_especifico') {

                    // TODO: trocar pros botoes
                    const num_genero = parseInt(texto)

                    if (isNaN(num_genero) || num_genero > this.generos.length || num_genero <= 0)
                        this.atualizarEstadoChat(chatId, 'genero_invalido')
                    else {
                        this.bot.sendMessage(chatId, `Boa escolha de gênero: ${this.generos[num_genero-1].name}`)
                        this.atualizarEstadoChat(chatId, 'busca_filmes')
                    }
                }

                // apresenta mensagem de erro caso o genero tenha sido invalido
                if (this.estados[chatId]?.estado === 'genero_invalido') {

                    this.bot.sendMessage(chatId, 'Parece que você digitou um valor incorreto.\n\nIrei mostrar a lista novamente.')
                    this.atualizarEstadoChat(chatId, 'generos_filme')
                }

            } while (this.estados[chatId]?.estado === 'generos_filme')

            //TODO: Seguir com estado: busca_filmes
            //    - Delay entre as mensagens

            //Mensagem de recepção feita pelo bot
            //Ex: apresentação do bot, pedir para selecionar um gênero de filme

            //Ao informar o gênero ele deverá fazer mais algumas perguntas ou simplesmente poderemos deixar
            //apenas uma informação

            //Alguns tipos de perguntas: 
            //A do próprio gênero do filme
            //Atores presentes nele
            //Filme lançado entre {ano informado} e {ano informado}
            //Faixa etária
            //Possui premiações

            //Em seguida haverá a resposta do bot, onde está presente o que foi solicitado acima
            //Com uma breve sinopse 
            //Nota da crítica
            //Juntamente com a informações de onde podemos assistir (plataformas)
        })
    }

    /**
     * Realiza a apresentação do bot para o usuario
     */
    apresentacao() {

        const mensagens = [
            'Olá, sou o BestMovie4U_Bot.',
            'Sou capaz de recomendar o filme ideal para você, basta que me dê algumas informações.',
            'Ah, e não é só isso, também consigo te informar em quais plataformas ele se encontra disponível.',
            'Além da avaliação dos usuários sobre o filme.',
            'Vamos começar?']

        let mensagem = ``

        for (let msg of mensagens)
            mensagem += `${msg}\n\n`

        return mensagem
    }

    /**
     * Pega os generos na API do TMDB caso seja a primeira vez
     */
    async pegarGeneros() {

        if (this.generos.length === 0) {

            const mensagens = await get('/genre/movie/list')
            this.generos = mensagens?.genres || this.generos
        }
    }

    /**
     * Apresenta a lista de generos pro usuario
     */
    async mostrarGeneros() {

        await this.pegarGeneros()

        let mensagem = `Selecione um dos generos abaixo de acordo com o seu número respectivo:\n\n`

        for (let i = 0; i < this.generos.length; i++)
            mensagem += `${i + 1} - ${this.generos[i].name}\n`

        return mensagem
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

        this.estados[chatId] = {
            estado: estado,
            horario: moment().format('DD/MM/YYYY HH:mm:ss')
        }
    }
}


module.exports = MoviesController