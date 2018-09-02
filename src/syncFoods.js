const {foodToIndex} = require('./lib/algolia')
const algoliasearch = require('algoliasearch')

const {
  ALGOLIA_APP_ID,
  ALGOLIA_API_KEY,
  ALGOLIA_INDEX_NAME,
} = process.env;

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY)
const index = client.initIndex(ALGOLIA_INDEX_NAME)

const modelName = 'Food'

module.exports = event => {

  const mutation = event.data[modelName].mutation
  const node = event.data[modelName].node
  const previousValues = event.data[modelName].previousValues
  
  console.log('Sync ',mutation, node || previousValues)

  switch (mutation) {
    case 'CREATED':
      return index.addObject(node)
    case 'UPDATED':
      return index.saveObject(node)
    case 'DELETED':
      return index.deleteObject(previousValues.id) 
    default:
      console.log(`mutation was '${mutation}'. Unable to sync node.`)
      return Promise.resolve()
  }
}