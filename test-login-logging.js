import connectDB from './config/db.js';
import User from './models/user.model.js';
import Log from './models/log.model.js';
import bcrypt from 'bcryptjs';
import { logAction } from './utils/logger.js';

/**
 * Test script to verify login logging works
 */
async function testLoginLogging() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await connectDB();
        console.log('✅ Connected to MongoDB\n');

        // Check if test user exists
        let testUser = await User.findOne({ email: 'admin@test.com' });

        if (!testUser) {
            console.log('👤 Creating test admin user...');
            const hashedPassword = await bcrypt.hash('password123', 12);
            testUser = await User.create({
                email: 'admin@test.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('✅ Test user created: admin@test.com / password123\n');
        } else {
            console.log('✅ Test user already exists: admin@test.com\n');
        }

        // Count logs before
        const logsBefore = await Log.countDocuments();
        console.log(`📊 Logs in database before test: ${logsBefore}`);

        // Simulate a login by creating a log
        console.log('\n🔐 Simulating login...');
        const userForLogging = {
            sub: testUser._id,
            role: testUser.role,
            email: testUser.email,
            username: testUser.email
        };

        await logAction(userForLogging, "USER_LOGIN", {
            userId: testUser._id,
            email: testUser.email,
            role: testUser.role,
            timestamp: new Date()
        });

        // Count logs after
        const logsAfter = await Log.countDocuments();
        console.log(`📊 Logs in database after test: ${logsAfter}`);

        if (logsAfter > logsBefore) {
            console.log('\n✅ SUCCESS! Login log was created!');

            // Show the log
            const latestLog = await Log.findOne().sort({ timestamp: -1 });
            console.log('\n📝 Latest log entry:');
            console.log('   Action:', latestLog.action);
            console.log('   User:', latestLog.username);
            console.log('   Role:', latestLog.role);
            console.log('   Time:', latestLog.timestamp);
            console.log('   Details:', JSON.stringify(latestLog.details, null, 2));
        } else {
            console.log('\n❌ FAILED! No log was created.');
            console.log('   This might be because the user role is not admin/superadmin');
        }

        // Show all logs
        const allLogs = await Log.find().sort({ timestamp: -1 }).limit(5);
        console.log(`\n📋 Recent logs (showing ${allLogs.length}):`);
        allLogs.forEach((log, index) => {
            console.log(`   ${index + 1}. ${log.action} by ${log.username} at ${log.timestamp.toLocaleString()}`);
        });

        console.log('\n✨ Test completed!');
        console.log('\n💡 You can now:');
        console.log('   1. Login to CMS with: admin@test.com / password123');
        console.log('   2. Check User Logs section in the CMS');
        console.log('   3. You should see the USER_LOGIN log entry');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testLoginLogging();
