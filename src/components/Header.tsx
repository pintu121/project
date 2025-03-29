import React from 'react';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-900">WitsIQ</span>
          </Link>
          <nav>
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-500 transition-colors"
            >
              New Exam
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}