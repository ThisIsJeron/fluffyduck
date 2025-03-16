
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

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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
      toast.error(error.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      toast.error(error.message || "An error occurred during sign in");
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
                </CardContent>

                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </CardFooter>
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
                <form onSubmit={handleSignUp}>
                  <CardContent className="space-y-4 pt-4">
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
                  </CardContent>

                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </CardFooter>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
