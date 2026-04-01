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
