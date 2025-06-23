import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Brain,
  Leaf,
  BarChart2,
  CheckCircle,
  Zap,
  Globe,
  Shield,
  Clock,
  Target,
} from "lucide-react";

export const Features = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Carbon Calculation",
      description:
        "Instant lifecycle assessment with confidence scoring. Our AI calculates manufacturing, transport, use, and end-of-life emissions in seconds.",
      highlight: true,
      color: "emerald",
    },
    {
      icon: Leaf,
      title: "Real-Time Sustainability Insights",
      description:
        "Monitor carbon footprints across your entire asset portfolio with live updates and predictive analytics for informed decision-making.",
      highlight: true,
      color: "emerald",
    },
    {
      icon: BarChart2,
      title: "Automated ESG Reporting",
      description:
        "Generate audit-ready compliance reports for CSRD, GRI, and CDP standards. No more manual data collection or calculations.",
      highlight: true,
      color: "blue",
    },
    {
      icon: CheckCircle,
      title: "Comprehensive Asset Management",
      description:
        "Track, maintain, and optimize all your physical and digital assets with detailed lifecycle management and maintenance scheduling.",
      highlight: false,
      color: "gray",
    },
    {
      icon: Shield,
      title: "Audit-Ready Compliance",
      description:
        "Maintain transparent audit trails with source attribution, confidence scores, and detailed calculation methodologies.",
      highlight: false,
      color: "blue",
    },
    {
      icon: Globe,
      title: "Multi-Location Visibility",
      description:
        "Get a unified view of assets and their carbon impact across multiple locations, departments, and jurisdictions.",
      highlight: false,
      color: "gray",
    },
    {
      icon: Clock,
      title: "95% Time Reduction",
      description:
        "Eliminate weeks of manual carbon calculations. What used to take months now happens in minutes with AI automation.",
      highlight: false,
      color: "orange",
    },
    {
      icon: Zap,
      title: "Maintenance Carbon Tracking",
      description:
        "AI analyzes maintenance activities to automatically calculate and track carbon emissions from repairs and replacements.",
      highlight: false,
      color: "emerald",
    },
    {
      icon: Target,
      title: "Carbon Reduction Opportunities",
      description:
        "Identify high-impact assets and receive AI-powered recommendations for reducing your organization's carbon footprint.",
      highlight: false,
      color: "emerald",
    },
  ];

  const getColorClasses = (color: string, highlight: boolean) => {
    const colors = {
      emerald: {
        bg: highlight ? "bg-emerald-100" : "bg-emerald-50",
        text: "text-emerald-600",
        icon: "text-emerald-600",
      },
      blue: {
        bg: highlight ? "bg-blue-100" : "bg-blue-50",
        text: "text-blue-600",
        icon: "text-blue-600",
      },
      orange: {
        bg: highlight ? "bg-orange-100" : "bg-orange-50",
        text: "text-orange-600",
        icon: "text-orange-600",
      },
      gray: {
        bg: highlight ? "bg-gray-100" : "bg-gray-50",
        text: "text-gray-600",
        icon: "text-gray-600",
      },
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <section id="features" className="py-20 overflow-hidden bg-white">
      <motion.div
        ref={containerRef}
        style={{ y, opacity }}
        className="max-w-7xl mx-auto px-4"
      >
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Leaf className="w-4 h-4" />
            AI-Powered Sustainability Features
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-4xl font-bold mb-6"
          >
            Everything You Need in One Platform
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            The world&apos;s first asset management platform with built-in AI
            carbon intelligence. Manage assets, track carbon footprints, and
            automate ESG reporting—all in one place.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const colorClasses = getColorClasses(
              feature.color,
              feature.highlight,
            );

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.21, 1.11, 0.81, 0.99],
                }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                  feature.highlight
                    ? `${colorClasses.bg} border-2 border-${feature.color}-200 shadow-md`
                    : `bg-white border-gray-200 hover:border-${feature.color}-200`
                }`}
              >
                {/* Highlight Badge */}
                {feature.highlight && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      AI-POWERED
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses.bg}`}
                  >
                    <feature.icon className={`w-6 h-6 ${colorClasses.icon}`} />
                  </motion.div>

                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${
                        feature.highlight ? "text-gray-900" : "text-gray-900"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Call-to-Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-8 border border-emerald-100"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Asset Management?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join forward-thinking companies using AI to automate their carbon
            footprint tracking and ESG reporting. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              onClick={() => (window.location.href = "/sign-up")}
            >
              Start Free Trial
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold px-8 py-3 rounded-lg transition-colors"
              onClick={() =>
                (window.location.href =
                  "mailto:ecokeepr@gmail.com?subject=Book%20a%20Demo")
              }
            >
              See Demo
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
