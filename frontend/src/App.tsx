import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, Typography, Statistic, Row, Col, Spin, Empty, Card, Descriptions, Tag, Divider } from 'antd';
import { FileTextOutlined, DatabaseOutlined, FireOutlined } from '@ant-design/icons';
import { ConversationList } from './components/ConversationList';
import { ConversationDetail } from './components/ConversationDetail';
import { SearchPage } from './components/SearchPage';
import { SummaryPage } from './components/SummaryPage';
import { statisticsApi } from './services/api';
import type { Statistics } from './types';
import { antdConfig } from './theme/antd';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatistics = useCallback(async () => {
    try {
      const data = await statisticsApi.get();
      setStats(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const menuItems = [
    { key: '/', label: '记录', icon: null },
    { key: '/search', label: '搜索', icon: null },
    { key: '/summary', label: '总结', icon: null },
    { key: '/statistics', label: '统计', icon: null },
  ];

  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    navigate(key);
  }, [navigate]);

  return (
    <ConfigProvider {...antdConfig}>
      <Layout className="min-h-screen bg-gray-50">
        <Header style={{ position: 'fixed', width: '100%', zIndex: 1000, top: 0, background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <div style={{ padding: '8px', background: '#f59e0b', borderRadius: '8px', flexShrink: 0 }}>
                <svg style={{ width: '24px', height: '24px', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: '1.2' }}>
                <Title level={5} style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Personal Capability Center</Title>
                <p style={{ fontSize: '11px', color: '#999', margin: 0, marginTop: '2px' }}>个人能力中心</p>
              </div>
            </div>

            {stats && (
              <Row gutter={16} className="hidden md:flex">
                <Col>
                  <Statistic
                    title="对话"
                    value={stats.total_conversations}
                    valueStyle={{ fontSize: '24px' }}
                  />
                </Col>
                <Col>
                  <div style={{ height: '48px', width: '1px', background: '#f0f0f0' }}></div>
                </Col>
                <Col>
                  <Statistic
                    title="平均字数"
                    value={Math.round(stats.avg_words || 0)}
                    valueStyle={{ fontSize: '24px' }}
                  />
                </Col>
              </Row>
            )}
          </div>
        </Header>

        <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 999, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={handleMenuClick}
              style={{ borderBottom: 'none' }}
            />
          </div>
        </div>

        <Content style={{ padding: '24px', paddingTop: '130px', background: '#ffffff', minHeight: '100vh' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Routes>
              <Route path="/" element={<ConversationList />} />
              <Route path="/conversation/:id" element={<ConversationDetail />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/summary" element={<SummaryPage />} />
              <Route path="/statistics" element={
              loading ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <Spin size="large" tip="加载统计数据中..." />
                </div>
              ) : stats ? (
                <div>
                  <Title level={2} style={{ marginBottom: '24px' }}>统计数据</Title>
                   
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                      <Card hoverable style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 8, transition: 'all 0.3s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'; }}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#e6f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                            <DatabaseOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                          </div>
                          <Statistic
                            title="总对话"
                            value={stats.total_conversations || 0}
                            valueStyle={{ fontSize: '24px', fontWeight: 600, color: '#262626' }}
                          />
                          <Text type="secondary">条记录</Text>
                        </div>
                      </Card>
                    </Col>
                    
                    <Col xs={24} sm={12} lg={6}>
                      <Card hoverable style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 8, transition: 'all 0.3s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'; }}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#fff7e6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                            <DatabaseOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />
                          </div>
                          <Statistic
                            title="已向量化"
                            value={stats.with_vectors || 0}
                            valueStyle={{ fontSize: '24px', fontWeight: 600, color: '#262626' }}
                          />
                          <Text type="secondary">条记录</Text>
                        </div>
                      </Card>
                    </Col>
                    
                    <Col xs={24} sm={12} lg={6}>
                      <Card hoverable style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 8, transition: 'all 0.3s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'; }}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#fff1f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                            <FireOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
                          </div>
                          <Statistic
                            title="高重要性"
                            value={stats.high_importance || 0}
                            valueStyle={{ fontSize: '24px', fontWeight: 600, color: '#262626' }}
                          />
                          <Text type="secondary">条记录</Text>
                        </div>
                      </Card>
                    </Col>
                    
                    <Col xs={24} sm={12} lg={6}>
                      <Card hoverable style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 8, transition: 'all 0.3s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'; }}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f9f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                            <FileTextOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
                          </div>
                          <Statistic
                            title="平均字数"
                            value={Math.round(stats.avg_words || 0)}
                            valueStyle={{ fontSize: '24px', fontWeight: 600, color: '#262626' }}
                          />
                          <Text type="secondary">字</Text>
                        </div>
                      </Card>
                    </Col>
                  </Row>

                  <Divider style={{ margin: '32px 0' }} />

                  <Card title="详细统计" hoverable style={{ marginTop: '24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 8, transition: 'all 0.3s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'; }}
                  >
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="总字数">{stats.total_words?.toLocaleString() || 0}</Descriptions.Item>
                      <Descriptions.Item label="最近更新">
                        {stats.updated_at ? new Date(stats.updated_at).toLocaleString('zh-CN') : '暂无数据'}
                      </Descriptions.Item>
                      <Descriptions.Item label="数据状态">
                        <Tag color="green">正常</Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </div>
              ) : (
                <Empty description="暂无统计数据" />
              )
            } />
          </Routes>
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
