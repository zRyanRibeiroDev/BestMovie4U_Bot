

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
    async buscarPorGeneroData(genero, data, objUsuario) {

        const maximo_filmes = 3

        let pagina = objUsuario?.pagina || 1
        let outras_opcoes = objUsuario?.outras_opcoes || 0
        let filmes, verif

        do {

            filmes = await this.get(`/discover/movie`, `sort_by=popularity.desc&include_adult=false&include_video=false&page=${pagina}&with_genres=${genero}&primary_release_year=${data}`)

            verif = maximo_filmes + outras_opcoes > filmes?.results.length

            // incrementa a pagina caso tenha utilizado todos os resultados da pagina atual
            if (verif) {

                objUsuario.pagina++
                pagina = objUsuario.pagina

                objUsuario.outras_opcoes = 0
                outras_opcoes = objUsuario.outras_opcoes
            }

        } while (verif)

        return filmes?.results ? filmes.results.slice(outras_opcoes, maximo_filmes + outras_opcoes) : []
    }

    async filmeEscolhido(objUsuario) {

        let movie_id = objUsuario?.movie_id

        filme = await this.get(`/movie/${movie_id}`,)
        
    }
}


module.exports = RequestsController