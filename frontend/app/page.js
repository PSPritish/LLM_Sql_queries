'use client';

import { motion } from 'framer-motion';
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
    <div>
      <div className="container mx-auto">
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentPhase()}
        </motion.div>
        <ChatMessages />
      </div>
    </div>
  );
}
