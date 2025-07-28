'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  FiTarget,
  FiCheckCircle,
  FiX,
  FiEdit3,
  FiDownload,
  FiShare2,
  FiCopy
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import useStore from '../store/useStore';

const Results = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { cvData, setCurrentPhase } = useStore();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiTarget },
    { id: 'keywords', label: 'Keywords', icon: FiCheckCircle },
    { id: 'suggestions', label: 'Suggestions', icon: FiEdit3 },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return 'badge-success';
    if (score >= 60) return 'badge-warning';
    return 'badge-error';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'badge-error';
      case 'medium': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const proceedToQuestions = () => {
    setCurrentPhase('questions');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10">
            <FiTarget className="text-4xl text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">CV Analysis Results</h1>
        <p className="text-lg text-base-content/70">
          Comprehensive analysis of your CV with actionable insights
        </p>
      </motion.div>

      {/* ATS Score Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-xl"
      >
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title text-2xl mb-2">ATS Compatibility Score</h2>
              <p className="text-primary-content/80">
                Your CV&apos;s compatibility with Applicant Tracking Systems
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">{cvData.atsScore}%</div>
              <div className={`badge ${getScoreBadge(cvData.atsScore)} badge-lg`}>
                {cvData.atsScore >= 80 ? 'Excellent' : cvData.atsScore >= 60 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="tabs tabs-boxed bg-base-200 p-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab gap-2 ${activeTab === tab.id ? 'tab-active' : ''}`}
          >
            <tab.icon className="text-sm" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* CV Info */}
            <div className="card bg-base-100 shadow-lg border border-base-200">
              <div className="card-body">
                <h3 className="card-title">CV Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-base-content/70">File Name:</span>
                    <span className="font-medium">{cvData.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">File Size:</span>
                    <span className="font-medium">
                      {(cvData.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Identified Role:</span>
                    <span className="font-medium badge badge-primary">
                      {cvData.identifiedRole}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card bg-base-100 shadow-lg border border-base-200">
              <div className="card-body">
                <h3 className="card-title">Quick Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat">
                    <div className="stat-title">Keywords Found</div>
                    <div className="stat-value text-2xl text-success">
                      {cvData.keywords?.filter(k => k.found).length || 0}
                    </div>
                    <div className="stat-desc">
                      out of {cvData.keywords?.length || 0} total
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Suggestions</div>
                    <div className="stat-value text-2xl text-warning">
                      {cvData.suggestions?.length || 0}
                    </div>
                    <div className="stat-desc">improvements available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="space-y-6">
            <div className="card bg-base-100 shadow-lg border border-base-200">
              <div className="card-body">
                <h3 className="card-title mb-4">Keyword Analysis</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cvData.keywords?.map((keyword, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-2 ${keyword.found
                        ? 'border-success bg-success/10'
                        : 'border-error bg-error/10'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{keyword.word}</span>
                        {keyword.found ? (
                          <FiCheckCircle className="text-success" />
                        ) : (
                          <FiX className="text-error" />
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`badge ${keyword.importance === 'high'
                          ? 'badge-error'
                          : keyword.importance === 'medium'
                            ? 'badge-warning'
                            : 'badge-info'
                          } badge-sm`}>
                          {keyword.importance}
                        </span>
                        <span className={`text-sm ${keyword.found ? 'text-success' : 'text-error'
                          }`}>
                          {keyword.found ? 'Found' : 'Missing'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {cvData.suggestions?.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card bg-base-100 shadow-lg border border-base-200"
              >
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-warning/10">
                      <FiEdit3 className="text-warning text-xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg">{suggestion.title}</h4>
                        <span className={`badge ${getPriorityColor(suggestion.priority)}`}>
                          {suggestion.priority} priority
                        </span>
                      </div>
                      <p className="text-base-content/70 mb-3">
                        {suggestion.description}
                      </p>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-primary">
                          Apply Suggestion
                        </button>
                        <button className="btn btn-sm btn-ghost">
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        <button
          onClick={proceedToQuestions}
          className="btn btn-primary gap-2"
        >
          <HiSparkles />
          Generate Interview Questions
        </button>
        <button className="btn btn-outline gap-2">
          <FiDownload />
          Download Report
        </button>
        <button className="btn btn-outline gap-2">
          <FiShare2 />
          Share Results
        </button>
        <button className="btn btn-outline gap-2">
          <FiCopy />
          Copy Link
        </button>
      </motion.div>
    </div>
  );
};

export default Results;
