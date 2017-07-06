# Node.js client for the Swiftype Enterprise Api

## Installation

With npm:

    npm install swiftype-enterprise-node

or clone locally:

    $ git clone git@github.com:swiftype/swiftype-enterprise-node.git
    $ cd swiftype-enterprise-node
    $ npm install

## Usage

### Setup

Create a new instance of the Swiftype Enterprise Client with your access token:

    const SwiftypeEnterpriseClient = require('swiftype-enterprise-node')
    const accessToken = '' // your access token
    const swiftype = new SwiftypeEnterpriseClient(accessToken)

### Indexing Documents

This example shows how to use the indexDocuments method, which blocks until all documents have either completed or failed indexing.
If not all of the documents have completed or failed indexing within 10 seconds, an Error is raised.
See the asyncIndexDocuments method below for an example on how to index documents without blocking.

    const contentSourceKey = '' // your content source key
    const documents = [
      {
        external_id: 1234,
        title: "5 Tips On Finding A Mentor",
        body: "The difference between a budding entrepreneur who merely shows promise and one who is already enjoying some success often comes down to mentoring.",
        url: "https://www.shopify.com/content/5-tips-on-finding-a-mentor"
      },
      {
        external_id: 1235,
        title: "How to Profit from Your Passions",
        body: "Want to know the secret to starting a successful business? Find a void and fill it.",
        url: "https://www.shopify.com/content/how-to-profit-from-your-passions"
      }
    ]

    swiftype.indexDocuments(contentSourceKey, documents)
    .then((documentReceipts) => {
      // handle document receipts
    })
    .catch((error) => {
      // handle error
    })

### Destroying Documents

    const contentSourceKey = '' // your content source key
    const documentExternalIds = [1234, 1235]

    swiftype.destroyDocuments(contentSourceKey, documentExternalIds)
    .then((destroyDocumentsResults) => {
      // handle destroy documents results
    })
    .catch((error) => {
      // handle error
    })


### Asynchronous Indexing

This example shows how to index documents without blocking.
When using this method, you are responsible for checking the indexing result for each document by using the documentReceipts method below.

    const contentSourceKey = '' // your content source key
    const documents = [
      {
        external_id: 1234,
        title: "5 Tips On Finding A Mentor",
        body: "The difference between a budding entrepreneur who merely shows promise and one who is already enjoying some success often comes down to mentoring.",
        url: "https://www.shopify.com/content/5-tips-on-finding-a-mentor"
      },
      {
        external_id: 1235,
        title: "How to Profit from Your Passions",
        body: "Want to know the secret to starting a successful business? Find a void and fill it.",
        url: "https://www.shopify.com/content/how-to-profit-from-your-passions"
      }
    ]

    swiftype.asyncIndexDocuments(contentSourceKey, documents)
    .then((documentReceiptIds) => {
      // handle document receipt IDs
    })
    .catch((error) => {
      // handle error
    })


### Checking Document Receipts

Works in conjunction with the asyncIndexDocuments method above.

    const contentSourceKey = '' // your content source key
    const documentReceiptIds = ['5955d6fafd28400169baf97e', '5955d6fafd28400169baf980'] // from calling asyncIndexDocuments

    swiftype.documentReceipts(documentReceiptIds)
    .then((documentReceipts) => {
      // handle document receipts
    })
    .catch((error) => {
      // handle error
    })


## Running Tests

    $ npm test
