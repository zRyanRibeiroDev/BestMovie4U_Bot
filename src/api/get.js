const axios = require('axios')
require('dotenv').config()

/**
 * Realiza uma request do tipo GET no endpoint informado para a API do TMDB
 * @param url endpoint desejado, a função irá incluir a URL base, o token de acesso e o idioma pt-BR
 */
const get = async (url) => {

  try {

    const options = {
      method: 'get'
    }

    if (!url.startsWith(process.env.TMDB_URL))
      url = process.env.TMDB_URL + url

    const config = `?api_key=${process.env.TMDB_TOKEN}&language=pt-BR`

    if (!url.endsWith(config))
      url += config

    const {data} = await axios.get(url, options)

    return data

  } catch (e) {

    return false
  }
}


module.exports = get