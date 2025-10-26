/**
 * Script to mark some solutions as premium
 * This demonstrates the premium feature for AstralAI
 */

const mongoose = require('mongoose');
const Solution = require('../models/Solution');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-solutions-hub');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Mark solutions as premium
const markPremiumSolutions = async () => {
  try {
    // Get some solutions to mark as premium
    const solutions = await Solution.find({ status: 'approved' }).limit(3);
    
    if (solutions.length === 0) {
      console.log('❌ No approved solutions found to mark as premium');
      return;
    }

    // Mark the first 3 solutions as premium
    const solutionIds = solutions.map(sol => sol._id);
    
    const result = await Solution.updateMany(
      { _id: { $in: solutionIds } },
      { $set: { isPremium: true } }
    );

    console.log(`✅ Marked ${result.modifiedCount} solutions as premium:`);
    
    // Display the premium solutions
    const premiumSolutions = await Solution.find({ _id: { $in: solutionIds } })
      .populate('companyId', 'name')
      .select('title companyId isPremium');
    
    premiumSolutions.forEach(solution => {
      console.log(`  - ${solution.title} (${solution.companyId?.name || 'Unknown Company'})`);
    });

  } catch (error) {
    console.error('❌ Error marking solutions as premium:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await markPremiumSolutions();
  await mongoose.connection.close();
  console.log('✅ Premium solutions marked successfully');
  process.exit(0);
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = { markPremiumSolutions };
