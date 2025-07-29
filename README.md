# Toshan Bakery Web Application

A feature-rich, modern web application for Toshan Bakery, built with Next.js, Firebase, and Tailwind CSS.  
This app provides a seamless bakery shopping experience with user authentication, product catalog, cart, checkout, order history, and more.

---
## Live Demo

You can try the Toshan Bakery web application live here:

**[🌐 Toshan Bakery ](https://bakery.toshankanwar.website)**
**[🌐 Admin Dashboard ](https://admin.bakery.toshankanwar.website/login)**
**[🌐 Repo Admin Dashboard ](https://github.com/toshankanwar/Admin-Bakery-Management-and--Ecommerce)**
**[🌐 Custom email server ](https://mail-server-toshan-bakery.onrender.com)**
**[🌐 Online Payment Server ](https://bakery-online-payment-server.onrender.com)**
**[🌐 cancle Order Server ](https://bakery-cancle-order-server.onrender.com)**
**[🌐 Item decrement Server ](https://bakery-item-decrement-server.onrender.com)**

Repo links for all Backend Servers 

https://github.com/toshankanwar/Bakery-Online--Payment-Server
https://github.com/toshankanwar/Bakery-Cancle--Order-Server
https://github.com/toshankanwar/Bakery-Item_decrement-Server
https://github.com/toshankanwar/Mail-Server-Toshan-bakery

## Screenshots

![image](https://github.com/user-attachments/assets/a75a9205-bce5-48a3-b06c-493e73a787fc)
![image](https://bakery.toshankanwar.website/payment.png)
![WhatsApp Image 2025-06-20 at 01 43 34_b63de603](https://github.com/user-attachments/assets/c4afaa5a-9970-49f4-8e51-ea3c5a4dc4a2)
![WhatsApp Image 2025-06-20 at 01 43 34_7cb46860](https://github.com/user-attachments/assets/9e3305e4-ae20-41bf-a2e7-0cca0c343af8)
![image](https://github.com/user-attachments/assets/0fd39e32-9779-4538-9179-606fdc7837dd)
![image](https://github.com/user-attachments/assets/aaf9238f-505a-48f4-8a15-0484b79a4422)
![image](https://github.com/user-attachments/assets/144cf184-6b84-4e92-af12-5ffeb8561934)



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
- **Razorpay Payment:** Pay online using upi, credit cards, Qr code. Robust payment gateway with automatic refund based on if order cancle and payment confirmed  .
- **Cart & Checkout:** Authenticated cart, address form, delivery options (today/choose date), payment method selection.
- **Order Placement:** Order summary, order creation, and persistent order history.
- **Order Management:** View all orders, filter by status, download PDF invoices.
- **Admin Features:** (in code) Admins can create and manage products & categories.
- **Automatic Stock Management:** Bakery item quantity reduces automatically after order via backend (Custom servers).
- **Security:** Role-based access, robust Firestore security rules.
- **Responsive Design:** Mobile-first, accessible, and visually appealing UI.

---

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Framer Motion
- **Backend:** Firebase Auth, Firestore, Firebase Storage ,Render ,Razorpay, Node.js
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
   git clone https://github.com/toshankanwar/bakery-management-and-ecommerce
   cd bakery-management-and-ecommerce
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

---

## How the App Works

1. **Home Page:**  
   Users see the latest products, categories, special offers, and testimonials.
2. **Catalog:**  
   All products are shown, navigable by slug-based URLs (`/product/<slug>`).
3. **Cart & Checkout:**  
   Authenticated users add items to cart, proceed to checkout, choose delivery type (today/choose date), fill address, and select payment method.
4. **Order Placement:**  
   On order, stock is checked, orders collection is updated, and cart items are removed.
5. **Order Management:**  
   Users see their order history and can download invoices as PDF.
6. **Admin (in code):**  
   Admins can add/edit/delete products, categories.
7. **Automatic Stock Update:**  
   After order, bakery item quantity is reduced automatically via Cloud Function.
8. **Security:**  
   Firestore rules ensure safe and role-based access for all operations.

---




---

## Contributing

1. Fork this repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## Contact

For questions, support, or business inquiries, please reach out to us at:

**Email:** [contact@toshankanwar.website](mailto:contact@toshankanwar.website)

---

## License

[MIT](LICENSE)

---

**Made with ❤️ by Toshan Bakery Team**