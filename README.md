# CV Grinder - AI-Powered CV Analysis Tool

A modern, privacy-focused CV analysis application with a chat interface, built with Next.js frontend and Flask backend.

## Features

- 📄 **Document Parsing**: Supports PDF, DOC, and DOCX files
- 🤖 **AI-Powered Analysis**: Backend ready for LLM integration
- 📊 **ATS Scoring**: Applicant Tracking System compatibility analysis
- 🔍 **Keyword Optimization**: Find missing keywords for target roles
- 💡 **Improvement Suggestions**: Personalized CV enhancement recommendations
- 🎯 **Interview Preparation**: Role-specific interview questions
- 💬 **Chat Interface**: Interactive conversation with AI assistant
- 🔒 **Privacy-Focused**: Local document processing, temporary storage

## Tech Stack

### Frontend

- **Next.js 14** with App Router
- **Tailwind CSS** + **DaisyUI** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **PDF.js** for PDF parsing
- **Mammoth.js** for Word document parsing

### Backend

- **Flask** with CORS support
- **Python 3.8+**
- Ready for LLM integration (OpenAI, Anthropic, etc.)

## Quick Start

### Option 1: Use Setup Script (Recommended)

```bash
# Run the setup script
./setup.sh

# Start backend (terminal 1)
cd backend
source venv/bin/activate
python app.py

# Start frontend (terminal 2)
cd frontend
npm run dev
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## Usage

1. Open http://localhost:3000 in your browser
2. Upload a CV file (PDF, DOC, or DOCX)
3. Chat with the AI assistant for analysis
4. View detailed insights in the analysis panel
5. Get suggestions and interview questions

## LLM Integration

The backend is structured to easily integrate with any LLM service. Key integration points are marked with `TODO` comments in `backend/app.py`:

### 1. CV Analysis (`/api/analyze` endpoint)

```python
# TODO: REPLACE THIS SECTION WITH LLM INTEGRATION
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
```

### 2. Chat Integration (`/api/chat` endpoint)

```python
# TODO: REPLACE THIS SECTION WITH LLM CHAT INTEGRATION
# The message variable contains the user's chat message
# The analysis_id (if provided) contains context from previous CV analysis
# Implement your LLM chat here to generate contextual responses
```

### Example LLM Integration

```python
# Example using OpenAI
import openai

def llm_analyze_cv(cv_text, filename):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a CV analysis expert..."},
            {"role": "user", "content": f"Analyze this CV: {cv_text}"}
        ]
    )
    # Parse response and return structured data
    return parsed_analysis

def llm_chat_with_context(message, analysis_context):
    # Implement contextual chat with CV analysis context
    pass
```

## API Endpoints

### Backend (http://localhost:5000)

- `GET /health` - Health check
- `POST /api/session` - Create new session
- `POST /api/analyze` - Analyze CV content
- `POST /api/chat` - Chat with AI assistant
- `GET /api/analysis/<id>` - Get specific analysis
- `GET /api/session/<id>/analyses` - Get session analyses

### Request/Response Formats

#### CV Analysis Request

```json
{
  "session_id": "string",
  "cv_text": "string",
  "filename": "string",
  "file_size": number
}
```

#### Chat Request

```json
{
  "session_id": "string",
  "message": "string",
  "analysis_id": "string (optional)"
}
```

## Project Structure

```
├── backend/
│   ├── app.py              # Flask application with LLM integration points
│   ├── requirements.txt    # Python dependencies
│   └── venv/              # Virtual environment (created after setup)
├── frontend/
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   │   ├── ChatInterface.js    # Main chat interface
│   │   ├── AnalysisPanel.js    # CV analysis panel
│   │   ├── Sidebar.js          # Navigation sidebar
│   │   └── Header.js           # App header
│   ├── store/
│   │   └── useStore.js    # Zustand state management
│   ├── utils/
│   │   ├── api.js         # Backend API integration
│   │   └── documentParser.js   # Document parsing utilities
│   ├── package.json       # Node.js dependencies
│   └── .env.local         # Environment variables
├── setup.sh              # Quick setup script
└── README.md             # This file
```

## Environment Variables

### Frontend (`.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Development Notes

### Document Parsing

- PDF parsing uses PDF.js
- Word document parsing uses Mammoth.js
- All parsing happens in the browser for privacy
- Parsed text is sent to backend for analysis

### State Management

- Uses Zustand for lightweight state management
- Session data stored in sessionStorage (temporary)
- No sensitive data persisted permanently

### Privacy & Security

- Documents processed locally in browser
- Only text content sent to backend
- Temporary session storage
- No permanent data storage

## Customization

### Adding New Document Types

1. Update `documentParser.js` to handle new formats
2. Add type validation in `isSupportedDocument()`

### Styling

- Uses Tailwind CSS with DaisyUI components
- Theme switching available in header
- Responsive design for mobile/desktop

### Adding Features

1. Add new API endpoints in `backend/app.py`
2. Create corresponding frontend API calls in `utils/api.js`
3. Update state management in `store/useStore.js`
4. Implement UI components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

1. Check the TODO comments in the code
2. Review the API documentation above
3. Test with the provided dummy data structure
4. Ensure backend is running on port 5000
