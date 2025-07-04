# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Common Commands
- `docker compose up -d` - Start application with Docker Compose
- `npm run dev` - Start development server (requires local setup)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests

### Database Commands
- `npm run db:migrate` - Deploy database migrations (production)
- `npm run db:migrate:dev` - Run migrations in development mode
- `npm run db:studio` - Open Prisma Studio for database inspection

### Additional Scripts
- `./scripts/migrate-dev.sh` - Development migration script
- `./scripts/migrate.sh` - Production migration script

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 with TypeScript, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Jest with TypeScript support
- **Containerization**: Docker with Docker Compose

### Project Structure
```
app/
├── api/todos/           # Todo API endpoints
├── components/          # React components
├── lib/                 # Utility libraries (Prisma client)
├── todos/[id]/         # Dynamic todo detail pages
├── types/              # TypeScript type definitions
├── globals.css         # Global styles
├── layout.tsx          # Root layout
└── page.tsx            # Home page

prisma/
├── schema.prisma       # Database schema
└── migrations/         # Database migrations
```

### Database Schema
- **User**: id, email, name, todos (relation), timestamps
- **Todo**: id, title, description, completed, user relation (optional), timestamps

### Key Files
- `app/types/todo.ts` - Todo TypeScript interface
- `app/lib/prisma.ts` - Prisma client configuration
- `prisma/schema.prisma` - Database schema definition
- `jest.config.js` - Jest testing configuration

### API Endpoints
- `GET /api/todos` - Fetch all todos (ordered by creation date desc)
- `POST /api/todos` - Create new todo
- `GET /api/todos/[id]` - Get specific todo
- Additional CRUD operations in respective route files

### Testing
- Jest configured with TypeScript support
- Test files: `**/*.test.ts` and `**/*.test.tsx`
- Path mapping: `@/*` resolves to project root

### Development Notes
- Uses PostgreSQL as primary database
- Prisma manages database schema and migrations
- Global Prisma client with test environment handling
- Next.js App Router architecture
- TypeScript strict mode enabled
- Path aliases configured (`@/*` → `./`)

### Language Support
- Primary language: Japanese (comments and error messages in Japanese)
- UI and documentation in Japanese