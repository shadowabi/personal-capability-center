import { useState, useEffect, useCallback, startTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchApi, statisticsApi } from '../services/api';
import type { Conversation } from '../types';
import { Search as SearchIcon, Tag, TrendingUp, X } from 'lucide-react';
import { ConversationCard } from './SearchPage/ConversationCard';
import { EmptyState } from './SearchPage/EmptyState';
import { LoadingState } from './SearchPage/LoadingState';
import { containerVariants } from './SearchPage/animations';

export function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [importanceMin, setImportanceMin] = useState<number | null>(null);
  const [results, setResults] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedTags, importanceMin]);

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
          <h2 className="text-3xl font-bold gradient-text mb-6">搜索记忆</h2>

          <div className="space-y-6">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索关键词..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:outline-none transition-colors text-lg"
              />
            </div>

            {allTags.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-900">
                  <Tag className="w-5 h-5" />
                  标签筛选
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <motion.button
                      key={tag}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg'
                          : 'bg-white/50 text-gray-700 border border-white/30 hover:bg-white/70'
                      }`}
                    >
                      {tag}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-900">
                <TrendingUp className="w-5 h-5" />
                重要性筛选
              </h3>
              <div className="flex gap-3">
                {[null, 7, 8, 9].map((val) => (
                  <motion.button
                    key={val ?? 'all'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setImportanceMin(val)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      importanceMin === val
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg'
                        : 'bg-white/50 text-gray-700 border border-white/30 hover:bg-white/70'
                    }`}
                  >
                    {val === null ? '全部' : `${val}+`}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '搜索中...' : '搜索'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearAll}
                className="px-6 py-4 bg-white/50 text-gray-700 rounded-xl font-medium border border-white/30 hover:bg-white/70 transition-all flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                清空
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {hasSearched && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {loading ? (
            <LoadingState />
          ) : hasResults ? (
            <>
              <h3 className="text-xl font-bold text-gray-900">找到 {results.length} 条结果</h3>
              <AnimatePresence>
                {results.map((conv, index) => (
                  <ConversationCard key={conv.id} conv={conv} index={index} />
                ))}
              </AnimatePresence>
            </>
          ) : (
            <EmptyState />
          )}
        </motion.div>
      )}
    </div>
  );
}
