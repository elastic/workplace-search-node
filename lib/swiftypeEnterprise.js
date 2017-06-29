const Client = require('./client')

const REQUIRED_TOP_LEVEL_KEYS = Object.freeze([
  'external_id',
  'url',
  'title',
  'body'
])
const OPTIONAL_TOP_LEVEL_KEYS = Object.freeze([
  'created_at',
  'updated_at',
  'type'
])
const CORE_TOP_LEVEL_KEYS = Object.freeze(REQUIRED_TOP_LEVEL_KEYS + OPTIONAL_TOP_LEVEL_KEYS)

class SwiftypeEnterpriseClient {

  constructor(accessToken, baseUrl = 'https://api.swiftype.com/api/v1/ent') {
    this.client = new Client(accessToken, baseUrl)
  }

  validateDocument(doc) {
    const docKeys = Object.keys(doc)
    const missingKeys = REQUIRED_TOP_LEVEL_KEYS.filter((key) => !docKeys.includes(key))
    if (missingKeys.length > 0) {
      throw new Error(`Missing required keys: ${missingKeys.join(',')}`)
    }
    const invalidKeys = docKeys.filter((key) => !CORE_TOP_LEVEL_KEYS.includes(key))
    if (invalidKeys.length > 0) {
      throw new Error(`Invalid keys: ${invalidKeys.join(',')}. Valid keys are: ${CORE_TOP_LEVEL_KEYS}.`)
    }
  }

 /**
  * To be used with the asyncIndexDocuments method.
  * Returns a Promise, that when resolved returns an array of document receipt Objects.
  * The returned Promise is rejected if an error occurs.
  */
  documentReceipts(documentReceiptIds) {
    return this.client.get(`/document_receipts/bulk_show`, { ids: documentReceiptIds.join(',') })
  }

 /**
  * Indexes documents into a content source identified by the contentSourceKey.
  * Returns a Promise, that when resolved returns an array of document receipt Ids.
  *
  * As opposed to the indexDocuments method, this method does not block.
  * The returned Promise is rejected if an error occurs.
  */
  asyncIndexDocuments(contentSourceKey, documents) {
    documents.forEach(this.validateDocument)
    return this.client.post(`/sources/${contentSourceKey}/documents/bulk_create`, documents, (body) => {
      return body['document_receipts'].map((documentReceipt) => documentReceipt['id'])
    })
  }

 /**
  * Indexes documents into a content source identified by the contentSourceKey.
  * Returns a Promise, that when resolved returns an array of document receipt Objects.
  *
  * Blocks for up to 10 seconds waiting for all documents to either complete or fail indexing.
  * The returned Promise is rejected if the timeout elaspes, or if some other error occurs.
  */
  indexDocuments(contentSourceKey, documents) {
    return new Promise((resolve, reject) => {
      this.asyncIndexDocuments(contentSourceKey, documents)
      .then((receiptIds) => {
        const timeoutAt = new Date().getTime() + 10000
        const interval = setInterval(() => {
          this.documentReceipts(receiptIds)
          .then((receipts) => {
            if (receipts.every((receipt) => receipt['status'] !== 'pending')) {
              clearInterval(interval)
              resolve(receipts)
            } else if (new Date().getTime() > timeoutAt) {
              clearInterval(interval)
              reject(new Error('Request timed out'))
            }
          })
          .catch((error) => {
            clearInterval(interval)
            reject(error)
          })
        }, 100)
      })
      .catch((error) => {
        reject(error)
      })
    })
  }

 /**
  * Destroys documents from a content source identified by the contentSourceKey.
  * Returns a Promise, that when resolved returns an array of document destruction Objects.
  * The returned Promise is rejected if an error occurs.
  */
  destroyDocuments(contentSourceKey, documentIds) {
    return this.client.post(`/sources/${contentSourceKey}/documents/bulk_destroy`, documentIds)
  }
}

module.exports = SwiftypeEnterpriseClient
