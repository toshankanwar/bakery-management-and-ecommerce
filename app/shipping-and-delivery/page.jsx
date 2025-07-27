'use client';

export default function ShippingAndDelivery() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-6 sm:px-10 lg:px-12">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-gray-900">
        Shipping & Delivery Policy
      </h1>

      <section className="mb-8">
        <p className="text-gray-700 mb-4 leading-relaxed">
          At Toshan Bakery, we strive to deliver fresh, high-quality bakery products directly to your doorstep with care and punctuality.
        </p>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Orders placed before <strong>5 PM</strong> are generally delivered on the <strong>same day</strong>, subject to product availability and your delivery location.
          Orders placed after that cutoff or on holidays will be processed on the next business day.
        </p>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Delivery times may vary based on location, weather conditions, and operational constraints. We appreciate your understanding in such cases.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Shipping Charges</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Shipping or delivery charges, if applicable, will be clearly shown during checkout before you confirm your order.
          In some cases, we may offer <strong>free shipping</strong> promotions or waive delivery fees for orders above a certain amount.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Address & Contact Details</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Please ensure that all address and contact information you provide is accurate and complete. This helps us avoid delivery delays or failures.
        </p>
        <p className="text-gray-700 mb-4 leading-relaxed">
          If you need to update your shipping details after placing an order, please contact support immediately and we will do our best to accommodate changes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Delivery Issues & Support</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          In case of any delivery delays, missing items, or issues with your order, please reach out to our support team as soon as possible.
        </p>
        <p className="text-gray-700 mb-4 leading-relaxed">
          You can contact us at:{' '}
          <a
            href="mailto:contact@toshanbakery.website"
            className="text-green-600 underline hover:text-green-700"
          >
            contact@toshanbakery.website
          </a>
          {' '}
          and we will be happy to assist you.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Delivery Locations</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Currently, we deliver to select locations within our service areas. If you are unsure whether we deliver to your location, please contact us before placing your order.
        </p>
      </section>

      <p className="text-sm text-gray-500 mt-12 italic">
        <em>Note: Our Shipping & Delivery Policy is subject to change without prior notice. Please review this page periodically for updates.</em>
      </p>
    </div>
  );
}
