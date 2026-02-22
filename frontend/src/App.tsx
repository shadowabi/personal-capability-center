import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ConversationList } from './components/ConversationList';
import { ConversationDetail } from './components/ConversationDetail';
import { SearchPage } from './components/SearchPage';
import { SummaryPage } from './components/SummaryPage';
import { statisticsApi } from './services/api';
import type { Statistics } from './types';
import { Brain, MessageSquare, BarChart3, Search, Sparkles } from 'lucide-react';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('conversations');
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const data = await statisticsApi.get();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load statistics:', error);
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'conversations', label: '对话', icon: MessageSquare, path: '/' },
    { id: 'search', label: '搜索', icon: Search, path: '/search' },
    { id: 'summary', label: '总结', icon: Sparkles, path: '/summary' },
    { id: 'statistics', label: '统计', icon: BarChart3, path: '/statistics' },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-rose-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <motion.header
        className="glass sticky top-0 z-50 border-0"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="p-2 bg-gradient-to-br from-amber-500 to-rose-500 rounded-xl shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold gradient-text">
                  Personal Capability Center
                </h1>
                <p className="text-xs text-gray-500">个人能力中心</p>
              </div>
            </motion.div>

            {stats && (
              <motion.div
                className="hidden md:flex items-center gap-4 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-right">
                  <p className="text-2xl font-bold gradient-text">{stats.total_conversations}</p>
                  <p className="text-xs text-gray-500">对话</p>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="text-right">
                  <p className="text-2xl font-bold gradient-text">{stats.avg_words?.toFixed(0) || 0}</p>
                  <p className="text-xs text-gray-500">平均字数</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

      <motion.nav
        className="glass sticky top-20 z-40 border-b border-white/30"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-t-lg transition-all relative ${
                  activeTab === tab.id
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"
                    layoutId="underline"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <Routes key={location.pathname}>
            <Route path="/" element={<ConversationList />} />
            <Route path="/conversation/:id" element={<ConversationDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/statistics" element={
              stats ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {[
                    { label: '总对话数', value: stats.total_conversations, icon: MessageSquare, color: 'from-amber-500 to-orange-500' },
                    { label: '已向量化', value: stats.with_vectors || 0, icon: Brain, color: 'from-orange-500 to-rose-500' },
                    { label: '高重要性', value: stats.high_importance || 0, icon: Sparkles, color: 'from-rose-500 to-pink-500' },
                    { label: '平均字数', value: stats.avg_words?.toFixed(0) || 0, icon: BarChart3, color: 'from-amber-400 to-rose-400' },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass rounded-2xl p-6 hover-lift relative overflow-hidden group"
                    >
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                        initial={false}
                      />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
                            <stat.icon className="w-6 h-6 text-white" />
                          </div>
                          <motion.div
                            className="text-4xl font-bold gradient-text"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                          >
                            {stat.value}
                          </motion.div>
                        </div>
                        <p className="text-gray-600 font-medium">{stat.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <motion.div
                    className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <p className="text-gray-600">加载统计数据中...</p>
                </motion.div>
              )
            } />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
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
