import pytest
import sys
import os
from dotenv import load_dotenv

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.database.supabase import supabase_client

@pytest.mark.asyncio
async def test_supabase_connection():
    try:
        # Load environment variables
        load_dotenv()
        
        # Test a simple query
        result = (
            supabase_client
            .table('campaigns')
            .select('*')
            .limit(1)
            .execute()
        )
        
        print(f"\nSupabase connection test result: {result}")
        assert result is not None
        print("✅ Supabase connection successful")
        
    except Exception as e:
        print(f"❌ Supabase connection error: {str(e)}")
        raise

if __name__ == "__main__":
    pytest.main([__file__, "-v"])