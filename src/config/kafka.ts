import { Consumer, EachMessagePayload, Kafka } from "kafkajs";
import { MessageBroker } from "../types/broker";
import { KafkaOrder, OrderStatus } from "../types/order";
import { createTransport } from "../factories/transport-factory";
import { Message } from "../types/transport";
import orderMessageGenerator from "../mail/orderMessageGenerator";

export class KafkaBroker implements MessageBroker {
  private consumer: Consumer;

  constructor(clientId: string, brokers: string[]) {
    const kafka = new Kafka({ clientId, brokers });

    this.consumer = kafka.consumer({ groupId: clientId });
  }

  /**
   * Connect the consumer
   */
  async connectConsumer() {
    await this.consumer.connect();
  }

  /**
   * Disconnect the consumer
   */
  async disconnectConsumer() {
    await this.consumer.disconnect();
  }

  async consumeMessage(topics: string[], fromBeginning: boolean = false) {
    await this.consumer.subscribe({ topics, fromBeginning });

    await this.consumer.run({
      eachMessage: async ({ topic, message }: EachMessagePayload) => {
        if (topic === "order") {
          const order: KafkaOrder = JSON.parse(message.value.toString());

          if (
            order.event_type === "ORDER_CREATED" ||
            (order.event_type === "ORDER_STATUS_UPDATED" &&
              order.data.orderStatus !== OrderStatus.RECEIVED)
          ) {
            try {
              const mailTransport = createTransport("mail");
              const mailMessage: Message = orderMessageGenerator(order);
              await mailTransport.send(mailMessage);
              console.log("Mail sent successfully");
            } catch (error) {
              console.log("Failed to send mail", error);
            }
          }
        }
      },
    });
  }
}
