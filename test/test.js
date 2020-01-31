'use strict'

const assert = require('assert')
const nock = require('nock')
const WorkplaceSearchClient = require('../lib/workplaceSearch')
const HttpClient = require('../lib/client')
const packageJson = require('../package.json')

const mockAccessToken = 'mockAccessToken'
const mockContentSourceKey = 'mockContentSourceKey'
const mockDocuments = [
  {
    id: 1234,
    title: '5 Tips On Finding A Mentor',
    body:
      'The difference between a budding entrepreneur who merely shows promise and one who is already enjoying some success often comes down to mentoring.',
    url: 'https://www.shopify.com/content/5-tips-on-finding-a-mentor'
  },
  {
    id: 1235,
    title: 'How to Profit from Your Passions',
    body:
      'Want to know the secret to starting a successful business? Find a void and fill it.',
    url: 'https://www.shopify.com/content/how-to-profit-from-your-passions'
  }
]
const clientName = 'elastic-workplace-search-node'
const clientVersion = '0.4.0'

// Mock for Workplace Search client
nock('https://api.swiftype.com/api/ws/v1', {
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
      { user: 'enterprise_search2', permissions: [] },
      { user: 'enterprise_search', permissions: [] }
    ]
  })
  .get(`/sources/${mockContentSourceKey}/permissions`)
  .query({ page: { size: 1 } })
  .reply(200, {
    meta: { page: { current: 1, total_pages: 2, total_results: 2, size: 1 } },
    results: [{ user: 'enterprise_search2', permissions: [] }]
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
  .get(`/sources/${mockContentSourceKey}/permissions/enterprise_search`)
  .reply(200, { user: 'enterprise_search', permissions: [] })
  .post(`/sources/${mockContentSourceKey}/permissions/enterprise_search`, {
    permissions: ['permission1']
  })
  .reply(200, { user: 'enterprise_search', permissions: ['permission1'] })
  .post(`/sources/${mockContentSourceKey}/permissions/enterprise_search/add`, {
    permissions: ['permission2']
  })
  .reply(200, {
    user: 'enterprise_search',
    permissions: ['permission1', 'permission2']
  })
  .post(
    `/sources/${mockContentSourceKey}/permissions/enterprise_search/remove`,
    { permissions: ['permission2'] }
  )
  .reply(200, {
    user: 'enterprise_search',
    permissions: ['permission1']
  })

// Mock for underlying http client libry
nock('https://example.com', {
  reqheaders: {
    authorization: `Bearer ${mockAccessToken}`,
    'x-swiftype-client': clientName,
    'x-swiftype-client-version': clientVersion
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

describe('WorkplaceSearchClient', () => {
  const client = new WorkplaceSearchClient(
    mockAccessToken,
    'https://api.swiftype.com/api/ws/v1'
  )

  context('#indexDocuments', () => {
    it('should index documents', async () => {
      const results = await client.indexDocuments(
        mockContentSourceKey,
        mockDocuments
      )
      assert.deepEqual(results, [
        { id: null, id: '1234', errors: [] },
        { id: null, id: '1235', errors: [] }
      ])
    })
  })

  context('#destroyDocuments', () => {
    it('should destroy documents', async () => {
      const results = await client.destroyDocuments(
        mockContentSourceKey,
        mockDocuments.map(doc => doc.id)
      )
      assert.deepEqual(results, [
        { id: 1234, success: true },
        { id: 1235, success: true }
      ])
    })
  })

  context('#permissions', () => {
    it('should list permissions', async () => {
      const results = await client.listAllPermissions(mockContentSourceKey)
      assert.deepEqual(results, {
        meta: {
          page: { current: 1, total_pages: 1, total_results: 2, size: 25 }
        },
        results: [
          { user: 'enterprise_search2', permissions: [] },
          { user: 'enterprise_search', permissions: [] }
        ]
      })
    })

    it('should pass page size', async () => {
      const results = await client.listAllPermissions(mockContentSourceKey, {
        pageSize: 1
      })
      assert.deepEqual(results, {
        meta: {
          page: { current: 1, total_pages: 2, total_results: 2, size: 1 }
        },
        results: [{ user: 'enterprise_search2', permissions: [] }]
      })
    })

    it('should pass current page', async () => {
      const results = await client.listAllPermissions(mockContentSourceKey, {
        currentPage: 2
      })
      assert.deepEqual(results, {
        meta: {
          page: { current: 2, total_pages: 1, total_results: 2, size: 25 }
        },
        results: []
      })
    })

    it('should pass page size and current page', async () => {
      const results = await client.listAllPermissions(mockContentSourceKey, {
        pageSize: 1,
        currentPage: 2
      })
      assert.deepEqual(results, {
        meta: {
          page: { current: 2, total_pages: 2, total_results: 2, size: 1 }
        },
        results: [{ user: 'enterprise_search', permissions: [] }]
      })
    })
  })

  context('#permissions/{user} (GET)', () => {
    it('should get user permissions', async () => {
      const results = await client.getUserPermissions(
        mockContentSourceKey,
        'enterprise_search'
      )
      assert.deepEqual(results, { user: 'enterprise_search', permissions: [] })
    })
  })

  context('#permissions/{user} (POST)', () => {
    it('should update user permissions', async () => {
      const results = await client.updateUserPermissions(
        mockContentSourceKey,
        'enterprise_search',
        { permissions: ['permission1'] }
      )
      assert.deepEqual(results, {
        user: 'enterprise_search',
        permissions: ['permission1']
      })
    })
  })

  context('#permissions/{user}/add', () => {
    it('should add user permissions', async () => {
      const results = await client.addUserPermissions(
        mockContentSourceKey,
        'enterprise_search',
        { permissions: ['permission2'] }
      )
      assert.deepEqual(results, {
        user: 'enterprise_search',
        permissions: ['permission1', 'permission2']
      })
    })
  })

  context('#permissions/{user}/remove', () => {
    it('should remove user permissions', async () => {
      const results = await client.removeUserPermissions(
        mockContentSourceKey,
        'enterprise_search',
        { permissions: ['permission2'] }
      )
      assert.deepEqual(results, {
        user: 'enterprise_search',
        permissions: ['permission1']
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
        port: 443
      })
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
        port: 443
      })
    })
  })
})
