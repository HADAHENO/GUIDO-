export interface ChatContext {
  conversationId?: string;
  metadata?: {
    [key: string]: any;
  };
}