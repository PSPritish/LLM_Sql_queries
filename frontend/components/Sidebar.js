'use client';

import { motion } from 'framer-motion';
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
  const {
    currentPhase,
    resetAnalysis,
    cvData,
    setCurrentPhase,
    clearAllData,
    recentAnalyses,
    loadAnalysis,
    removeRecentAnalysis,
    addMessage,
    setShowAnalysisPanel,
    setActiveAnalysisTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen
  } = useStore();

  const handleNavigation = (item) => {
    if (item.action) {
      item.action();
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all CV data and chat history? This cannot be undone.')) {
      clearAllData();
      window.location.reload();
    }
  };

  const handleLoadAnalysis = (analysis) => {
    loadAnalysis(analysis.id);
    addMessage({
      type: 'system',
      content: `Loaded previous analysis: "${analysis.name}" (Score: ${analysis.score}%)`
    });
    addMessage({
      type: 'assistant',
      content: `I've loaded your previous analysis for "${analysis.name}". Here's what I found:\n\n🎯 **ATS Score**: ${analysis.score}%\n🏢 **Target Role**: ${analysis.company}\n📊 **Status**: ${analysis.status}\n\nWould you like me to show you the detailed analysis or help you improve it further?`,
      hasActions: true
    });
  };

  const sidebarItems = [
    {
      icon: FiPlus,
      label: 'New Analysis',
      active: false,
      action: resetAnalysis,
      description: 'Start fresh analysis'
    },
    {
      icon: FiTarget,
      label: 'ATS Analysis',
      active: currentPhase === 'analysis',
      action: () => {
        setCurrentPhase('analysis');
        setActiveAnalysisTab('overview');
        setShowAnalysisPanel(true);
      },
      disabled: !cvData.fileName && !cvData.atsScore,
      description: 'View ATS compatibility'
    },
    {
      icon: FiCheckCircle,
      label: 'Results & Tips',
      active: currentPhase === 'results',
      action: () => {
        setCurrentPhase('results');
        setActiveAnalysisTab('suggestions');
        setShowAnalysisPanel(true);
      },
      disabled: !cvData.atsScore,
      description: 'Get improvement suggestions'
    },
    {
      icon: FiMessageSquare,
      label: 'Interview Prep',
      active: currentPhase === 'questions',
      action: () => {
        setCurrentPhase('questions');
        setActiveAnalysisTab('interview');
        setShowAnalysisPanel(true);
      },
      disabled: !cvData.interviewQuestions.length,
      description: 'Practice interview questions'
    }
  ];



  return (
    <>
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1
        }}
        className={`bg-base-100 border-r border-base-200 flex flex-col h-screen overflow-hidden transition-all duration-300 z-50 ${mobileSidebarOpen ? 'fixed lg:relative' : 'hidden lg:flex'
          } ${sidebarCollapsed ? 'w-16' : 'w-80'}`}
      >
        {/* Sidebar Header with Toggle */}
        <div className="p-4 border-b border-base-200 flex items-center justify-between flex-shrink-0">
          {!sidebarCollapsed ? (
            <motion.div
              className="flex items-center gap-3 btn btn-ghost rounded-2xl "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-8">
                  <HiSparkles className="text-lg" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  CV Grinder
                </h1>
              </div>
            </motion.div>
          ) : <motion.button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="btn btn-ghost btn-circle"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <HiSparkles className={`text-lg text-primary ${sidebarCollapsed ? 'text-xl' : ''}`} />
          </motion.button>}


        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {/* Current Analysis Status */}
            {cvData.fileName && (
              <div className="mb-4 p-3 bg-base-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FiFileText className="text-primary text-sm" />
                  <span className="text-sm font-medium truncate">{cvData.fileName}</span>
                </div>
                {cvData.atsScore > 0 && (
                  <div className="flex items-center gap-2">
                    <div className={`badge badge-sm ${cvData.atsScore >= 80 ? 'badge-success' : cvData.atsScore >= 60 ? 'badge-warning' : 'badge-error'}`}>
                      {cvData.atsScore}% ATS
                    </div>
                    <span className="text-xs text-base-content/60">{cvData.identifiedRole}</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1">
              {sidebarItems.map((item, index) => (
                <div key={index} className="group relative">
                  <motion.button
                    onClick={() => handleNavigation(item)}
                    className={`btn w-full justify-start gap-3 ${item.active
                      ? 'btn-primary'
                      : item.disabled
                        ? 'btn-disabled opacity-50'
                        : 'btn-ghost hover:bg-base-200'
                      }`}
                    whileHover={{ scale: item.disabled ? 1 : 1.02 }}
                    whileTap={{ scale: item.disabled ? 1 : 0.98 }}
                    disabled={item.disabled}
                  >
                    <item.icon className="text-lg" />                  {!sidebarCollapsed && (
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{item.label}</div>
                        {item.description && !item.active && (
                          <div className="text-xs text-base-content/50">{item.description}</div>
                        )}
                      </div>
                    )}
                  </motion.button>

                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-base-300 text-base-content px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {item.label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Analyses */}
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 border-t border-base-200 mt-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-base-content/70">
                  Recent Analyses
                </h3>
                {recentAnalyses.length > 0 && (
                  <div className="badge badge-sm badge-primary">{recentAnalyses.length}</div>
                )}
              </div>

              {recentAnalyses.length === 0 ? (
                <div className="text-center py-8 text-base-content/50">
                  <FiFileText className="text-2xl mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No recent analyses yet</p>
                  <p className="text-xs">Upload a CV to get started</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentAnalyses.map((analysis) => (
                    <motion.div
                      key={analysis.id}
                      className="p-3 rounded-lg bg-base-200 hover:bg-base-300 cursor-pointer group border border-transparent hover:border-primary/20 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLoadAnalysis(analysis)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {analysis.name}
                            </p>
                            <p className="text-xs text-base-content/60">
                              {analysis.company}
                            </p>
                          </div>
                          <div className={`badge badge-sm ${analysis.score >= 90 ? 'badge-success' :
                            analysis.score >= 70 ? 'badge-warning' : 'badge-error'
                            }`}>
                            {analysis.score}%
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-base-content/50">
                            {analysis.date}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="btn btn-ghost btn-xs hover:btn-error"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Remove this analysis?')) {
                                  removeRecentAnalysis(analysis.id);
                                }
                              }}
                              title="Remove analysis"
                            >
                              <FiTrash2 className="text-xs" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {recentAnalyses.length > 3 && (
                <motion.button
                  className="btn btn-ghost btn-sm w-full mt-3 text-xs"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    console.log('Show all analyses');
                  }}
                >
                  View All ({recentAnalyses.length})
                </motion.button>
              )}
            </motion.div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-base-200 flex-shrink-0">
          <motion.button
            onClick={handleClearAll}
            className="btn btn-outline btn-sm w-full gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiTrash2 className="text-sm" />
            {!sidebarCollapsed && 'Clear All'}
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
