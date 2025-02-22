
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import "./App.css";
import CreateCampaign from "./pages/CreateCampaign";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <CreateCampaign />
      <Toaster />
    </Router>
  );
}

export default App;
