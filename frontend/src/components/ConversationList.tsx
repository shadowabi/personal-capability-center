import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Pagination, Button, Tag, Empty, Spin, Typography } from 'antd';
import { DeleteOutlined, CalendarOutlined, MessageOutlined, FireOutlined } from '@ant-design/icons';
import { conversationApi } from '../services/api';
import type { Conversation } from '../types';

const { Title, Paragraph, Text } = Typography;

export function ConversationList() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadConversations();
  }, [page]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await conversationApi.list(page, 10);
      setConversations(response.items || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这条对话吗？')) {
      try {
        await conversationApi.delete(id);
        loadConversations();
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    }
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return { color: 'red', text: '高重要性' };
    if (importance >= 6) return { color: 'orange', text: '中重要性' };
    return { color: 'green', text: '普通' };
  };

  const renderConversation = useCallback((item: Conversation) => {
    const importanceStyle = getImportanceColor(item.importance);

    return (
      <Card
        key={item.id}
        hoverable
        onClick={() => navigate(`/conversation/${item.id}`)}
        style={{ marginBottom: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 8, transition: 'all 0.3s', cursor: 'pointer' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'; }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <Title level={5} style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</Title>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#999', marginTop: '8px' }}>
              {item.date && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                  <CalendarOutlined />
                  {item.date}
                </span>
              )}
              {item.word_count > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                  <MessageOutlined />
                  {item.word_count} 字
                </span>
              )}
            </div>
          </div>

          <Tag color={importanceStyle.color} icon={<FireOutlined />} style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
            {item.importance}/10
          </Tag>
        </div>

        <Paragraph
          ellipsis={{ rows: 2 }}
          style={{ marginBottom: '16px' }}
        >
          {item.summary}
        </Paragraph>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          {item.tags && item.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {item.tags.map((tag) => (
                <Tag key={tag} color="default">{tag}</Tag>
              ))}
            </div>
          )}

          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.id);
            }}
          >
            删除
          </Button>
        </div>
      </Card>
    );
  }, [navigate, handleDelete]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>能力记录</Title>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : conversations.length === 0 ? (
        <Empty description="暂无对话记录" />
      ) : (
        <>
          <div>
            {conversations.map(renderConversation)}
          </div>

          {total > 0 && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Pagination
                current={page}
                total={total}
                pageSize={10}
                onChange={setPage}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
