export default function PrivacyPolicy() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Privacy Policy
          </h1>
          <p className="text-gray-500 mt-1">Last updated: January 2025</p>
        </div>
        <a href="/" className="text-emerald-600 hover:text-emerald-700 text-sm">
          ← Back to Home
        </a>
      </div>

      {/* Contents Section */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Contents</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <a
              href="#introduction"
              className="block text-gray-600 hover:text-gray-900"
            >
              Introduction
            </a>
            <a
              href="#use-of-cookies"
              className="block text-gray-600 hover:text-gray-900"
            >
              Use of Cookies
            </a>
            <a
              href="#data-retention"
              className="block text-gray-600 hover:text-gray-900"
            >
              Data Retention
            </a>
          </div>
          <div className="space-y-2">
            <a
              href="#information-collection"
              className="block text-gray-600 hover:text-gray-900"
            >
              Information Collection and Use
            </a>
            <a
              href="#data-security"
              className="block text-gray-600 hover:text-gray-900"
            >
              Data Security
            </a>
            <a
              href="#data-protection"
              className="block text-gray-600 hover:text-gray-900"
            >
              Your Data Protection Rights
            </a>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        <section id="introduction">
          <h2 className="text-xl font-medium mb-4">Introduction</h2>
          <p className="text-gray-600">
            Welcome to the Asset Management System Privacy Policy. This document
            outlines our practices regarding the collection, use, and disclosure
            of your information when you use our service and the choices you
            have associated with that data.
          </p>
        </section>

        <section id="information-collection">
          <h2 className="text-xl font-medium mb-4">
            Information Collection and Use
          </h2>
          <p className="text-gray-600 mb-4">
            We collect several different types of information for various
            purposes to provide and improve our service to you:
          </p>
          <ul className="text-gray-600 list-disc pl-5 space-y-2">
            <li>
              Personal identification information (Name, email address, company
              details)
            </li>
            <li>Usage data (Access patterns, feature utilization)</li>
            <li>
              Asset management data (Asset details, environmental metrics)
            </li>
          </ul>
        </section>

        <section id="use-of-cookies">
          <h2 className="text-xl font-medium mb-4">Use of Cookies</h2>
          <p className="text-gray-600 mb-4">
            We use cookies and similar tracking technologies to track activity
            on our service and hold certain information. Cookies are files with
            a small amount of data which may include an anonymous unique
            identifier.
          </p>
          <p className="text-gray-600">
            You can instruct your browser to refuse all cookies or to indicate
            when a cookie is being sent. However, if you do not accept cookies,
            you may not be able to use some portions of our service.
          </p>
        </section>

        <section id="data-security">
          <h2 className="text-xl font-medium mb-4">Data Security</h2>
          <p className="text-gray-600">
            The security of your data is important to us. We implement
            appropriate technical and organizational measures to protect your
            information. However, no method of transmission over the Internet or
            electronic storage is 100% secure.
          </p>
        </section>
      </div>
    </div>
  );
}
