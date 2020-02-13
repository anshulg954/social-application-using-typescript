"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodeMailer = require("nodemailer");
const SendGrid = require("nodemailer-sendgrid-transport");
class NodeMailer {
    static initializeTransport() {
        return nodeMailer.createTransport(SendGrid({
            auth: {
                api_key: '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'
            }
        }));
    }
    static sendEmail(data) {
        return NodeMailer.initializeTransport().sendMail({
            from: 'anshulg954@outlook.com',
            to: data.to,
            subject: data.subject,
            html: data.html,
        });
    }
}
exports.NodeMailer = NodeMailer;
