import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  CheckCircle,
  Users,
  Clock,
  Star,
  Brain,
  Zap,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

const Hero = () => {
  const containerRef = useRef(null);
  const router = useRouter();
  const [isCalculating, setIsCalculating] = useState(false);

  const handleTryDemo = () => {
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 3000);
  };

  return (
    <section className="bg-gradient-to-br from-white via-emerald-50/30 to-green-50 py-16 lg:py-24 overflow-hidden relative">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10" ref={containerRef}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Beta Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">
                Beta Launch - Early Access
              </span>
              <span className="sm:hidden">Beta Launch</span>
            </motion.div>

            {/* Main Headline - Beta Focused */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight"
            >
              <span className="text-gray-900">
                The Future of Asset Management
              </span>
              <br />
              <span className="text-emerald-600">
                AI-Powered & Carbon Conscious
              </span>
            </motion.h1>

            {/* Beta Value Proposition */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Be among the first to experience AI-driven asset management with
              <strong className="text-gray-900">
                {" "}
                instant carbon calculations
              </strong>{" "}
              and
              <strong className="text-gray-900"> ESG reporting</strong>. Join
              our beta program and shape the future.
            </motion.p>

            {/* Primary CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg font-semibold group relative"
                onClick={() => router.push("/sign-up")}
              >
                Join Beta Program
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold group"
                onClick={() => {
                  window.location.href =
                    "mailto:ecokeepr@gmail.com?subject=Beta%20Access%20Request&body=I'm%20interested%20in%20joining%20the%20EcoKeepr%20beta%20program%20and%20would%20like%20to%20learn%20more%20about%20the%20AI-powered%20features.";
                }}
              >
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Request Demo
              </Button>
            </motion.div>

            {/* Beta Trust Signals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Free beta access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Early adopter benefits</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Direct feedback channel</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Interactive Demo */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative"
            >
              {/* Demo Container */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Browser Header */}
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 border-b">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="bg-white rounded px-3 py-1 text-xs text-gray-500 ml-2 flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                    ecokeepr.com
                  </div>
                </div>

                {/* Demo Content */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Asset Input */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
                        💻
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          MacBook Pro 14&quot;
                        </div>
                        <div className="text-sm text-gray-500">
                          Apple, 2023 Model
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        onClick={handleTryDemo}
                        animate={isCalculating ? { scale: [1, 1.05, 1] } : {}}
                        transition={{
                          duration: 0.5,
                          repeat: isCalculating ? Infinity : 0,
                        }}
                      >
                        {isCalculating ? "Calculating..." : "Calculate CO2"}
                      </motion.button>
                    </div>

                    {/* AI Processing Indicator */}
                    {isCalculating && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-50 border border-emerald-200 rounded-xl p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                            <Brain className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-emerald-900">
                              AI Analysis in Progress
                            </div>
                            <div className="text-sm text-emerald-700">
                              Analyzing lifecycle data...
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Results Display */}
                    {!isCalculating && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium text-emerald-900">
                            Carbon Footprint
                          </div>
                          <div className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                            94% Confidence
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-emerald-900 mb-2">
                          287 kg CO₂e
                        </div>
                        <div className="text-sm text-emerald-700">
                          Complete lifecycle assessment
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 border"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-medium">AI Powered</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 border"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium">Beta Feature</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
