import { fromEvent } from 'graphcool-lib';
const sgMail = require('@sendgrid/mail');
const { SENDGRID_API_KEY } = process.env;
const cleanURL = (url="") => url.replace(/^https?:\/\//i, "");

const EXISTING_USER_TEXT = "¡Hola, de nuevo!"
const NEW_USER_TEXT = "¡Bienvenid@! Ya estás list@ para pedir y publicar tus comidas favoritas."
const NEW_USER_REDIRECT = "/me?firstTime=true"

export default async event => {
  const client = fromEvent(event);
  const api = client.api('simple/v1');

  const { 
    email,
    dev,
    redirect
  } = event.data;

  sgMail.setApiKey(SENDGRID_API_KEY);

  const {User:existingUser} = await api.request(`
    {
      User(email:"${email}"){ 
        id
      }
    }`
  );

  if(!existingUser){
    const {createUser:newUser} = await api.request(`
      mutation{
        createUser(email:"${email}"){
          id
        }
      }
    `);
  }

  const User = existingUser || newUser

  const emailMessage = existingUser ? EXISTING_USER_TEXT : NEW_USER_TEXT;
  const redirectAfterLogin = existingUser ? cleanURL(redirect) : NEW_USER_REDIRECT;

  const userId = User.id;

  const token = await client.generateAuthToken(userId, 'User');
  const linkHostname = dev ? 'http://localhost:8793/' : 'https://ricoycasero.herokuapp.com/';

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
              color:#222;
            " 
          >
            ${emailMessage}
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
            href="${linkHostname}auth?token=${token}&redirect=${redirectAfterLogin}"
          >
            Ingresar a tu cuenta
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