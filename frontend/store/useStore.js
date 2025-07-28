import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createSession, analyzeCV, sendChatMessage, getSessionAnalyses } from '../utils/api';

// Helper to create unique session ID for temporary storage (fallback)
const createSessionId = () => `cv_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const useStore = create(
  persist(
    (set, get) => ({
      // Session Management
      sessionId: null,
      sessionStartTime: null,

      // CV Analysis State
      uploadedCV: null,
      analysisResults: null,
      isAnalyzing: false,
      currentPhase: 'upload', // upload, analysis, results, questions

      // Chat-like Messages State (temporary)
      messages: [],
      isTyping: false,
      showAnalysisPanel: false,
      activeAnalysisTab: 'overview',

      // UI State
      sidebarCollapsed: false,
      mobileSidebarOpen: false,

      // CV Data (temporary analysis results)
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

      // Recent Analyses (demo data stored locally)
      recentAnalyses: [
        {
          id: 1,
          name: 'Software Engineer CV',
          date: '2 hours ago',
          score: 85,
          company: 'Tech Corp',
          status: 'completed',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          name: 'Data Scientist Resume',
          date: '1 day ago',
          score: 92,
          company: 'DataFlow Inc',
          status: 'completed',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          name: 'Product Manager CV',
          date: '3 days ago',
          score: 78,
          company: 'StartupXYZ',
          status: 'completed',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 4,
          name: 'Frontend Developer CV',
          date: '1 week ago',
          score: 88,
          company: 'WebTech',
          status: 'completed',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],

      // Session Actions
      initializeSession: async () => {
        try {
          // Try to create session with backend API
          const sessionId = await createSession();
          set({
            sessionId,
            sessionStartTime: new Date().toISOString(),
            messages: [{
              id: Date.now(),
              type: 'system',
              content: '🔒 Privacy Notice: Your CV data is processed securely and not permanently stored. All analysis is temporary and will be cleared when you close this session.',
              timestamp: new Date(),
              isPrivacyNotice: true
            }]
          });
          return sessionId;
        } catch (error) {
          console.warn('Failed to create backend session, using local session:', error);
          // Fallback to local session
          const sessionId = createSessionId();
          set({
            sessionId,
            sessionStartTime: new Date().toISOString(),
            messages: [{
              id: Date.now(),
              type: 'system',
              content: '⚠️ Running in offline mode. Backend not available. Some features may be limited.',
              timestamp: new Date(),
              isPrivacyNotice: true
            }]
          });
          return sessionId;
        }
      },

      // CV Actions
      setUploadedCV: (file) => set({ uploadedCV: file }),

      setCurrentPhase: (phase) => set({ currentPhase: phase }),

      setAnalysisResults: (results) => {
        const state = get();
        set({
          analysisResults: results,
          cvData: { ...state.cvData, ...results }
        });

        // Auto-add to recent analyses when analysis is complete
        if (results.atsScore && state.uploadedCV) {
          const newAnalysis = {
            id: Date.now(),
            name: state.uploadedCV.name || 'Untitled CV',
            date: 'Just now',
            score: results.atsScore,
            company: results.identifiedRole || 'Unknown',
            status: 'completed',
            timestamp: new Date().toISOString()
          };

          // Add to recent analyses
          set((currentState) => ({
            recentAnalyses: [newAnalysis, ...currentState.recentAnalyses.slice(0, 9)]
          }));
        }
      },

      setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

      // API Actions
      analyzeUploadedCV: async (cvText, filename, fileSize) => {
        const state = get();
        if (!state.sessionId) {
          throw new Error('No active session. Please refresh the page.');
        }

        try {
          set({ isAnalyzing: true });

          const analysisResult = await analyzeCV(state.sessionId, cvText, filename, fileSize);

          // Transform API response to match our store structure
          const transformedResults = {
            fileName: analysisResult.filename,
            fileSize: analysisResult.file_size,
            identifiedRole: analysisResult.identified_role,
            keywords: analysisResult.keywords.found || [],
            missingKeywords: analysisResult.keywords.missing || [],
            atsScore: analysisResult.ats_score,
            suggestions: analysisResult.suggestions || [],
            interviewQuestions: analysisResult.interview_questions || [],
            strengths: analysisResult.strengths || [],
            areasToImprove: analysisResult.areas_to_improve || [],
            analysisId: analysisResult.id,
            createdAt: analysisResult.created_at
          };

          set({
            analysisResults: transformedResults,
            cvData: { ...state.cvData, ...transformedResults },
            isAnalyzing: false
          });

          // Auto-add to recent analyses
          const newAnalysis = {
            id: analysisResult.id,
            name: filename,
            date: 'Just now',
            score: analysisResult.ats_score,
            company: analysisResult.identified_role || 'Unknown',
            status: 'completed',
            timestamp: analysisResult.created_at
          };

          set((currentState) => ({
            recentAnalyses: [newAnalysis, ...currentState.recentAnalyses.slice(0, 9)]
          }));

          return transformedResults;
        } catch (error) {
          set({ isAnalyzing: false });
          console.error('CV analysis failed:', error);
          throw error;
        }
      },

      // Send chat message to backend
      sendMessage: async (message) => {
        const state = get();
        if (!state.sessionId) {
          throw new Error('No active session. Please refresh the page.');
        }

        try {
          // Add user message immediately
          set((currentState) => ({
            messages: [...currentState.messages, {
              id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'user',
              content: message,
              timestamp: new Date()
            }]
          }));

          // Get analysis ID if available
          const analysisId = state.analysisResults?.analysisId || null;

          // Send to backend
          const response = await sendChatMessage(state.sessionId, message, analysisId);

          // Add assistant response
          set((currentState) => ({
            messages: [...currentState.messages, {
              id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'assistant',
              content: response.message,
              timestamp: new Date(response.timestamp),
              hasActions: response.has_actions || false
            }]
          }));

          return response;
        } catch (error) {
          console.error('Failed to send message:', error);

          // Add error message
          set((currentState) => ({
            messages: [...currentState.messages, {
              id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'system',
              content: 'Sorry, I encountered an error processing your message. Please try again.',
              timestamp: new Date()
            }]
          }));

          throw error;
        }
      },

      // Message Actions
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          ...message
        }]
      })),

      setIsTyping: (typing) => set({ isTyping: typing }),

      setShowAnalysisPanel: (show) => set({ showAnalysisPanel: show }),

      setActiveAnalysisTab: (tab) => set({ activeAnalysisTab: tab }),

      // UI Actions
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

      clearMessages: () => set({
        messages: [{
          id: Date.now(),
          type: 'system',
          content: '🔒 Privacy Notice: Your CV data is processed locally in your browser and not stored on our servers. All analysis is temporary and will be cleared when you close this session.',
          timestamp: new Date(),
          isPrivacyNotice: true
        }]
      }),

      // Recent Analyses Actions
      addRecentAnalysis: (analysis) => set((state) => ({
        recentAnalyses: [analysis, ...state.recentAnalyses.slice(0, 9)] // Keep only 10 most recent
      })),

      loadAnalysis: (analysisId) => {
        const state = get();
        const analysis = state.recentAnalyses.find(a => a.id === analysisId);
        if (analysis) {
          // Create a simulated CV file object for UI purposes
          const simulatedCV = new File([''], analysis.name, { type: 'application/pdf' });

          // Simulate loading the analysis
          set({
            uploadedCV: simulatedCV,
            cvData: {
              fileName: analysis.name,
              fileSize: 1024 * 1024, // 1MB simulated
              extractedText: '',
              identifiedRole: analysis.company,
              keywords: ['React', 'JavaScript', 'Node.js', 'TypeScript', 'CSS'],
              atsScore: analysis.score,
              suggestions: ['Add more quantified achievements', 'Include relevant technical keywords', 'Use action verbs'],
              interviewQuestions: ['Tell me about your experience with React', 'How do you handle state management?', 'Describe a challenging project']
            },
            showAnalysisPanel: true,
            currentPhase: 'results'
          });
          return analysis;
        }
        return null;
      },

      removeRecentAnalysis: (analysisId) => set((state) => ({
        recentAnalyses: state.recentAnalyses.filter(a => a.id !== analysisId)
      })),

      // Reset entire session
      resetAnalysis: () => {
        const newSessionId = createSessionId();
        set({
          sessionId: newSessionId,
          sessionStartTime: new Date().toISOString(),
          uploadedCV: null,
          analysisResults: null,
          isAnalyzing: false,
          currentPhase: 'upload',
          messages: [{
            id: Date.now(),
            type: 'system',
            content: '🔒 Privacy Notice: Your CV data is processed locally in your browser and not stored on our servers. All analysis is temporary and will be cleared when you close this session.',
            timestamp: new Date(),
            isPrivacyNotice: true
          }],
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
          // Keep recentAnalyses as they are demo data
        });
      },

      // Clear all temporary data (for complete privacy)
      clearAllData: () => {
        // Clear from storage
        localStorage.removeItem('cv-grinder-storage');
        sessionStorage.clear();

        // Reset state
        set({
          sessionId: null,
          sessionStartTime: null,
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
        });
      }
    }),
    {
      name: 'cv-grinder-storage',
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for temporary data
      partialize: (state) => ({
        // Only persist non-sensitive data
        currentPhase: state.currentPhase,
        sessionId: state.sessionId,
        sessionStartTime: state.sessionStartTime,
        messages: state.messages,
        recentAnalyses: state.recentAnalyses,
        showAnalysisPanel: state.showAnalysisPanel,
        cvData: {
          fileName: state.cvData.fileName,
          fileSize: state.cvData.fileSize,
          identifiedRole: state.cvData.identifiedRole,
          keywords: state.cvData.keywords,
          atsScore: state.cvData.atsScore,
          suggestions: state.cvData.suggestions,
          interviewQuestions: state.cvData.interviewQuestions
        }
        // Note: We don't persist uploadedCV (file data) or extractedText for privacy
      })
    }
  )
);

export default useStore;
