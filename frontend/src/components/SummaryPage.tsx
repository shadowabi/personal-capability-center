import { useState, useCallback } from 'react';
import { Card, Button, Radio, Spin, Empty, message, Typography, Alert, Space } from 'antd';
import { DownloadOutlined, ReloadOutlined, CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CopyOutlined, FireOutlined } from '@ant-design/icons';
import { summaryApi } from '../services/api';
import { MarkdownRenderer } from './MarkdownRenderer';

const { Title, Paragraph, Text } = Typography;

export function SummaryPage() {
  const [summaryType, setSummaryType] = useState<'monthly' | 'yearly' | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = useCallback(async (type: 'monthly' | 'yearly') => {
    setSummaryType(type);
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const data = type === 'monthly'
        ? await summaryApi.getMonthly()
        : await summaryApi.getYearly();
      setSummary(data);
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setError('生成总结失败，请检查 OpenCode 连接');
      message.error('生成总结失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadSummary = useCallback(() => {
    if (!summary) return;

    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summaryType}-summary.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('下载成功');
  }, [summary, summaryType]);

  const copyToClipboard = useCallback(async () => {
    if (!summary) return;

    try {
      await navigator.clipboard.writeText(summary);
      message.success('已复制到剪贴板');
    } catch (err) {
      console.error('Failed to copy:', err);
      message.error('复制失败，请手动复制');
    }
  }, [summary]);

return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
      <Card style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>AI 总结</Title>

        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <Button 
            type={summaryType === 'monthly' ? 'primary' : 'default'}
            icon={<CalendarOutlined />}
            onClick={() => generateSummary('monthly')}
            size="large"
          >
            月度总结
          </Button>
          <Button 
            type={summaryType === 'yearly' ? 'primary' : 'default'}
            icon={<ClockCircleOutlined />}
            onClick={() => generateSummary('yearly')}
            size="large"
          >
            年度总结
          </Button>
        </div>

        <div style={{ fontSize: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <Text type="secondary">使用 OpenCode 获取历史对话记录</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <Text type="secondary">自动分析关键话题和趋势</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            <Text type="secondary">需要 OpenCode 服务运行中</Text>
          </div>
        </div>
      </Card>

      {loading && (
        <Card style={{ textAlign: 'center' }}>
          <Spin size="large" tip="AI 正在生成总结..." />
          <Paragraph type="secondary" style={{ marginTop: '16px' }}>
            这可能需要几秒钟
          </Paragraph>
        </Card>
      )}

      {error && (
        <Alert
          type="error"
          message="生成失败"
          description={error}
          showIcon
          icon={<ExclamationCircleOutlined />}
          action={
            <Button type="primary" size="small" onClick={() => generateSummary(summaryType)}>
              重试
            </Button>
          }
          style={{ marginBottom: '24px' }}
        />
      )}

      {summary && !loading && (
        <div>
          <Card style={{ marginBottom: '24px' }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                icon={<CopyOutlined />}
                onClick={copyToClipboard}
              >
                复制
              </Button>

              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={downloadSummary}
              >
                下载
              </Button>

              <Button
                icon={<ReloadOutlined />}
                onClick={() => generateSummary(summaryType)}
              >
                重新生成
              </Button>
            </Space>
          </Card>

          <Card>
            <MarkdownRenderer content={summary} />
          </Card>
        </div>
      )}
    </div>
  );
}
