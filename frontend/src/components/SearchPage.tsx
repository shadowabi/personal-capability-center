import { useState, useEffect, useCallback, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Tag, Radio, Spin, Empty, message, Typography, Space } from 'antd';
import { SearchOutlined, TagsOutlined, FireOutlined, CloseOutlined } from '@ant-design/icons';
import { searchApi, statisticsApi } from '../services/api';
import type { Conversation } from '../types';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

export function SearchPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [importanceMin, setImportanceMin] = useState<number | null>(null);
  const [results, setResults] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [, startTransition] = useTransition();

  const hasResults = results.length > 0;

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const tags = await statisticsApi.getAllTags();
      setAllTags(tags || []);
    } catch (error) {
      console.error('Failed to load tags:', error);
      message.error('加载标签失败');
    }
  };

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);

    try {
      let conversations: Conversation[] = [];
      
      if (keyword) {
        conversations = await searchApi.byKeyword(keyword);
      } else if (selectedTags.length > 0) {
        conversations = await searchApi.byTags(selectedTags);
      } else if (importanceMin !== null) {
        conversations = await searchApi.byImportance(importanceMin, 10);
      } else {
        conversations = await searchApi.byKeyword("");
      }
      
      startTransition(() => {
        setResults(conversations);
      });
    } catch (error) {
      console.error('Failed to search:', error);
      message.error('搜索失败');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedTags, importanceMin, startTransition]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const clearAll = useCallback(() => {
    setKeyword('');
    setSelectedTags([]);
    setImportanceMin(null);
    setResults([]);
    setHasSearched(false);
  }, []);

  const renderConversation = useCallback((conv: Conversation) => {
    const getImportanceColor = (importance: number) => {
      if (importance >= 8) return 'red';
      if (importance >= 6) return 'orange';
      return 'green';
    };

    return (
      <Card
        key={conv.id}
        hoverable
        onClick={() => navigate(`/conversation/${conv.id}`)}
        style={{ marginBottom: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 8, transition: 'all 0.3s', cursor: 'pointer' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'; }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <Title level={5} style={{ margin: 0 }}>{conv.title}</Title>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#999', marginTop: '8px' }}>
              {conv.date && <Text>{conv.date}</Text>}
              {conv.word_count > 0 && <Text>{conv.word_count} 字</Text>}
            </div>
          </div>

          <Tag color={getImportanceColor(conv.importance)} icon={<FireOutlined />} style={{ flexShrink: 0 }}>
            {conv.importance}/10
          </Tag>
        </div>

        <Paragraph
          ellipsis={{ rows: 2 }}
          style={{ marginBottom: '16px' }}
        >
          {conv.summary}
        </Paragraph>

        {conv.tags && conv.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {conv.tags.map((tag) => (
              <Tag key={tag} color="default">{tag}</Tag>
            ))}
          </div>
        )}
      </Card>
    );
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
      <Card style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>搜索记录</Title>

        <div style={{ marginBottom: '24px' }}>
          <Search
            placeholder="搜索关键词..."
            enterButton="搜索"
            size="large"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
            loading={loading}
            prefix={<SearchOutlined />}
            allowClear
          />
        </div>

        {allTags.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <Title level={5} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TagsOutlined />
              标签筛选
            </Title>
            <Space size={[8, 8]} wrap>
              {allTags.map((tag) => (
                <Tag.CheckableTag
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onChange={() => toggleTag(tag)}
                >
                  {tag}
                </Tag.CheckableTag>
              ))}
            </Space>
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <Title level={5} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FireOutlined />
            重要性筛选
          </Title>
          <Radio.Group 
            value={importanceMin}
            onChange={(e) => setImportanceMin(e.target.value)}
            size="large"
          >
            <Radio.Button value={null}>全部</Radio.Button>
            <Radio.Button value={7}>7+</Radio.Button>
            <Radio.Button value={8}>8+</Radio.Button>
            <Radio.Button value={9}>9+</Radio.Button>
          </Radio.Group>
        </div>

        <Space style={{ width: '100%' }}>
          <Button
            type="primary"
            size="large"
            onClick={handleSearch}
            loading={loading}
            icon={<SearchOutlined />}
            style={{ flex: 1 }}
          >
            搜索
          </Button>

          <Button
            size="large"
            onClick={clearAll}
            icon={<CloseOutlined />}
          >
            清空
          </Button>
        </Space>
      </Card>

      {hasSearched && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <Spin size="large" tip="搜索中..." />
            </div>
          ) : hasResults ? (
            <>
              <Title level={4}>找到 {results.length} 条结果</Title>
              <div>
                {results.map(renderConversation)}
              </div>
            </>
          ) : (
            <Empty description="未找到匹配的结果" />
          )}
        </div>
      )}
    </div>
  );
}
