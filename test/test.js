const assert = require('assert')
const SwiftypeEnterpriseClient = require('../lib/swiftypeEnterprise')
const replay  = require('replay');

const mockAccessToken = 'mockAccessToken'
const mockContentSourceKey = 'mockContentSourceKey'
const mockDocuments = [
  {
    external_id: 1234,
    title: '5 Tips On Finding A Mentor',
    body: 'The difference between a budding entrepreneur who merely shows promise and one who is already enjoying some success often comes down to mentoring.',
    url: 'https://www.shopify.com/content/5-tips-on-finding-a-mentor'
  },
  {
    external_id: 1235,
    title: 'How to Profit from Your Passions',
    body: 'Want to know the secret to starting a successful business? Find a void and fill it.',
    url: 'https://www.shopify.com/content/how-to-profit-from-your-passions'
  }
]

describe('SwiftypeEnterpriseClient', () => {
  const swiftype = new SwiftypeEnterpriseClient(mockAccessToken)

  describe('#asyncIndexDocuments', () => {
    it('should index documents asynchronously', (done) => {
      swiftype.asyncIndexDocuments(mockContentSourceKey, mockDocuments)
      .then((documentReceiptIds) => {
        assert.deepEqual(['5955d6fafd28400169baf97e', '5955d6fafd28400169baf980'], documentReceiptIds)
        done()
      })
      .catch((error) => {
        done(error)
      })
    })
  })

  describe('#indexDocuments', () => {
    it('should index documents synchronously', (done) => {
      swiftype.indexDocuments(mockContentSourceKey, mockDocuments)
      .then((documentReceipts) => {
        assert.deepEqual([
          {
            id: '5955d6fafd28400169baf97e',
            external_id: '1234',
            status: 'complete',
            errors: [],
            links: {
              document_receipt:'https://api.swiftype.com/api/v1/ent/document_receipts/5955d6fafd28400169baf97e'
            }
          },
          {
            id: '5955d6fafd28400169baf980',
            external_id: '1235',
            status: 'complete',
            errors: [],
            links: {
              document_receipt: 'https://api.swiftype.com/api/v1/ent/document_receipts/5955d6fafd28400169baf980'
            }
          }
        ], documentReceipts)
        done()
      })
      .catch((error) => {
        done(error)
      })
    })
  })

  describe('#destroyDocuments', () => {
    it('should destroy documents', (done) => {
      swiftype.destroyDocuments(mockContentSourceKey, mockDocuments.map((doc) => doc.external_id))
      .then((documentDestroyResults) => {
        assert.deepEqual([{ external_id: 1234, success: true }, { external_id: 1235, success: true }], documentDestroyResults)
        done()
      })
      .catch((error) => {
        done(error)
      })
    })
  })
})



