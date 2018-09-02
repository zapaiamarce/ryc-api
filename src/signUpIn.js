import { fromEvent } from "graphcool-lib";
import * as moment from "moment";

const sgMail = require('@sendgrid/mail');
const { SENDGRID_API_KEY } = process.env;

const EXISTING_USER_HEADEAR = "¡Hola, de nuevo!"
const NEW_USER_HEADER = "¡Bienvenid@! Ya estás list@ para pedir y publicar tus comidas favoritas."

sgMail.setApiKey(SENDGRID_API_KEY);

export default async event => {
  const client = fromEvent(event);
  const api = client.api('simple/v1');
  const code = Math.floor(Math.random() * (999999 - 100000)) + 100000

  const { email } = event.data;

  const { User:existingUser } = await api.request(`
    {
      User(email:"${email}"){ id }
    }
  `);

  if(!existingUser){
    const { createUser:newUser } = await api.request(`
      mutation{
        createUser(email:"${email}"){ id }
      }
    `);
  }

  const User = existingUser || newUser

  const { AuthCode:existingAuthCode } = await api.request(`
    {
      AuthCode(email:"${email}"){ id }
    }
  `);
  
  if(!existingAuthCode){
    const { createAuthCode:newAuthCode } = await api.request(`
      mutation{
        createAuthCode(email:"${email}"){ id }
      }
    `);
  }

  const AuthCode = existingAuthCode || newAuthCode;
  
  await api.request(`
    mutation{
      updateAuthCode(
        id:"${AuthCode.id}"
        code:"${code}",
        failedAttempts: 0,
        alreadyUsed: false
      ){
        id
      }
    }
  `);

  const emailHeader = existingUser ? EXISTING_USER_HEADEAR : NEW_USER_HEADER;

  const userId = User.id;
  const msg = {
    to: email,
    from: 'Rico y Casero <admin@ricoycasero.com>',
    subject: `Tu código es: ${code}`,

    html: `

        <div style="
            text-align:center;
            color:#333;
            font-family: proxima-nova, Lato, Arial;
        "> 
          <div style="
            background-color:#41DDC1;
            text-align:center;
            padding:25px 0 18px;
          ">
            <img
              style="height:25px"
              src="https://res.cloudinary.com/dnamyvmsq/image/upload/ryc/ryc_white.png" 
            />
          </div>
          
          <h1 style="
              font-size:26px;
              font-weight:500;
              text-align: center;
              margin-top:40px;
          ">
            ${emailHeader}
          </h1>

          <h2 style="
                font-size:18px;
                font-weight:500;
                text-align: center;
                margin:30px 0 0;
          ">
            Tu código para ingresar es:
          </h2>
          
          <div style="
            margin-top:10px; 
            text-align:center;
          ">
            <span style="
              display:inline-block; 
              color:white; 
              background-color:#353536; 
              padding:15px 40px;
              font-size:26px;
              border-radius:2px;
              text-decoration:none;
              font-family:Courier;
            ">
              ${code}
            </span>
          </div>
          <div style="
            margin-top:10px;
            color:#BBB;
            font-size: 12px;
            text-align:center;
          ">
            Generado el ${moment().format("D/M/YYYY HH:mm")}
          </div>
        </div>
      
    `,
  };

  await sgMail.send(msg);

  console.log(`code ${code}`)

  return {
    data: {
      message: `Hello ${userId}`
    }
  }
}