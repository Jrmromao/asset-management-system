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
            {/* Social Proof Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">
                Rated #1 AI-Powered Carbon Tracker
              </span>
              <span className="sm:hidden">AI-Powered</span>
            </motion.div>

            {/* Main Headline - Benefit Focused */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight"
            >
              <span className="text-gray-900">
                Stop Manual Carbon Calculations.
              </span>
              <br />
              <span className="text-emerald-600">
                Get Results in 5 Seconds.
              </span>
            </motion.h1>

            {/* Clear Value Proposition */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Our AI instantly calculates lifecycle carbon footprints for any
              asset.{" "}
              <strong className="text-gray-900">Save 95% of your time</strong>{" "}
              and generate audit-ready ESG reports with confidence scoring.
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
                Start 14-Day Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold group"
                onClick={() => {
                  window.location.href =
                    "mailto:ecokeepr@gmail.com?subject=Book%20a%20Demo&body=I'm%20interested%20in%20seeing%20how%20EcoKeepr's%20AI%20can%20automate%20our%20carbon%20calculations.";
                }}
              >
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch 2-Min Demo
              </Button>
            </motion.div>

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Setup in 5 minutes</span>
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
                        className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg"
                      >
                        <Brain className="w-4 h-4 animate-pulse" />
                        <span>AI analyzing lifecycle emissions...</span>
                      </motion.div>
                    )}

                    {/* Results */}
                    <motion.div
                      animate={{ opacity: isCalculating ? 0.4 : 1 }}
                      className="grid grid-cols-2 gap-3"
                    >
                      <div className="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
                        <div className="text-3xl font-bold text-emerald-600">
                          384
                        </div>
                        <div className="text-sm text-emerald-700 font-medium">
                          kg CO2e
                        </div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
                        <div className="text-3xl font-bold text-blue-600">
                          94%
                        </div>
                        <div className="text-sm text-blue-700 font-medium">
                          Confidence
                        </div>
                      </div>
                    </motion.div>

                    {/* Lifecycle Breakdown */}
                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        Lifecycle Breakdown
                      </div>
                      {[
                        {
                          phase: "Manufacturing",
                          value: 285,
                          color: "bg-red-400",
                        },
                        {
                          phase: "Transport",
                          value: 12,
                          color: "bg-orange-400",
                        },
                        {
                          phase: "Use Phase",
                          value: 78,
                          color: "bg-yellow-400",
                        },
                        {
                          phase: "End of Life",
                          value: 9,
                          color: "bg-green-400",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${item.color}`}
                            ></div>
                            <span className="text-gray-600">{item.phase}</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {item.value} kg
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
              >
                3.2s ⚡
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
              >
                AI-Powered
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-20 pt-12 border-t border-gray-200"
        >
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 mb-4">
              Trusted by sustainability leaders worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="font-bold text-2xl text-gray-900">500+</div>
              <div className="text-sm text-gray-600">
                Companies tracking carbon
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <div className="font-bold text-2xl text-gray-900">95%</div>
              <div className="text-sm text-gray-600">
                Time saved on calculations
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <div className="font-bold text-2xl text-gray-900">3.2s</div>
              <div className="text-sm text-gray-600">
                Average calculation time
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
