import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { conversationApi } from '../services/api';
import type { Conversation } from '../types';
import { ArrowLeft, Trash2, Calendar, Tag as TagIcon, Sparkles, Clock, FileText } from 'lucide-react';

export const ConversationDetail = () => {
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
      alert('删除失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return { bg: 'from-red-500 to-pink-500', text: '非常重要' };
    if (importance >= 6) return { bg: 'from-amber-500 to-orange-500', text: '重要' };
    if (importance >= 4) return { bg: 'from-emerald-500 to-teal-500', text: '一般' };
    return { bg: 'from-blue-500 to-cyan-500', text: '普通' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="mt-6 text-gray-600 font-medium">正在加载对话详情...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-red-500 text-xl mb-6 font-medium">{error || '对话不存在'}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            返回列表
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const importanceStyle = getImportanceColor(conversation.importance);

  return (
    <AnimatePresence>
      <motion.div
        className="min-h-screen pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="mb-8 flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-lg rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700 font-medium">返回列表</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              disabled={deleting}
              className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all ${deleting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Trash2 className="w-5 h-5" />
              <span className="font-medium">{deleting ? '删除中...' : '删除对话'}</span>
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="glass rounded-3xl p-8 relative overflow-hidden">
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${importanceStyle.bg} opacity-5`}
                animate={{ opacity: [0.05, 0.1, 0.05] }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold gradient-text mb-3">
                      {conversation.title}
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{conversation.date}</span>
                    </div>
                  </div>

                  <motion.div
                    className={`px-4 py-2 bg-gradient-to-r ${importanceStyle.bg} text-white rounded-full flex items-center gap-2 shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: [0, 2, -2, 0] }}
                    transition={{ rotate: { duration: 0.3 } }}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="font-bold">{conversation.importance}/10</span>
                    <span className="text-sm opacity-90">- {importanceStyle.text}</span>
                  </motion.div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-900">
                      <TagIcon className="w-5 h-5" />
                      标签
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {conversation.tags && conversation.tags.length > 0 ? (
                          conversation.tags.map((tag, index) => (
                            <motion.span
                              key={tag}
                              className="px-4 py-2 bg-white/50 backdrop-blur-sm text-gray-700 text-sm font-medium rounded-full border border-white/30 shadow-sm"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              {tag}
                            </motion.span>
                          ))
                        ) : (
                          <span className="text-gray-500">暂无标签</span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-900">
                      <FileText className="w-5 h-5" />
                      摘要
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {conversation.summary}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6 gradient-text">详细内容</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {conversation.details}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                className="glass rounded-2xl p-6 text-center hover-lift"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <FileText className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                <p className="text-gray-500 text-sm mb-1">字数</p>
                <p className="text-2xl font-bold text-gray-900">{conversation.word_count}</p>
              </motion.div>

              <motion.div
                className="glass rounded-2xl p-6 text-center hover-lift"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <p className="text-gray-500 text-sm mb-1">创建时间</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(conversation.created_at).toLocaleString('zh-CN')}
                </p>
              </motion.div>

              <motion.div
                className="glass rounded-2xl p-6 text-center hover-lift"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Clock className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                <p className="text-gray-500 text-sm mb-1">更新时间</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(conversation.updated_at).toLocaleString('zh-CN')}
                </p>
              </motion.div>

              <motion.div
                className="glass rounded-2xl p-6 text-center hover-lift"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                <p className="text-gray-500 text-sm mb-1">ID</p>
                <p className="text-2xl font-bold gradient-text">{conversation.id}</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
