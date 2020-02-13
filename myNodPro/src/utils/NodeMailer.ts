import * as nodeMailer from "nodemailer";
import * as SendGrid from "nodemailer-sendgrid-transport";


export class NodeMailer{

        private static initializeTransport(){
          return nodeMailer.createTransport(SendGrid({
            auth:{
                api_key:'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'
            }

          }))  
        }
       static sendEmail(data:{to:[string],subject:string,html:string}): any{
          return NodeMailer.initializeTransport().sendMail(
               {
                from:'anshulg954@outlook.com',
                to:data.to,
                subject:data.subject,
                html:data.html,
            });
       }
        
}