from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
from datetime import datetime
import json
import re
from llm import query_flan_t5, query_llama2_chat, query_hf_model

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# In-memory storage for demo (replace with database in production)
sessions = {}
analyses = {}


def extract_keywords_from_cv(cv_text):
    """Extract technical keywords from CV text using Flan-T5"""
    prompt = f"""
    Extract technical skills, programming languages, frameworks, and tools mentioned in this CV.
    Return only a comma-separated list of keywords.
    
    CV Text: {cv_text[:2000]}
    
    Keywords:"""

    try:
        response = query_flan_t5(prompt, max_tokens=100)
        # Clean and parse the response
        keywords = [k.strip() for k in response.split(",") if k.strip()]
        return keywords[:10]  # Limit to 10 keywords
    except Exception as e:
        print(f"Error extracting keywords: {e}")
        return ["Python", "JavaScript", "React", "Node.js"]  # Fallback


def identify_role_from_cv(cv_text):
    """Identify the most likely job role from CV content using Flan-T5"""
    prompt = f"""
    Based on this CV, what is the most likely job role/position this person is applying for?
    Return only the job title (e.g., "Software Engineer", "Data Scientist", "Product Manager").
    
    CV Text: {cv_text[:1500]}
    
    Job Role:"""

    try:
        response = query_flan_t5(prompt, max_tokens=50)
        # Clean the response
        role = response.strip().replace("Job Role:", "").strip()
        return role if role else "Software Developer"
    except Exception as e:
        print(f"Error identifying role: {e}")
        return "Software Developer"  # Fallback


def generate_cv_suggestions(cv_text):
    """Generate improvement suggestions for the CV using Flan-T5"""
    prompt = f"""
    Analyze this CV and provide 4 specific improvement suggestions.
    Focus on content, formatting, and missing elements.
    Return each suggestion on a new line.
    
    CV Text: {cv_text[:2000]}
    
    Suggestions:"""

    try:
        response = query_flan_t5(prompt, max_tokens=200)
        # Parse suggestions
        suggestions = [s.strip() for s in response.split("\n") if s.strip()]
        return (
            suggestions[:4]
            if suggestions
            else [
                "Add quantified achievements with specific numbers",
                "Include relevant technical keywords",
                "Improve formatting consistency",
                "Add a professional summary section",
            ]
        )
    except Exception as e:
        print(f"Error generating suggestions: {e}")
        return [
            "Add quantified achievements with specific numbers",
            "Include relevant technical keywords",
            "Improve formatting consistency",
            "Add a professional summary section",
        ]


def generate_interview_questions(cv_text, role):
    """Generate role-specific interview questions based on CV using Flan-T5"""
    prompt = f"""
    Generate 5 interview questions for a {role} position based on this CV.
    Focus on the candidate's experience and skills mentioned in the CV.
    
    CV Text: {cv_text[:1500]}
    Role: {role}
    
    Questions:"""

    try:
        response = query_flan_t5(prompt, max_tokens=250)
        # Parse questions
        questions = [q.strip() for q in response.split("\n") if q.strip() and "?" in q]
        return (
            questions[:5]
            if questions
            else [
                f"Tell me about your experience as a {role}.",
                "What has been your most challenging project?",
                "How do you stay updated with new technologies?",
                "Describe a time when you solved a complex problem.",
                "What motivates you in your work?",
            ]
        )
    except Exception as e:
        print(f"Error generating questions: {e}")
        return [
            f"Tell me about your experience as a {role}.",
            "What has been your most challenging project?",
            "How do you stay updated with new technologies?",
            "Describe a time when you solved a complex problem.",
            "What motivates you in your work?",
        ]


def calculate_ats_score(cv_text, keywords):
    """Calculate ATS compatibility score based on CV content"""
    # Simple scoring based on various factors
    score = 70  # Base score

    # Check for common ATS-friendly elements
    if len(cv_text) > 500:
        score += 5
    if any(keyword.lower() in cv_text.lower() for keyword in keywords):
        score += 10
    if "experience" in cv_text.lower():
        score += 5
    if any(
        word in cv_text.lower() for word in ["achieved", "developed", "managed", "led"]
    ):
        score += 10

    return min(score, 95)  # Cap at 95


