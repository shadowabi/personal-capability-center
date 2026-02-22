import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export const EmptyState = () => (
  <div className="text-center py-20 glass rounded-2xl">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Search className="w-24 h-24 mx-auto text-gray-300 mb-4" />
    </motion.div>
    <p className="text-xl text-gray-500 mb-2">未找到相关结果</p>
    <p className="text-gray-400">尝试调整搜索条件</p>
  </div>
);
