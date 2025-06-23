"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import HeaderIcon from "@/components/page/HeaderIcon";
import Footer from "@/components/page/Footer";
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  Code,
  TrendingUp,
  Heart,
  Coffee,
  Laptop,
  Plane,
  ArrowLeft,
  Briefcase,
} from "lucide-react";

const CareersPage = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const departments = ["All", "Engineering", "Product", "Sales", "Marketing", "Customer Success"];

  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health, dental, and vision insurance plus wellness stipend",
    },
    {
      icon: Coffee,
      title: "Flexible Work",
      description: "Remote-first culture with flexible hours and co-working space allowance",
    },
    {
      icon: Laptop,
      title: "Equipment & Setup",
      description: "Latest MacBook Pro, monitor, and $1,000 home office setup budget",
    },
    {
      icon: TrendingUp,
      title: "Growth & Learning",
      description: "$2,000 annual learning budget for courses, conferences, and certifications",
    },
    {
      icon: Plane,
      title: "Time Off",
      description: "Unlimited PTO policy plus company-wide retreat twice per year",
    },
    {
      icon: DollarSign,
      title: "Equity & Compensation",
      description: "Competitive salary, equity package, and annual performance bonuses",
    },
  ];

  const jobs = [
    {
      id: 1,
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "Remote (US/EU)",
      type: "Full-time",
      salary: "$140,000 - $180,000",
      description: "Build scalable web applications using Next.js, TypeScript, and modern cloud infrastructure. Work on our core asset management platform serving thousands of users.",
      requirements: [
        "5+ years of full-stack development experience",
        "Expert in React, Node.js, and TypeScript",
        "Experience with cloud platforms (AWS/GCP/Azure)",
        "Strong understanding of database design and optimization",
        "Experience with CI/CD and DevOps practices",
      ],
      posted: "2 days ago",
    },
    {
      id: 2,
      title: "AI/ML Engineer",
      department: "Engineering",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      salary: "$160,000 - $200,000",
      description: "Develop and deploy machine learning models for carbon footprint calculation, asset lifecycle prediction, and intelligent automation features.",
      requirements: [
        "MS/PhD in Computer Science, Machine Learning, or related field",
        "3+ years of production ML experience",
        "Proficiency in Python, TensorFlow/PyTorch, and MLOps",
        "Experience with large-scale data processing",
        "Knowledge of sustainability/LCA methodologies (preferred)",
      ],
      posted: "1 week ago",
    },
    {
      id: 3,
      title: "Product Manager - Sustainability",
      department: "Product",
      location: "Remote",
      type: "Full-time",
      salary: "$130,000 - $160,000",
      description: "Lead product strategy for our sustainability features including carbon tracking, ESG reporting, and regulatory compliance tools.",
      requirements: [
        "4+ years of product management experience",
        "Background in sustainability, ESG, or environmental science",
        "Experience with B2B SaaS products",
        "Strong analytical and communication skills",
        "Understanding of regulatory frameworks (GRI, SASB, TCFD)",
      ],
      posted: "3 days ago",
    },
    {
      id: 4,
      title: "Enterprise Sales Executive",
      department: "Sales",
      location: "New York, NY / Remote",
      type: "Full-time",
      salary: "$120,000 - $150,000 + Commission",
      description: "Drive revenue growth by selling our platform to Fortune 500 companies. Manage full sales cycle from lead generation to contract negotiation.",
      requirements: [
        "5+ years of enterprise B2B sales experience",
        "Track record of exceeding sales quotas",
        "Experience selling to C-suite executives",
        "Knowledge of asset management or sustainability markets",
        "Strong presentation and negotiation skills",
      ],
      posted: "5 days ago",
    },
    {
      id: 5,
      title: "Senior UX Designer",
      department: "Product",
      location: "Remote",
      type: "Full-time",
      salary: "$110,000 - $140,000",
      description: "Design intuitive user experiences for complex enterprise workflows. Lead design systems and collaborate closely with engineering teams.",
      requirements: [
        "5+ years of UX design experience",
        "Strong portfolio demonstrating B2B SaaS design",
        "Proficiency in Figma, Sketch, or similar tools",
        "Experience with design systems and component libraries",
        "User research and usability testing experience",
      ],
      posted: "1 week ago",
    },
    {
      id: 6,
      title: "Content Marketing Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      salary: "$90,000 - $120,000",
      description: "Create compelling content that educates our audience about asset management and sustainability. Build thought leadership in the industry.",
      requirements: [
        "3+ years of content marketing experience",
        "Excellent writing and storytelling skills",
        "Experience with B2B SaaS marketing",
        "Knowledge of SEO and content optimization",
        "Understanding of sustainability/environmental topics",
      ],
      posted: "4 days ago",
    },
    {
      id: 7,
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Remote",
      type: "Full-time",
      salary: "$85,000 - $110,000",
      description: "Ensure customer success and drive expansion revenue. Work closely with enterprise clients to maximize value from our platform.",
      requirements: [
        "3+ years of customer success experience",
        "Experience with enterprise SaaS customers",
        "Strong analytical and problem-solving skills",
        "Excellent communication and presentation abilities",
        "Experience with customer health scoring and churn prevention",
      ],
      posted: "6 days ago",
    },
    {
      id: 8,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$130,000 - $160,000",
      description: "Build and maintain our cloud infrastructure. Ensure high availability, security, and scalability of our platform.",
      requirements: [
        "4+ years of DevOps/Infrastructure experience",
        "Expertise in AWS/GCP and Infrastructure as Code",
        "Experience with Kubernetes and containerization",
        "Strong understanding of security best practices",
        "Experience with monitoring and observability tools",
      ],
      posted: "1 week ago",
    },
  ];

  const filteredJobs = selectedDepartment === "All" 
    ? jobs 
    : jobs.filter(job => job.department === selectedDepartment);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <HeaderIcon />
            <nav className="hidden md:flex gap-8">
              <Link href="/" className="text-sm font-medium hover:text-green-600 transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-green-600 transition-colors">
                About
              </Link>
              <Link href="/careers" className="text-sm font-medium text-green-600">
                Careers
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:text-green-600 transition-colors">
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Login</Link>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" asChild>
              <Link href="/sign-up">Free Trial</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900">
              Join Our Mission to Build a{" "}
              <span className="text-green-600">Sustainable Future</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              We're looking for passionate individuals who want to make a real impact 
              on how organizations manage their assets and environmental footprint.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                View Open Positions
              </Button>
              <Button size="lg" variant="outline">
                Learn About Benefits
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">Why Work at EcoKeepr?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer competitive benefits and a culture that values work-life balance, 
              continuous learning, and making a positive impact.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <benefit.icon className="w-12 h-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">Open Positions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              We're growing fast and looking for talented people to join our team. 
              Don't see the perfect role? Send us your resume anyway!
            </p>
            
            {/* Department Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {departments.map((dept) => (
                <Button
                  key={dept}
                  variant={selectedDepartment === dept ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDepartment(dept)}
                  className={selectedDepartment === dept ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {dept}
                </Button>
              ))}
            </div>
          </div>

          {/* Job Listings */}
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl text-gray-900 mb-2">{job.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.department}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.type}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {job.salary}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{job.posted}</Badge>
                      <Button className="bg-green-600 hover:bg-green-700">
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{job.description}</p>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No positions found for the selected department.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
            Don't See the Perfect Role?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            We're always interested in connecting with talented individuals who share 
            our passion for sustainability and technology. Send us your resume!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
              Send Resume
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
              Learn More About Us
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CareersPage; 