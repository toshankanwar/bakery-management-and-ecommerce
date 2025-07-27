'use client';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-6 sm:px-10 lg:px-12">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-gray-900">
        Privacy Policy
      </h1>

      <section className="mb-8">
        <p className="text-gray-700 mb-4 leading-relaxed">
          At Toshan Bakery, we take your privacy seriously. This policy explains how we collect, use, protect, and handle your personal information when you use our services.
        </p>
        <p className="text-gray-700 mb-4 leading-relaxed">
          We are committed to maintaining the confidentiality, integrity, and security of your data while ensuring compliance with applicable privacy laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Information We Collect</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>Personal Details:</strong> Name, email address, phone number, and shipping information to fulfill your orders.</li>
          <li><strong>Payment Information:</strong> Payment details are handled securely via trusted third-party payment gateways and are never stored directly on our servers.</li>
          <li><strong>Usage Data:</strong> Information about your interactions with our website for improving user experience and service quality.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">How We Use Your Information</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>To process and fulfill your orders efficiently.</li>
          <li>To communicate important updates, promotions, or support regarding your orders.</li>
          <li>To improve our website, services, and customer experience.</li>
          <li>To comply with legal obligations and prevent fraud or unauthorized activity.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Data Security</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          We implement technical and organizational measures to protect your data from unauthorized access, alteration, disclosure, or destruction. Our payment processing partners comply with industry standards such as PCI-DSS for secure payment transactions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Sharing Your Information</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          We do not sell or rent your personal information to third parties. We may share necessary data with trusted partners only as required to fulfill your orders (e.g., shipping companies, payment gateways) or if legally compelled to do so.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Your Rights</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>You can request access to, correction, or deletion of your personal information.</li>
          <li>You may opt out of marketing communications at any time.</li>
          <li>For any data privacy concerns or requests, contact us at the email below.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Frequently Asked Questions (FAQs)</h2>
        <dl className="space-y-6 text-gray-700">
          <div>
            <dt className="font-medium">How is my payment information handled?</dt>
            <dd className="mt-1">
              Payment details are processed securely by trusted third-party payment gateways like Razorpay. We do not store your sensitive payment information on our servers.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Is my personal data shared with others?</dt>
            <dd className="mt-1">
              We only share your personal data with essential service providers required to fulfill your orders or comply with the law. We do not sell your data.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Can I request deletion of my data?</dt>
            <dd className="mt-1">
              Yes, you can contact us at any time to request deletion or correction of your personal information, subject to legal and operational constraints.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Who do I contact with privacy questions?</dt>
            <dd className="mt-1">
              Please email us at{' '}
              <a href="mailto:contact@toshanbakery.website" className="text-green-600 underline hover:text-green-700">
                contact@toshanbakery.website
              </a>
              {' '}for any questions or concerns regarding your privacy.
            </dd>
          </div>
        </dl>
      </section>

      <p className="text-sm text-gray-500 mt-12 italic">
        This Privacy Policy is subject to updates. Please check this page periodically for changes.
      </p>
    </div>
  );
}
