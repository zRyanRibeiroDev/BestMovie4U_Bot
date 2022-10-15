class MoviesController {

    estados = {}

    constructor(bot) {

        this.bot = bot

        // define o comportamento do bot ao ocorrer erro de polling
        bot.on('polling_error', (error) => {
            console.log(error)
        })

        console.log('O BOT ESTÁ RODANDO!')
    }

    ouvirMensagens() {

        // define os comportamentos do bot ao receber qualquer tipo de mensagem
        this.bot.on('message', (msg) => {

            // pega o ID do chat que recebeu mensagem
            const chatId = msg.chat.id

            // realiza a apresentação se for primeira vez ou bater timeout
            if (this.estados[chatId]?.estado === undefined || this.verificarTimeOutChat(chatId)) {

                this.bot.sendMessage(chatId, this.apresentacao())
                this.atualizarEstadoChat(chatId, 'generos_filme')
            }

            // apresenta os generos de filme
            if (this.estados[chatId]?.estado === 'generos_filme') {

                this.bot.sendMessage(chatId, this.generos())
                this.atualizarEstadoChat(chatId, 'genero_especifico')
            }

            // apresenta filmes pelo genero escolhido
            else if (this.estados[chatId]?.estado === 'genero_especifico') {

                // TODO: trocar pros botoes

                // TODO: apresentar primeiramente 3 filmes do genero escolhido
                this.bot.sendMessage(chatId, 'boa escolha')
            }

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
            //Juntamente com a informações de onde podemos assistir(plataformas)

        })
    }

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

    generos() {

        // TODO: preencher todos generos disponiveis com get na api

        const mensagens = axios.get('https://api.themoviedb.org/3/genre/movie/list?api_key=<<api_key>>&language=pt-BR')

        let mensagem = `Selecione um dos generos abaixo de acordo com o seu número respectivo:\n\n`

        for (let i=0; i<mensagens.length;i++)
            mensagem += `${i+1} - ${mensagens[i]}\n`

        return mensagem
    }

    verificarTimeOutChat(chatId) {

        const moment = require('moment')

        const formato = 'DD/MM/YYYY HH:mm:ss'

        const atual = moment(moment().format(formato), formato)
        const antes = moment(this.estados[chatId].horario, formato)

        const diferença = moment.duration(atual.diff(antes)).asSeconds()

        return diferença >= parseInt(process.env.TIMEOUT)
    }

    atualizarEstadoChat(chatId, estado) {

        const moment = require('moment')

        this.estados[chatId] = {
            estado: estado,
            horario: moment().format('DD/MM/YYYY HH:mm:ss')
        }
    }
}



module.exports = MoviesController