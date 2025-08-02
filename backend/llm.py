from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, AutoModelForCausalLM
import torch

# Model configurations
FLAN_T5_MODEL = "google/flan-t5-base"  # For CV analysis tasks
LLAMA2_MODEL = "meta-llama/Llama-2-7b-chat-hf"  # For chatting

# Initialize Flan-T5 for CV analysis
print("Loading Flan-T5 model for CV analysis...")
flan_tokenizer = AutoTokenizer.from_pretrained(FLAN_T5_MODEL)
flan_model = AutoModelForSeq2SeqLM.from_pretrained(FLAN_T5_MODEL)

# Initialize LLaMA 2 for chat (with error handling for availability)
llama_tokenizer = None
llama_model = None

try:
    print("Loading LLaMA 2 model for chat...")
    llama_tokenizer = AutoTokenizer.from_pretrained(LLAMA2_MODEL)
    llama_model = AutoModelForCausalLM.from_pretrained(
        LLAMA2_MODEL,
        torch_dtype=torch.float16,
        device_map="auto" if torch.cuda.is_available() else None,
    )
    print("✅ LLaMA 2 model loaded successfully")
except Exception as e:
    print(f"⚠️ Warning: Could not load LLaMA 2 model: {e}")
    print("📝 Falling back to Flan-T5 for chat as well")


def query_flan_t5(prompt: str, max_tokens=512):
    """Query Flan-T5 model for CV analysis tasks"""
    try:
        inputs = flan_tokenizer(
            prompt, return_tensors="pt", truncation=True, max_length=512
        )
        output_ids = flan_model.generate(
            **inputs, max_new_tokens=max_tokens, do_sample=True, temperature=0.7
        )
        response = flan_tokenizer.decode(output_ids[0], skip_special_tokens=True)
        # Remove the input prompt from response if it's included
        if prompt in response:
            response = response.replace(prompt, "").strip()
        return response
    except Exception as e:
        print(f"Error with Flan-T5: {e}")
        return "Error generating response"


def query_llama2_chat(prompt: str, max_tokens=256):
    """Query LLaMA 2 model for chat responses using chat template"""
    if llama_model is None or llama_tokenizer is None:
        # Fallback to Flan-T5 if LLaMA 2 is not available
        return query_flan_t5(prompt, max_tokens)

    try:
        # Format messages for LLaMA 2 chat template with system role
        messages = [
            {
                "role": "system",
                "content": "You are a helpful CV analysis assistant. Provide concise, actionable advice for improving CVs and job search strategies.",
            },
            {"role": "user", "content": prompt},
        ]

        # Apply chat template and tokenize
        inputs = llama_tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=True,
            return_dict=True,
            return_tensors="pt",
        ).to(llama_model.device)

        # Generate response
        with torch.no_grad():
            outputs = llama_model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                pad_token_id=llama_tokenizer.eos_token_id,
            )

        # Decode only the generated part (exclude input)
        response = llama_tokenizer.decode(
            outputs[0][inputs["input_ids"].shape[-1] :], skip_special_tokens=True
        )
        return response.strip()

    except Exception as e:
        print(f"Error with LLaMA 2: {e}")
        # Fallback to Flan-T5
        return query_flan_t5(prompt, max_tokens)


def query_hf_model(prompt: str, max_tokens=512):
    """Legacy function for backward compatibility - uses Flan-T5"""
    return query_flan_t5(prompt, max_tokens)
