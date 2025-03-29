import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Moon, Bell, Shield, LogOut } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export default function ProfilePage() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen pb-20 px-4 pt-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">John Doe</h1>
          <p className="text-gray-600 dark:text-gray-300">john.doe@example.com</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm divide-y dark:divide-gray-700">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-4 p-4 text-left"
        >
          <Moon className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-sm text-gray-500">{theme === 'dark' ? 'On' : 'Off'}</p>
          </div>
        </button>

        <button className="w-full flex items-center gap-4 p-4 text-left">
          <Bell className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
            <p className="text-sm text-gray-500">Manage notifications</p>
          </div>
        </button>

        <button className="w-full flex items-center gap-4 p-4 text-left">
          <Shield className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">Privacy</p>
            <p className="text-sm text-gray-500">Control your data</p>
          </div>
        </button>

        <button className="w-full flex items-center gap-4 p-4 text-left">
          <Settings className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">Settings</p>
            <p className="text-sm text-gray-500">App preferences</p>
          </div>
        </button>

        <button className="w-full flex items-center gap-4 p-4 text-left text-red-500">
          <LogOut className="w-5 h-5" />
          <div className="flex-1">
            <p className="font-medium">Sign Out</p>
          </div>
        </button>
      </div>
    </motion.div>
  );
}