import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Tag, Spin, Empty, message, Row, Col, Statistic } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, CalendarOutlined, FileTextOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons';
import { MarkdownRenderer } from './MarkdownRenderer';
import { conversationApi } from '../services/api';
import type { Conversation } from '../types';

const { Title, Paragraph, Text } = Typography;

export function ConversationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadConversation();
  }, [id]);

  const loadConversation = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await conversationApi.get(parseInt(id));
      setConversation(data);
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError('加载对话详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !conversation) return;

    if (!window.confirm('确定要删除这条对话吗？')) {
      return;
    }

    try {
      setDeleting(true);
      await conversationApi.delete(parseInt(id));
      navigate('/');
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      message.error('删除失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return { color: 'red', text: '非常重要' };
    if (importance >= 6) return { color: 'orange', text: '重要' };
    if (importance >= 4) return { color: 'blue', text: '一般' };
    return { color: 'green', text: '普通' };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: '24px', color: '#666' }}>正在加载对话详情...</p>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Empty description={error || '对话不存在'} />
        <Button type="primary" onClick={() => navigate('/')} style={{ marginTop: '24px' }}>
          返回列表
        </Button>
      </div>
    );
  }

  const importanceStyle = getImportanceColor(conversation.importance);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
          返回列表
        </Button>
        <Button danger icon={<DeleteOutlined />} onClick={handleDelete} loading={deleting}>
          删除对话
        </Button>
      </div>

      <Card hoverable style={{ marginBottom: '24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 8, transition: 'all 0.3s' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'; }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title level={3} style={{ margin: 0 }}>{conversation.title}</Title>
            {conversation.date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', color: '#666' }}>
                <CalendarOutlined />
                <Text>{conversation.date}</Text>
              </div>
            )}
          </div>

          <Tag color={importanceStyle.color} icon={<FireOutlined />} style={{ flexShrink: 0 }}>
            {conversation.importance}/10 - {importanceStyle.text}
          </Tag>
        </div>

        {conversation.tags && conversation.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {conversation.tags.map((tag) => (
              <Tag key={tag} color="default">{tag}</Tag>
            ))}
          </div>
        )}

        <Paragraph ellipsis={{ rows: 3 }}>
          {conversation.summary}
        </Paragraph>
      </Card>

      <Card
        title={<Title level={4} style={{ margin: 0 }}>详细内容</Title>}
        hoverable
        style={{ marginBottom: '24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 8, transition: 'all 0.3s' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'; }}
      >
        {conversation.details ? (
          <MarkdownRenderer content={conversation.details} />
        ) : (
          <Text type="secondary">暂无详细内容</Text>
        )}
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ textAlign: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 8, transition: 'all 0.3s' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'; }}
          >
            <FileTextOutlined style={{ fontSize: '32px', color: '#f59e0b', marginBottom: '8px', display: 'block' }} />
            <Statistic
              title="字数"
              value={conversation.word_count || 0}
              valueStyle={{ fontSize: '24px', fontWeight: 600, color: '#262626' }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card hoverable style={{ textAlign: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 8, transition: 'all 0.3s' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'; }}
          >
            <ClockCircleOutlined style={{ fontSize: '32px', color: '#f97316', marginBottom: '8px', display: 'block' }} />
            <Statistic
              title="创建时间"
              value={conversation.created_at ? new Date(conversation.created_at).toLocaleString('zh-CN') : '-'}
              valueStyle={{ fontSize: '14px', color: '#262626' }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card hoverable style={{ textAlign: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 8, transition: 'all 0.3s' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'; }}
          >
            <ClockCircleOutlined style={{ fontSize: '32px', color: '#f43f5e', marginBottom: '8px', display: 'block' }} />
            <Statistic
              title="更新时间"
              value={conversation.updated_at ? new Date(conversation.updated_at).toLocaleString('zh-CN') : '-'}
              valueStyle={{ fontSize: '14px', color: '#262626' }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card hoverable style={{ textAlign: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 8, transition: 'all 0.3s' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'; }}
          >
            <FireOutlined style={{ fontSize: '32px', color: '#ec4899', marginBottom: '8px', display: 'block' }} />
            <Statistic
              title="ID"
              value={conversation.id}
              valueStyle={{ fontSize: '24px', fontWeight: 600, color: '#262626' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
