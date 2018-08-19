import { fromEvent } from 'graphcool-lib';
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
  console.log('a')
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
        code:"${code}"
      ){
        id
      }
    }
  `);

  const emailHeader = existingUser ? EXISTING_USER_HEADEAR : NEW_USER_HEADER;

  const userId = User.id;
  const msg = {
    to: email,
    from: 'R&C <admin@ricoycasero.com>',
    subject: 'Ingresar a Rico y Casero',

    html: `

        <div
          style="
            text-align:center;
            color:#333;
            font-family: proxima-nova, Lato, Arial;
          " 
        > 
          <table style="width:100%; border-spacing:0;">
            <tr>
              <td style="width:70px;">
                <img src="https://res.cloudinary.com/dnamyvmsq/image/upload/w_70/ryc/shield.png""> 
              </td>
              <td>
                <h1
                  style="
                    font-size:26px;
                    font-weight:500;
                    text-align: center;
                  " 
                >
                  ${emailHeader}
                </h1>
              </td>
              <td style="width:70px;"></td>
            </tr>
          </table>

          <h2
              style="
                font-size:18px;
                font-weight:500;
                text-align: center;
                margin:20px 0 0;
              " 
          >
            Tu código es:
          </h2>
          
          <div style="margin-top:20px;">
            <span
              style="
                display:inline-block; 
                color:white; 
                background-color:#41DDC1; 
                padding:15px;
                font-size:22px;
                width:285px;
                border-radius:2px;
                text-decoration:none;
                font-family:Courier;
              " 
            >
              ${code}
            </span>
          </div>
        </div>
      
    `,
  };

  await sgMail.send(msg);

  return {
    data: {
      message: `Hello ${userId}`
    }
  }
}