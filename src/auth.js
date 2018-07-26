import { fromEvent } from 'graphcool-lib';
const sgMail = require('@sendgrid/mail');
const { SENDGRID_API_KEY } = process.env;
const cleanURL = url => url.replace(/^https?:\/\//i, "");

export default async event => {
  const client = fromEvent(event);
  const api = client.api('simple/v1');

  const { 
    email,
    dev,
    redirect
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
    from: 'R&C <admin@ricoycasero.com>',
    subject: 'Ingresar a Rico y Casero',

    html: `

        <div
          style="
            text-align:center;
            font-family: Helvetica, Arial;
          " 
        >
          <img src="https://res.cloudinary.com/dnamyvmsq/image/upload/w_300,q_100/ryc/logo-mail.png">

          <h1
            style="
              font-size:20px;
              font-weight:500;
              margin:40px 0;
            " 
          >
            Para ingresar a tu cuenta
          </h1>

          <a 
            style="
              display:inline-block; 
              color:white; 
              background-color:#41DDC1; 
              padding:15px;
              font-size:16px;
              width:285px;
              border-radius:2px;
              text-decoration:none;
            " 
            href="${linkHostname}auth?token=${token}&redirect=${cleanURL(redirect)}"
          >
            Hacé click en este botón
          </a>
          
        </div>
      
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