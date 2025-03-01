import { motion } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const Hero = () => {
  const containerRef = useRef(null);
  const router = useRouter();

  const heroH1 = "Smart asset management with environmental impact tracking";
  const heroP =
    "Track, maintain, and optimize your equipment's environmental impact all in one place.";
  const letters = heroH1.split("");

  const variants = {
    hidden: { opacity: 0, y: 20 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.03,
        duration: 0.5,
      },
    }),
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 1,
        duration: 0.5,
      },
    },
  };

  const statsVariants = {
    hidden: { opacity: 0, y: 30 },
    show: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.2,
        duration: 0.6,
      },
    }),
  };

  const stats = [
    {
      title: "Carbon Tracking",
      value: "Comprehensive",
      description:
        "Tools designed to help identify carbon reduction opportunities",
    },
    {
      title: "Potential Savings",
      value: "Case-by-case",
      description:
        "Savings potential varies based on organization size and asset portfolio",
    },
    {
      title: "Asset Visibility",
      value: "Complete view",
      description: "Centralized platform for monitoring all registered assets",
    },
    {
      title: "Compliance Tools",
      value: "Supporting",
      description:
        "Designed with consideration for current sustainability frameworks",
    },
  ];

  const words = heroH1.split(" ");
  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: i * 0.2,
        ease: [0.33, 1, 0.68, 1],
      },
    }),
  };

  return (
    <section className="bg-gradient-to-b from-white to-green-50 py-20 overflow-hidden">
      <div
        className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12"
        ref={containerRef}
      >
        <div className="flex flex-col justify-center gap-8">
          <motion.h1
            className="mt-6 text-4xl lg:text-6xl font-bold tracking-tight"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {words.map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariants}
                custom={i}
                className="inline-block mr-[0.25em] whitespace-pre"
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-xl text-muted-foreground"
          >
            {heroP}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            variants={buttonVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => router.push("/sign-up")}
            >
              Start free trial
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-lg"
              onClick={() => {
                window.location.href =
                  "mailto:ecokeepr@gmail.com?subject=Book%20a%20Demo";
              }}
            >
              Book a demo
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={statsVariants}
              initial="hidden"
              whileInView="show"
              custom={index}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-green-600">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold my-2">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
