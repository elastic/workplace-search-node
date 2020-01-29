const Client = require('./client')

class WorkplaceSearchClient {
  constructor(accessToken, baseUrl = 'http://localhost:3002/api/ws/v1') {
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
    return this.client.post(
      `/sources/${contentSourceKey}/documents/bulk_destroy`,
      documentIds
    )
  }

  /**
   * Lists users permissions for a content source identified by the contentSourceKey.
   */
  listAllPermissions(contentSourceKey, pageParams) {
    const pageParamsForQuery = pageParams
      ? {
          ...(pageParams.currentPage && {
            'page[current]': pageParams.currentPage
          }),
          ...(pageParams.pageSize && { 'page[size]': pageParams.pageSize })
        }
      : undefined

    return this.client.get(
      `/sources/${contentSourceKey}/permissions`,
      pageParamsForQuery
    )
  }

  getUserPermissions(contentSourceKey, user) {
    return this.client.get(`/sources/${contentSourceKey}/permissions/${user}`)
  }

  updateUserPermissions(contentSourceKey, user, permissions) {
    return this.client.post(
      `/sources/${contentSourceKey}/permissions/${user}`,
      permissions
    )
  }

  addUserPermissions(contentSourceKey, user, permissions) {
    return this.client.post(
      `/sources/${contentSourceKey}/permissions/${user}/add`,
      permissions
    )
  }

  removeUserPermissions(contentSourceKey, user, permissions) {
    return this.client.post(
      `/sources/${contentSourceKey}/permissions/${user}/remove`,
      permissions
    )
  }
}

module.exports = WorkplaceSearchClient
