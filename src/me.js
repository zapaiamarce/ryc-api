const sgMail = require('@sendgrid/mail');
import { fromEvent } from 'graphcool-lib';
console.log('test');

export default async event => {
  const client = fromEvent(event);
  const api = client.api('simple/v1');
  const userId = event.context.auth.nodeId;


  const { User } = await api.request(`
    {
      User(id:"${userId}"){ 
        email,
        id
      }
    }
  `);

  return {
    data: {
      me: User
    }
  }
}