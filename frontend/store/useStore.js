import { create } from 'zustand';

const useStore = create((set, get) => ({
  // CV Analysis State
  uploadedCV: null,
  analysisResults: null,
  isAnalyzing: false,
  currentPhase: 'upload', // upload, analysis, results, questions

  // Chat-like Messages State
  messages: [],
  isTyping: false,

  // CV Data
  cvData: {
    fileName: '',
    fileSize: 0,
    extractedText: '',
    identifiedRole: '',
    keywords: [],
    atsScore: 0,
    suggestions: [],
    interviewQuestions: []
  },

  // Actions
  setUploadedCV: (file) => set({ uploadedCV: file }),

  setCurrentPhase: (phase) => set({ currentPhase: phase }),

  setAnalysisResults: (results) => set({
    analysisResults: results,
    cvData: { ...get().cvData, ...results }
  }),

  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      id: Date.now(),
      timestamp: new Date(),
      ...message
    }]
  })),

  setIsTyping: (typing) => set({ isTyping: typing }),

  clearMessages: () => set({ messages: [] }),

  resetAnalysis: () => set({
    uploadedCV: null,
    analysisResults: null,
    isAnalyzing: false,
    currentPhase: 'upload',
    messages: [],
    cvData: {
      fileName: '',
      fileSize: 0,
      extractedText: '',
      identifiedRole: '',
      keywords: [],
      atsScore: 0,
      suggestions: [],
      interviewQuestions: []
    }
  })
}));

export default useStore;
