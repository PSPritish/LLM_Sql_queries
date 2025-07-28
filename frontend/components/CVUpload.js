'use client';

import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import {
  FiUpload,
  FiFile,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiDownload,
  FiSend,
  FiMessageSquare
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import useStore from '../store/useStore';

const CVUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const {
    uploadedCV,
    setUploadedCV,
    setCurrentPhase,
    isAnalyzing,
    setIsAnalyzing,
    addMessage
  } = useStore();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleFile = useCallback((file) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      addMessage({
        type: 'error',
        content: 'Please upload a PDF or Word document.',
        sender: 'system'
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      addMessage({
        type: 'error',
        content: 'File size should be less than 10MB.',
        sender: 'system'
      });
      return;
    }

    // Simulate upload progress
    setIsAnalyzing(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadedCV(file);
          setIsAnalyzing(false);
          addMessage({
            type: 'success',
            content: `CV "${file.name}" uploaded successfully! Ready for analysis.`,
            sender: 'system'
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }, [setIsAnalyzing, setUploadedCV, addMessage]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);



  const removeFile = () => {
    setUploadedCV(null);
    setUploadProgress(0);
    addMessage({
      type: 'info',
      content: 'CV removed. You can upload a new one.',
      sender: 'system'
    });
  };

  const startAnalysis = () => {
    if (uploadedCV) {
      setCurrentPhase('analysis');
      addMessage({
        type: 'info',
        content: 'Starting CV analysis...',
        sender: 'system'
      });
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    addMessage({
      type: 'info',
      content: chatInput,
      sender: 'user'
    });

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      const responses = [
        "I'd be happy to help you analyze your CV! Please upload your CV file and I'll provide detailed insights.",
        "Great question! Once you upload your CV, I can help with ATS optimization, keyword analysis, and interview preparation.",
        "I can assist you with CV improvement suggestions, role-specific keywords, and generating interview questions tailored to your experience.",
        "Upload your CV and I'll analyze it for ATS compatibility, suggest improvements, and create personalized interview questions.",
      ];

      addMessage({
        type: 'info',
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: 'assistant'
      });
      setIsTyping(false);
    }, 1500);

    setChatInput('');
  };

  const suggestedPrompts = [
    "How can I improve my CV's ATS score?",
    "What keywords should I include for a software engineer role?",
    "Can you help me prepare for interviews?",
    "How do I optimize my CV for specific job roles?"
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10">
            <HiSparkles className="text-4xl text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          AI-Powered CV Analysis
        </h1>
        <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
          Upload your CV and get instant ATS scoring, keyword optimization, and personalized interview questions.
        </p>
      </motion.div>

      {/* ChatGPT-like Interface */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-3xl mx-auto"
      >
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body p-6">
            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="relative">
              <div className="flex items-center gap-3 p-4 border-2 border-base-300 rounded-xl focus-within:border-primary transition-colors chat-input">
                <FiMessageSquare className="text-xl text-base-content/60" />
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything about CV analysis, ATS optimization, or interview prep..."
                  className="flex-1 bg-transparent outline-none text-base placeholder:text-base-content/50"
                />
                <motion.button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  className="btn btn-primary btn-sm rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isTyping ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <FiSend />
                  )}
                </motion.button>
              </div>
            </form>

            {/* Suggested Prompts */}
            <div className="mt-4">
              <p className="text-sm text-base-content/60 mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setChatInput(prompt)}
                    className="btn btn-outline btn-sm rounded-full text-xs suggested-prompt"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Or Divider */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-4 max-w-3xl mx-auto"
      >
        <div className="flex-1 h-px bg-base-300"></div>
        <span className="text-base-content/60 font-medium">OR</span>
        <div className="flex-1 h-px bg-base-300"></div>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-3xl mx-auto"
      >
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold">Upload Your CV</h3>
              <p className="text-base-content/60">Get instant AI-powered analysis</p>
            </div>
            {!uploadedCV ? (
              <div
                className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-base-300 hover:border-primary/50 hover:bg-base-50'
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleChange}
                  accept=".pdf,.doc,.docx"
                />

                <motion.div
                  className="space-y-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-primary/10">
                      <FiUpload className="text-3xl text-primary" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Drop your CV here, or click to browse
                    </h3>
                    <p className="text-base-content/60">
                      Supports PDF, DOC, DOCX files up to 10MB
                    </p>
                  </div>

                  <button className="btn btn-primary gap-2">
                    <FiUpload />
                    Choose File
                  </button>
                </motion.div>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                {/* Upload Progress */}
                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <progress
                      className="progress progress-primary w-full"
                      value={uploadProgress}
                      max="100"
                    />
                  </div>
                )}

                {/* Uploaded File */}
                {!isAnalyzing && (
                  <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-success/20">
                        <FiFile className="text-lg text-success" />
                      </div>
                      <div>
                        <p className="font-medium">{uploadedCV.name}</p>
                        <p className="text-sm text-base-content/60">
                          {(uploadedCV.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-success">
                        <FiCheck className="text-white" />
                      </div>
                      <button
                        onClick={removeFile}
                        className="btn btn-ghost btn-sm btn-circle"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {!isAnalyzing && (
                  <div className="flex gap-3 justify-center">
                    <motion.button
                      onClick={startAnalysis}
                      className="btn btn-primary gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <HiSparkles />
                      Start Analysis
                    </motion.button>
                    <button
                      onClick={removeFile}
                      className="btn btn-outline gap-2"
                    >
                      <FiX />
                      Remove
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Features Overview */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {[
          {
            icon: FiFile,
            title: 'CV Parsing',
            description: 'Extract and analyze your CV content with advanced AI',
            color: 'text-blue-500'
          },
          {
            icon: FiCheck,
            title: 'ATS Scoring',
            description: 'Get detailed ATS compatibility scores and recommendations',
            color: 'text-green-500'
          },
          {
            icon: FiAlertCircle,
            title: 'Interview Prep',
            description: 'Generate personalized interview questions based on your CV',
            color: 'text-orange-500'
          }
        ].map((feature, index) => (
          <motion.div
            key={index}
            className="card bg-base-100 shadow-lg border border-base-200"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-body text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-base-200">
                  <feature.icon className={`text-2xl ${feature.color}`} />
                </div>
              </div>
              <h3 className="card-title justify-center text-lg">
                {feature.title}
              </h3>
              <p className="text-base-content/70">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default CVUpload;
