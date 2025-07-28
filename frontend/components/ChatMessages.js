'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import {
  FiCheck,
  FiX,
  FiInfo,
  FiAlertTriangle,
  FiUser,
  FiCpu
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import useStore from '../store/useStore';

const ChatMessages = () => {
  const { messages, isTyping } = useStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getMessageIcon = (type, sender) => {
    if (sender === 'system') {
      switch (type) {
        case 'success': return <FiCheck className="text-success" />;
        case 'error': return <FiX className="text-error" />;
        case 'warning': return <FiAlertTriangle className="text-warning" />;
        default: return <FiInfo className="text-info" />;
      }
    }
    return sender === 'user' ? <FiUser className="text-primary" /> : <HiSparkles className="text-secondary" />;
  };

  const getMessageStyle = (type, sender) => {
    if (sender === 'user') {
      return 'chat-end';
    }

    switch (type) {
      case 'success':
        return 'chat-start bg-success/10 border-success/20';
      case 'error':
        return 'chat-start bg-error/10 border-error/20';
      case 'warning':
        return 'chat-start bg-warning/10 border-warning/20';
      default:
        return 'chat-start';
    }
  };

  if (messages.length === 0 && !isTyping) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-base-100 border border-base-200 rounded-lg shadow-xl overflow-hidden z-50">
      <div className="p-3 bg-primary text-primary-content border-b border-primary/20">
        <div className="flex items-center gap-2">
          <HiSparkles className="text-lg" />
          <span className="font-semibold">CV Assistant</span>
        </div>
      </div>

      <div className="p-4 h-80 overflow-y-auto space-y-3">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              className={`chat ${getMessageStyle(message.type, message.sender)}`}
            >
              <div className="chat-image avatar">
                <div className="w-8 rounded-full bg-base-200 flex items-center justify-center">
                  {getMessageIcon(message.type, message.sender)}
                </div>
              </div>

              <div className="chat-header">
                <span className="text-xs text-base-content/60">
                  {message.sender === 'user' ? 'You' : 'Assistant'}
                </span>
                <time className="text-xs opacity-50 ml-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </time>
              </div>

              <div className={`chat-bubble ${message.sender === 'user'
                  ? 'chat-bubble-primary'
                  : message.type === 'error'
                    ? 'chat-bubble-error'
                    : message.type === 'success'
                      ? 'chat-bubble-success'
                      : message.type === 'warning'
                        ? 'chat-bubble-warning'
                        : 'chat-bubble-info'
                }`}>
                {message.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="chat chat-start"
          >
            <div className="chat-image avatar">
              <div className="w-8 rounded-full bg-base-200 flex items-center justify-center">
                <HiSparkles className="text-secondary animate-pulse" />
              </div>
            </div>
            <div className="chat-bubble chat-bubble-info">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
