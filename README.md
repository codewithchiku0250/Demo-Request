# PixelCraft Demo Request Portal

A highly polished, premium, mobile-responsive, full-stack **"Client Demo Request"** web application designed for freelance web & app development agencies. It gathers complex business parameters from prospects who want custom demo websites or apps (such as restaurants, clinics, hotels, gym, schools, shops) and houses them in a secure administrative dashboard.

## Key Features

1. **Stunning Glassmorphism Frontend**: Custom responsive UI with vibrant HSL dark/light modes, premium animations, and custom vector icons.
2. **Dynamic Industry Selection**: A highly interactive industry grid that updates the form type and scrolls users smoothly down.
3. **Robust Multi-Step Forms**: Real-time inline field validations, multi-file image drag-and-drop uploads (logo and business local photos), and color theme swatches.
4. **MVC Architecture Backend**: Secure Node.js + Express API server, rate limiting spam protectors, and Helmet-secured HTTP headers.
5. **MongoDB Integration**: Complete Mongoose request database models and administrator session tables.
6. **Automated Notification System**: Real-time emails sent via Nodemailer (Admin alerts with client specs and WhatsApp links, and immediate client thank-you receipts).
7. **Secure Admin Dashboard Panel**: Protected login portal using JWT tokens, interactive totals metrics, live filter/search tables, status dropdown managers, and Excel-friendly CSV exports.
8. **PWA & Offline Capability**: Modern standalone service worker and app manifest.
9. **Multi-Language Support**: Switchable English and Spanish layouts via JSON localization files.

---

## Folder Structure

```
├── .env                  # Configuration variables
├── .env.example          # Blank template variables
├── .gitignore            # Version control exclusions
├── package.json          # Server dependencies
├── README.md             # Guide documentation
├── seed.js               # Admin account seeder
├── server.js             # Express application entry point
├── config/
│   └── db.js             # Mongoose connection config
├── controllers/
│   ├── authController.js # Admin login controller
│   └── requestController.js # Client request submissions
├── middleware/
│   ├── authMiddleware.js # Protected routes JWT checks
│   ├── uploadMiddleware.js # Multer configurations
│   └── securityMiddleware.js # Express limit rates
├── models/
│   ├── Admin.js          # Admin schema
│   └── DemoRequest.js    # Client request schema
├── routes/
│   ├── authRoutes.js     # Admin authorization endpoints
│   └── requestRoutes.js  # Submission endpoints
└── public/               # Static client files
    ├── index.html        # Client-facing portal
    ├── admin.html        # Admin control room
    ├── manifest.json     # PWA configurations
    ├── sw.js             # Service Worker
    ├── css/
    │   ├── styles.css    # Landing stylesheet
    │   └── admin.css     # Console stylesheet
    ├── js/
    │   ├── app.js        # Main landing script
    │   └── admin.js      # Dashboard script
    └── locales/          # Localization bundles
        ├── en.json       # English text
        └── es.json       # Spanish text
```

---

## Installation & Local Development

### 1. Prerequisites
- **Node.js** (v16.0 or higher recommended)
- **MongoDB** active on local port `27017` or a MongoDB Atlas URI link.

### 2. Setup
Clone or extract the application, enter the workspace directory, and install the npm dependencies:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file (one has already been generated for you with standard defaults) and populate the missing fields:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/demo_requests
JWT_SECRET=yoursupersecretkey
ADMIN_EMAIL=admin@youragency.com
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_username
SMTP_PASS=your_password
```
*(Note: If SMTP parameters are left blank, Nodemailer triggers will output rich logs of emails directly to the server terminal, ensuring zero-crash evaluation).*

### 4. Database Seeding (Create Admin)
Populate your database with the default administrator credentials specified in your `.env` file:
```bash
npm run seed
```
This initializes:
- **Default Username**: `admin`
- **Default Password**: `AdminSecurePass2026!`

### 5. Running the Application
To run the server in development auto-reload mode (requires `nodemon` installed globally/locally):
```bash
npm run dev
```
To run the server in production mode:
```bash
npm start
```

Once running, navigate to:
- **Client Landing Webpage**: [http://localhost:5000](http://localhost:5000)
- **Admin Dashboard Console**: [http://localhost:5000/admin.html](http://localhost:5000/admin.html)

---

## API Documentation

### Public Endpoints
- **`POST /api/requests/submit`**
  - Submits a client's business details, custom color theme, requested features, and handles image files (logo, local photos).
  - *Headers*: `Content-Type: multipart/form-data`
  - *Form Fields*: `fullName`, `businessName`, `mobile`, `whatsapp`, `email`, `businessType`, `requiredService`, `businessDescription`, `preferredColor`, `featuresRequired[]`, `budgetRange`, `deadline`, `referenceLink`, `additionalNotes`, `logo` (File), `photos` (Multiple Files).

### Admin Endpoints (Protected by JWT Header `Authorization: Bearer <Token>`)
- **`POST /api/auth/login`**: Authenticate admin username/password and receive the signed JWT.
- **`GET /api/auth/me`**: Verify current active administrator session.
- **`GET /api/requests`**: Retrieve all requests. Supports sorting (`?sortBy=newest|oldest|name`), status filters (`?status=New|In Progress`), types filters (`?businessType=Restaurant`), and search matches (`?search=john`).
- **`GET /api/requests/:id`**: Fetch complete specifications of a single request.
- **`PATCH /api/requests/:id/status`**: Transition a request state. Body: `{ "status": "In Progress" }`.
- **`DELETE /api/requests/:id`**: Permanently remove a request and delete associated logos/photos from disk storage.
- **`GET /api/requests/export`**: Stream an Excel-compatible CSV database backup of all leads.

---

## Production Deployment Guides

### Deploying to Render
1. Create a free account on [Render](https://render.com).
2. Connect your Git repository.
3. Configure a **Web Service** with the following details:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run seed && npm start`
4. Under **Advanced Options**, add your Environment Variables matching your `.env.example` (ensure `MONGODB_URI` points to a hosted database like MongoDB Atlas, or create a free Render MongoDB service).
5. Click **Deploy Web Service**.

### Deploying to Vercel (Optional Serverless)
1. Add a standard `vercel.json` file at the root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```
2. Set up environment variables on the Vercel dashboard and run `vercel --prod`.

---

## Security Highlights

- **Spam Protection**: Submit route rate-limited to 5 requests/hour per IP.
- **Brute Force Protection**: Admin authentication attempts restricted to 10 requests/15-mins per IP.
- **HTTP Hardening**: Embedded `helmet` security configurations, setting custom Content-Security-Policies to avoid injection and cross-site scripting (XSS) risks.
- **Clean File Handling**: Multer validations reject non-image file mimetypes and enforce a strict 5MB size limit. Deleting a request from the dashboard automatically unlinks and un-stores files from disk.
