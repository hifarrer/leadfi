# LeadFind Setup Instructions

## Quick Start

1. **Set up your database**:
   - Create a PostgreSQL database
   - Update the `DATABASE_URL` in `.env` file with your database connection string

2. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   - Navigate to `http://localhost:3000`
   - Create an account or sign in
   - Start searching for leads!

## Environment Variables

Make sure your `.env` file contains:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/leadfind?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Database Setup

1. Install PostgreSQL on your system
2. Create a database named `leadfind`
3. Update the `DATABASE_URL` in `.env` with your actual database credentials
4. Run `npm run db:migrate` to create the database tables

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database

## Features

✅ **Complete LeadFind Application** with:
- User authentication (signup/login)
- Advanced search form with multiple criteria
- Real-time lead search using Apify API
- Results display with filtering
- Export to CSV and JSON
- Search history management
- Modern responsive UI
- Database persistence

## Troubleshooting

If you encounter any issues:

1. **Database connection errors**: Check your `DATABASE_URL` in `.env`
2. **Build errors**: Run `npm run db:generate` to regenerate Prisma client
3. **Authentication issues**: Ensure `NEXTAUTH_SECRET` is set in `.env`

## Next Steps

1. Set up your PostgreSQL database
2. Update environment variables
3. Run migrations
4. Start the application
5. Create your first account
6. Start finding leads!

The application is now ready to use! 🚀
