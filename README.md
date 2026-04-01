# Porteo WMS - AS/400 & LANSA Integration Guide

This guide explains how to install, run, and integrate the Porteo WMS platform with IBM i (AS/400) systems using LANSA technology.

## 1. Prerequisites
- **Node.js**: Version 20 or higher.
- **npm**: Standard package manager.
- **IBM i (AS/400)**: Access to a partition with LANSA installed.
- **LANSA Integrator or Visual LANSA**: Required to expose AS/400 data as REST APIs.

## 2. Installation
1. **Clone the repository** (or download the source).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   AS400_API_URL=https://your-as400-ip:port/api/lansa
   AS400_API_KEY=your_secure_token
   ```

## 3. Running the Platform
- **Development Mode**:
  ```bash
  npm run dev
  ```
  *Note: In development mode, the platform uses mock endpoints in `server.ts` to simulate AS/400 connectivity. This allows you to test the UI without a live IBM i connection.*

- **Production Build**:
  ```bash
  npm run build
  npm start
  ```

## 4. AS/400 & LANSA Integration Logic
The Porteo WMS is designed to communicate with AS/400 via a **RESTful API layer**. 

### Step-by-Step Integration:
1. **Expose LANSA Data**:
   - Use **Visual LANSA** to create a Server Module.
   - Define a `Routine` that fetches data from your physical files (e.g., `INVFIL`).
   - Expose this routine as a `REST API` endpoint (JSON format).
2. **Configure the Connector**:
   - In the Porteo WMS, navigate to **Settings > Integration**.
   - Enter your LANSA API endpoint.
3. **Data Mapping**:
   - The WMS expects JSON in the following format for inventory:
     ```json
     {
       "sku": "AS400_PART_NUMBER",
       "quantity": 100,
       "location": "WH-A1"
     }
     ```
   - Ensure your LANSA routine maps AS/400 fields to these keys.

## 5. Migration to Servers
1. **Containerization**: The platform is ready for Docker. Use the provided `Dockerfile`.
2. **Cloud Deployment**:
   - Deploy to **Google Cloud Run** or **AWS App Runner**.
   - Ensure the server has network access (VPN or Allowlist) to your AS/400 IP address.
3. **Database**: The platform uses SQLite by default. For high-scale production, migrate the `server.ts` database logic to PostgreSQL or SQL Server.

## 6. Troubleshooting
- **Connection Timeout**: Verify that the AS/400 firewall allows traffic on the LANSA web port (usually 80 or 443).
- **Auth Error**: Check that the `AS400_API_KEY` matches the one configured in your LANSA Server Module logic.

---
*Developed for Porteo Group - Intelligent Logistics Solutions.*
