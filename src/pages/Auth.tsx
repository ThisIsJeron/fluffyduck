import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check for OAuth errors in URL
  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('error=')) {
      const errorMatch = hash.match(/error=([^&]*)/);
      const errorMsgMatch = hash.match(/error_description=([^&]*)/);
      
      if (errorMatch && errorMsgMatch) {
        const errorType = decodeURIComponent(errorMatch[1]);
        const errorMsg = decodeURIComponent(errorMsgMatch[1]);
        setAuthError(`${errorType}: ${errorMsg}`);
      }
    }
  }, [location]);

  // Redirect authenticated users
  useEffect(() => {
    // Don't redirect if we're in the middle of email confirmation
    const isEmailConfirmation = location.hash && location.hash.includes('type=signup');
    
    if (user && !isEmailConfirmation) {
      navigate("/dashboard");
    }
  }, [user, navigate, location]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      if (!email || !password || !restaurantName) {
        throw new Error("Please fill in all fields");
      }

      console.log("Starting sign up with:", { email, restaurantName });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            restaurant_name: restaurantName,
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) throw error;

      console.log("Sign up response:", data);
      
      setEmailSent(true);
      toast.success(
        "Sign up successful! Please check your email for confirmation instructions.",
        { duration: 6000 }
      );
      
      // Clear form after successful signup
      setEmail("");
      setPassword("");
      setRestaurantName("");
      
    } catch (error: any) {
      console.error("Sign up error:", error);
      setAuthError(error.message || "An error occurred during sign up");
      toast.error(error.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      if (!email || !password) {
        throw new Error("Please provide both email and password");
      }
      
      console.log("Attempting sign in with:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("Sign in successful:", data);
      toast.success("Successfully signed in!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Sign in error:", error);
      setAuthError(error.message || "An error occurred during sign in");
      toast.error(error.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      console.log("Starting Google sign in");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: "https://www.fluffyduck.ai/auth",
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) throw error;
      
      console.log("Google auth initiated:", data);
    } catch (error: any) {
      console.error("Google sign in error:", error);
      setAuthError(error.message || "An error occurred during Google sign in");
      toast.error(error.message || "An error occurred during Google sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              FluffyDuck Marketing
            </CardTitle>
            <CardDescription className="text-center">
              Sign in or create an account to manage your restaurant marketing
            </CardDescription>
          </CardHeader>
          
          {authError && (
            <div className="mx-6 mb-4 p-3 bg-destructive/15 border border-destructive rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-destructive">{authError}</div>
            </div>
          )}
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-2 text-xs text-muted-foreground">
                        OR CONTINUE WITH
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                    Sign in with Google
                  </Button>
                </CardContent>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              {emailSent ? (
                <CardContent className="pt-4 text-center">
                  <div className="rounded-lg bg-primary/10 p-6 mb-4">
                    <h3 className="text-lg font-medium mb-2">Verify Your Email</h3>
                    <p className="mb-4">
                      We've sent a confirmation email to <strong>{email}</strong>.
                      Please check your inbox and click the confirmation link to activate your account.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Didn't receive an email? Check your spam folder or{" "}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-normal underline"
                        onClick={() => setEmailSent(false)}
                      >
                        try again
                      </Button>
                    </p>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="space-y-4 pt-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="restaurant-name">Restaurant Name</Label>
                      <Input
                        id="restaurant-name"
                        type="text"
                        placeholder="Your Restaurant"
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-2 text-xs text-muted-foreground">
                        OR CONTINUE WITH
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                    Sign up with Google
                  </Button>
                </CardContent>
              )}
            </TabsContent>
          </Tabs>
          
          <CardFooter className="flex flex-col space-y-3 pt-0">
            <div className="text-xs text-center text-muted-foreground">
              For Google authentication to work, make sure your Supabase project has Google OAuth properly configured in the authentication settings.
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
