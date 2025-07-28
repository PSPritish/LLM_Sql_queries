/**
 * API utility functions for communicating with Flask backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Create a new session
 * @returns {Promise<string>} Session ID
 */
export async function createSession() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }

    const data = await response.json();
    return data.session_id;
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session. Please check if the backend is running.');
  }
}

/**
 * Analyze CV content
 * @param {string} sessionId - Session ID
 * @param {string} cvText - Extracted CV text
 * @param {string} filename - Original filename
 * @param {number} fileSize - File size in bytes
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeCV(sessionId, cvText, filename, fileSize) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        cv_text: cvText,
        filename: filename,
        file_size: fileSize
      }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing CV:', error);
    throw new Error('Failed to analyze CV. Please try again.');
  }
}

/**
 * Send chat message
 * @param {string} sessionId - Session ID
 * @param {string} message - User message
 * @param {string} analysisId - Optional analysis ID for context
 * @returns {Promise<Object>} Chat response
 */
export async function sendChatMessage(sessionId, message, analysisId = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        message: message,
        analysis_id: analysisId
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw new Error('Failed to send message. Please try again.');
  }
}

/**
 * Get analysis by ID
 * @param {string} analysisId - Analysis ID
 * @returns {Promise<Object>} Analysis data
 */
export async function getAnalysis(analysisId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analysis/${analysisId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get analysis: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting analysis:', error);
    throw new Error('Failed to retrieve analysis.');
  }
}

/**
 * Get all analyses for a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Array>} Array of analysis summaries
 */
export async function getSessionAnalyses(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/session/${sessionId}/analyses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get session analyses: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting session analyses:', error);
    throw new Error('Failed to retrieve session analyses.');
  }
}

/**
 * Check backend health
 * @returns {Promise<boolean>} Whether backend is healthy
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

/**
 * Debug endpoint to test text parsing
 * @param {string} cvText - Extracted CV text
 * @param {string} filename - Original filename
 * @returns {Promise<Object>} Debug information
 */
export async function debugParseText(cvText, filename) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/debug/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cv_text: cvText,
        filename: filename
      }),
    });

    if (!response.ok) {
      throw new Error(`Debug parse failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in debug parse:', error);
    throw new Error('Failed to debug parse text.');
  }
}
