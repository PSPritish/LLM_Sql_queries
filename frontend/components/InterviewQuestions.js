'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  FiMessageSquare,
  FiUser,
  FiCode,
  FiHelpCircle,
  FiRefreshCw,
  FiDownload,
  FiBookmark,
  FiPlay,
  FiPause
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import useStore from '../store/useStore';

const InterviewQuestions = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const { cvData } = useStore();

  const categories = [
    { id: 'all', label: 'All Categories', icon: FiMessageSquare },
    { id: 'technical', label: 'Technical', icon: FiCode },
    { id: 'behavioral', label: 'Behavioral', icon: FiUser },
    { id: 'situational', label: 'Situational', icon: FiHelpCircle }
  ];

  const difficulties = [
    { id: 'all', label: 'All Levels' },
    { id: 'easy', label: 'Easy', color: 'badge-success' },
    { id: 'medium', label: 'Medium', color: 'badge-warning' },
    { id: 'hard', label: 'Hard', color: 'badge-error' }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'hard': return 'badge-error';
      default: return 'badge-neutral';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'technical': return FiCode;
      case 'behavioral': return FiUser;
      case 'situational': return FiHelpCircle;
      default: return FiMessageSquare;
    }
  };

  const filteredQuestions = cvData.interviewQuestions?.filter(question => {
    const categoryMatch = selectedCategory === 'all' ||
      question.category.toLowerCase() === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' ||
      question.difficulty.toLowerCase() === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  }) || [];

  const generateMoreQuestions = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
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
            <FiMessageSquare className="text-4xl text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">Interview Questions</h1>
        <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
          Personalized interview questions based on your CV and the {cvData.identifiedRole} role
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="card bg-base-100 shadow-lg border border-base-200"
      >
        <div className="card-body">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Category</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`btn btn-sm gap-2 ${selectedCategory === category.id ? 'btn-primary' : 'btn-outline'
                      }`}
                  >
                    <category.icon className="text-sm" />
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Difficulty</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty.id}
                    onClick={() => setSelectedDifficulty(difficulty.id)}
                    className={`btn btn-sm ${selectedDifficulty === difficulty.id ? 'btn-primary' : 'btn-outline'
                      }`}
                  >
                    {difficulty.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Questions Count */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-between items-center"
      >
        <div className="text-lg">
          <span className="font-semibold">{filteredQuestions.length}</span> questions found
        </div>
        <div className="flex gap-2">
          <button
            onClick={generateMoreQuestions}
            disabled={isGenerating}
            className="btn btn-primary gap-2"
          >
            {isGenerating ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Generating...
              </>
            ) : (
              <>
                <FiRefreshCw />
                Generate More
              </>
            )}
          </button>
          <button className="btn btn-outline gap-2">
            <FiDownload />
            Export
          </button>
        </div>
      </motion.div>

      {/* Questions List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {filteredQuestions.map((question, index) => {
          const CategoryIcon = getCategoryIcon(question.category);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card bg-base-100 shadow-lg border border-base-200 hover:shadow-xl transition-shadow"
            >
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <CategoryIcon className="text-primary text-xl" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="badge badge-outline">
                        {question.category}
                      </span>
                      <span className={`badge ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                    </div>

                    <h3 className="text-lg font-medium mb-4 leading-relaxed">
                      {question.question}
                    </h3>

                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-outline gap-2">
                        <FiPlay />
                        Practice
                      </button>
                      <button className="btn btn-sm btn-ghost gap-2">
                        <FiBookmark />
                        Save
                      </button>
                      <button className="btn btn-sm btn-ghost gap-2">
                        <HiSparkles />
                        Get Hints
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* No Questions Found */}
      {filteredQuestions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="p-4 rounded-full bg-base-200 inline-block mb-4">
            <FiMessageSquare className="text-4xl text-base-content/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No questions found</h3>
          <p className="text-base-content/70 mb-4">
            Try adjusting your filters or generate more questions
          </p>
          <button
            onClick={generateMoreQuestions}
            className="btn btn-primary gap-2"
          >
            <FiRefreshCw />
            Generate Questions
          </button>
        </motion.div>
      )}

      {/* Practice Session Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="card bg-gradient-to-r from-success to-info text-white shadow-xl"
      >
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="card-title text-2xl mb-2">Ready for a Practice Session?</h3>
              <p className="text-white/80">
                Start a timed interview simulation with these questions
              </p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-white gap-2">
                <FiPlay />
                Start Session
              </button>
              <button className="btn btn-outline btn-white gap-2">
                <FiPause />
                Custom Session
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tips Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="card bg-base-100 shadow-lg border border-base-200"
      >
        <div className="card-body">
          <h3 className="card-title">💡 Interview Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Technical Questions:</h4>
              <ul className="text-sm text-base-content/70 space-y-1">
                <li>• Explain your thought process clearly</li>
                <li>• Use specific examples from your projects</li>
                <li>• Discuss trade-offs and alternatives</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Behavioral Questions:</h4>
              <ul className="text-sm text-base-content/70 space-y-1">
                <li>• Use the STAR method (Situation, Task, Action, Result)</li>
                <li>• Be specific and quantify results</li>
                <li>• Show growth and learning from experiences</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InterviewQuestions;
