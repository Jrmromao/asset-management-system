import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { BarChart2, Box, CheckCircle, Globe, Leaf, Zap } from "lucide-react";

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
      icon: Box,
      title: "Asset Tracking",
      description:
        "Comprehensive tracking of all your physical and digital assets with detailed lifecycle management.",
    },
    {
      icon: Leaf,
      title: "Carbon Footprint",
      description:
        "Monitor and analyze the environmental impact of your assets with real-time carbon footprint tracking.",
    },
    {
      icon: BarChart2,
      title: "Sustainability Reports",
      description:
        "Generate detailed sustainability reports and get actionable insights to reduce your environmental impact.",
    },
    {
      icon: CheckCircle,
      title: "Compliance Management",
      description:
        "Stay compliant with environmental regulations and standards with built-in compliance tracking and reporting.",
    },
    {
      icon: Globe,
      title: "Global Asset Visibility",
      description:
        "Get a bird's-eye view of your assets across multiple locations and jurisdictions.",
    },
    {
      icon: Zap,
      title: "Energy Efficiency Optimization",
      description:
        "Identify energy-hungry assets and optimize their usage for improved efficiency and reduced costs.",
    },
  ];

  return (
    <section id="features" className="py-20 overflow-hidden">
      <motion.div
        ref={containerRef}
        style={{ y, opacity }}
        className="max-w-7xl mx-auto px-4"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          Powerful Features for Sustainable Asset Management
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
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
              className="space-y-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100"
              >
                <feature.icon className="w-6 h-6 text-green-600" />
              </motion.div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
