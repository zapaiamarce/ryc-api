const sgMail = require('@sendgrid/mail');
import { fromEvent } from 'graphcool-lib';

export default async event => {
  const client = fromEvent(event);
  const api = client.api('simple/v1');
  const {auth} = event.context;
  
  if(auth && auth.nodeId){
    try {
      const userId = auth.nodeId;
      const { User } = await api.request(`
        {
          User(id:"${userId}"){ 
            email,
            id,
            fullName,
            deliveryCenterLocation,
            deliveryRadiusInMeters
          }
        }
      `);
    } catch (error) {
      console.log(error)
    }
  }
  
  return {
    data: User || null
  }
}