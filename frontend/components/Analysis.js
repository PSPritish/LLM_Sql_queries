'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FiTarget,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiSearch,
  FiUser,
  FiFileText
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import useStore from '../store/useStore';

const Analysis = () => {
  const [analysisStep, setAnalysisStep] = useState(0);
  const [simulatedResults, setSimulatedResults] = useState(null);
  const {
    uploadedCV,
    setAnalysisResults,
    setCurrentPhase,
    addMessage,
    isAnalyzing,
    setIsAnalyzing
  } = useStore();

  const analysisSteps = useMemo(() => [
    { label: 'Parsing CV Content', icon: FiFileText },
    { label: 'Identifying Role & Keywords', icon: FiSearch },
    { label: 'Calculating ATS Score', icon: FiTarget },
    { label: 'Generating Suggestions', icon: HiSparkles },
    { label: 'Creating Interview Questions', icon: FiUser }
  ], []);

  const startAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Simulate analysis steps
    for (let i = 0; i < analysisSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnalysisStep(i + 1);

      addMessage({
        type: 'info',
        content: `${analysisSteps[i].label}...`,
        sender: 'system'
      });
    }

    // Generate mock results
    const mockResults = {
      fileName: uploadedCV.name,
      fileSize: uploadedCV.size,
      extractedText: 'Sample extracted text from CV...',
      identifiedRole: 'Software Engineer',
      keywords: [
        { word: 'JavaScript', found: true, importance: 'high' },
        { word: 'React', found: true, importance: 'high' },
        { word: 'Node.js', found: true, importance: 'medium' },
        { word: 'Python', found: false, importance: 'medium' },
        { word: 'AWS', found: true, importance: 'high' },
        { word: 'Docker', found: false, importance: 'low' },
        { word: 'TypeScript', found: true, importance: 'medium' },
        { word: 'MongoDB', found: false, importance: 'low' }
      ],
      atsScore: 78,
      suggestions: [
        {
          type: 'keyword',
          title: 'Add Missing Keywords',
          description: 'Include "Python" and "Docker" to improve ATS compatibility',
          priority: 'high'
        },
        {
          type: 'format',
          title: 'Use Action Verbs',
          description: 'Start bullet points with strong action verbs like "Developed", "Implemented", "Led"',
          priority: 'medium'
        },
        {
          type: 'content',
          title: 'Quantify Achievements',
          description: 'Add metrics and numbers to demonstrate impact (e.g., "Improved performance by 30%")',
          priority: 'high'
        }
      ],
      interviewQuestions: [
        {
          category: 'Technical',
          question: 'Explain the difference between React class components and functional components.',
          difficulty: 'Medium'
        },
        {
          category: 'Behavioral',
          question: 'Tell me about a challenging project you worked on and how you overcame the obstacles.',
          difficulty: 'Medium'
        },
        {
          category: 'Technical',
          question: 'How would you optimize a slow-performing React application?',
          difficulty: 'Hard'
        },
        {
          category: 'Situational',
          question: 'How do you stay updated with the latest JavaScript frameworks and technologies?',
          difficulty: 'Easy'
        }
      ]
    };

    setSimulatedResults(mockResults);
    setAnalysisResults(mockResults);
    setIsAnalyzing(false);

    addMessage({
      type: 'success',
      content: 'Analysis complete! Your CV has been scored and optimized suggestions are ready.',
      sender: 'system'
    });
  }, [uploadedCV, setIsAnalyzing, setAnalysisResults, addMessage, analysisSteps]);

  useEffect(() => {
    if (uploadedCV) {
      startAnalysis();
    }
  }, [uploadedCV, startAnalysis]);

  const proceedToResults = () => {
    setCurrentPhase('results');
  };

  if (!isAnalyzing && simulatedResults) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Analysis Complete Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <motion.div
              className="p-4 rounded-full bg-success/10"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FiCheckCircle className="text-4xl text-success" />
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold">Analysis Complete!</h1>
          <p className="text-lg text-base-content/70">
            Your CV has been analyzed. Here&apos;s a quick overview:
          </p>
        </motion.div>

        {/* Quick Results */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-4"
        >
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body text-center">
              <FiTarget className="text-3xl text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{simulatedResults.atsScore}%</div>
              <div className="text-sm text-base-content/60">ATS Score</div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body text-center">
              <FiSearch className="text-3xl text-success mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {simulatedResults.keywords.filter(k => k.found).length}/{simulatedResults.keywords.length}
              </div>
              <div className="text-sm text-base-content/60">Keywords Found</div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body text-center">
              <HiSparkles className="text-3xl text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold">{simulatedResults.suggestions.length}</div>
              <div className="text-sm text-base-content/60">Suggestions</div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body text-center">
              <FiUser className="text-3xl text-info mx-auto mb-2" />
              <div className="text-2xl font-bold">{simulatedResults.interviewQuestions.length}</div>
              <div className="text-sm text-base-content/60">Questions</div>
            </div>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <button
            onClick={proceedToResults}
            className="btn btn-primary btn-lg gap-3"
          >
            <FiTrendingUp />
            View Detailed Results
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            className="flex justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="p-4 rounded-full bg-primary/10">
              <HiSparkles className="text-4xl text-primary" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold">Analyzing Your CV</h1>
          <p className="text-lg text-base-content/70">
            Our AI is processing your CV to provide comprehensive insights...
          </p>
        </div>

        {/* Analysis Steps */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <div className="space-y-4">
              {analysisSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: index <= analysisStep ? 1 : 0.5,
                    x: 0
                  }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-lg ${index < analysisStep
                      ? 'bg-success/10 border border-success/20'
                      : index === analysisStep
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-base-200'
                    }`}
                >
                  <div className={`p-2 rounded-full ${index < analysisStep
                      ? 'bg-success text-white'
                      : index === analysisStep
                        ? 'bg-primary text-white'
                        : 'bg-base-300'
                    }`}>
                    {index < analysisStep ? (
                      <FiCheckCircle className="text-lg" />
                    ) : (
                      <step.icon className="text-lg" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium">{step.label}</p>
                    {index === analysisStep && (
                      <div className="mt-2">
                        <progress className="progress progress-primary w-full" />
                      </div>
                    )}
                  </div>

                  {index < analysisStep && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-success"
                    >
                      <FiCheckCircle className="text-xl" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Analysis Progress</span>
            <span>{Math.round((analysisStep / analysisSteps.length) * 100)}%</span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={analysisStep}
            max={analysisSteps.length}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Analysis;
