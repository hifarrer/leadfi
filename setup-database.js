const { PrismaClient } = require('./src/generated/client');

async function setupDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test the connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Check if tables exist
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in database`);
    
    console.log('🎉 Database is ready to use!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    console.log('\n📖 Please check DATABASE_SETUP.md for setup instructions');
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
