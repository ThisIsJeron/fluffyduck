
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const TopHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
      toast.success("Successfully signed out");
      navigate("/");
    } else {
      navigate("/auth");
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="backdrop-blur bg-white/75 fixed top-0 left-0 right-0 z-50 border-b border-gray-200 h-[80px] shadow-sm"
    >
      <div className="max-w-screen-xl mx-auto flex justify-between items-center h-full px-4">
        <Link to="/" className="flex items-center">
          <img
            src="/fluffyduck_logo.png"
            alt="FluffyDuck Logo"
            className="h-10 mr-2"
          />
          <span className="font-bold text-lg hidden md:inline">
            FluffyDuck
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600 hidden sm:block">
                {user.email}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleAuthAction}
              >
                <UserCircle className="h-5 w-5" />
                <span>Sign Out</span>
              </Button>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleAuthAction}
            >
              <UserCircle className="h-5 w-5" />
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
};
