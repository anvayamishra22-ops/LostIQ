# LOSTIQ – Smart Lost & Found Portal

LOSTIQ is a web-based **Lost and Found Management System** designed for college campuses. It allows students and staff to report lost items, list found items, search/filter listings, and file claims for belonging recovery. 

This project is built using the **MERN (MongoDB, Express, React, Node)** stack with plain CSS styling, clean forms, and robust user authorization.

---

## 🚀 Key Features

*   **User Authentication**: JWT-based secure signup, login, and profile protection with bcryptjs password hashing.
*   **Lost Item Module**: Report missing items with descriptions, location tags, date, and single-image upload.
*   **Found Item Module**: Report found items, mark items as returned (resolved), and manage claims.
*   **Dynamic Image Upload**: Integrated with Multer and Cloudinary. Includes an automatic **local storage fallback** if Cloudinary keys are not provided.
*   **Search & Filtering**: Search items by name; filter by categories (Electronics, Documents, etc.) or campus locations.
*   **Claim System**: Request found items by submitting custom identification messages. Finders can approve/reject claims.
*   **Admin Dashboard**: Dedicated views for administrator accounts to manage users, delete inappropriate listings, and monitor claims.

---

## 🛠️ Tech Stack

*   **Frontend**: React.js, React Router, Axios, Plain CSS (Inter Font)
*   **Backend**: Node.js, Express.js, JWT, bcryptjs, Multer
*   **Database**: MongoDB, Mongoose
*   **Cloud Hosting**: Cloudinary (Image uploads)

---

## 📁 Project Folder Structure

```
lost_iq/
├── backend/
│   ├── config/          # DB connection & Cloudinary setup
│   ├── controllers/     # Controller functions (auth, items, claims, admin)
│   ├── middleware/      # JWT guards & Multer upload parser
│   ├── models/          # Mongoose models (User, Item, Claim)
│   ├── routes/          # Express route bindings
│   ├── .env.example     # Template for backend settings
│   └── server.js        # Entry point for the server
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Nav, footer, card elements & route guards
│   │   ├── context/     # Auth Context state
│   │   ├── pages/       # User views (Home, Forms, Dashboard, Lists)
│   │   ├── services/    # Axios client and endpoints definition
│   │   ├── App.jsx      # App shell with routing layout
│   │   └── index.css    # Plain CSS rules with variable colors
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## ⚙️ Environment Configuration

### Backend Setup (`backend/`)
Create a `.env` file inside the `backend/` folder (you can copy `.env.example`) and fill in:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/lost_iq
JWT_SECRET=lost_iq_secret_key_123

# Cloudinary Credentials (Optional)
# If left empty, LOSTIQ will automatically save uploads to the backend/uploads/ folder.
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend Setup (`frontend/`)
Vite defaults to port `5173`. We configured the API base URL to connect to the backend on `http://localhost:5000/api`. If you deploy the backend on another port, create a `.env` in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ⚡ Running the Project Locally

### Prerequisites
Make sure you have **Node.js (v18+)** and **MongoDB** installed and running on your system.

### Step 1: Start the Backend Server
Open a terminal and run the following commands:
```bash
# Navigate to backend
cd backend

# Install dependencies (use bypass flags if needed)
npm install --legacy-peer-deps

# Start the server
npm run dev
```
The server should display `MongoDB Connected` and start listening on port `5000`.

### Step 2: Start the Frontend Client
Open a second terminal window and run:
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the dev environment
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 🎓 Viva Q&A Guide for Students

Be prepared to answer these questions during your project presentation:

1. **How is Authentication implemented?**
   * *Answer*: We use **JWT (JSON Web Tokens)** for session management. When a user logs in, the backend verifies their credentials, signs a token with the user ID, and sends it to the frontend. The React app stores it in `localStorage` and automatically attaches it under the `Authorization: Bearer <token>` header for protected API calls using an Axios interceptor.
2. **How does Password Hashing work?**
   * *Answer*: We use **bcryptjs** and a Mongoose pre-save hook on the `UserSchema`. Before storing the user in MongoDB, the password is auto-salted and hashed, meaning plain-text passwords are never saved in the database.
3. **How does the image upload work without Cloudinary configured?**
   * *Answer*: We built a custom **local storage fallback** into the Multer middleware. If Cloudinary credentials are empty in `.env`, Multer uses disk storage to write files to the `backend/uploads` directory. Express then exposes this folder statically under the `/uploads` route so the React client can render it safely.
4. **How are claims handled?**
   * *Answer*: If a student claims a found item, a new record is added to the `Claim` model in MongoDB containing the item reference, the claimant ID, and their custom message. The item finder can review all claims received on their dashboard and choose to "Approve" (which updates the item status to 'recovered') or "Reject".
