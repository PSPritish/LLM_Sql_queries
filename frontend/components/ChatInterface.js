'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import {
  FiSend,
  FiPaperclip,
  FiFile,
  FiX,
  FiCheck,
  FiChevronRight,
  FiChevronLeft,
  FiBarChart,
  FiTarget,
  FiMessageSquare,
  FiAlertTriangle
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import useStore from '../store/useStore';
import AnalysisPanel from './AnalysisPanel';
import { parseDocument, isSupportedDocument, formatFileSize, debugFileInfo } from '../utils/documentParser';
import { debugParseText, checkBackendHealth } from '../utils/api';

const ChatInterface = () => {
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    messages,
    addMessage,
    uploadedCV,
    setUploadedCV,
    isAnalyzing,
    setIsAnalyzing,
    sessionId,
    initializeSession,
    showAnalysisPanel,
    setShowAnalysisPanel,
    cvData,
    setAnalysisResults,
    setActiveAnalysisTab,
    analyzeUploadedCV,
    sendMessage
  } = useStore();

  useEffect(() => {
    if (!sessionId) {
      initializeSession();
    }
  }, [sessionId, initializeSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileUpload = async (file) => {
    // Validate file type
    if (!isSupportedDocument(file)) {
      addMessage({
        type: 'system',
        content: 'Please upload a PDF, DOC, or DOCX document.',
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      addMessage({
        type: 'system',
        content: 'File size should be less than 10MB.',
      });
      return;
    }

    setUploadedCV(file);
    addMessage({
      type: 'user',
      content: `📎 Uploaded CV: ${file.name} (${formatFileSize(file.size)})`
    });

    try {
      // Parse the document
      addMessage({
        type: 'assistant',
        content: `Processing "${file.name}"... Please wait while I extract and analyze the content.`
      });

      // DEBUG: Log file information
      const fileInfo = await debugFileInfo(file);
      console.log('📁 File Info:', fileInfo);

      const { text, metadata } = await parseDocument(file);

      // DEBUG: Console log the parsed text
      console.log('='.repeat(80));
      console.log('🔍 FRONTEND DEBUG: Document parsing result');
      console.log('📄 Filename:', file.name);
      console.log('📊 File size:', file.size, 'bytes');
      console.log('📝 Text length:', text.length, 'characters');
      console.log('📈 Word count:', metadata.wordCount);
      console.log('='.repeat(80));
      console.log('📋 PARSED TEXT CONTENT:');
      console.log('-'.repeat(40));
      console.log(text);
      console.log('-'.repeat(40));
      console.log('🔚 END OF PARSED TEXT');
      console.log('='.repeat(80));

      if (!text.trim()) {
        throw new Error('No text content could be extracted from the document.');
      }

      // Analyze with backend
      addMessage({
        type: 'assistant',
        content: `✅ Document parsed successfully (${metadata.wordCount} words). Now analyzing content...`
      });      // DEBUG: Send to debug endpoint first
      try {
        // Check if backend is available
        const backendHealthy = await checkBackendHealth();
        if (!backendHealthy) {
          addMessage({
            type: 'system',
            content: `⚠️ Backend service is not available. Please ensure the Flask backend is running on port 5000.`
          });
        }

        const debugResult = await debugParseText(text, file.name);
        console.log('🔍 DEBUG BACKEND RESPONSE:', debugResult);

        addMessage({
          type: 'system',
          content: `🛠️ **Backend Debug Info:**\n• Received ${debugResult.text_length} characters\n• ${debugResult.word_count} words, ${debugResult.line_count} lines\n• Backend processing: ${debugResult.success ? '✅ Success' : '❌ Failed'}`
        });
      } catch (debugError) {
        console.error('Debug endpoint failed:', debugError);
        addMessage({
          type: 'system',
          content: `⚠️ Debug endpoint failed: ${debugError.message}. Backend may not be running.`
        });
      }

      const analysisResult = await analyzeUploadedCV(text, file.name, file.size);

      // DEBUG: Show parsed text info in chat
      if (analysisResult.debug_info) {
        addMessage({
          type: 'system',
          content: `🔍 **Debug Info:**\n• Text length: ${analysisResult.debug_info.text_length} characters\n• Word count: ${analysisResult.debug_info.word_count} words\n• Preview: "${analysisResult.debug_info.first_100_chars}"\n• Parsing successful: ${analysisResult.debug_info.parsing_successful ? '✅' : '❌'}`
        });
      }

      addMessage({
        type: 'assistant',
        content: `🎉 Analysis complete! Your CV "${file.name}" scored **${analysisResult.atsScore}%** on ATS compatibility.\n\n**Identified Role:** ${analysisResult.identifiedRole}\n\n🔍 I can help you with:\n• **ATS Optimization** - Improve compatibility scores\n• **Keyword Analysis** - Find missing industry keywords\n• **Content Suggestions** - Get personalized recommendations\n• **Interview Preparation** - Practice with role-specific questions\n\nWhat would you like to explore first?`,
        hasActions: true
      });

      setShowAnalysisPanel(true);

    } catch (error) {
      console.error('File processing error:', error);

      let errorMessage = 'Sorry, I encountered an error processing your CV. ';

      if (error.message.includes('No readable text') || error.message.includes('No text content')) {
        errorMessage += 'The document appears to be empty or the text could not be extracted. This might be an image-based PDF or corrupted file. Please ensure your CV contains readable text.';
      } else if (error.message.includes('Invalid PDF')) {
        errorMessage += 'The PDF file appears to be corrupted or invalid. Please try re-saving or re-creating the PDF.';
      } else if (error.message.includes('password')) {
        errorMessage += 'Password-protected documents are not supported. Please upload an unprotected version.';
      } else if (error.message.includes('initialize') || error.message.includes('PDF parser')) {
        errorMessage += 'Failed to initialize the PDF parser. Please refresh the page and try again.';
      } else if (error.message.includes('Backend') || error.message.includes('Failed to analyze')) {
        errorMessage += 'The analysis service is currently unavailable. Please try again later.';
      } else if (error.message.includes('session')) {
        errorMessage += 'Your session has expired. Please refresh the page and try again.';
      } else if (error.message.includes('DOC file')) {
        errorMessage += 'Old DOC format has limited support. Please convert to DOCX or PDF for better results.';
      } else {
        errorMessage += 'Please try uploading a different format (PDF, DOCX) or check if the file is corrupted.';
      }

      addMessage({
        type: 'system',
        content: errorMessage
      });

      // Reset uploaded CV on error
      setUploadedCV(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');

    try {
      setIsTyping(true);
      await sendMessage(userMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Error message is already added by the sendMessage function
    } finally {
      setIsTyping(false);
    }
  };

  const suggestedPrompts = [
    "Analyze my CV for ATS compatibility",
    "What keywords should I add for a software engineer role?",
    "Generate interview questions based on my experience",
    "How can I improve my CV format?"
  ];

  const quickActions = [
    {
      icon: FiBarChart,
      label: "ATS Analysis",
      action: () => {
        setActiveAnalysisTab('overview');
        setShowAnalysisPanel(true);
      }
    },
    {
      icon: FiTarget,
      label: "Keywords",
      action: () => {
        setActiveAnalysisTab('keywords');
        setShowAnalysisPanel(true);
      }
    },
    {
      icon: FiMessageSquare,
      label: "Interview Prep",
      action: () => {
        setActiveAnalysisTab('interview');
        setShowAnalysisPanel(true);
      }
    }
  ];

  return (
    <div className="flex h-full bg-base-100">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div
          className={`flex-1 overflow-y-auto p-4 ${dragActive ? 'bg-primary/5 border-2 border-dashed border-primary' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="mb-6">
                  <div className="avatar placeholder mx-auto mb-4">
                    <div className="bg-primary text-primary-content rounded-full w-16">
                      <HiSparkles className="text-3xl" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Welcome to CV Grinder</h2>
                  <p className="text-base-content/60 max-w-md mx-auto">
                    Upload your CV and get AI-powered analysis, ATS scoring, and interview preparation tips.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
                  {[
                    { icon: FiFile, title: "Upload CV", desc: "PDF, DOC, or DOCX format" },
                    { icon: FiBarChart, title: "ATS Analysis", desc: "Check compatibility scores" },
                    { icon: FiTarget, title: "Keywords", desc: "Optimize for your target role" },
                    { icon: FiMessageSquare, title: "Interview Prep", desc: "Practice with AI questions" }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="card bg-base-200 p-4 text-center"
                      whileHover={{ y: -2 }}
                    >
                      <item.icon className="text-2xl text-primary mx-auto mb-2" />
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-base-content/60">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-base-content/60">Try asking:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestedPrompts.map((prompt, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setChatInput(prompt)}
                        className="btn btn-outline btn-sm"
                        whileHover={{ scale: 1.02 }}
                      >
                        {prompt}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                  {message.type === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="avatar placeholder">
                        <div className="bg-base-200 text-base-content rounded-full w-8">
                          <HiSparkles className="text-sm" />
                        </div>
                      </div>
                      <span className="text-sm font-medium">CV Assistant</span>
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-lg ${message.type === 'user'
                      ? 'bg-primary text-primary-content ml-12'
                      : message.type === 'system'
                        ? 'bg-warning/10 border border-warning/20 text-warning-content'
                        : 'bg-base-200 text-base-content'
                      }`}
                  >
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap m-0">{message.content}</p>
                    </div>

                    {message.hasActions && uploadedCV && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-base-300">
                        {quickActions.map((action, index) => (
                          <motion.button
                            key={index}
                            onClick={action.action}
                            className="btn btn-sm btn-outline gap-1"
                            whileHover={{ scale: 1.05 }}
                          >
                            <action.icon className="text-xs" />
                            {action.label}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-base-content/50 mt-1 px-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="avatar placeholder">
                    <div className="bg-base-200 text-base-content rounded-full w-8">
                      <HiSparkles className="text-sm" />
                    </div>
                  </div>
                  <div className="bg-base-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="loading loading-dots loading-sm"></span>
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-base-200 p-4 bg-base-100">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-end gap-3 p-4 border-2 border-base-300 rounded-xl focus-within:border-primary transition-colors bg-base-100">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />

                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-ghost btn-sm btn-circle"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiPaperclip className="text-lg" />
                </motion.button>

                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything about CV analysis, upload your CV, or get interview tips..."
                  className="flex-1 bg-transparent outline-none resize-none max-h-32 min-h-[2.5rem] placeholder:text-base-content/50"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />

                <motion.button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  className="btn btn-primary btn-sm btn-circle"
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

            {uploadedCV && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mt-3 p-3 bg-success/10 border border-success/20 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <FiFile className="text-success" />
                  <div>
                    <p className="text-sm font-medium">{uploadedCV.name}</p>
                    <p className="text-xs text-base-content/60">
                      {(uploadedCV.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="text-success" />
                  <motion.button
                    onClick={() => setUploadedCV(null)}
                    className="btn btn-ghost btn-xs btn-circle"
                    whileHover={{ scale: 1.1 }}
                  >
                    <FiX />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Panel */}
      {showAnalysisPanel && (uploadedCV || cvData.fileName) && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="w-96 border-l border-base-200 bg-base-50"
        >
          <AnalysisPanel onClose={() => setShowAnalysisPanel(false)} />
        </motion.div>
      )}
    </div>
  );
};

export default ChatInterface;
