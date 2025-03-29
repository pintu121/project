import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PracticeGenerator from '../components/PracticeGenerator';
import PracticeSession from '../components/PracticeSession';

export default function PracticePage() {
  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 pt-8">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<PracticeGenerator />} />
            <Route path="/session" element={<PracticeSession />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}