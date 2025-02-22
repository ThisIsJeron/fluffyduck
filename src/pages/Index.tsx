
import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Users, Briefcase, ChartBar, Mail, Phone, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="text-xl font-semibold text-primary">
              FluffyDuck
            </a>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-accent transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-accent transition-colors">How it Works</a>
              <a href="#contact" className="text-gray-600 hover:text-accent transition-colors">Contact</a>
            </div>
            <Link 
              to="/create-campaign" 
              className="bg-primary text-white px-6 py-2 rounded-full hover:bg-accent transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
              Transform Your Restaurant's Digital Presence with AI
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Automate customer interactions, streamline catering operations, and grow your B2B relationships effortlessly.
            </p>
            <button className="bg-accent text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-2">
              Schedule a Demo
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Transform Your Business</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Bot className="w-8 h-8 text-accent" />,
                title: "AI-Powered Communication",
                description: "Instant responses to customer inquiries 24/7"
              },
              {
                icon: <Users className="w-8 h-8 text-accent" />,
                title: "B2B Relationship Management",
                description: "Build and maintain strong business partnerships"
              },
              {
                icon: <Briefcase className="w-8 h-8 text-accent" />,
                title: "Catering Automation",
                description: "Streamline your catering operations efficiently"
              },
              {
                icon: <ChartBar className="w-8 h-8 text-accent" />,
                title: "Smart Analytics",
                description: "Data-driven insights for better decisions"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {[
                {
                  step: "01",
                  title: "Connect Your Channels",
                  description: "Integrate your email, phone, and social media platforms"
                },
                {
                  step: "02",
                  title: "AI Learning Phase",
                  description: "Our AI learns your business style and preferences"
                },
                {
                  step: "03",
                  title: "Automated Management",
                  description: "Let AI handle routine inquiries and communications"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="flex gap-8 mb-12"
                >
                  <div className="text-4xl font-bold text-accent/20">{item.step}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Get in Touch</h2>
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent text-white py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">FluffyDuck</h3>
              <p className="text-gray-400">
                Transforming restaurant operations with artificial intelligence.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  <span className="text-gray-400">contact@fluffyduck.ai</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Links</h3>
              <div className="space-y-2">
                <a href="#features" className="block text-gray-400 hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="block text-gray-400 hover:text-white transition-colors">How it Works</a>
                <a href="#contact" className="block text-gray-400 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} FluffyDuck. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
