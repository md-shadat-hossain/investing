const { Investment, InvestmentPlan } = require("../models");
const walletService = require("./wallet.service");
const notificationService = require("./notification.service");
const profitDistributionService = require("./profitDistribution.service");

/**
 * Process completed investments
 * This should be run periodically (e.g., every hour)
 */
const processCompletedInvestments = async () => {
  try {
    const now = new Date();
    const completedInvestments = await Investment.find({
      status: "active",
      endDate: { $lte: now },
    }).populate("plan user");

    let processedCount = 0;

    for (const investment of completedInvestments) {
      try {
        // Calculate total return (principal + profit)
        const totalReturn = investment.amount + investment.expectedProfit;

        // Add to user's wallet
        await walletService.addProfit(investment.user._id, totalReturn);

        // Update investment status
        investment.status = "completed";
        investment.earnedProfit = investment.expectedProfit;
        await investment.save();

        // Send notification to user
        await notificationService.sendToUser(
          investment.user._id,
          notificationService.templates.investmentCompleted(
            investment.plan.name,
            investment.expectedProfit
          ).title,
          notificationService.templates.investmentCompleted(
            investment.plan.name,
            investment.expectedProfit
          ).content,
          "investment"
        );

        processedCount++;
        console.log(`Processed investment ${investment._id} for user ${investment.user.email}`);
      } catch (error) {
        console.error(`Error processing investment ${investment._id}:`, error);
      }
    }

    if (processedCount > 0) {
      console.log(`Processed ${processedCount} completed investments`);
    }

    return processedCount;
  } catch (error) {
    console.error("Error in processCompletedInvestments:", error);
    throw error;
  }
};

/**
 * Process daily profits for active investments
 * This distributes daily ROI to users (uses new profit distribution service with admin controls)
 * @param {boolean} testMode - If true, runs in test mode (1 minute intervals)
 */
const processDailyProfits = async (testMode = false) => {
  try {
    console.log("Starting profit distribution...");

    // Use the new profit distribution service which handles:
    // - Admin adjustments
    // - Paused investments
    // - Profit rate customization
    // - Proper tracking and logging
    const results = await profitDistributionService.distributeAllProfits(testMode);

    console.log(`Profit distribution complete:`);
    console.log(`- Total investments processed: ${results.total}`);
    console.log(`- Successful: ${results.successful}`);
    console.log(`- Failed: ${results.failed}`);
    console.log(`- Skipped: ${results.skipped}`);

    return results;
  } catch (error) {
    console.error("Error in processDailyProfits:", error);
    throw error;
  }
};

/**
 * Start cron jobs
 * @param {boolean} testMode - If true, runs every 1 minute for testing. If false, runs daily at midnight.
 */
const startCronJobs = (testMode = false) => {
  // Process completed investments every hour
  setInterval(async () => {
    console.log("Running: Process completed investments");
    await processCompletedInvestments();
  }, 60 * 60 * 1000); // Every hour

  if (testMode) {
    // TEST MODE: Run profit distribution every 1 minute
    console.log("=".repeat(60));
    console.log("🧪 TEST MODE ENABLED: Profit distribution every 1 MINUTE");
    console.log("⚠️  This is for TESTING purposes only!");
    console.log("=".repeat(60));

    // Run IMMEDIATELY on startup (after 3 seconds)
    setTimeout(async () => {
      console.log("\n⏰ [TEST MODE] Running profit distribution (Initial run)...");
      const result = await processDailyProfits(true); // Pass testMode = true
      console.log(`✅ Initial distribution complete: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped\n`);
    }, 3000); // Wait 3 seconds after startup

    // Then run every 1 minute
    setInterval(async () => {
      console.log("\n⏰ [TEST MODE] Running profit distribution (Every 1 minute)...");
      const result = await processDailyProfits(true); // Pass testMode = true
      console.log(`✅ Distribution complete: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped\n`);
    }, 60 * 1000); // Every 1 minute

    console.log("✅ Cron jobs started - Next profit distribution in 3 seconds, then every 1 minute");
    console.log("=".repeat(60) + "\n");
  } else {
    // PRODUCTION MODE: Process profits every 8 hours
    const EIGHT_HOURS = 8 * 60 * 60 * 1000;

    // Run immediately on startup (after 5 seconds)
    setTimeout(async () => {
      console.log("⏰ Running profit distribution (Initial run)...");
      const result = await processDailyProfits();
      console.log(`✅ Initial distribution complete: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped`);
    }, 5000);

    // Then run every 8 hours
    setInterval(async () => {
      console.log("⏰ Running profit distribution (Every 8 hours)...");
      const result = await processDailyProfits();
      console.log(`✅ Distribution complete: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped`);
    }, EIGHT_HOURS);

    console.log(`✅ Cron jobs started - Profit distribution every 8 hours`);
  }
};

module.exports = {
  processCompletedInvestments,
  processDailyProfits,
  startCronJobs,
};
