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
 * @param {boolean} testMode - If true, runs every 1 minute for testing with testMode flag.
 */
const startCronJobs = (testMode = false) => {
  // Process completed investments every 1 minute
  // Needs to be frequent to handle minute-based and hourly durations
  setInterval(async () => {
    try {
      await processCompletedInvestments();
    } catch (error) {
      console.error("Error in processCompletedInvestments cron:", error);
    }
  }, 60 * 1000); // Every 1 minute

  if (testMode) {
    // TEST MODE: Run profit distribution every 1 minute with testMode flag
    console.log("=".repeat(60));
    console.log("TEST MODE ENABLED: Profit distribution every 1 MINUTE");
    console.log("WARNING: This is for TESTING purposes only!");
    console.log("=".repeat(60));

    // Run IMMEDIATELY on startup (after 3 seconds)
    setTimeout(async () => {
      console.log("\n[TEST MODE] Running profit distribution (Initial run)...");
      const result = await processDailyProfits(true);
      console.log(`Initial distribution complete: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped\n`);
    }, 3000);

    // Then run every 1 minute
    setInterval(async () => {
      try {
        const result = await processDailyProfits(true);
        if (result.successful > 0 || result.failed > 0) {
          console.log(`[TEST MODE] Distribution: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped`);
        }
      } catch (error) {
        console.error("[TEST MODE] Profit distribution error:", error);
      }
    }, 60 * 1000); // Every 1 minute

    console.log("Cron jobs started - Profit distribution every 1 minute (test mode)");
    console.log("=".repeat(60) + "\n");
  } else {
    // PRODUCTION MODE: Run profit distribution every 1 minute
    // Must be frequent to support hourly ROI and minute-based durations
    // The distributeAllProfits service checks nextProfitDate so only due investments are processed

    // Run immediately on startup (after 5 seconds)
    setTimeout(async () => {
      console.log("Running profit distribution (Initial run)...");
      try {
        const result = await processDailyProfits();
        console.log(`Initial distribution complete: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped`);
      } catch (error) {
        console.error("Initial profit distribution error:", error);
      }
    }, 5000);

    // Then run every 1 minute
    setInterval(async () => {
      try {
        const result = await processDailyProfits();
        if (result.successful > 0 || result.failed > 0) {
          console.log(`Profit distribution: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped`);
        }
      } catch (error) {
        console.error("Profit distribution error:", error);
      }
    }, 60 * 1000); // Every 1 minute

    console.log("Cron jobs started - Profit distribution every 1 minute, completed investments check every 1 minute");
  }
};

module.exports = {
  processCompletedInvestments,
  processDailyProfits,
  startCronJobs,
};
