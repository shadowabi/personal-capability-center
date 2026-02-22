import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { summaryApi } from '../services/api';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Download, RefreshCw, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function SummaryPage() {
  const [summaryType, setSummaryType] = useState<'monthly' | 'yearly'>('monthly');
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async (type: 'monthly' | 'yearly') => {
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
    } finally {
      setLoading(false);
    }
  };

  const downloadSummary = () => {
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
  };

  const copyToClipboard = async () => {
    if (!summary) return;

    try {
      await navigator.clipboard.writeText(summary);
      alert('已复制到剪贴板！');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('复制失败，请手动复制');
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        className="glass rounded-3xl p-8 relative overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-400 to-rose-400 rounded-full blur-3xl opacity-20"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold gradient-text mb-6">AI 总结</h2>

          <div className="flex gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => generateSummary('monthly')}
              className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                summaryType === 'monthly'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 border border-white/30 hover:bg-white/70'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                月度总结
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => generateSummary('yearly')}
              className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                summaryType === 'yearly'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 border border-white/30 hover:bg-white/70'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                年度总结
              </div>
            </motion.button>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>使用 OpenCode 获取历史对话记录</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>自动分析关键话题和趋势</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>需要 OpenCode 服务运行中</span>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {loading && (
          <motion.div
            className="glass rounded-3xl p-12 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.div
              className="w-20 h-20 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-xl text-gray-700 font-medium">AI 正在生成总结...</p>
            <p className="text-gray-500 mt-2">这可能需要几秒钟</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            className="glass rounded-3xl p-12 text-center border-2 border-red-200"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-red-600 mb-4">生成失败</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => generateSummary(summaryType)}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all"
            >
              重试
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {summary && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <motion.div
              className="flex justify-end gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-lg text-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-4 h-4" />
                复制
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadSummary}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Download className="w-4 h-4" />
                下载
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => generateSummary(summaryType)}
                className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-lg text-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                重新生成
              </motion.button>
            </motion.div>

            <motion.div
              className="glass rounded-3xl p-8 prose prose-lg max-w-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ReactMarkdown>{summary}</ReactMarkdown>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
