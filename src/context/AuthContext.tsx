
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider initializing...");
    
    // Check if we have a hash fragment from email confirmation
    const handleEmailConfirmation = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('type=signup')) {
        try {
          setIsLoading(true);
          console.log("Detected email confirmation hash:", hash);
          
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error getting session after email confirmation:", error);
            throw error;
          }
          
          if (data?.session) {
            console.log("Session found after email confirmation:", data.session);
            setSession(data.session);
            setUser(data.session.user);
            toast.success("Email confirmed successfully! You are now signed in.");
          } else {
            console.log("No session found after email confirmation");
          }
        } catch (error: any) {
          console.error("Error confirming email:", error);
          toast.error(error.message || "Failed to confirm email");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    handleEmailConfirmation();
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change:", event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (event === 'SIGNED_IN') {
          toast.success("Successfully signed in!");
        } else if (event === 'SIGNED_OUT') {
          toast.info("Signed out successfully");
        } else if (event === 'USER_UPDATED') {
          toast.info("User information updated");
        } else if (event === 'PASSWORD_RECOVERY') {
          toast.info("Password recovery initiated");
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Auth token refreshed");
        } else if (event === 'MFA_CHALLENGE_VERIFIED') {
          toast.info("MFA verified successfully");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("Signing out...");
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
