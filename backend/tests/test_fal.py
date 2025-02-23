import os
from dotenv import load_dotenv
import fal

def test_fal():
    # Load environment variables
    load_dotenv()
    
    # Get and set FAL_KEY
    fal_key = os.getenv("FAL_KEY")
    if not fal_key:
        print("❌ Error: FAL_KEY not found in environment variables")
        return
        
    try:
        # Configure fal
        fal.key = fal_key
        print("✅ Fal configured successfully")
        print(f"Fal version: {fal.__version__}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_fal()