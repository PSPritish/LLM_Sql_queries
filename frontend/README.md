# CV Grinder - AI-Powered CV Analysis Platform

A modern, ChatGPT-like frontend for CV analysis and optimization powered by AI. This application helps job seekers improve their CVs through ATS scoring, keyword analysis, and personalized interview question generation.

## 🌟 Features

### Phase 1 Implementation (Current)

- **Modern ChatGPT-like Interface**: Interactive chat interface for CV analysis queries
- **CV Upload & Parsing**: Drag-and-drop or click-to-upload CV files (PDF, DOC, DOCX)
- **ATS Scoring Engine**: Real-time compatibility scoring with Applicant Tracking Systems
- **Keyword Analysis**: Role-specific keyword matching and optimization suggestions
- **CV Improvement Suggestions**: AI-powered recommendations for better CV performance
- **Interview Question Generation**: Personalized, context-aware interview questions
- **Beautiful UI/UX**: Modern design with smooth animations and responsive layout

### Technical Features

- **Real-time Chat Interface**: ChatGPT-style interaction for CV assistance
- **Suggested Prompts**: Quick-start questions for common CV optimization needs
- **Progressive Analysis**: Step-by-step analysis visualization
- **Interactive Results**: Tabbed interface for overview, keywords, and suggestions
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS + DaisyUI (Dark theme)
- **State Management**: Zustand for global state
- **Animations**: Framer Motion for smooth transitions
- **Icons**: React Icons (Feather Icons + Hero Icons)
- **Development**: Turbopack for fast development

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000` (or `http://localhost:3001` if 3000 is busy)

## 📱 Usage

### 1. Chat Interface

- Use the ChatGPT-like input box to ask questions about CV optimization
- Try suggested prompts for quick help
- Get instant AI responses for guidance

### 2. CV Upload

- Drag and drop your CV file or click to browse
- Supports PDF, DOC, and DOCX formats (up to 10MB)
- Real-time upload progress with feedback

### 3. Analysis Process

- Watch the step-by-step analysis progression
- Get real-time updates on parsing, keyword identification, and scoring

### 4. Results Review

- **Overview**: CV information and quick statistics
- **Keywords**: Visual keyword analysis with found/missing indicators
- **Suggestions**: Actionable improvement recommendations

### 5. Interview Preparation

- Generate role-specific interview questions
- Filter by category (Technical, Behavioral, Situational)
- Filter by difficulty level (Easy, Medium, Hard)
- Practice with generated questions

## 🎯 Project Roadmap

### Phase 1: CV GRINDING ✅

📌 **Implementation Roadmap Completed:**

- [x] CV Parsing and Text Extraction
- [x] Role and Keyword Identification
- [x] ATS Scoring Engine
- [x] CV Improvement Suggestions
- [x] Generate CV-Based Interview Questions

### Phase 2: Enhanced Analysis (Next)

- [ ] Integration with real LLM APIs (OpenAI GPT-4, Claude)
- [ ] Advanced NLP processing with spaCy/NLTK
- [ ] Role-specific CV templates
- [ ] Industry-specific keyword databases

### Phase 3: Backend Integration

- [ ] Flask/FastAPI backend development
- [ ] Database integration (PostgreSQL/SQLite)
- [ ] User authentication and profiles
- [ ] CV history and comparison

### Phase 4: Advanced Features

- [ ] Real-time collaborative editing
- [ ] CV template generation
- [ ] Job posting integration
- [ ] Interview simulation with video

## 🎨 Design Features

- **Modern Dark Theme**: Professional look with excellent readability
- **Smooth Animations**: Framer Motion for fluid user experience
- **Responsive Layout**: Mobile-first design that works on all devices
- **Interactive Elements**: Hover effects, loading states, and micro-interactions
- **ChatGPT-like Interface**: Familiar and intuitive chat experience

## 📊 Sample Features Demo

The application includes mock data and simulated analysis for demonstration:

- Sample ATS scores (78% compatibility)
- Keyword analysis for Software Engineer roles
- Realistic improvement suggestions
- Generated interview questions for different categories

## 🎯 Sample Features for Initial MVP ✅

- [x] Upload CV → Parse → Basic ATS scoring
- [x] Suggest missing critical keywords for a given role
- [x] Generate 5-10 targeted CV questions
- [x] Modern ChatGPT-like interface with Tailwind CSS, DaisyUI
- [x] Zustand for global state management
- [x] Framer Motion for smooth animations
- [x] React Icons for comprehensive iconography

---

**Built with ❤️ for job seekers worldwide**

_Helping you land your dream job through AI-powered CV optimization_

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
