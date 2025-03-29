import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface NavigationItem {
  icon: LucideIcon;
  label: string;
  path: string;
  caption?: string;
}

interface NavigationProps {
  items: NavigationItem[];
}

export default function Navigation({ items }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    // Always use replace for home navigation to prevent back navigation
    if (path === '/') {
      navigate('/', { replace: true });
      return;
    }
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-t-3xl px-6 py-4 z-50 border-t border-gray-100 dark:border-gray-700">
      <div className="max-w-4xl mx-auto flex justify-around items-center">
        {items.map((item) => {
          const isActive = location.pathname === item.path || 
                         (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className="relative flex flex-col items-center pt-2 pb-1 px-3 group"
            >
              <div className="relative">
                <Icon
                  className={`h-6 w-6 transition-colors duration-200 ${
                    isActive 
                      ? 'text-blue-500 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="navigation-pill"
                    className="absolute -inset-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl -z-10"
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 35 
                    }}
                  />
                )}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'text-blue-500 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                }`}
              >
                {item.label}
              </span>
              {item.caption && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-medium rounded-full">
                  {item.caption}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}