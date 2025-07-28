from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# In-memory storage for demo (replace with database in production)
sessions = {}
analyses = {}


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})


@app.route("/api/session", methods=["POST"])
def create_session():
    """Create a new session"""
    session_id = f"cv_session_{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:8]}"
    sessions[session_id] = {
        "id": session_id,
        "created_at": datetime.now().isoformat(),
        "analyses": [],
    }
    return jsonify({"session_id": session_id})


@app.route("/api/debug/parse", methods=["POST"])
def debug_parse():
    """
    Debug endpoint to test text parsing
    Expected payload: {
        "cv_text": "string",
        "filename": "string"
    }
    """
    try:
        data = request.get_json()
        cv_text = data.get("cv_text")
        filename = data.get("filename", "unknown.pdf")

        if not cv_text:
            return jsonify({"error": "Missing cv_text"}), 400

        # Return debug information
        result = {
            "filename": filename,
            "text_length": len(cv_text),
            "word_count": len(cv_text.split()),
            "line_count": len(cv_text.split("\n")),
            "first_200_chars": cv_text[:200],
            "last_200_chars": cv_text[-200:] if len(cv_text) > 200 else cv_text,
            "full_text": cv_text,  # Include full text for debugging
            "success": True,
        }

        print(
            f"🔍 DEBUG PARSE: {filename} - {len(cv_text)} chars, {len(cv_text.split())} words"
        )

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e), "success": False}), 500


