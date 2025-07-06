# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Common Commands
- `docker compose up -d` - Start application with Docker Compose
- `docker compose down -v` - Stop and remove containers with volumes (database reset)
- `docker compose up -d --force-recreate` - Force recreate containers and volumes
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests

### IMPORTANT: Development Environment
- **ALWAYS use Docker Compose for development** - `docker compose up -d`
- **DO NOT use local npm commands** (`npm run dev`, `npm run build`, `npm run start`)
- This project is configured to run exclusively in Docker containers
- Local development setup is NOT supported and should be avoided

### Git Workflow (CRITICAL)
- **作業開始前の必須手順**:
  1. `git checkout main` - mainブランチに切り替え
  2. `git pull origin main` - 最新のmainブランチを取得
  3. `git checkout -b feature/your-feature-name` - 新しいブランチを作成
- **絶対に既存ブランチで作業しない** - 常に最新のmainから新しいブランチを切る
- **PRマージ後は必ず新しいブランチで次の作業を開始する**

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
- **Todo**: id, title, description, completed, user relation (optional), labels (relation), timestamps
- **Label**: id, name, color, todos (relation), timestamps
- **TodoLabel**: Many-to-many relation between Todo and Label

### Key Files
- `app/types/todo.ts` - Todo and Label TypeScript interfaces
- `app/components/LabelBadge.tsx` - Color-coded label display component
- `app/components/LabelSelector.tsx` - Multi-select label picker component
- `app/lib/prisma.ts` - Prisma client configuration
- `prisma/schema.prisma` - Database schema definition
- `jest.config.js` - Jest testing configuration

### API Endpoints
- `GET /api/todos` - Fetch all todos with labels (ordered by creation date desc)
- `POST /api/todos` - Create new todo with label assignment
- `GET /api/todos/[id]` - Get specific todo with labels
- `PUT /api/todos/[id]` - Update todo with label reassignment
- `GET /api/labels` - Fetch all available labels
- Additional CRUD operations in respective route files

### Testing
- Jest configured with TypeScript support
- Test files: `**/*.test.ts` and `**/*.test.tsx`
- Path mapping: `@/*` resolves to project root

### Label System
- **Color-coded Labels**: 6 predefined labels with distinct colors (red, orange, blue, purple, green, gray)
- **Multi-label Support**: Each Todo can have multiple labels
- **Predefined Labels**: 緊急 (red), 重要 (orange), 進行中 (blue), レビュー (purple), 完了予定 (green), 参考 (gray)
- **Visual Display**: Color-coded badges in todo lists and detail views
- **Label Management**: Checkbox-based multi-select interface in forms

### Development Notes
- Uses PostgreSQL as primary database
- Prisma manages database schema and migrations
- Global Prisma client with test environment handling
- Next.js App Router architecture
- TypeScript strict mode enabled
- Path aliases configured (`@/*` → `./`)
- Label system with many-to-many relationship between Todos and Labels

### Testing Requirements
- 実装完了後は必ず TEST.md に従って MCP tools でテストを実行すること
- MCP Playwright を使用してE2Eテストを実行
- パスワードハッシュ化機能の動作確認を含む完全なログインフローテスト
- 詳細なテスト手順は TEST.md を参照

### Language Support
- Primary language: Japanese (comments and error messages in Japanese)
- UI and documentation in Japanese
