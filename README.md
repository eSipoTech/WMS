# Logistics Platform MVP Architecture

## 1. Architecture Overview (Brief)
The platform follows a **Modular Monolith** architecture. A shared **Core Layer** handles Authentication, RBAC (Admin/Operativo), and Real-time Communication (WebSockets). **Domain Modules** (WMS, CRM, Fleet) extend the core by consuming shared services (Inventory, Tracking). The **API Layer** (Express) provides RESTful endpoints, while **Prisma** ensures type-safe database interactions with PostgreSQL. The **Frontend** (React) is a single-page application using a component-based design with **Zustand** for state management and **Tailwind CSS** for responsive, utility-first styling. This design ensures high reusability, easy scalability, and clear separation of concerns between logistics operations and business logic.

## 2. Project Structure
```
/
├── prisma/
│   └── schema.prisma      # Database models (PostgreSQL)
├── src/
│   ├── components/        # Shared UI components (Dashboard, Chat, etc.)
│   ├── modules/           # Domain-specific logic (WMS, CRM, Fleet)
│   ├── hooks/             # Custom React hooks (useAuth, useInventory)
│   ├── store/             # Global state (Zustand)
│   ├── lib/               # Utilities (axios, socket.io-client)
│   └── App.tsx            # Main Entry & Routing
├── server/
│   ├── routes/            # API Endpoints (Auth, WMS, CRM, Fleet)
│   ├── middleware/        # Auth & Logging Middleware
│   ├── services/          # Business logic (Inventory management)
│   └── socket.ts          # WebSocket handlers (Real-time chat/alerts)
├── server.ts              # Express server entry point
└── .env.example           # Environment variables template
```

## 3. Key APIs (Endpoints)
- `POST /api/auth/login`: User authentication.
- `GET /api/inventory`: List inventory by warehouse/bin.
- `POST /api/wms/receive`: Process inbound orders.
- `POST /api/wms/pick`: Process outbound picking.
- `GET /api/crm/leads`: Manage B2B pipeline.
- `GET /api/fleet/status`: Real-time vehicle tracking.
- `POST /api/chat/send`: Internal communication.

## 4. Running the Project
1. Install dependencies: `npm install`
2. Set up database: `npx prisma db push`
3. Seed data: `npx tsx seed.ts`
4. Start development server: `npm run dev`

## 5. Email Integration Configuration
To enable correct email sending for invoices and notifications, follow these steps:

### SMTP Configuration (Recommended)
Create a `.env` file (or update your environment variables) with the following parameters:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Porteo Billing <billing@porteo.com>"
```
*Note: For Gmail, you must use an "App Password" if 2FA is enabled.*

### Auth/OAuth Integration
If using Microsoft 365 or Google Workspace with OAuth2, ensure you have registered the application in the respective cloud console (Azure/GCP) and provided the `CLIENT_ID` and `CLIENT_SECRET` in the environment configuration.

### Verification
Once configured, the platform will use these credentials to route all outbound communication through your official company domain, ensuring high deliverability and professional branding.

## 6. Communication Integrations

### WhatsApp Integration
The Fleet Tracking module includes a "Contact Driver" feature that utilizes WhatsApp. 
- **Configuration**: Ensure drivers have WhatsApp installed on their mobile devices.
- **Deep Linking**: The system uses `wa.me` links to pre-fill messages with vehicle identification (e.g., Plate Number and Model).
- **Customization**: To change the default message, locate the `Fleet.tsx` component and update the `href` in the "WhatsApp Message" button section.

### Fleet Map Visualization
The tracking module uses a high-performance SVG-based technical map for minimal latency.
- **Scaling**: The map is responsive and includes grid patterns for operational context.
- **Live Updates**: GPS coordinates are simulated for demonstration but can be connected to any standard telematics API via the `useEffect` hooks in `Fleet.tsx`.

## 7. AI Optimization Engine
The "AI Optimization" feature in the Fleet module is an active background process.
- **Functionality**: Analyzes traffic patterns (simulated) and suggests rerouting.
- **Persistence**: Once "Continuous Optimization" is toggled, a visual indicator appears on the technical map, signaling that the AI engine is actively monitoring and correcting routes for maximum fuel efficiency.
