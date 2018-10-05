import {addCook} from "./lib/airtable"

const sendCook = async event => {
  try{
    addCook(event.data)
    return {
      data:{
        message:"ok"
      }
    }
  }catch(e){
    console.log(e)
    return {
      data:{
        message:"not ok"
      }
    }
  }
}

export default async event => {
  try{
    return sendCook(event)
  }catch(e){
    console.log(e)
  }
}
