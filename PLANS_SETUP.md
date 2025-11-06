# Plans Management Setup

## Database Migration

After adding the Plan model to the Prisma schema, you need to run a migration:

```bash
npx prisma migrate dev --name add_plans
```

This will:
- Create the `Plan` table in your database
- Generate the Prisma client with the new Plan model

## Seed Initial Plans

To populate the database with the initial plans (Free, Basic, Ultra), run:

```bash
node scripts/seed-plans.js
```

This will create three plans:
- **Free**: $0/month, $0/year
- **Basic**: $15/month, $150/year (marked as Popular)
- **Ultra**: $25/month, $250/year

## Admin Plans Management

Once the migration and seed are complete:

1. Login as admin (with email matching `ADMIN_EMAIL` environment variable)
2. Navigate to `/admin` dashboard
3. Click "Manage Plans" button
4. You can now:
   - View all plans
   - Create new plans
   - Edit existing plans (name, prices, features, popular badge, display order)
   - Delete plans

## Features

- Plans are stored in the database with:
  - Monthly and yearly prices
  - Features as JSON array (easily add/remove)
  - Popular badge option
  - Display order for sorting
- The `/pricing` page automatically fetches and displays plans from the database
- Admin can manage all aspects of plans without code changes

## API Endpoints

### Public
- `GET /api/plans` - Get all plans (ordered by displayOrder)

### Admin Only
- `GET /api/admin/plans` - List all plans
- `POST /api/admin/plans` - Create new plan
- `GET /api/admin/plans/[id]` - Get specific plan
- `PUT /api/admin/plans/[id]` - Update plan
- `DELETE /api/admin/plans/[id]` - Delete plan

