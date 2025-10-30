# Database Setup Guide for LeadFind

## The Error You're Seeing

The error `Can't reach database server at localhost:5432` means PostgreSQL is not running or not properly configured.

## Option 1: Install PostgreSQL Locally (Recommended)

### Windows:
1. **Download PostgreSQL**:
   - Go to https://www.postgresql.org/download/windows/
   - Download the installer for your Windows version

2. **Install PostgreSQL**:
   - Run the installer
   - Remember the password you set for the `postgres` user
   - Keep the default port (5432)

3. **Create Database**:
   - Open pgAdmin (installed with PostgreSQL)
   - Or use command line:
   ```bash
   # Open Command Prompt as Administrator
   psql -U postgres
   # Enter your password when prompted
   CREATE DATABASE leadfind;
   \q
   ```

4. **Update .env file**:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/leadfind?schema=public"
   NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   ```

### macOS:
```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
createdb leadfind
```

### Linux (Ubuntu/Debian):
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb leadfind
```

## Option 2: Use Docker (Alternative)

If you have Docker installed:

1. **Create docker-compose.yml**:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: leadfind
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

2. **Start PostgreSQL**:
```bash
docker-compose up -d
```

3. **Update .env**:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/leadfind?schema=public"
```

## Option 3: Use a Cloud Database (Production Ready)

### Free Options:
- **Supabase**: https://supabase.com (Free tier available)
- **Railway**: https://railway.app (Free tier available)
- **Neon**: https://neon.tech (Free tier available)

### Setup with Supabase (Recommended for free):
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Update your `.env` file with the connection string

## After Setting Up Database

1. **Run migrations**:
```bash
npm run db:migrate
```

2. **Start the application**:
```bash
npm run dev
```

## Verify Database Connection

You can test if your database is working by running:

```bash
npx prisma studio
```

This will open a web interface where you can see your database tables.

## Troubleshooting

### Common Issues:

1. **Port 5432 already in use**:
   - Change the port in your PostgreSQL config
   - Or stop the service using that port

2. **Authentication failed**:
   - Check your username and password in the DATABASE_URL
   - Make sure the user has permission to create databases

3. **Database doesn't exist**:
   - Create the database manually first
   - Or let Prisma create it (if user has CREATE DATABASE permission)

### Check if PostgreSQL is running:

**Windows**:
```bash
# Check if PostgreSQL service is running
sc query postgresql
```

**macOS/Linux**:
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432
```

## Quick Test

Once you have PostgreSQL running and the database created, test the connection:

```bash
# This should work without errors
npx prisma db push
```

If this works, your database is properly configured!
