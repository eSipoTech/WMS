# Porteo WMS - Installation & Deployment Guide

Welcome to the **Porteo Warehouse Management System (WMS)**. This guide will walk you through the process of setting up the application on your own servers, from cloning the code to running it in production.

---

## 📋 Prerequisites

Before you begin, make sure your server has the following installed:

1.  **Node.js (v18 or higher)**: The engine that runs the application.
    *   [Download Node.js](https://nodejs.org/)
2.  **npm (comes with Node.js)**: The tool used to install the software's building blocks (packages).
3.  **Git**: Used to download the code from GitHub.
    *   [Download Git](https://git-scm.com/)

---

## 🚀 Step-by-Step Installation

### 1. Download the Code
Open your terminal (or command prompt) and run the following command to download the project from GitHub:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd porteo-wms
```

### 2. Install Dependencies
The software relies on several "packages" to function. Install them all with one command:

```bash
npm install
```
*This may take a minute or two as it downloads all necessary libraries.*

### 3. Configure Environment Variables
The application needs a **Gemini API Key** to power its AI features.

1.  Look at the `.env.example` file for the required variables.
2.  Create a file named `.env` in the root folder of the project.
3.  Add your API key to the file like this:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```
    *(You can get your key from the [Google AI Studio](https://aistudio.google.com/app/apikey))*

---

## 📊 Data Import & Setup

Porteo WMS is designed to be data-driven. You can initialize the system by uploading an Excel (`.xlsx`) file.

### How to Import Data:
1.  Navigate to the **Administration** tab in the sidebar.
2.  Select **System Admin** or **Layout Management**.
3.  Use the **"Global Data Import"** button.
4.  The system accepts Excel files with the following sheets:
    *   `Warehouses`: Columns: `name`, `location`, `market` (MEXICO/USA), `capacity`.
    *   `Inventory`: Columns: `sku`, `name`, `quantity`, `unit`, `customer`.
    *   `Pricing`: Columns: `customerId`, `sku`, `basePrice`.

The system will automatically detect the market (e.g., Mexico) and create the necessary warehouse structures and inventory records.

---

## 🛠️ Running the Application

### For Development (Testing)
If you want to run the app to see how it looks and test changes:

```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### For Production (Live Server)
When you are ready to put the app on a real server for users:

1.  **Build the project**: This optimizes the code for speed and security.
    ```bash
    npm run build
    ```
2.  **Serve the files**: The optimized files will be created in a folder called `dist`. You can use a simple static server like `serve` or configure Nginx/Apache to point to this folder.

    *Quick way to serve locally:*
    ```bash
    npx serve -s dist
    ```

---

## 🛡️ Security Note
**Never** share your `.env` file or commit it to GitHub. It contains your private API keys. Always add `.env` to your `.gitignore` file.

---

**Need Help?**
If you run into any issues, contact your lead developer or open an issue in the GitHub repository.
