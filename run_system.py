import os
import sys

# Add ai_engine to python path so we can import server
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai_engine'))

print("==================================================")
print("   🚀 RET PROJECT: AI SYSTEM STARTUP              ")
print("==================================================")
print("1. Checking Environment...")
print("2. Initializing AI Brain...")
print("3. Starting Web Server & AI Dashboard...")
print("==================================================")

# Import the Flask app from our new server file
try:
    # Try importing from the local server.py first (Recommended)
    from server import app, socketio
except ImportError:
    try:
        from ai_engine.server import app, socketio
    except ImportError:
        print("❌ Error: Could not find server.py in root or ai_engine/.")
        raise
        
    # Run the server
    print("--- 🌐 RET System Server Running on http://localhost:5000 ---")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
except ImportError as e:
    print(f"❌ Error: Could not import AI Server. {e}")
    print("Make sure you installed dependencies: python -m pip install flask flask-socketio transformers torch requests")
except Exception as e:
    print(f"❌ Critical Error: {e}")