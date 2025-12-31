import os
import torch
from transformers import GPT2Tokenizer, GPT2LMHeadModel, TextDataset, DataCollatorForLanguageModeling, Trainer, TrainingArguments

# --- Configuration ---
# Base dir is 'ret' folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRAIN_FILE = os.path.join(BASE_DIR, "ai_engine", "data", "full_project_context.txt")
MODEL_DIR = os.path.join(BASE_DIR, "ai_engine", "models", "ret_brain")

# Folders to learn from
INCLUDE_DIRS = ['frontend', 'backend', 'ai_engine']
# Extensions to read
INCLUDE_EXTS = ['.html', '.css', '.js', '.py', '.json', '.md', '.txt']
# Folders to ignore
IGNORE_DIRS = ['models', 'node_modules', '__pycache__', '.git', 'data', 'venv']

def collect_project_data():
    print(f"--- 🔍 Scanning Project: {BASE_DIR} ---")
    data_dir = os.path.dirname(TRAIN_FILE)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)

    with open(TRAIN_FILE, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk(BASE_DIR):
            # Filter directories in-place
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            
            for file in files:
                if any(file.endswith(ext) for ext in INCLUDE_EXTS):
                    file_path = os.path.join(root, file)
                    # Skip the training file itself
                    if file_path == TRAIN_FILE: continue
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                            if content.strip():
                                outfile.write(f"\n\n--- FILE: {file} ---\n\n")
                                outfile.write(content)
                                print(f"   + Learned: {file}")
                    except Exception as e:
                        print(f"   ! Skipped {file}: {e}")

    print(f"--- ✅ Dataset Compiled at {TRAIN_FILE} ---")

def train_brain():
    # 1. Hardware Check
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"--- 🚀 Hardware Acceleration: {device.upper()} ---")

    # 2. Load Tokenizer & Model
    tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
    tokenizer.pad_token = tokenizer.eos_token
    model = GPT2LMHeadModel.from_pretrained("gpt2")
    model.to(device)

    # 3. Prepare Dataset
    if not os.path.exists(TRAIN_FILE):
        collect_project_data()

    print("--- 🧠 Loading Dataset... ---")
    dataset = TextDataset(
        tokenizer=tokenizer,
        file_path=TRAIN_FILE,
        block_size=128 
    )
    data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

    # 4. Training Arguments
    training_args = TrainingArguments(
        output_dir=MODEL_DIR,
        overwrite_output_dir=True,
        num_train_epochs=5,
        per_device_train_batch_size=4,
        save_steps=100,
        save_total_limit=2,
        logging_steps=10,
        prediction_loss_only=True,
    )

    # 5. Train
    trainer = Trainer(
        model=model,
        args=training_args,
        data_collator=data_collator,
        train_dataset=dataset,
    )

    print("--- 🎓 Training Started (This may take time) ---")
    trainer.train()
    
    # 6. Save
    trainer.save_model(MODEL_DIR)
    tokenizer.save_pretrained(MODEL_DIR)
    print(f"--- ✅ RET Brain Saved to {MODEL_DIR} ---")

if __name__ == "__main__":
    collect_project_data()
    train_brain()