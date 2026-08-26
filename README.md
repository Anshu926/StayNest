Set-Content -Path "c:\Users\anshu\OneDrive\Desktop\WEBSITE\Project\README.md" -Value @'
# 🏠 StayNest — Accommodation & Meal Booking Platform

> **Live Production:** [https://staynest-platform.vercel.app](https://staynest-platform.vercel.app)  
> **Tagline:** *Find your stay. Find your food. Settle in faster.*

---

## 📖 Overview

**StayNest** is a modern, full-stack accommodation and daily meal discovery and booking platform built for students, corporate employees, and young professionals. It bridges the gap between seekers and local verified providers for **Paying Guest (PG) accommodations, private/shared rental rooms, flats, student hostels, and homemade daily tiffin services**.

---

## ✨ Core Features

### 🔍 For Seekers / Customers
- **Stay Discovery:** Advanced filtering by budget, property type (*PG, Flat, Hostel, Single Room, Shared Room*), occupant preference (*Student, Professional, Co-ed, Male, Female*), and amenities (*Wi-Fi, AC, Parking, Attached Bath, etc.*).
- **Meal & Tiffin Services:** Search meal providers by food preference (*Pure Veg, Non-Veg, Jain, Veg & Non-Veg*), meal times (*Breakfast, Lunch, Dinner*), monthly subscription pricing, and delivery coverage.
- **Independent Wishlist & Saved Collections:**
  - ❤️ **Favorites (Wishlist):** Quick access to listings you love.
  - 🔖 **Saved Collections:** Organize and bookmark listings for future planning with personal notes.
- **Real-Time Communication:**
  - 💬 **Inquiries & Live Chat:** Direct lead inquiries with conversation threads.
  - 📱 **WhatsApp Integration:** 1-click WhatsApp messaging to verified property owners.
- **Ratings & Verified Reviews:** Read authentic tenant reviews and rate stays/tiffins.

### 🏢 For Property & Meal Providers
- **Provider Dashboard:** Track active listings, total views, tenant leads, and active chat conversations in real-time.
- **Listing Management:** Add, edit, pause, or delete stay and tiffin listings with custom photos and amenity tags.
- **Lead CRM & Inquiry Management:** Status tracking (*Pending, Responded, Resolved, Closed*), direct reply threads, and one-click lead deletion.
- **Provider Business Settings:** Manage business profiles, verification badges, contact info, WhatsApp numbers, and security credentials.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16.3.1](https://nextjs.org/) (App Router, Turbopack, Server & Client Components)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with dark/light mode support
- **Icons:** [Lucide React](https://lucide.dev/)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas) via [Mongoose](https://mongoosejs.com/)
- **Authentication:** JWT (JSON Web Tokens) with `bcryptjs` password hashing
- **Deployment:** [Vercel](https://vercel.com/) with global edge CDN & automatic SSL

---

## 📁 Project Architecture

```
Project/
├── app/                          # Next.js App Router Pages & APIs
│   ├── api/                      # REST API Endpoints
│   │   ├── auth/                 # Login, Register, Me endpoints
│   │   ├── areas/                # Locality data endpoints
│   │   ├── conversations/        # Live chat & message endpoints
│   │   ├── favorites/            # ❤️ Wishlist API
│   │   ├── inquiries/            # Lead inquiry & reply API
│   │   ├── listings/             # Provider listing CRUD API
│   │   ├── provider/             # Provider profile & settings API
│   │   ├── reviews/              # Rating & review API
│   │   ├── saved/                # 🔖 Saved collection API
│   │   ├── stays/                # Stays listing & detail API
│   │   └── tiffins/              # Tiffin listing & detail API
│   ├── areas/                    # Locality explorer pages
│   ├── enquiries/                # Customer inquiries & chat portal
│   ├── favorites/                # Customer Wishlist page (❤️)
│   ├── list-your-service/        # Provider onboarding landing page
│   ├── login/ & register/        # Authentication pages
│   ├── provider/                 # Provider portal (Dashboard, CRM, Settings)
│   ├── saved/                    # Customer Saved Collections page (🔖)
│   ├── stays/                    # Stays search & detail page ([slug])
│   ├── tiffins/                  # Tiffins search & detail page ([slug])
│   ├── globals.css               # Global Tailwind CSS styles
│   └── layout.tsx                # Root layout & theme provider
├── components/                   # Reusable React UI Components
│   ├── chat/                     # Live chat modal components
│   ├── home/                     # Hero, Popular Stays, Popular Tiffins
│   ├── layout/                   # Navbar & Footer
│   ├── listings/                 # ListingCard & TiffinCard
│   ├── provider/                 # Provider controls & image uploaders
│   └── shared/                   # FavoriteButton, SaveButton, WhatsAppButton
├── models/                       # Mongoose Schemas (User, Stay, Tiffin, etc.)
├── lib/                          # Database connection & JWT authentication
├── scripts/                      # Database seed scripts
└── types/                        # TypeScript interfaces & types
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js:** v18.17+ or v20+
- **MongoDB:** Local MongoDB instance OR MongoDB Atlas cluster URL

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Anshu926/NagpurNest.git staynest
cd staynest
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:
```env
# MongoDB Connection String (Atlas or Localhost)
MONGODB_URI=mongodb+srv://admin:NagpurNest123@cluster0.diiwt2t.mongodb.net/nest?retryWrites=true&w=majority&appName=Cluster0

# Authentication Secret
JWT_SECRET=staynest-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=StayNest
```

### 4. Seed Sample Database (Optional)
To populate sample stays, tiffins, and localities:
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🚢 Deployment on Vercel

1. Push your code to GitHub.
2. Import your repository into **[Vercel](https://vercel.com/)**.
3. Add the following **Environment Variables** in Vercel settings:
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: A secure random 32+ character string
4. Click **Deploy**.

---

## 🛡️ License

This project is open source and available under the [MIT License](LICENSE).
'@
Write-Host "README.md written successfully"
