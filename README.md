<p align="center"><img src="https://github.com/elastic/enterprise-search-node/blob/master/logo-enterprise-search.png?raw=true" alt="Elastic Enterprise Search Logo"></p>

<p align="center"><a href="https://circleci.com/gh/elastic/enterprise-search-node"><img src="https://circleci.com/gh/elastic/enterprise-search-node.svg?style=svg" alt="CircleCI build"></a></p>

> A first-party Node.js client for [Elastic Enterprise Search](https://www.elastic.co/solutions/enterprise-search).

## Contents

- [Getting started](#getting-started-)
- [Usage](#usage)
- [FAQ](#faq-)
- [Contribute](#contribute-)
- [License](#license-)

---

## Getting started 🐣

With npm:

```bash
npm install @elastic/enterprise-search-node
```

or clone locally:

```bash
git clone git@github.com:elastic/enterprise-search-node.git
cd enterprise-search-node
npm install
```

## Usage

Create a new instance of the Elastic Enterprise Search Client with your access token:

```javascript
const EnterpriseSearchClient = require('@elastic/enterprise-search-node')
const accessToken = '' // your access token
const client = new EnterpriseSearchClient(accessToken)
```

### Change API endpoint

```javascript
const client = new EnterpriseSearchClient(
  accessToken,
  'https://your-server.example.com/api/v1/ent'
)
```

### Indexing Documents

This example shows how to use the indexDocuments method:

```javascript
const contentSourceKey = '' // your content source key
const documents = [
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

client
  .indexDocuments(contentSourceKey, documents)
  .then(results => {
    // handle results
  })
  .catch(error => {
    // handle error
  })
```

### Destroying Documents

```javascript
const contentSourceKey = '' // your content source key
const documentIds = [1234, 1235]

client
  .destroyDocuments(contentSourceKey, documentIds)
  .then(destroyDocumentsResults => {
    // handle destroy documents results
  })
  .catch(error => {
    // handle error
  })
```

### Getting permissions list

```javascript
const contentSourceKey = '' // your content source key
const pageParams = { currentPage: 2, pageSize: 20 } // optional argument

client
  .getPermissions(contentSourceKey, pageParams)
  .then(response => {
    // handle response
  })
  .catch(error => {
    // handle error
  })
```

### Getting user permissions

```javascript
const contentSourceKey = '' // your content source key
const user = 'elastic'

client
  .getUserPermissions(contentSourceKey, user)
  .then(response => {
    // handle response
  })
  .catch(error => {
    // handle error
  })
```

### Updating user permissions

```javascript
const contentSourceKey = '' // your content source key
const user = 'enterprise_search' // username
const permissions = ['permission1', 'permission2'] // array of permissions to assign to the user

client
  .updateUserPermissions(contentSourceKey, user, permissions)
  .then(response => {
    // handle response
  })
  .catch(error => {
    // handle error
  })
```

### Adding user permissions

```javascript
const contentSourceKey = '' // your content source key
const user = 'enterprise_search' // username
const permissions = ['permission2'] // array of permissions to add to the user

client
  .addUserPermissions(contentSourceKey, user, permissions)
  .then(response => {
    // handle response
  })
  .catch(error => {
    // handle error
  })
```

## Running tests

Run tests via npm:

```bash
$ npm test
```

## FAQ 🔮

### Where do I report issues with the client?

If something is not working as expected, please open an [issue](https://github.com/elastic/enterprise-search-node/issues/new).

## Contribute 🚀

We welcome contributors to the project. Before you begin, a couple notes...

- Before opening a pull request, please create an issue to [discuss the scope of your proposal](https://github.com/elastic/enterprise-search-node/issues).
- Please write simple code and concise documentation, when appropriate.

## License 📗

[Apache 2.0](https://github.com/elastic/enterprise-search-node/blob/master/LICENSE.txt) © [Elastic](https://github.com/elastic)

Thank you to all the [contributors](https://github.com/elastic/enterprise-search-node/graphs/contributors)!
