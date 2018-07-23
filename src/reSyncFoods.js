const algoliasearch = require('algoliasearch');
import { fromEvent } from 'graphcool-lib';

const {
  ALGOLIA_APP_ID,
  ALGOLIA_API_KEY,
  ALGOLIA_INDEX_NAME,
} = process.env;

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY)
const index = client.initIndex(ALGOLIA_INDEX_NAME)

export default async event => {
  const client = fromEvent(event);
  const api = client.api('simple/v1');

  await index.clearIndex();
  
  const { allFoods } = await api.request(`
    {
      allFoods{
        id
        addressstr
        title
        _geoloc: location
      }
    }
  `);

  // console.log(allFoods);
  
  allFoods.forEach(f => index.addObject(f))

  return {
    data:{
      response: "ok"
    }
  }

}