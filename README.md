# Revento App

This project consists of a **frontend (Next.js + TypeScript)** and a **backend (PHP + Flask + AI-Machine Learning)**. Follow the instructions below to set up and run the application.

---

## Prerequisites

Ensure you have the following installed:

- **Node.js** (for frontend)
- **PHP & Apache Server** (using XAMPP)
- **Python 3** (for Flask-based recommendation system)
- **MySQL** (for database)

---

## Frontend Setup (Next.js + TypeScript)

1. Navigate to the frontend folder:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. The app should now be running at `http://localhost:3000`.

---

## Backend Setup

### PHP Backend (Using XAMPP)

1. Ensure **XAMPP** is installed and running (Apache & MySQL).
2. Place the PHP files inside your XAMPP `htdocs` directory.
3. Start your Apache server from the XAMPP control panel.

Your PHP backend should now be accessible through `http://localhost/revento-backend`.

---

### Flask (Python) Backend for Recommendations

1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Install required Python packages:
   ```sh
   pip install flask pandas scikit-learn mysql-connector-python
   ```
3. Run the backend server:
   ```sh
   python recommend.py
   ```
4. The Flask server should now be running.

---

## Database Setup (MySQL)

1. Create a new database:
   ```sql
   CREATE DATABASE revento_app;
   ```
2. Import the SQL file:
   - Open MySQL or use a database management tool (like phpMyAdmin).
   - Import the provided SQL file into the `revento_app` database.

---

## You're all set!

Now your application should be up and running.

- **Frontend:** `http://localhost:3000`
- **PHP Backend:** `http://localhost/revento-backend`
- **Flask API:** Running on the specified port

You can login using
Email:admin@admin.com
Password:admin

Thank you
