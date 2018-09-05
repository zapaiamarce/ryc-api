import { fromEvent } from "graphcool-lib";
const algoliasearch = require("algoliasearch");
const {foodToIndex} = require('./lib/algolia')
const { ALGOLIA_APP_ID, ALGOLIA_API_KEY, ALGOLIA_INDEX_NAME } = process.env;

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

const action = async (event) => {
  const client = fromEvent(event);
  const api = client.api("simple/v1");

  await index.clearIndex();

  const { allFoods } = await api.request(`
    {
      allFoods{
        id
        title
        dates{
          delivery
          orderDeadline
        }
        cook{
          id
          deliveryCenterLocation
          deliveryRadiusInMeters
        }
      }
    }
  `);
  
  // console.log("allFoods", allFoods);
  
  allFoods.forEach(f => index.addObject(foodToIndex(f)));

  return {
    data: {
      response: "ok"
    }
  };
}

export default async event => {
  try{
    const res = await action(event)
  }catch(e){
    console.log(e)
  }

  return res
};