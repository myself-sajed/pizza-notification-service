import { MailTransport } from "../mail/mail";
import { Transport } from "../types/transport";

const transport: Transport[] = [];

export function createTransport(transportType: "mail" | "sms") {
  switch (transportType) {
    case "mail": {
      const cachedTransport = transport.find(
        (item) => item instanceof MailTransport,
      );
      if (cachedTransport) return cachedTransport;
      const mailTransport = new MailTransport();
      transport.push(mailTransport);
      return mailTransport;
    }

    case "sms":
      console.log("SMS do not support yet");
      break;

    default:
      console.log(`${transportType} does not support yet`);
  }
}
