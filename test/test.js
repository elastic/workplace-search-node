'use strict'

const assert = require('assert')
const nock = require('nock')
const SwiftypeEnterpriseClient = require('../lib/swiftypeEnterprise')
const HttpClient = require('../lib/client')
const packageJson = require('../package.json')

const mockAccessToken = 'mockAccessToken'
const mockContentSourceKey = 'mockContentSourceKey'
const mockDocuments = [
  {
    id: 1234,
    title: '5 Tips On Finding A Mentor',
    body: 'The difference between a budding entrepreneur who merely shows promise and one who is already enjoying some success often comes down to mentoring.',
    url: 'https://www.shopify.com/content/5-tips-on-finding-a-mentor'
  },
  {
    id: 1235,
    title: 'How to Profit from Your Passions',
    body: 'Want to know the secret to starting a successful business? Find a void and fill it.',
    url: 'https://www.shopify.com/content/how-to-profit-from-your-passions'
  }
]

// Mock for Swiftype client
nock('https://api.swiftype.com/api/v1/ent', {
    reqheaders: {
      authorization: `Bearer ${mockAccessToken}`,
      'user-agent': `${packageJson.name}/${packageJson.version}`
    }
  })
  .post(`/sources/${mockContentSourceKey}/documents/bulk_create`)
  .reply(200, [
    { id: null, id: '1234', errors: [] },
    { id: null, id: '1235', errors: [] }
  ])
  .post(`/sources/${mockContentSourceKey}/documents/bulk_destroy`)
  .reply(200, [
    { id: 1234, success: true },
    { id: 1235, success: true }
  ])

// Mock for underlying http client libry
nock('https://example.com', {
    reqheaders: {
      authorization: `Bearer ${mockAccessToken}`,
      'user-agent': `${packageJson.name}/${packageJson.version}`
    }
  })
  .get('/get?foo=bar')
  .reply(200, { hello: 'world' })
  .post('/post', { foo: 'bar' })
  .reply(200, { hello: 'world' })

describe('SwiftypeEnterpriseClient', () => {
  const swiftype = new SwiftypeEnterpriseClient(mockAccessToken, 'https://api.swiftype.com/api/v1/ent')

  context('#indexDocuments', () => {
    it('should index documents', async () => {
      const results = await swiftype.indexDocuments(mockContentSourceKey, mockDocuments)
      assert.deepEqual(results, [
        { id: null, id: '1234', errors: [] },
        { id: null, id: '1235', errors: [] }
      ])
    })
  })

  context('#destroyDocuments', () => {
    it('should destroy documents', async () => {
      const results = await swiftype.destroyDocuments(mockContentSourceKey, mockDocuments.map((doc) => doc.id))
      assert.deepEqual(results, [
        { id: 1234, success: true },
        { id: 1235, success: true }
      ])
    })
  })
})

describe('http client', () => {
  const client = new HttpClient(mockAccessToken, 'https://example.com')

  context('#get', () => {
    it('should send a get request', async () => {
      const response = await client.get('/get', { foo: 'bar' })
      assert.deepEqual(response, { hello: 'world' })
    })
  })

  context('#post', () => {
    it('should send post request', async () => {
      const response = await client.post('/post', { foo: 'bar' })
      assert.deepEqual(response, { hello: 'world' })
    })
  })
})
