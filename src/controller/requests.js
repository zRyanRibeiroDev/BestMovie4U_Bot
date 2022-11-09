

// classe somente para preparar e tratar requests que podem ser feitas pelo bot
class RequestsController {

    constructor() {

        this.get = require('../api/get.js')
    }

    /**
     * Pega os generos na API do TMDB caso seja a primeira vez
     */
    async pegarGeneros(generos) {

        if (generos.length === 0) {

            const mensagens = await this.get('/genre/movie/list')
            generos = mensagens?.genres || generos
        }

        return generos
    }

    /**
     * Pega os filmes mais recomendados por genero e data na API do TMDB
     */
    async buscarPorGeneroData(genero, data, maximo_filmes = 3) {

        let filmes_anos = await this.get(`/discover/movie`, `sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=${genero}&primary_release_year=${data}`)

        if (filmes_anos?.results)
            filmes_anos = filmes_anos.results.slice(0, maximo_filmes)
        else
            filmes_anos = []

        return filmes_anos
    }
}


module.exports = RequestsController