'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  FiX,
  FiBarChart,
  FiTarget,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiMessageSquare,
  FiDownload
} from 'react-icons/fi';
import useStore from '../store/useStore';

const AnalysisPanel = ({ onClose }) => {
  // Get analysis data and tab state from store
  const { cvData, activeAnalysisTab, setActiveAnalysisTab } = useStore();

  // Get analysis data from store (with API data structure)
  const analysisData = {
    atsScore: cvData.atsScore || 0,
    keywords: {
      found: cvData.keywords || [],
      missing: cvData.missingKeywords || [],
      roleMatch: cvData.keywords?.length > 0 ? Math.round((cvData.keywords.length / (cvData.keywords.length + (cvData.missingKeywords?.length || 0))) * 100) : 0
    },
    suggestions: cvData.suggestions?.length > 0 ? cvData.suggestions.map(s => ({ type: 'suggestion', text: s })) : [],
    interviewQuestions: cvData.interviewQuestions || [],
    strengths: cvData.strengths || [],
    areasToImprove: cvData.areasToImprove || []
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart },
    { id: 'keywords', label: 'Keywords', icon: FiTarget },
    { id: 'suggestions', label: 'Suggestions', icon: FiCheckCircle },
    { id: 'interview', label: 'Interview', icon: FiMessageSquare }
  ];

  const ScoreCircle = ({ score, label }) => (
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-2">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-base-300"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - score / 100)}`}
            className={score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-error'}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{score}</span>
        </div>
      </div>
      <p className="text-sm text-base-content/60">{label}</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* Header */}
      <div className="p-4 border-b border-base-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold">CV Analysis</h2>
        <motion.button
          onClick={onClose}
          className="btn btn-ghost btn-sm btn-circle"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FiX />
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeAnalysisTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4">
              <ScoreCircle score={analysisData.atsScore} label="ATS Score" />
              <ScoreCircle score={analysisData.keywords.roleMatch} label="Role Match" />
            </div>

            <div className="space-y-4">
              {analysisData.strengths.length > 0 && (
                <div className="card bg-base-200 p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FiTrendingUp className="text-success" />
                    Strengths
                  </h3>
                  <ul className="text-sm space-y-1">
                    {analysisData.strengths.map((strength, index) => (
                      <li key={index}>• {strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisData.areasToImprove.length > 0 && (
                <div className="card bg-base-200 p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FiAlertCircle className="text-warning" />
                    Areas to Improve
                  </h3>
                  <ul className="text-sm space-y-1">
                    {analysisData.areasToImprove.map((area, index) => (
                      <li key={index}>• {area}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisData.strengths.length === 0 && analysisData.areasToImprove.length === 0 && (
                <div className="card bg-base-200 p-4 text-center">
                  <p className="text-sm text-base-content/60">
                    Upload and analyze a CV to see detailed insights
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeAnalysisTab === 'keywords' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <h3 className="font-semibold mb-3 text-success flex items-center gap-2">
                <FiCheckCircle />
                Found Keywords ({analysisData.keywords.found.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysisData.keywords.found.map((keyword, index) => (
                  <span key={index} className="badge badge-success gap-1">
                    <FiCheckCircle className="text-xs" />
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-error flex items-center gap-2">
                <FiAlertCircle />
                Missing Keywords ({analysisData.keywords.missing.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysisData.keywords.missing.map((keyword, index) => (
                  <span key={index} className="badge badge-error gap-1">
                    <FiAlertCircle className="text-xs" />
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="card bg-base-200 p-4">
              <h4 className="font-medium mb-2">💡 Keyword Tips</h4>
              <ul className="text-sm space-y-1 text-base-content/80">
                <li>• Add missing keywords naturally in your experience</li>
                <li>• Use exact keyword matches from job descriptions</li>
                <li>• Include both acronyms and full forms</li>
              </ul>
            </div>
          </motion.div>
        )}

        {activeAnalysisTab === 'suggestions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {analysisData.suggestions.length > 0 ? (
              <>
                {analysisData.suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    className={`card p-4 border-l-4 ${suggestion.type === 'critical'
                      ? 'bg-error/10 border-error'
                      : suggestion.type === 'important'
                        ? 'bg-warning/10 border-warning'
                        : 'bg-info/10 border-info'
                      }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`badge badge-sm ${suggestion.type === 'critical'
                        ? 'badge-error'
                        : suggestion.type === 'important'
                          ? 'badge-warning'
                          : 'badge-info'
                        }`}>
                        {suggestion.type || 'suggestion'}
                      </div>
                      <p className="text-sm flex-1">{suggestion.text || suggestion}</p>
                    </div>
                  </motion.div>
                ))}

                <div className="card bg-base-200 p-4 mt-6">
                  <h4 className="font-medium mb-2">📈 Next Steps</h4>
                  <p className="text-sm text-base-content/80">
                    Review each suggestion above and implement the changes to improve your CV&apos;s effectiveness.
                  </p>
                </div>
              </>
            ) : (
              <div className="card bg-base-200 p-4 text-center">
                <h4 className="font-medium mb-2">No Suggestions Available</h4>
                <p className="text-sm text-base-content/60">
                  Upload and analyze a CV to receive personalized improvement suggestions.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeAnalysisTab === 'interview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {analysisData.interviewQuestions.length > 0 ? (
              <>
                <div className="card bg-base-200 p-4">
                  <h3 className="font-semibold mb-2">🎯 Potential Questions</h3>
                  <p className="text-sm text-base-content/70">
                    Based on your CV, here are questions you might encounter:
                  </p>
                </div>

                <div className="space-y-3">
                  {analysisData.interviewQuestions.map((question, index) => (
                    <motion.div
                      key={index}
                      className="card bg-base-100 border border-base-200 p-4"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="badge badge-primary badge-sm">{index + 1}</div>
                        <p className="text-sm flex-1">{question}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="card bg-base-200 p-4">
                  <h4 className="font-medium mb-2">💡 Interview Tips</h4>
                  <ul className="text-sm space-y-1 text-base-content/80">
                    <li>• Prepare STAR method examples for each skill</li>
                    <li>• Research the company and role beforehand</li>
                    <li>• Have specific examples ready for technical questions</li>
                    <li>• Practice explaining complex projects simply</li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="card bg-base-200 p-4 text-center">
                <h3 className="font-semibold mb-2">🎯 Interview Preparation</h3>
                <p className="text-sm text-base-content/60 mb-4">
                  Upload and analyze a CV to generate role-specific interview questions.
                </p>
                <div className="card bg-base-300 p-3">
                  <h4 className="font-medium mb-2">💡 General Interview Tips</h4>
                  <ul className="text-sm space-y-1 text-base-content/80">
                    <li>• Prepare STAR method examples for each skill</li>
                    <li>• Research the company and role beforehand</li>
                    <li>• Have specific examples ready for technical questions</li>
                    <li>• Practice explaining complex projects simply</li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-base-200">
        <motion.button
          className="btn btn-primary btn-sm w-full gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiDownload />
          Export Analysis Report
        </motion.button>
      </div>
    </div>
  );
};

export default AnalysisPanel;
