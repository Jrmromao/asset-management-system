import React, { useState } from "react";
import { BookOpen, Building2, Globe2, Leaf } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ReCAPTCHA from "@/components/ReCAPTCHA";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [showModal, setShowModal] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleEmailSubmit = (e: any) => {
    e.preventDefault();
    if (!email) {
      setStatus({ type: "error", message: "Please enter your email" });
      return;
    }
    setShowModal(true);
  };

  const handleSubscribe = async () => {
    if (!agreed) {
      setStatus({ type: "error", message: "Please agree to the terms" });
      return;
    }

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus({ type: "success", message: "Successfully subscribed!" });
        setEmail("");
        setShowModal(false);
        setAgreed(false);
      } else {
        setStatus({ type: "error", message: "Subscription failed" });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Something went wrong" });
    }
  };

  const columns = [
    {
      title: "Solutions",
      icon: <Leaf className="w-5 h-5 text-green-500" />,
      links: [
        "Asset Tracking",
        "Carbon Footprint",
        "Sustainability Reports",
        // "Energy Optimization",
        // "Compliance Tools",
      ],
    },
    {
      title: "Industries",
      icon: <Globe2 className="w-5 h-5 text-green-500" />,
      links: [
        "Manufacturing",
        "Logistics",
        "Agriculture",
        "Energy",
        "Government",
      ],
    },
    {
      title: "Resources",
      icon: <BookOpen className="w-5 h-5 text-green-500" />,
      links: [
        "Documentation",
        "API Reference",
        "Success Stories",
        "Sustainability Blog",
        // "Green Practices Guide",
      ],
    },
    {
      title: "Company",
      icon: <Building2 className="w-5 h-5 text-green-500" />,
      links: [
        "About Us",
        "Careers",
        // "Press Room",
        // "Partner Network",
        "Contact",
      ],
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="mb-16 bg-green-50 rounded-2xl p-8">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Join the sustainability movement
            </h3>
            <p className="text-gray-600 mb-6">
              Get monthly insights on sustainable asset management and
              environmental impact tracking.
            </p>
            <form
              onSubmit={handleEmailSubmit}
              className="flex flex-col space-y-4"
            >
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500 px-4 py-3"
                />
                <button
                  type="submit"
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  Subscribe
                </button>
              </div>
              {status.message && (
                <p
                  className={`text-sm ${status.type === "error" ? "text-red-600" : "text-green-600"}`}
                >
                  {status.message}
                </p>
              )}
            </form>
          </div>
        </div>
        <AlertDialog open={showModal} onOpenChange={setShowModal}>
          <AlertDialogContent className="bg-white p-6 rounded-lg max-w-md">
            <AlertDialogHeader className="space-y-3">
              <AlertDialogTitle className="text-xl font-semibold text-center">
                Complete Your Subscription
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <div className="border border-gray-200 rounded p-4 text-center">
                  <ReCAPTCHA
                    siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                    onVerify={(token) => {
                      // setRecaptchaToken(token);
                      // setError("");
                    }}
                  />
                </div>
                {status.type === "error" && (
                  <p className="text-red-500 text-sm text-center">
                    {status.message}
                  </p>
                )}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to receive marketing communications and agree to the{" "}
                    <a href="#" className="text-green-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-green-600 hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-3 mt-6">
              <AlertDialogAction
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </AlertDialogAction>
              <AlertDialogAction
                onClick={handleSubscribe}
                className="flex-1 py-2 px-4 bg-green-500 text-white hover:bg-green-600 rounded-lg"
              >
                Complete Subscription
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12 justify-items-center">
          {columns.map((column) => (
            <div key={column.title}>
              <div className="flex items-center space-x-2 mb-6">
                {column.icon}
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  {column.title}
                </h3>
              </div>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-green-600 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Leaf className="w-8 h-8 text-emerald-600" />
                <span className="text-lg font-semibold text-emerald-600">
                  EcoKeepr
                </span>
              </div>
              {/*<div className="flex items-center space-x-1 text-emerald-600">*/}
              {/*  <Phone size={16} />*/}
              {/*  <span className="text-sm">1-888-888-8888</span>*/}
              {/*</div>*/}
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 text-sm text-gray-600">
              <a href="#" className="hover:text-green-600 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-green-600 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-green-600 transition-colors">
                Cookies
              </a>
              <span>© 2025 EcoKeepr</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
