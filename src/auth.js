const sgMail = require('@sendgrid/mail');
import { fromEvent } from 'graphcool-lib';
const { SENDGRID_API_KEY } = process.env;

export default async event => {
  const client = fromEvent(event);
  const api = client.api('simple/v1');

  const { 
    email,
    dev,
  } = event.data;

  sgMail.setApiKey(SENDGRID_API_KEY);

  const result = await api.request(`
    {
      User(email:"${email}"){ 
        id
      }
    }`
  );

  const userId = result.User.id;

  const token = await client.generateAuthToken(userId, 'User');
  const linkHostname = dev ? 'http://localhost:8793/' : 'http://www.ricoycasero.com/';

  const msg = {
    to: email,
    from: 'zapaiamarce@gmail.com',
    subject: 'Tu cuenta de Rico y Casero',
    // text: 'and easy to do anywhere, even with Node.js',
    html: `
        <h1>
          Click en el siguiente link para ingresar:
        </h1>
        <a 
          style="
            display:inline-block; 
            color:white; 
            background-color:blue; 
            padding:20px;
          " 
          href="${linkHostname}auth?token=${token}"
        >
          Ingresar a tu cuenta
        </a>
      
    `,
  };

  await sgMail.send(msg);

  await new Promise(r => setTimeout(r, 50))

  return {
    data: {
      message: `Hello ${userId}`
    }
  }
}