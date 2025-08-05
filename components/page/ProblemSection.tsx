import { motion } from "framer-motion";
import {
  Zap,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const ValuePropositionSection = () => {
  const transformations = [
    {
      icon: Zap,
      before: "Manual carbon calculations",
      after: "AI-powered instant results",
      benefit: "95% time savings",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-200",
    },
    {
      icon: CheckCircle,
      before: "Uncertain ESG reporting",
      after: "94% confidence scoring",
      benefit: "Audit-ready insights",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      icon: TrendingUp,
      before: "Scattered asset data",
      after: "Unified sustainability platform",
      benefit: "Complete ESG visibility",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Beta Innovation
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Pioneering the Future of{" "}
            <span className="text-emerald-600">
              Sustainable Asset Management
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the next generation of asset management with AI-driven
            carbon tracking. Join our beta program and be part of the
            sustainability revolution.
          </p>
        </motion.div>

        {/* Transformation Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {transformations.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className={`${item.bgColor} ${item.borderColor} border-2 rounded-2xl p-8 text-center relative overflow-hidden`}
            >
              {/* Beta Badge */}
              <div className="absolute top-4 right-4">
                <span className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Beta
                </span>
              </div>

              {/* Icon */}
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <item.icon className={`w-8 h-8 ${item.iconColor}`} />
              </div>

              {/* Before State */}
              <div className="mb-6">
                <div className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-2">
                  Traditional Approach
                </div>
                <div className="text-gray-700 font-medium">{item.before}</div>
              </div>

              {/* Arrow Transition */}
              <div className="flex justify-center mb-6">
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>

              {/* After State */}
              <div className="mb-6">
                <div className="text-sm text-gray-900 uppercase tracking-wide font-medium mb-2">
                  EcoKeepr Beta
                </div>
                <div className="text-gray-900 font-bold text-lg">
                  {item.after}
                </div>
              </div>

              {/* Benefit */}
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">Key Benefit</div>
                <div className="font-bold text-lg text-gray-900">
                  {item.benefit}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Beta CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-8 border border-emerald-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Shape the Future?
            </h3>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Join our exclusive beta program and get early access to
              cutting-edge AI features. Your feedback will help us build the
              perfect sustainable asset management platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg font-semibold"
                onClick={() => (window.location.href = "/sign-up")}
              >
                Join Beta Program
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg font-semibold"
                onClick={() => {
                  window.location.href =
                    "mailto:ecokeepr@gmail.com?subject=Beta%20Program%20Inquiry&body=I'm%20interested%20in%20learning%20more%20about%20the%20EcoKeepr%20beta%20program%20and%20would%20like%20to%20discuss%20partnership%20opportunities.";
                }}
              >
                Contact Beta Team
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
