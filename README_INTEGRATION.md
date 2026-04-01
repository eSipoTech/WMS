# Porteo WMS Next-Gen: Integration Guide (AS/400 & LANSA)

Welcome to the Porteo WMS Next-Gen integration guide. This document explains how to install, run, and integrate this platform with IBM i (AS/400) systems using LANSA technology.

## 1. Prerequisites

- **Node.js**: v18 or higher.
- **Git**: For version control.
- **IBM i (AS/400)**: Access to a server with LANSA installed.
- **LANSA Integrator (JSM)**: Required for REST/JSON communication.

## 2. Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/porteo/wms-next-gen.git
   cd wms-next-gen
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   AS400_HOST=your.as400.host
   LANSA_API_KEY=your_lansa_api_key
   DB2_USER=your_username
   DB2_PASSWORD=your_password
   ```

## 3. Running the Application

### Development Mode
Runs the app with hot-reloading:
```bash
npm run dev
```

### Production Mode
Builds the app for production:
```bash
npm run build
npm start
```

## 4. AS/400 & LANSA Integration Architecture

The integration follows a modern RESTful architecture:

1.  **Physical Files (PF)**: Data resides in DB2 physical files on the IBM i.
2.  **LANSA Server Modules**: These modules act as the bridge, exposing DB2 data via REST APIs.
3.  **LANSA Integrator (JSM)**: Handles the JSON serialization and HTTP communication between the WMS and the IBM i.
4.  **WMS Backend**: Communicates with the LANSA APIs to sync inventory, orders, and master data.

### Key Integration Points:
- **Inventory Sync**: Real-time updates of stock levels from AS/400 to WMS.
- **Order Processing**: Orders created in AS/400 are pushed to WMS for fulfillment.
- **Master Data**: SKU and Client information is mastered in AS/400 and synced to WMS.

## 5. Migration to Servers

### Docker Deployment
1. **Build the image**:
   ```bash
   docker build -t porteo-wms .
   ```
2. **Run the container**:
   ```bash
   docker run -p 3000:3000 --env-file .env porteo-wms
   ```

### Cloud Deployment (Google Cloud Run)
1. **Push to Artifact Registry**:
   ```bash
   gcloud builds submit --tag gcr.io/[PROJECT_ID]/porteo-wms
   ```
2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy porteo-wms --image gcr.io/[PROJECT_ID]/porteo-wms --platform managed
   ```

## 6. Troubleshooting

- **Connection Refused**: Check if the LANSA JSM service is running on the IBM i.
- **Authentication Error**: Verify the `LANSA_API_KEY` in your `.env` file.
- **Latency Issues**: Ensure the network connection between the WMS server and the IBM i is optimized (e.g., same VPC or dedicated line).

---
*Porteo WMS - Empowering Logistics with AI & Modern Integration*
