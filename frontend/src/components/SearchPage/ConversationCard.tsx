import { memo } from 'react';
import { motion } from 'framer-motion';
import type { Conversation } from '../../types';
import { Calendar } from 'lucide-react';

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
};

interface ConversationCardProps {
  conv: Conversation;
  index: number;
}

export const ConversationCard = memo<ConversationCardProps>(({ conv, index }) => (
  <motion.div
    variants={itemVariants}
    layout
    initial="hidden"
    animate="visible"
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ delay: index * 0.05 }}
  >
    <div className="glass rounded-2xl p-6 hover-lift">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-xl font-bold text-gray-900">{conv.title}</h4>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          {conv.date}
        </div>
      </div>
      <p className="text-gray-600 mb-4 line-clamp-2">{conv.summary}</p>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {conv.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-white/50 text-gray-700 text-xs font-medium rounded-full border border-white/30"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="px-3 py-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold rounded-full">
          {conv.importance}/10
        </div>
      </div>
    </div>
  </motion.div>
));
