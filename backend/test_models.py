#!/usr/bin/env python3
"""
Test script for the dual-model setup:
- Flan-T5 for CV analysis
- LLaMA 2 for chat interactions
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from llm import query_flan_t5, query_llama2_chat


def test_flan_t5():
    """Test Flan-T5 model for CV analysis tasks"""
    print("🧪 Testing Flan-T5 for CV analysis...")

    # Test keyword extraction
    cv_sample = """
    John Doe
    Software Engineer
    Skills: Python, JavaScript, React, Node.js, MongoDB, AWS
    Experience: 3 years developing web applications
    """

    prompt = f"""
    Extract technical skills from this CV. Return only a comma-separated list.
    
    CV: {cv_sample}
    
    Keywords:"""

    try:
        response = query_flan_t5(prompt, max_tokens=50)
        print(f"✅ Flan-T5 Response: {response}")
        return True
    except Exception as e:
        print(f"❌ Flan-T5 Error: {e}")
        return False


def test_llama2():
    """Test LLaMA 2 model for chat interactions"""
    print("\n🧪 Testing LLaMA 2 for chat...")

    prompt = "How can I improve my CV to get better job opportunities? Give me 3 specific tips."

    try:
        response = query_llama2_chat(prompt, max_tokens=150)
        print(f"✅ LLaMA 2 Response: {response}")
        return True
    except Exception as e:
        print(f"❌ LLaMA 2 Error: {e}")
        print(
            "ℹ️  This is expected if LLaMA 2 model is not available - will fallback to Flan-T5"
        )
        return False


def test_chat_template():
    """Test the chat template functionality"""
    print("\n🧪 Testing LLaMA 2 chat template...")

    # Test with a CV-related question
    prompt = "I'm a software engineer with 3 years of experience. What should I highlight in my CV?"

    try:
        response = query_llama2_chat(prompt, max_tokens=100)
        print(f"✅ Chat Template Response: {response}")
        return True
    except Exception as e:
        print(f"❌ Chat Template Error: {e}")
        return False


def main():
    """Run model tests"""
    print("🚀 Testing Dual-Model Setup")
    print("=" * 50)

    flan_success = test_flan_t5()
    llama_success = test_llama2()
    chat_template_success = test_chat_template()

    print("\n📊 Test Results:")
    print(f"Flan-T5 (CV Analysis): {'✅ Working' if flan_success else '❌ Failed'}")
    print(
        f"LLaMA 2 (Chat): {'✅ Working' if llama_success else '⚠️ Fallback to Flan-T5'}"
    )
    print(
        f"Chat Template: {'✅ Working' if chat_template_success else '⚠️ Using Fallback'}"
    )

    if flan_success:
        print("\n🎉 At minimum, Flan-T5 is working for both CV analysis and chat!")
    else:
        print("\n⚠️ Models may need additional setup or dependencies.")

    print("\n💡 Usage Summary:")
    print("- CV Analysis (keywords, role, suggestions, etc.): Uses Flan-T5")
    print("- Chat Interactions: Uses LLaMA 2 (with Flan-T5 fallback)")
    print("- ATS Scoring: Simple rule-based calculation")


if __name__ == "__main__":
    main()
