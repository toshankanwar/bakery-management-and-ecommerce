# Toshan Bakery Web Application

A feature-rich, modern web application for Toshan Bakery, built with Next.js, Firebase, and Tailwind CSS.  
This app provides a seamless bakery shopping experience with user authentication, product catalog, cart, checkout, order history, and more.

---
## Live Demo

You can try the Toshan Bakery web application live here:

**[🌐 Toshan Bakery Demo](https://bakery.toshankanwar.website)**
**[🌐 Admin Dashboard Demo](https://admin.bakery.toshankanwar.website/login)**

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Firebase Setup](#firebase-setup)
- [Environment Variables](#environment-variables)
- [Firestore Database Structure](#firestore-database-structure)
- [Security Rules](#security-rules)
- [Cloud Functions](#cloud-functions)
- [How the App Works](#how-the-app-works)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [Contact](#contact)
- [License](#license)

---

## Features

- **Landing & Home Page:** Hero section, features, categories, special offers, testimonials, contact info.
- **Product Catalog:** Slug-based product pages, categories, and latest products.
- **Cart & Checkout:** Authenticated cart, address form, delivery options (today/choose date), payment method selection.
- **Order Placement:** Order summary, order creation, and persistent order history.
- **Order Management:** View all orders, filter by status, download PDF invoices.
- **Admin Features:** (in code) Admins can create and manage products & categories.
- **Automatic Stock Management:** Bakery item quantity reduces automatically after order via backend (Cloud Function).
- **Security:** Role-based access, robust Firestore security rules.
- **Responsive Design:** Mobile-first, accessible, and visually appealing UI.

---

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Framer Motion
- **Backend:** Firebase Auth, Firestore, Firebase Storage
- **Deployment:** Vercel / Firebase Hosting
- **Other:** React Hot Toast, html2pdf.js, Heroicons

---

## Project Structure

```
/app
  /about
  /cart
  /checkout
  /orders
  /product/[slug]
  /shop
  /contact
  layout.jsx
  page.jsx
/components
/contexts
/firebase
/public
/styles
```

---

## Setup & Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/<your-org-or-user>/toshan-bakery.git
   cd toshan-bakery
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Firebase (see below).**

4. **Create `.env.local` file (see [Environment Variables](#environment-variables)).**

5. **Run the development server:**

   ```bash
   npm run dev
   ```

6. **Visit [http://localhost:3000](http://localhost:3000) in your browser.**

---

## Firebase Setup

- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a project (e.g. "toshan-bakery")
- Add a Web App and copy config for `.env.local`
- Enable **Authentication** (Email/Password)
- Create Firestore database (production mode)
- Set up Storage (for product images, optional)
- Set [Firestore Security Rules](#security-rules)
- (Optional) Deploy [Cloud Functions](#cloud-functions) for stock management

---

## Environment Variables

Create a `.env.local` file in the root:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Values can be found in your Firebase project settings.

---

## Firestore Database Structure

### Collections

- `/users/{userId}`
    - `email`, `displayName`, `role`, `createdAt`
- `/bakeryItems/{itemId}`
    - `name`, `description`, `price`, `category`, `imageUrl`, `inStock`, `isNew`, `quantity`, `createdAt`, `updatedAt`
- `/carts/{userId}/items/{itemId}`
    - `productId`, `name`, `quantity`, `addedAt`, `price`, `image`, `category`
- `/orders/{orderId}`
    - `userId`, `userEmail`, `items`, `address`, `paymentMethod`, `paymentStatus`, `orderStatus`, `subtotal`, `shipping`, `total`, `createdAt`, `updatedAt`, `deliveryType`, `deliveryDate?`
- `/categories/{categoryId}`
    - `name`, `description`, `active`, `createdAt`, `updatedAt`

---

## Security Rules

See [`firestore.rules`](firestore.rules) in the project for exact rules.
**Key points:**
- Only admins (role: 'admin') can create/update/delete products/categories.
- Users can update only `quantity` of bakery items (for stock management).
- Orders can only be created by authenticated users for themselves.
- Cart items can only be managed by their owner.

---

## Cloud Functions

For automatic stock reduction after order placement, deploy the following Cloud Function:

```js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.reduceBakeryStockOnOrder = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderData = snap.data();
    const items = orderData.items || [];
    for (const item of items) {
      const itemId = item.productId || item.id;
      const itemRef = admin.firestore().collection('bakeryItems').doc(itemId);
      await admin.firestore().runTransaction(async (transaction) => {
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists) return;
        const currentQty = itemDoc.data().quantity || 0;
        const newQty = Math.max(0, currentQty - (item.quantity || 1));
        transaction.update(itemRef, { quantity: newQty });
      });
    }
    return null;
  });
```

**To deploy:**

```sh
cd functions
npm install
firebase deploy --only functions
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

**Made with ❤️ by Toshan Bakery Team**