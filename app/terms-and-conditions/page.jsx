'use client';

export default function TermsAndConditions() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-6 sm:px-10 lg:px-12">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-gray-900">
        Terms and Conditions
      </h1>

      <section className="mb-8">
        <p className="text-gray-700 mb-4 leading-relaxed">
          By placing an order on our website, you agree to provide accurate and truthful information and to comply with all our policies and terms outlined herein.
        </p>
        <p className="text-gray-700 mb-4 leading-relaxed">
          All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order at our sole discretion, including cases of fraud, errors in pricing or product information, or unavailability of stock.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Product Information</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Product images, descriptions, and prices are provided for informational purposes only and may vary.</li>
          <li>We strive to ensure accuracy but cannot guarantee that all details are error-free or current.</li>
          <li>Prices, availability, and specifications may change without prior notice.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Order Acceptance and Cancellation</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Receipt of your order does not constitute acceptance; we reserve the right to accept or decline your order.</li>
          <li>Orders may be cancelled by us for reasons including but not limited to stock unavailability, pricing errors, or suspicious activity.</li>
          <li>You may request to cancel your order within the designated cancellation timeframe as outlined in our Cancellation and Refund Policy.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Pricing and Payment</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless otherwise stated.</li>
          <li>We accept payments via verified payment methods listed on the checkout page.</li>
          <li>Payment must be completed in full before order processing, except for Cash on Delivery orders where payment will be collected upon delivery.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Shipping and Delivery</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Please refer to our Shipping & Delivery Policy for detailed information about delivery timelines, charges, and responsibilities.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Returns, Cancellations & Refunds</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Our Cancellation and Refund Policy outlines your rights and the process for cancellations, returns, and refunds.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Limitation of Liability</h2>
        <p className="text-gray-700 leading-relaxed">
          We are not liable for any indirect, incidental, or consequential damages arising from the use of our products or services, except as required by law.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Changes to These Terms</h2>
        <p className="text-gray-700 leading-relaxed">
          We reserve the right to update or modify these Terms and Conditions at any time without prior notice. Please review this page periodically for any changes.
        </p>
      </section>

      <p className="text-gray-700 text-base mb-6">
        For any questions about our terms or policies, please contact us at{' '}
        <a
          href="mailto:contact@toshanbakery.website"
          className="text-green-600 underline hover:text-green-700"
        >
          contact@toshanbakery.website
        </a>.
      </p>

      <p className="text-sm text-gray-500 italic">
        Last updated: July 2025
      </p>
    </div>
  );
}
