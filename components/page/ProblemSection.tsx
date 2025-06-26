import { motion } from "framer-motion";
import { Zap, CheckCircle, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ValuePropositionSection = () => {
  const transformations = [
    {
      icon: Zap,
      before: "Hours of manual calculations",
      after: "5-second automated results",
      benefit: "95% time savings",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-200",
    },
    {
      icon: CheckCircle,
      before: "Guessing carbon footprints",
      after: "94% confidence scoring",
      benefit: "Audit-ready reports",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      icon: TrendingUp,
      before: "Scattered asset data",
      after: "Unified sustainability insights",
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
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4" />
            The EcoKeepr Transformation
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            From Manual Guesswork to{" "}
            <span className="text-emerald-600">AI-Powered Precision</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            See how leading companies transformed their carbon tracking process
            and accelerated their ESG reporting
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
              {/* Icon */}
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <item.icon className={`w-8 h-8 ${item.iconColor}`} />
              </div>

              {/* Before State */}
              <div className="mb-6">
                <div className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-2">
                  Before
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
                  After
                </div>
                <div className="text-gray-900 font-bold text-lg">
                  {item.after}
                </div>
              </div>

              {/* Benefit Badge */}
              <div className="bg-white rounded-full px-4 py-2 text-sm font-semibold text-gray-900 border shadow-sm">
                {item.benefit}
              </div>

              {/* Background Decoration */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full"></div>
            </motion.div>
          ))}
        </div>

        {/* Social Proof Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-8 lg:p-12 text-center border border-emerald-100"
        >
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-2xl lg:text-3xl font-medium text-gray-900 mb-6 leading-relaxed">
              &quot;EcoKeepr reduced our carbon calculation time from{" "}
              <span className="text-emerald-600 font-bold">
                3 weeks to 3 minutes
              </span>
              . We now have complete visibility into our asset footprints with
              confidence scores for every calculation.&quot;
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-lg">SM</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  Sarah Martinez
                </div>
                <div className="text-gray-600">
                  Sustainability Manager, TechCorp
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Carbon Tracking?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join 500+ companies already using AI to automate their
            sustainability reporting
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg font-semibold group"
            >
              Start 30-Day Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold"
            >
              See Live Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
