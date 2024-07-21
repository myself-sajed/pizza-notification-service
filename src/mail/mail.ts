import nodemailer, { Transporter } from "nodemailer";
import { Message, Transport } from "../types/transport";
import config from "config";
import logger from "../config/logger";

export class MailTransport implements Transport {
  private transporter: Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      // host: config.get("transport.mail.host"),
      // port: config.get("transport.mail.port"),
      // secure: config.get("transport.mail.secure"),
      service: config.get("transport.mail.service"),
      auth: {
        user: config.get("transport.mail.auth.user"),
        pass: config.get("transport.mail.auth.pass"),
      },
    });
  }

  async send(message: Message) {
    const info = await this.transporter.sendMail({
      from: config.get("transport.mail.from"),
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    logger.info({
      messageId: info.messageId,
      message: { ...message, html: "sent" },
    });
  }
}
