import connectDB from './config/db.js';
import Log from './models/log.model.js';

/**
 * Simple script to check what logs exist in the database
 */
async function checkLogs() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await connectDB();
        console.log('✅ Connected!\n');

        // Count total logs
        const totalLogs = await Log.countDocuments();
        console.log(`📊 Total logs in database: ${totalLogs}\n`);

        if (totalLogs === 0) {
            console.log('❌ No logs found in database!');
            console.log('\n💡 To create logs:');
            console.log('   1. Run: node test-login-logging.js');
            console.log('   2. Or login to the CMS');
            console.log('   3. Or perform any action (create package, etc.)');
        } else {
            console.log('✅ Logs found! Here are the most recent:\n');

            const logs = await Log.find()
                .sort({ timestamp: -1 })
                .limit(10);

            logs.forEach((log, index) => {
                console.log(`${index + 1}. ${log.action}`);
                console.log(`   User: ${log.username} (${log.role})`);
                console.log(`   Time: ${log.timestamp.toLocaleString()}`);
                console.log(`   Details: ${JSON.stringify(log.details)}`);
                console.log('');
            });

            // Show action breakdown
            const actionStats = await Log.aggregate([
                { $group: { _id: "$action", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);

            console.log('📈 Action Breakdown:');
            actionStats.forEach(stat => {
                console.log(`   ${stat._id}: ${stat.count}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkLogs();
