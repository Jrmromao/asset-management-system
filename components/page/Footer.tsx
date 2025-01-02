import React from "react";
import { BookOpen, Building2, Globe2, Leaf, Phone } from "lucide-react";

const Footer = () => {
  const columns = [
    {
      title: "Solutions",
      icon: <Leaf className="w-5 h-5 text-green-500" />,
      links: [
        "Asset Tracking",
        "Carbon Footprint",
        "Sustainability Reports",
        "Energy Optimization",
        "Compliance Tools",
      ],
    },
    {
      title: "Industries",
      icon: <Globe2 className="w-5 h-5 text-green-500" />,
      links: [
        "Manufacturing",
        "Commercial Real Estate",
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
        "Green Practices Guide",
      ],
    },
    {
      title: "Company",
      icon: <Building2 className="w-5 h-5 text-green-500" />,
      links: [
        "About Us",
        "Careers",
        "Press Room",
        "Partner Network",
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
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 min-w-0 rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500 px-4 py-3"
              />
              <button className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
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
              <div className="flex items-center space-x-1 text-emerald-600">
                <Phone size={16} />
                <span className="text-sm">1-888-888-8888</span>
              </div>
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
