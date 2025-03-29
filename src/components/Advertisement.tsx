import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface AdvertisementProps {
  type: 'banner' | 'sidebar' | 'native';
  className?: string;
  onClose?: () => void;
}

export default function Advertisement({ type, className = '', onClose }: AdvertisementProps) {
  // This is a placeholder component. In production, you would:
  // 1. Integrate with an ad network (e.g., Google AdSense)
  // 2. Handle ad loading states
  // 3. Track impressions and clicks
  // 4. Implement proper ad targeting

  const adContent = {
    banner: {
      height: 'h-24',
      width: 'w-full',
      text: 'Banner Advertisement'
    },
    sidebar: {
      height: 'h-[600px]',
      width: 'w-[300px]',
      text: 'Sidebar Advertisement'
    },
    native: {
      height: 'h-32',
      width: 'w-full',
      text: 'Native Advertisement'
    }
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-xl overflow-hidden ${adContent.height} ${adContent.width} ${className}`}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 bg-white/80 dark:bg-gray-800/80 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          {adContent.text}
        </p>
      </div>
    </motion.div>
  );
}