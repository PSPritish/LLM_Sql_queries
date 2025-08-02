#!/usr/bin/env python3
"""
Simplified model loading test - checks if basic setup is working
"""


def test_imports():
    """Test if required packages are installed"""
    try:
        import torch

        print(f"✅ PyTorch version: {torch.__version__}")

        import transformers

        print(f"✅ Transformers version: {transformers.__version__}")

        from transformers import (
            AutoTokenizer,
            AutoModelForSeq2SeqLM,
            AutoModelForCausalLM,
        )

        print("✅ All required imports successful")

        # Check CUDA availability
        if torch.cuda.is_available():
            print(f"🚀 CUDA available: {torch.cuda.get_device_name(0)}")
        else:
            print("💻 Using CPU (CUDA not available)")

        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False


def test_flan_t5_loading():
    """Test if Flan-T5 can be loaded"""
    try:
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

        print("📥 Attempting to load Flan-T5...")
        tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-base")
        model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-base")

        # Test a simple query
        prompt = (
            "Extract keywords from this text: Python developer with React experience"
        )
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True)
        outputs = model.generate(**inputs, max_new_tokens=20)
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)

        print(f"✅ Flan-T5 loaded and tested successfully")
        print(f"📝 Test response: {response}")
        return True

    except Exception as e:
        print(f"❌ Flan-T5 loading failed: {e}")
        return False


def test_llama2_availability():
    """Test if LLaMA 2 model can be accessed"""
    try:
        from transformers import AutoTokenizer

        print("📥 Checking LLaMA 2 availability...")
        tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-chat-hf")
        print("✅ LLaMA 2 tokenizer loaded successfully")

        # Note: We're not loading the full model here as it's large
        print("ℹ️  Full model loading will be tested when backend starts")
        return True

    except Exception as e:
        print(f"⚠️ LLaMA 2 not available: {e}")
        print("📝 This is expected if you don't have access to the model")
        return False


def main():
    print("🔧 Running Environment Setup Test")
    print("=" * 50)

    imports_ok = test_imports()
    if not imports_ok:
        print("\n❌ Basic setup failed. Please install requirements:")
        print("pip install torch transformers accelerate sentencepiece")
        return

    print("\n🧪 Testing Model Loading...")
    flan_ok = test_flan_t5_loading()
    llama_ok = test_llama2_availability()

    print("\n📊 Results:")
    print(f"Environment Setup: {'✅' if imports_ok else '❌'}")
    print(f"Flan-T5 (CV Analysis): {'✅' if flan_ok else '❌'}")
    print(f"LLaMA 2 (Chat): {'✅' if llama_ok else '⚠️'}")

    if flan_ok:
        print("\n🎉 Setup successful! Flan-T5 is ready for CV analysis.")
        if llama_ok:
            print("🚀 LLaMA 2 is also available for enhanced chat!")
        else:
            print("💡 LLaMA 2 will fallback to Flan-T5 for chat interactions.")
        print("\n▶️  You can now start the backend with: python app.py")
    else:
        print("\n⚠️ Setup incomplete. Please check your environment.")


if __name__ == "__main__":
    main()
