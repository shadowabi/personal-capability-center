import axios from 'axios';
import type {
  Conversation,
  ConversationCreate,
  ConversationUpdate,
  Statistics,
  TagUsage,
  TopicUsage,
  SearchResponse,
  ConversationsResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const OPENCODE_API_URL = import.meta.env.VITE_OPENCODE_API_URL || 'http://localhost:4096';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const opencodeApi = axios.create({
  baseURL: OPENCODE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const conversationApi = {
  // 获取对话列表
  list: async (page: number = 1, pageSize: number = 10, sortBy: string = 'date') => {
    const response = await api.get<ConversationsResponse>('/conversations', {
      params: { page, page_size: pageSize, sort_by: sortBy },
    });
    return response.data;
  },

  // 获取对话详情
  get: async (id: number) => {
    const response = await api.get<Conversation>(`/conversations/${id}`);
    return response.data;
  },

  // 创建对话
  create: async (data: ConversationCreate) => {
    const response = await api.post<Conversation>('/conversations', data);
    return response.data;
  },

  // 更新对话
  update: async (id: number, data: ConversationUpdate) => {
    const response = await api.put<Conversation>(`/conversations/${id}`, data);
    return response.data;
  },

  // 删除对话
  delete: async (id: number) => {
    await api.delete(`/conversations/${id}`);
  },
};

export const searchApi = {
  // 关键词搜索
  byKeyword: async (keyword: string, page: number = 1, pageSize: number = 10) => {
    const response = await api.get<SearchResponse>('/search/keyword', {
      params: { keyword, page, page_size: pageSize },
    });
    return response.data;
  },

  // 标签搜索
  byTags: async (tags: string[], page: number = 1, pageSize: number = 10) => {
    const response = await api.get<SearchResponse>('/search/tags', {
      params: { tags: tags.join(','), page, page_size: pageSize },
    });
    return response.data;
  },

  // 日期范围搜索
  byDateRange: async (startDate: string, endDate: string, page: number = 1, pageSize: number = 10) => {
    const response = await api.get<SearchResponse>('/search/date-range', {
      params: { start_date: startDate, end_date: endDate, page, page_size: pageSize },
    });
    return response.data;
  },

  // 重要性搜索
  byImportance: async (minImportance: number, maxImportance: number, page: number = 1, pageSize: number = 10) => {
    const response = await api.get<SearchResponse>('/search/importance', {
      params: { min_importance: minImportance, max_importance: maxImportance, page, page_size: pageSize },
    });
    return response.data;
  },

  // 相似度搜索
  bySimilarity: async (query: string, limit: number = 10) => {
    const response = await api.get<SearchResponse>('/search/similar', {
      params: { query, limit },
    });
    return response.data;
  },
};

export const statisticsApi = {
  // 获取统计信息
  get: async () => {
    const response = await api.get<Statistics>('/statistics');
    return response.data;
  },

  // 获取所有标签
  getAllTags: async () => {
    const response = await api.get<string[]>('/statistics/tags');
    return response.data;
  },

  // 获取热门标签
  getTopTags: async (limit: number = 10) => {
    const response = await api.get<TagUsage[]>('/statistics/tags/top', {
      params: { limit },
    });
    return response.data;
  },

  // 获取话题统计
  getTopics: async () => {
    const response = await api.get<TopicUsage[]>('/statistics/topics');
    return response.data;
  },
};

export interface SummaryResponse {
  summary: string;
  type: string;
  session_id?: string;
}

export const summaryApi = {
  getMonthly: async () => {
    const response = await api.get<SummaryResponse>('/summary/monthly');
    return response.data.summary;
  },

  getYearly: async () => {
    const response = await api.get<SummaryResponse>('/summary/yearly');
    return response.data.summary;
  },
};

export default api;
