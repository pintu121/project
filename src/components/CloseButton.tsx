import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

interface CloseButtonProps {
  className?: string;
}

export default function CloseButton({ className = '' }: CloseButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/', { replace: true })}
      className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${className}`}
      aria-label="Close"
    >
      <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
    </button>
  );
}