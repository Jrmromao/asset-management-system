import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Box, Building2, Factory, Globe, TreePine, Zap } from "lucide-react";

const Industries = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const industries = [
    {
      icon: Building2,
      title: "Commercial Real Estate",
      description:
        "Optimize building management and reduce environmental impact across your property portfolio.",
    },
    {
      icon: Factory,
      title: "Manufacturing",
      description:
        "Track and improve the sustainability of your production lines and supply chain.",
    },
    {
      icon: TreePine,
      title: "Agriculture",
      description:
        "Manage farm equipment and natural resources with a focus on sustainable practices.",
    },
    {
      icon: Zap,
      title: "Energy",
      description:
        "Monitor and optimize energy production and distribution assets for maximum efficiency.",
    },
    {
      icon: Box,
      title: "Logistics",
      description:
        "Streamline your fleet and warehouse operations while minimizing carbon footprint.",
    },
    {
      icon: Globe,
      title: "Government",
      description:
        "Manage public assets and infrastructure with transparency and environmental responsibility.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <section id="industries" className="py-20 bg-green-50 overflow-hidden">
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
          Tailored Solutions for Various Industries
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {industries.map((industry, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-md p-6 transition-shadow hover:shadow-lg"
            >
              <industry.icon className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{industry.title}</h3>
              <p className="text-muted-foreground">{industry.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Industries;
