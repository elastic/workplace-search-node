'use strict'

const querystring = require('querystring')
const { STATUS_CODES } = require('http')
const sget = require('simple-get').concat
const packageJson = require('../package.json')

class Client {
  constructor(accessToken, baseUrl) {
    this.accessToken = accessToken
    this.packageName = 'elastic-workplace-search-node'
    this.baseUrl = baseUrl
  }

  get(path, params) {
    return new Promise((resolve, reject) => {
      sget(
        {
          method: 'GET',
          url: params
            ? `${this.baseUrl}${path}?${querystring.stringify(params)}`
            : `${this.baseUrl}${path}`,
          headers: {
            'X-Swiftype-Client': this.packageName,
            'X-Swiftype-Client-Version': packageJson.version,
            Authorization: `Bearer ${this.accessToken}`
          },
          json: true
        },
        (err, res, data) => {
          if (err || res.statusCode >= 400) {
            err = err || new Error(STATUS_CODES[res.statusCode])
            err.statusCode = res && res.statusCode
            err.headers = res && res.headers
            err.body = data
            return reject(err)
          }
          resolve(data)
        }
      )
    })
  }

  post(path, params) {
    return new Promise((resolve, reject) => {
      sget(
        {
          method: 'POST',
          url: `${this.baseUrl}${path}`,
          headers: {
            'X-Swiftype-Client': this.packageName,
            'X-Swiftype-Client-Version': packageJson.version,
            Authorization: `Bearer ${this.accessToken}`
          },
          body: params,
          json: true
        },
        (err, res, data) => {
          if (err || res.statusCode >= 400) {
            err = err || new Error(STATUS_CODES[res.statusCode])
            err.statusCode = res && res.statusCode
            err.headers = res && res.headers
            err.body = data
            return reject(err)
          }
          resolve(data)
        }
      )
    })
  }
}

module.exports = Client
