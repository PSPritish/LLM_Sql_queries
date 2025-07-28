'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  FiPlus,
  FiFileText,
  FiTarget,
  FiCheckCircle,
  FiMessageSquare,
  FiTrash2,
  FiEdit3
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import useStore from '../store/useStore';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { currentPhase, resetAnalysis, cvData } = useStore();

  const sidebarItems = [
    {
      icon: FiPlus,
      label: 'New Analysis',
      active: currentPhase === 'upload',
      action: resetAnalysis
    },
    {
      icon: FiFileText,
      label: 'CV Upload',
      active: currentPhase === 'upload',
      phase: 'upload'
    },
    {
      icon: FiTarget,
      label: 'ATS Analysis',
      active: currentPhase === 'analysis',
      phase: 'analysis',
      disabled: !cvData.fileName
    },
    {
      icon: FiCheckCircle,
      label: 'Results & Suggestions',
      active: currentPhase === 'results',
      phase: 'results',
      disabled: !cvData.atsScore
    },
    {
      icon: FiMessageSquare,
      label: 'Interview Questions',
      active: currentPhase === 'questions',
      phase: 'questions',
      disabled: !cvData.interviewQuestions.length
    }
  ];

  const recentAnalyses = [
    { id: 1, name: 'Software Engineer CV', date: '2 hours ago', score: 85 },
    { id: 2, name: 'Data Scientist Resume', date: '1 day ago', score: 92 },
    { id: 3, name: 'Product Manager CV', date: '3 days ago', score: 78 },
  ];

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`bg-base-100 border-r border-base-200 h-full flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'
        }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-base-200">
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="btn btn-ghost btn-sm w-full justify-start gap-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <HiSparkles className="text-lg text-primary" />
          {!isCollapsed && <span className="font-semibold">CV Grinder</span>}
        </motion.button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="space-y-1">
            {sidebarItems.map((item, index) => (
              <motion.button
                key={index}
                onClick={item.action || (() => { })}
                className={`btn w-full justify-start gap-3 ${item.active
                    ? 'btn-primary'
                    : item.disabled
                      ? 'btn-disabled'
                      : 'btn-ghost hover:bg-base-200'
                  }`}
                whileHover={{ scale: item.disabled ? 1 : 1.02 }}
                whileTap={{ scale: item.disabled ? 1 : 0.98 }}
                disabled={item.disabled}
              >
                <item.icon className="text-lg" />
                {!isCollapsed && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent Analyses */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 border-t border-base-200 mt-4"
          >
            <h3 className="text-sm font-semibold text-base-content/70 mb-3">
              Recent Analyses
            </h3>
            <div className="space-y-2">
              {recentAnalyses.map((analysis) => (
                <motion.div
                  key={analysis.id}
                  className="p-3 rounded-lg bg-base-200 hover:bg-base-300 cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {analysis.name}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {analysis.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`badge badge-sm ${analysis.score >= 90 ? 'badge-success' :
                          analysis.score >= 70 ? 'badge-warning' : 'badge-error'
                        }`}>
                        {analysis.score}%
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="btn btn-ghost btn-xs">
                          <FiEdit3 className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-base-200">
        <motion.button
          className="btn btn-outline btn-sm w-full gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiTrash2 className="text-sm" />
          {!isCollapsed && 'Clear All'}
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
