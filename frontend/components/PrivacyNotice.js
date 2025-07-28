'use client';

import { motion } from 'framer-motion';
import { FiShield, FiX, FiCheck } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const PrivacyNotice = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    // Check if user has already accepted privacy notice
    const accepted = localStorage.getItem('cv-grinder-privacy-accepted');
    if (!accepted) {
      setIsVisible(true);
    } else {
      setHasAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cv-grinder-privacy-accepted', 'true');
    setHasAccepted(true);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
    >
      <div className="alert shadow-lg border border-success/20 bg-base-100">
        <div className="flex-shrink-0">
          <FiShield className="text-success text-xl" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-success">Privacy Protected</h3>
          <div className="text-sm text-base-content/70 mt-1">
            <p>Your CV data is processed locally in your browser. No data is sent to external servers or stored permanently.</p>
          </div>
        </div>
        <div className="flex-shrink-0 flex gap-2">
          <motion.button
            onClick={handleAccept}
            className="btn btn-success btn-sm gap-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiCheck className="text-sm" />
            Got it
          </motion.button>
          <motion.button
            onClick={handleDismiss}
            className="btn btn-ghost btn-sm btn-circle"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiX />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyNotice;
