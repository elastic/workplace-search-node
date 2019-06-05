const Client = require('./client')

const REQUIRED_TOP_LEVEL_KEYS = Object.freeze([
  'id',
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
   * Indexes documents into a content source identified by the contentSourceKey.
   * Returns a Promise, that when resolved returns an array of results for
   * each indexed document.
   */
  indexDocuments(contentSourceKey, documents) {
    documents.forEach(this.validateDocument)
    return this.client.post(
      `/sources/${contentSourceKey}/documents/bulk_create`,
      documents
    )
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
