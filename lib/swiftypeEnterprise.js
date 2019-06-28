const Client = require('./client')


class SwiftypeEnterpriseClient {

    constructor(accessToken, baseUrl = 'http://localhost:3002/api/v1/ent') {
    this.client = new Client(accessToken, baseUrl)
  }

   /**
   * Indexes documents into a content source identified by the contentSourceKey.
   * Returns a Promise, that when resolved returns an array of results for
   * each indexed document.
   */
  indexDocuments(contentSourceKey, documents) {
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
