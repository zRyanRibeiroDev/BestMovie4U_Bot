const axios = require('axios')

const get = (url) => {

  const options = {
    method: 'get'
  }

  //TODO: verificar se promise funciona
  axios.get(url, options)
    .then(function (response) {
      return response.data
    })
    .catch(function (error) {
      return error
    })
}

module.exports = get