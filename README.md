# Amamenta Palmas

Amamenta Palmas is a multi-tenant management system for a human milk bank. It supports the operational flow from donor registration and home visits through raw-milk collection, pasteurization, stock control, and distribution.

## Main features

- Donor registration, clinical history, exams, and document export
- Visit scheduling and tracking
- Raw-milk collection, screening, storage, and approval
- Pasteurization batches, microbiological approval, and pasteurized-milk inventory
- Milk distribution records and operational dashboards
- Tenant, employee, invitation, and user management
- Email verification, password recovery, JWT authentication, and Portuguese/English localization

## Project structure

| Directory | Description |
| --- | --- |
| `amamenta-api` | Fastify REST API, PostgreSQL schema, Drizzle migrations, and tests. |
| `amamenta-ui` | React/Vite web application. |
| `docs` | Development notes and project documentation. |

## Tech stack

- **API:** Node.js, TypeScript, Fastify, Zod, Drizzle ORM, PostgreSQL, JWT
- **Web app:** React, TypeScript, Vite, React Router, Axios, GOV.BR Design System

## Getting started

### Prerequisites

- Node.js 20 or later
- pnpm 10 or later (API)
- npm (web application)
- PostgreSQL database

### 1. Start the API

```bash
cd amamenta-api
Copy-Item example.env .env
# Fill in the required values in .env
pnpm install
pnpm db:migrate
pnpm dev
```

The API runs on `http://localhost:3333` by default. Interactive API documentation is available at `http://localhost:3333/docs`.

### 2. Start the web application

```bash
cd amamenta-ui
npm install
$env:VITE_API_URL = "http://localhost:3333"
npm run dev
```

For a persistent local configuration, create `amamenta-ui/.env` with:

```env
VITE_API_URL=http://localhost:3333
```

## Useful commands

### API (`amamenta-api`)

```bash
pnpm dev          # Run the API in watch mode
pnpm test         # Run tests
pnpm db:generate  # Generate a Drizzle migration
pnpm db:migrate   # Apply migrations
pnpm seed         # Seed the database
```

### Web app (`amamenta-ui`)

```bash
npm run dev       # Start the development server
npm run build     # Type-check and create a production build
npm run lint      # Run ESLint
```

## Environment variables

The API environment template is available at [`amamenta-api/example.env`](amamenta-api/example.env). Configure database access, JWT settings, application URLs, email delivery, and the initial super-admin credentials before running the API.

## Security

Review [`security.md`](security.md) before deploying. It documents the current authentication and authorization status as well as recommended security work.
