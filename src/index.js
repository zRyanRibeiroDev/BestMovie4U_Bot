const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '5552275568:AAGnLuOIUWtz9ETdEVj_Lq_GS5EgScv2cn0';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Test Received your message');


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

});