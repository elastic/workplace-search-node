'use strict'

const assert = require('assert')
const nock = require('nock')
const EnterpriseSearchClient = require('../lib/enterpriseSearch')
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
const clientName = "elastic-enterprise-search-node"
const clientVersion = "0.2.0"

// Mock for Enterprise Search client
nock('https://api.swiftype.com/api/v1/ent', {
  reqheaders: {
    authorization: `Bearer ${mockAccessToken}`,
    'x-swiftype-client': clientName,
    'x-swiftype-client-version': clientVersion
  }
})
  .post(`/sources/${mockContentSourceKey}/documents/bulk_create`)
  .reply(200, [
    { id: null, id: '1234', errors: [] },
    { id: null, id: '1235', errors: [] }
  ])
  .post(`/sources/${mockContentSourceKey}/documents/bulk_destroy`)
  .reply(200, [{ id: 1234, success: true }, { id: 1235, success: true }])
  .get(`/sources/${mockContentSourceKey}/permissions`)
  .reply(200, {
    meta: { page: { current: 1, total_pages: 1, total_results: 2, size: 25 } },
    results: [
      { user: 'elastic', permissions: [] },
      { user: 'enterprise_search', permissions: [] }
    ]
  })
  .get(`/sources/${mockContentSourceKey}/permissions`)
  .query({ page: { size: 1 } })
  .reply(200, {
    meta: { page: { current: 1, total_pages: 2, total_results: 2, size: 1 } },
    results: [{ user: 'elastic', permissions: [] }]
  })
  .get(`/sources/${mockContentSourceKey}/permissions`)
  .query({ page: { current: 2 } })
  .reply(200, {
    meta: { page: { current: 2, total_pages: 1, total_results: 2, size: 25 } },
    results: []
  })
  .get(`/sources/${mockContentSourceKey}/permissions`)
  .query({ page: { size: 1, current: 2 } })
  .reply(200, {
    meta: { page: { current: 2, total_pages: 2, total_results: 2, size: 1 } },
    results: [{ user: 'enterprise_search', permissions: [] }]
  })

// Mock for underlying http client libry
nock('https://example.com', {
    reqheaders: {
      authorization: `Bearer ${mockAccessToken}`,
      "x-swiftype-client": clientName,
      "x-swiftype-client-version": clientVersion
    }
  })
  .get('/get?foo=bar')
  .reply(200, { hello: 'world' })
  .post('/post', { foo: 'bar' })
  .reply(200, { hello: 'world' })
  .get('/error')
  .reply(500, { hello: 'world' })
  .post('/error', { foo: 'bar' })
  .reply(500, { hello: 'world' })

describe('EnterpriseSearchClient', () => {
  const client = new EnterpriseSearchClient(mockAccessToken, 'https://api.swiftype.com/api/v1/ent')

  context('#indexDocuments', () => {
    it('should index documents', async () => {
      const results = await client.indexDocuments(mockContentSourceKey, mockDocuments)
      assert.deepEqual(results, [
        { id: null, id: '1234', errors: [] },
        { id: null, id: '1235', errors: [] }
      ])
    })
  })

  context('#destroyDocuments', () => {
    it('should destroy documents', async () => {
      const results = await client.destroyDocuments(mockContentSourceKey, mockDocuments.map((doc) => doc.id))
      assert.deepEqual(results, [
        { id: 1234, success: true },
        { id: 1235, success: true }
      ])
    })
  })

  context('#permissions', () => {
    it('should list permissions', async () => {
      const results = await client.getPermissions(mockContentSourceKey)
      assert.deepEqual(results, {
        meta: {
          page: { current: 1, total_pages: 1, total_results: 2, size: 25 }
        },
        results: [
          { user: 'elastic', permissions: [] },
          { user: 'enterprise_search', permissions: [] }
        ]
      })
    })

    it('should pass page size', async () => {
      const results = await client.getPermissions(mockContentSourceKey, {
        size: 1
      })
      assert.deepEqual(results, {
        meta: {
          page: { current: 1, total_pages: 2, total_results: 2, size: 1 }
        },
        results: [{ user: 'elastic', permissions: [] }]
      })
    })

    it('should pass current page', async () => {
      const results = await client.getPermissions(mockContentSourceKey, {
        current: 2
      })
      assert.deepEqual(results, {
        meta: {
          page: { current: 2, total_pages: 1, total_results: 2, size: 25 }
        },
        results: []
      })
    })

    it('should pass page size and current page', async () => {
      const results = await client.getPermissions(mockContentSourceKey, {
        size: 1,
        current: 2
      })
      assert.deepEqual(results, {
        meta: {
          page: { current: 2, total_pages: 2, total_results: 2, size: 1 }
        },
        results: [{ user: 'enterprise_search', permissions: [] }]
      })
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

    it('should handle errors', async () => {
      const err = new Error('Internal Server Error')
      err.statusCode = 500
      err.headers = { 'content-type': 'application/json' }
      err.body = { hello: 'world' }
      await assert.rejects(client.get('/error'), err)
    })

    it('should handle errors (connection error)', async () => {
      const client = new HttpClient(mockAccessToken, 'https://test.example.com')
      await assert.rejects(client.get('/error'), {
        errno: 'ENOTFOUND',
        code: 'ENOTFOUND',
        syscall: 'getaddrinfo',
        hostname: 'test.example.com',
        host: 'test.example.com',
        port: 443 }
      )
    })
  })

  context('#post', () => {
    it('should send post request', async () => {
      const response = await client.post('/post', { foo: 'bar' })
      assert.deepEqual(response, { hello: 'world' })
    })

    it('should handle errors', async () => {
      const err = new Error('Internal Server Error')
      err.statusCode = 500
      err.headers = { 'content-type': 'application/json' }
      err.body = { hello: 'world' }
      await assert.rejects(client.post('/error', { foo: 'bar' }), err)
    })

    it('should handle errors (connection error)', async () => {
      const client = new HttpClient(mockAccessToken, 'https://test.example.com')
      await assert.rejects(client.post('/error', { foo: 'bar' }), {
        errno: 'ENOTFOUND',
        code: 'ENOTFOUND',
        syscall: 'getaddrinfo',
        hostname: 'test.example.com',
        host: 'test.example.com',
        port: 443 }
      )
    })
  })
})