@app.route("/api/analyze", methods=["POST"])
def analyze_cv():
    """
    Analyze CV content and return results
    Expected payload: {
        "session_id": "string",
        "cv_text": "string",
        "filename": "string",
        "file_size": number
    }
    """
    try:
        data = request.get_json()
        session_id = data.get("session_id")
        cv_text = data.get("cv_text")
        filename = data.get("filename")
        file_size = data.get("file_size")

        if not all([session_id, cv_text, filename]):
            return jsonify({"error": "Missing required fields"}), 400

        # DEBUG: Print parsed CV text for debugging
        print("=" * 80)
        print(f"🔍 DEBUG: Processing CV file: {filename}")
        print(f"📊 File size: {file_size} bytes")
        print(f"📝 Session ID: {session_id}")
        print(f"📄 CV Text length: {len(cv_text)} characters")
        print("=" * 80)
        print("📋 PARSED CV CONTENT:")
        print("-" * 40)
        print(cv_text)
        print("-" * 40)
        print("🔚 END OF CV CONTENT")
        print("=" * 80)

        # Create analysis ID
        analysis_id = str(uuid.uuid4())

        # TODO: REPLACE THIS SECTION WITH LLM INTEGRATION
        # ================================================
        # The cv_text variable contains the parsed CV content
        # Implement your LLM analysis here to generate:
        # - ats_score: ATS compatibility score (0-100)
        # - identified_role: Job role extracted from CV
        # - keywords.found: Keywords found in the CV
        # - keywords.missing: Relevant keywords missing from CV
        # - suggestions: Array of improvement suggestions
        # - interview_questions: Role-specific interview questions
        # - strengths: CV strengths identified
        # - areas_to_improve: Areas that need improvement

        # Example LLM integration:
        # analysis_result = llm_analyze_cv(cv_text, filename)

        # For now, return structured dummy data that matches the expected format
        analysis_result = {
            "id": analysis_id,
            "session_id": session_id,
            "filename": filename,
            "file_size": file_size,
            "created_at": datetime.now().isoformat(),
            # DEBUG: Include parsed text info for debugging
            "debug_info": {
                "text_length": len(cv_text),
                "word_count": len(cv_text.split()),
                "first_100_chars": (
                    cv_text[:100] + "..." if len(cv_text) > 100 else cv_text
                ),
                "parsing_successful": True,
            },
            # Analysis results - REPLACE WITH LLM GENERATED CONTENT
            "ats_score": 85,  # TODO: Generate with LLM based on cv_text
            "identified_role": "Software Developer",  # TODO: Extract with LLM from cv_text
            "keywords": {
                "found": [
                    "React",
                    "JavaScript",
                    "Node.js",
                    "TypeScript",
                    "CSS",
                ],  # TODO: Extract with LLM
                "missing": [
                    "Docker",
                    "Kubernetes",
                    "AWS",
                    "GraphQL",
                ],  # TODO: Generate with LLM
                "role_match": 78,
            },
            "suggestions": [
                "Add more quantified achievements with specific numbers",
                "Include relevant technical keywords for better ATS matching",
                "Consider adding a professional summary section",
                "Use action verbs to start bullet points",
            ],  # TODO: Generate with LLM based on cv_text analysis
            "interview_questions": [
                "Tell me about a challenging project you worked on.",
                "How do you handle state management in React applications?",
                "Describe your experience with RESTful API development.",
                "How do you ensure code quality in your projects?",
                "What's your approach to debugging complex issues?",
            ],  # TODO: Generate with LLM based on role and experience
            "strengths": [
                "Strong technical keywords",
                "Well-structured format",
                "Relevant experience",
            ],  # TODO: Generate with LLM
            "areas_to_improve": [
                "Add more quantified achievements",
                "Include missing keywords",
                "Improve formatting consistency",
            ],  # TODO: Generate with LLM
        }
        # ================================================

        # Store analysis
        analyses[analysis_id] = analysis_result

        # Add to session
        if session_id in sessions:
            sessions[session_id]["analyses"].append(analysis_id)

        return jsonify(analysis_result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/analysis/<analysis_id>", methods=["GET"])
def get_analysis(analysis_id):
    """Get specific analysis by ID"""
    if analysis_id not in analyses:
        return jsonify({"error": "Analysis not found"}), 404

    return jsonify(analyses[analysis_id])


@app.route("/api/session/<session_id>/analyses", methods=["GET"])
def get_session_analyses(session_id):
    """Get all analyses for a session"""
    if session_id not in sessions:
        return jsonify({"error": "Session not found"}), 404

    session = sessions[session_id]
    session_analyses = []

    for analysis_id in session["analyses"]:
        if analysis_id in analyses:
            analysis = analyses[analysis_id]
            session_analyses.append(
                {
                    "id": analysis["id"],
                    "filename": analysis["filename"],
                    "ats_score": analysis["ats_score"],
                    "identified_role": analysis["identified_role"],
                    "created_at": analysis["created_at"],
                }
            )

    return jsonify(session_analyses)


@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Handle chat messages
    Expected payload: {
        "session_id": "string",
        "message": "string",
        "analysis_id": "string" (optional)
    }
    """
    try:
        data = request.get_json()
        session_id = data.get("session_id")
        message = data.get("message")
        analysis_id = data.get("analysis_id")

        if not all([session_id, message]):
            return jsonify({"error": "Missing required fields"}), 400

        # TODO: REPLACE THIS SECTION WITH LLM CHAT INTEGRATION
        # ====================================================
        # The message variable contains the user's chat message
        # The analysis_id (if provided) contains context from previous CV analysis
        # Implement your LLM chat here to generate contextual responses

        # Example LLM integration:
        # if analysis_id and analysis_id in analyses:
        #     analysis_context = analyses[analysis_id]
        #     response = llm_chat_with_context(message, analysis_context)
        # else:
        #     response = llm_chat_general(message)

        # For now, return contextual responses based on available data
        if analysis_id and analysis_id in analyses:
            analysis = analyses[analysis_id]
            # TODO: Generate contextual response using LLM with analysis data
            response = {
                "message": f"I can see you've uploaded {analysis['filename']} with an ATS score of {analysis['ats_score']}%. What specific aspect would you like me to help you with? I can provide detailed feedback on keywords, suggestions for improvement, or generate interview questions based on your experience.",
                "timestamp": datetime.now().isoformat(),
                "has_actions": True,
            }
        else:
            # TODO: Generate general response using LLM
            response = {
                "message": "I'd be happy to help you with your CV analysis! To get started, please upload your CV file and I'll provide detailed ATS scoring, keyword optimization, and personalized improvement suggestions.",
                "timestamp": datetime.now().isoformat(),
                "has_actions": False,
            }
        # ====================================================

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
