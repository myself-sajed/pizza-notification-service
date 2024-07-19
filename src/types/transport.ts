export interface Message {
  to: string;
  text: string;
  html?: string;
  subject?: string;
}

export interface Transport {
  send: (message: Message) => Promise<void>;
}
