# 🚀 Next.js PWA App

This is a Progressive Web App (PWA) built with **Next.js**, designed to be installable from the browser with offline support and fast performance.

## 📦 Features

- Fully functional Next.js PWA
- Browser-installable (via the install icon in the address bar)
- Ready for deployment
- Sample page included for demonstration

---

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone git@github.com:Wosler-Corp/hilum-kiosk.git
cd hilum-kiosk
```

### 2. Install Dependencies

Make sure you have [Node.js](https://nodejs.org/) installed (preferably version 18 or later), then run:

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```bash
# Nexus Number for clinic identification
NEXT_PUBLIC_NEXUS_NUMBER=6473603374

# API Configuration (optional - defaults to staging)
NEXT_PUBLIC_API_BASE_URL=https://staging.nexus.wosler.ca/api/
```

**Note**: The `.env.local` file is ignored by git for security. Copy the values from `.env.example` if available.

### 4. Run the Development Server

```bash
npm run dev
```

The app will be running at: [http://localhost:3000](http://localhost:3000)

---

## 📦 Build for Production

To generate a production build:

```bash
npm run build
npm run start
```

---

## 📲 Installing the App from Your Browser (You need to run in production in order to do this)

Once the app is running in the browser (or deployed to a live URL), you can install it as a PWA:

1. Open the app in **Google Chrome** (or any PWA-supported browser).
2. Look for the **install icon** in the address bar.  
   - In Chrome, this icon may appear as a **screen with a download arrow**.
3. Click the install icon and follow the prompts.

After installation, the app will open in its own window like a native application.

