// Email verification utility removed
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendToken = async (token)=>{
    try{
        const msg={
            to: email,
            from:process.env.SENDGRID_FROM,
            subject: 'These is your token',
            html:`
                <div>
                        ${token}
                </div>
            `
        };
        await sgMail.send(msg);
        console.log(msg);
    }catch(error){
        console.log(err);
        
    }
}
module.exports = {sendToken}