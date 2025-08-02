# Dual-Model CV Analysis System

This backend uses two specialized language models for different tasks:

## 🎯 Model Assignment

### **Flan-T5 (google/flan-t5-base)** - CV Analysis Tasks

- **Keyword Extraction**: Identifies technical skills and technologies
- **Role Identification**: Determines likely job position from CV content
- **CV Suggestions**: Generates improvement recommendations
- **Interview Questions**: Creates role-specific interview questions
- **Strengths/Weaknesses**: Analyzes CV strong points and areas to improve
- **ATS Scoring**: Contributes to compatibility scoring calculations

### **LLaMA 2 (meta-llama/Llama-2-7b-chat-hf)** - Chat Interactions

- **Conversational AI**: Handles user questions about their CV
- **Contextual Responses**: Provides advice based on uploaded CV analysis
- **Career Guidance**: Offers job search and CV improvement tips
- **Interactive Support**: Responds to follow-up questions

## 🔧 Implementation Details

### Chat Template Integration

LLaMA 2 uses the proper chat template format:

```python
messages = [
    {"role": "system", "content": "You are a helpful CV analysis assistant..."},
    {"role": "user", "content": user_prompt},
]
inputs = tokenizer.apply_chat_template(messages, ...)
```

### Fallback Strategy

- If LLaMA 2 fails to load or encounters errors, chat functions automatically fallback to Flan-T5
- This ensures the system remains functional even with limited model availability

### Memory Management

- Models load once at startup and remain in memory
- CUDA support for GPU acceleration when available
- CPU fallback for systems without GPU

## 📂 Key Files

- `llm.py`: Model loading and query functions
- `app.py`: Flask API endpoints using the models
- `requirements.txt`: All dependencies including torch, transformers
- `setup_test.py`: Environment verification script
- `test_models.py`: Model functionality testing

## 🚀 Usage Flow

1. **CV Upload**: User uploads CV → parsed by frontend
2. **Analysis**: CV text → Flan-T5 → structured analysis results
3. **Chat**: User questions → LLaMA 2 → contextual responses
4. **Display**: Results shown in analysis panel and chat interface

## 🔍 API Endpoints

- `/api/analyze`: Uses Flan-T5 for comprehensive CV analysis
- `/api/chat`: Uses LLaMA 2 for conversational responses
- `/health`: System status and model availability check

## ⚡ Performance Notes

- **Flan-T5**: Lightweight, fast responses for structured analysis
- **LLaMA 2**: More sophisticated but resource-intensive for natural conversation
- **Optimization**: Consider using model quantization for production deployment

## 🛠️ Testing

Run these scripts to verify setup:

```bash
# Basic environment test
python setup_test.py

# Full model functionality test
python test_models.py

# Start the backend
python app.py
```

## 🔒 Model Access

**Flan-T5**: Publicly available, no special access required  
**LLaMA 2**: May require Hugging Face access token depending on model availability

This dual-model approach provides the best of both worlds: efficient structured analysis with Flan-T5 and natural conversational AI with LLaMA 2.
