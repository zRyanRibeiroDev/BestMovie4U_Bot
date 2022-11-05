require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const MoviesController = require('./src/controller/movies.js')

// cria o bot
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true })

new MoviesController(bot).ouvirMensagens()