const assert = require('assert')
const SwiftypeEnterpriseClient = require('../lib/swiftypeEnterprise')
const replay  = require('replay')

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

describe('SwiftypeEnterpriseClient', () => {
  const swiftype = new SwiftypeEnterpriseClient(mockAccessToken)

  describe('#indexDocuments', () => {
    it('should index documents', done => {
      swiftype
        .indexDocuments(mockContentSourceKey, mockDocuments)
        .then(results => {
          assert.deepEqual(
            [
              { id: null, id: '1234', errors: [] },
              { id: null, id: '1235', errors: [] }
            ],
            results
          )
          done()
        })
        .catch(error => {
          done(error)
        })
    })
  })

  describe('#destroyDocuments', () => {
    it('should destroy documents', (done) => {
      swiftype.destroyDocuments(mockContentSourceKey, mockDocuments.map((doc) => doc.id))
      .then((documentDestroyResults) => {
        assert.deepEqual([{ id: 1234, success: true }, { id: 1235, success: true }], documentDestroyResults)
        done()
      })
      .catch((error) => {
        done(error)
      })
    })
  })
})