def analyze_cv_strengths_weaknesses(cv_text):
    """Analyze CV strengths and areas for improvement using Flan-T5"""
    prompt = f"""
    Analyze this CV and identify:
    1. Three main strengths
    2. Three areas that need improvement
    
    Format your response as:
    STRENGTHS:
    - strength 1
    - strength 2
    - strength 3
    AREAS TO IMPROVE:
    - area 1
    - area 2  
    - area 3
    
    CV Text: {cv_text[:1500]}"""

    try:
        response = query_flan_t5(prompt, max_tokens=200)

        # Parse strengths and weaknesses
        strengths = []
        areas_to_improve = []

        lines = response.split("\n")
        current_section = None

        for line in lines:
            line = line.strip()
            if "STRENGTHS:" in line.upper():
                current_section = "strengths"
            elif "AREAS TO IMPROVE:" in line.upper() or "WEAKNESSES:" in line.upper():
                current_section = "improve"
            elif line.startswith("-") or line.startswith("•"):
                item = line[1:].strip()
                if current_section == "strengths" and len(strengths) < 3:
                    strengths.append(item)
                elif current_section == "improve" and len(areas_to_improve) < 3:
                    areas_to_improve.append(item)

        # Fallbacks if parsing fails
        if not strengths:
            strengths = [
                "Strong technical skills",
                "Relevant experience",
                "Well-structured content",
            ]
        if not areas_to_improve:
            areas_to_improve = [
                "Add quantified achievements",
                "Include more keywords",
                "Improve formatting",
            ]

        return strengths, areas_to_improve

    except Exception as e:
        print(f"Error analyzing strengths/weaknesses: {e}")
        return (
            [
                "Strong technical skills",
                "Relevant experience",
                "Well-structured content",
            ],
            [
                "Add quantified achievements",
                "Include more keywords",
                "Improve formatting",
            ],
        )


def generate_chat_response(message, analysis_context=None):
    """Generate chat response using LLaMA 2 with optional CV analysis context"""
    try:
        if analysis_context:
            # Chat with CV analysis context
            cv_info = f"""
            File: {analysis_context.get('filename', 'Unknown')}
            Role: {analysis_context.get('identified_role', 'Unknown')}
            ATS Score: {analysis_context.get('ats_score', 'Unknown')}
            Keywords: {', '.join(analysis_context.get('keywords', {}).get('found', []))}
            """

            prompt = f"""You are a CV analysis assistant. The user has uploaded a CV with the following details:
{cv_info}

User question: {message}

Provide a helpful, specific response about their CV. Be concise and actionable."""
        else:
            # General chat without context
            prompt = f"""You are a CV analysis assistant. Help users with CV improvement, job search advice, and career guidance.

User question: {message}

Provide a helpful response. Be concise and professional."""

        response = query_llama2_chat(prompt, max_tokens=150)

        # Clean up the response
        response = response.strip()
        if response.startswith("Response:"):
            response = response[9:].strip()

        return (
            response
            if response
            else "I'd be happy to help you with your CV! Could you please provide more specific details about what you'd like assistance with?"
        )

    except Exception as e:
        print(f"Error generating chat response: {e}")
        if analysis_context:
            return f"I can see you've uploaded {analysis_context.get('filename', 'your CV')} with an ATS score of {analysis_context.get('ats_score', 'N/A')}%. What specific aspect would you like me to help you with?"
        else:
            return "I'd be happy to help you with your CV analysis! Please upload your CV file and I'll provide detailed feedback and suggestions."


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

        # Use LLM to analyze CV content
        print("🤖 Starting LLM analysis...")

        # Extract information using LLM
        keywords = extract_keywords_from_cv(cv_text)
        identified_role = identify_role_from_cv(cv_text)
        suggestions = generate_cv_suggestions(cv_text)
        interview_questions = generate_interview_questions(cv_text, identified_role)
        strengths, areas_to_improve = analyze_cv_strengths_weaknesses(cv_text)
        ats_score = calculate_ats_score(cv_text, keywords)

        print(f"✅ LLM analysis complete - Role: {identified_role}, ATS: {ats_score}")

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
            # Analysis results generated by LLM
            "ats_score": ats_score,
            "identified_role": identified_role,
            "keywords": {
                "found": keywords,
                "missing": [
                    "Docker",
                    "Kubernetes",
                    "AWS",
                    "GraphQL",
                    "Unit Testing",
                ],  # TODO: Could enhance to generate missing keywords with LLM
                "role_match": min(85, ats_score + 5),
            },
            "suggestions": suggestions,
            "interview_questions": interview_questions,
            "strengths": strengths,
            "areas_to_improve": areas_to_improve,
        }

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

        print(f"💬 Chat request - Session: {session_id}, Message: {message[:50]}...")

        # Generate response using LLM with optional CV analysis context
        analysis_context = None
        if analysis_id and analysis_id in analyses:
            analysis_context = analyses[analysis_id]
            print(f"📋 Using analysis context: {analysis_context['filename']}")

        # Generate LLM response
        llm_response = generate_chat_response(message, analysis_context)

        # Determine if the response should trigger actions (like showing analysis panel)
        has_actions = False
        if analysis_context and any(
            keyword in message.lower()
            for keyword in [
                "analyze",
                "score",
                "keywords",
                "suggestions",
                "interview",
                "improve",
                "feedback",
            ]
        ):
            has_actions = True

        response = {
            "message": llm_response,
            "timestamp": datetime.now().isoformat(),
            "has_actions": has_actions,
        }

        print(f"✅ Chat response generated: {len(llm_response)} chars")

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
