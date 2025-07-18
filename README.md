# monorepo-chat

### base commands

install: `pnpm i`
dev: `pnpm dev`
build: `pnpm build`

### db
```bash
cd packages/backend
npx prisma migrate dev --name <name>
npx prisma generate
```