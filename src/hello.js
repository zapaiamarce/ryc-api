const sgMail = require('@sendgrid/mail');
import { fromEvent } from 'graphcool-lib';
const { SENDGRID_API_KEY } = process.env;

export default async event => {
  const client = fromEvent(event);
  const api = client.api('simple/v1');

  const { email } = event.data;
  sgMail.setApiKey(SENDGRID_API_KEY);

  console.log('key', SENDGRID_API_KEY);

  const result = await api.request(`
    {
      User(email:"${email}"){ 
        id
      }
    }`
  );

  const userId = result.User.id;

  const token = await client.generateAuthToken(userId, 'User');


  const msg = {
    to: email,
    from: 'zapaiamarce@gmail.com',
    subject: 'Your R&C Token',
    // text: 'and easy to do anywhere, even with Node.js',
    html: `<strong>Your token: ${token}</strong>`,
  };

  await sgMail.send(msg);

  await new Promise(r => setTimeout(r, 50))

  return {
    data: {
      message: `Hello ${userId}`
    }
  }
}