import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { conversationApi } from '../services/api';
import type { Conversation } from '../types';
import { Trash2, ChevronLeft, ChevronRight, Calendar, MessageSquare, TrendingUp, Clock } from 'lucide-react';

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
    if (importance >= 8) return { bg: 'from-red-500 to-pink-500', text: '高重要性' };
    if (importance >= 6) return { bg: 'from-amber-500 to-orange-500', text: '中重要性' };
    return { bg: 'from-emerald-500 to-teal-500', text: '普通' };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="space-y-8">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">对话记忆</h2>
          <p className="text-gray-600">共 {total} 条记录</p>
        </div>
        <motion.div
          className="p-4 bg-gradient-to-br from-amber-500 to-rose-500 rounded-xl shadow-xl"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Clock className="w-8 h-8 text-white" />
        </motion.div>
      </motion.div>

      {loading ? (
        <motion.div
          className="flex flex-col items-center justify-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="mt-4 text-gray-600">加载中...</p>
        </motion.div>
      ) : conversations.length === 0 ? (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MessageSquare className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-500 mb-2">暂无对话记录</p>
          <p className="text-gray-400">开始添加你的第一条对话吧</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <AnimatePresence>
            {conversations.map((conv, index) => (
              <motion.div
                key={conv.id}
                variants={itemVariants}
                layout
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: index * 0.05 }}
              >
                <motion.div
                  className="glass rounded-2xl p-6 hover-lift cursor-pointer relative overflow-hidden group"
                  onClick={() => navigate(`/conversation/${conv.id}`)}
                >
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${getImportanceColor(conv.importance).bg} opacity-0 group-hover:opacity-5 transition-opacity`}
                    initial={false}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {conv.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {conv.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {conv.word_count} 字
                          </div>
                        </div>
                      </div>

                      <motion.div
                        className={`px-3 py-1 bg-gradient-to-r ${getImportanceColor(conv.importance).bg} text-white text-xs font-medium rounded-full flex items-center gap-1`}
                        whileHover={{ scale: 1.1 }}
                      >
                        <TrendingUp className="w-3 h-3" />
                        {conv.importance}/10
                      </motion.div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {conv.summary}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {conv.tags.map((tag, tagIndex) => (
                          <motion.span
                            key={tag}
                            className="px-3 py-1 bg-white/50 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full border border-gray-200/50"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 + tagIndex * 0.02 }}
                          >
                            {tag}
                          </motion.span>
                        ))}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(conv.id);
                        }}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {total > 0 && (
        <motion.div
          className="flex justify-center gap-3 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              page === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            上一页
          </motion.button>

          <motion.div
            className="px-6 py-2 bg-white rounded-lg shadow-lg flex items-center gap-2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <span className="text-gray-600">第</span>
            <span className="text-xl font-bold gradient-text">{page}</span>
            <span className="text-gray-600">页</span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 10 >= total}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              page * 10 >= total
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
            }`}
          >
            下一页
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}