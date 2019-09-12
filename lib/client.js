'use strict'

const querystring = require('querystring')
const sget = require('simple-get').concat
const packageJson = require('../package.json')

class Client {
  constructor(accessToken, baseUrl) {
    this.accessToken = accessToken
    this.packageName = 'elastic-enterprise-search-node'
    this.baseUrl = baseUrl
  }

  get(path, params) {
    return new Promise((resolve, reject) => {
      sget({
        method: 'GET',
        url: params
          ? `${this.baseUrl}${path}?${querystring.stringify(params)}`
          : `${this.baseUrl}${path}`,
        headers: {
          'X-Swiftype-Client': this.packageName,
          'X-Swiftype-Client-Version': packageJson.version,
          'Authorization': `Bearer ${this.accessToken}`
        },
        json: true
      }, (err, res, data) => {
        if (err) return reject(err)
        if (res.statusCode >= 400) {
          return reject(data)
        }
        resolve(data)
      })
    })
  }

  post(path, params) {
    return new Promise((resolve, reject) => {
      sget({
        method: 'POST',
        url: `${this.baseUrl}${path}`,
        headers: {
          'X-Swiftype-Client': this.packageName,
          'X-Swiftype-Client-Version': packageJson.version,
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: params,
        json: true
      }, (err, res, data) => {
        if (err) return reject(err)
        if (res.statusCode >= 400) {
          return reject(data)
        }
        resolve(data)
      })
    })
  }
}

module.exports = Client
