'use client';

import { motion } from 'framer-motion';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CVUpload from '../components/CVUpload';
import Analysis from '../components/Analysis';
import Results from '../components/Results';
import InterviewQuestions from '../components/InterviewQuestions';
import ChatMessages from '../components/ChatMessages';
import useStore from '../store/useStore';

export default function Home() {
  const { currentPhase } = useStore();

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 'upload':
        return <CVUpload />;
      case 'analysis':
        return <Analysis />;
      case 'results':
        return <Results />;
      case 'questions':
        return <InterviewQuestions />;
      default:
        return <CVUpload />;
    }
  };

  return (
    <div className="min-h-screen bg-base-50">
      <Header />

      <div className="flex h-screen pt-16">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {renderCurrentPhase()}
          </motion.div>
        </main>
      </div>

      <ChatMessages />
    </div>
  );
}
