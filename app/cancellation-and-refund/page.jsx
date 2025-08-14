'use client';

export default function CancellationAndRefund() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-6 sm:px-10 lg:px-12">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-gray-900">
        Cancellation and Refund Policy
      </h1>

      <section className="mb-8">
        <p className="text-gray-700 mb-4 leading-relaxed">
          We aim to provide the best experience with Toshan Bakery. Below is our detailed cancellation and refund policy, reflecting how orders are managed and payments handled:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            Orders can be cancelled <strong>within 30 minutes of placement</strong> if they have not yet been marked as <em>confirmed</em>, <em>processing</em>, or <em>shipped</em> in our system.
          </li>
          <li>
            Once an order is <strong>confirmed, processing, or shipped</strong>, cancellations can still be requested but are subject to availability and stock management.
          </li>
          <li>
            Cancellation requests during these stages are processed by our support team and may involve restocking items and refund processing.
          </li>
          <li>
            For orders paid via UPI or online payment methods, refunds will be initiated automatically using the original payment transaction details.
          </li>
          <li>
            For Cash on Delivery (COD) orders, refunds are typically not processed since payment collection happens at delivery; however, exceptions may apply for returned or damaged products.
          </li>
          <li>
            Refunds generally take <strong>5-7 business days</strong> to be reflected in your account, depending on your bank or payment provider.
          </li>
          <li>
            If your order is cancelled due to <em>insufficient stock</em> or other operational reasons, you will be notified promptly and a refund will be issued to your original payment method.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">How to Cancel Your Order</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          If you wish to cancel your order within the eligible timeframe, please:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>
            Contact our support team immediately at{' '}
            <a
              href="mailto:contact@toshanbakery.website"
              className="text-green-600 underline hover:text-green-700"
            >
              contact@toshanbakery.website
            </a>{' '}
            with your order ID and cancellation request details.
          </li>
          <li>
            Ensure your cancellation request is received before your order status changes to <em>confirmed</em> or beyond.
          </li>
          <li>
            Keep your order ID handy for faster processing.
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Frequently Asked Questions (FAQs)</h2>
        <dl className="space-y-6 text-gray-700">
          <div>
            <dt className="font-medium">Can I cancel my order after it has been confirmed or shipped?</dt>
            <dd className="mt-1">
              Orders with status <em>confirmed</em>, <em>processing</em>, or <em>shipped</em> can be cancelled but are subject to stock availability and our cancellation policy. Please contact us immediately for assistance.
            </dd>
          </div>
          <div>
            <dt className="font-medium">How will I receive my refund?</dt>
            <dd className="mt-1">
              Refunds are processed to the original payment method used during checkout. For UPI or online payments, refunds are automated. For COD orders, refunds are handled on a case-by-case basis.
            </dd>
          </div>
          <div>
            <dt className="font-medium">How long does a refund take?</dt>
            <dd className="mt-1">
              Refunds typically take 5-7 business days to appear in your account, depending on your bank or payment provider.
            </dd>
          </div>
          <div>
            <dt className="font-medium">What if my order is cancelled due to stock issues?</dt>
            <dd className="mt-1">
              We will notify you promptly and process a refund for any affected items through your original payment method.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Who can I contact for help?</dt>
            <dd className="mt-1">
              You can reach our support team anytime at{' '}
              <a
                href="mailto:contact@toshankanwar.website"
                className="text-green-600 underline hover:text-green-700"
              >
                contact@toshankanwar.website
              </a>
              .
            </dd>
          </div>
        </dl>
      </section>

      <p className="text-sm text-gray-500 mt-12">
        <em>Note: This policy is subject to change without prior notice. Please visit this page periodically for any updates.</em>
      </p>
    </div>
  );
}
