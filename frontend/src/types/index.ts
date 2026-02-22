export interface Conversation {
  id: number;
  date: string;
  title: string;
  summary: string;
  details: string;
  tags: string[];
  importance: number;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationCreate {
  title: string;
  summary: string;
  details: string;
  tags: string[];
  importance?: number;
}

export interface ConversationUpdate {
  title?: string;
  summary?: string;
  details?: string;
  tags?: string[];
  importance?: number;
}

export interface Statistics {
  total_conversations: number;
  with_vectors: number;
  high_importance: number;
  avg_words: number;
  max_importance: number;
  min_importance: number;
}

export interface TagUsage {
  tag: string;
  usage_count: number;
}

export interface TopicUsage {
  topic: string;
  usage_count: number;
}

export type SearchResponse = Conversation[];

export interface ConversationsResponse {
  items: Conversation[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
