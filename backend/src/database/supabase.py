from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

class SupabaseClient:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_ANON_KEY")
        
        if not self.url or not self.key:
            raise ValueError("Missing Supabase environment variables")
        
        self.client = create_client(self.url, self.key)

    def get_client(self):
        return self.client

# Create a singleton instance
supabase_client = SupabaseClient().get_client()