const packageJson = require('../package.json')
const request = require('request')

class Client {
  constructor(accessToken, baseUrl) {
    this.accessToken = accessToken
    this.packageName = 'elastic-enterprise-search-node'
    this.baseUrl = baseUrl
  }

  wrap(options, responseParser) {
    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          reject(error)
        } else if (!(response.statusCode.toString().match(/2[\d]{2}/))) {
          reject(new Error(response.statusCode.toString()))
        } else {
          resolve(responseParser(body))
        }
      })
    })
  }

  get(path, params, responseParser = (body) => body) {
    return this.wrap({
      method: 'GET',
      url: `${this.baseUrl}${path}`,
      qs: params,
      json: true,
      auth: {
        bearer: this.accessToken
      },
      headers: {
        'X-Swiftype-Client': this.packageName,
        'X-Swiftype-Client-Version': packageJson.version,
        'Content-Type': 'application/json'
      }
    }, responseParser)
  }

  post(path, params, responseParser = (body) => body) {
    return this.wrap({
      method: 'POST',
      json: params,
      url: `${this.baseUrl}${path}`,
      auth: {
        bearer: this.accessToken
      },
      headers: {
        'X-Swiftype-Client': this.packageName,
        'X-Swiftype-Client-Version': packageJson.version,
        'Content-Type': 'application/json'
      }
    }, responseParser)
  }
}

module.exports = Client
