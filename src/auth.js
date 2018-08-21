import { fromEvent } from 'graphcool-lib';
const sgMail = require('@sendgrid/mail');
const { SENDGRID_API_KEY } = process.env;
const cleanURL = (url="") => url.replace(/^https?:\/\//i, "");


export default async event => {
  const client = fromEvent(event);
  const api = client.api('simple/v1');

  const { 
    email,
    code
  } = event.data;

  const { AuthCode:existingAuthCode } = await api.request(`
    {
      AuthCode(email:"${email}"){ 
        id,
        code,
        failedAttempts,
        alreadyUsed
      }
    }
  `);

  const codeExistsAndIsValid = existingAuthCode && (existingAuthCode.code == code);

  if(existingAuthCode && existingAuthCode.alreadyUsed){
    return {
      error: {
        code:13,
        message:"Code already used, please generate a new one"
      }
    }
  }else if(existingAuthCode && existingAuthCode.failedAttempts >= 3){
    return {
      error: {
        code:12,
        message:"Maximum failed attemps for this code, please generate a new one"
      }
    }
  }else if(codeExistsAndIsValid){
    const { User:existingUser } = await api.request(`
      {
        User(email:"${email}"){ id }
      }
    `);
    const token = await client.generateAuthToken(existingUser.id, 'User');
    // await api.request(`
    //   mutation{
    //     updateAuthCode(
    //       id:"${existingAuthCode.id}"
    //       alreadyUsed:true
    //     ){
    //       id
    //     }
    //   }
    // `);

    return {
      data:{
        token
      }
    }
  }else{
    await api.request(`
      mutation{
        updateAuthCode(
          id:"${existingAuthCode.id}"
          failedAttempts:${existingAuthCode.failedAttempts+1}
        ){
          id
        }
      }
    `);

    return {
      error: {
        code:11,
        message:"Invalid email or code",
        debugMessage: "We should add validation in the frontend as well!",
        userFacingMessage: "Please supply a valid email address!"
      }
    }
  }
}