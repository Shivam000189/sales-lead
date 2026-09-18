const cron = require("node-cron");
const { checkInbox } = require("../services/inboundEmailService");

/**
 * Initializes the background cron job for inbound email synchronization.
 * Defaults to running every 5 minutes.
 */
const startInboundEmailJob = () => {
  // Cron schedule: Every 5 minutes ("*/5 * * * *")
  const cronSchedule = process.env.INBOUND_EMAIL_CRON || "*/5 * * * *";

  cron.schedule(cronSchedule, async () => {
    try {
      console.log("[InboundEmailJob] Running scheduled inbox sync...");
      const result = await checkInbox();
      console.log(
        `[InboundEmailJob] Sync finished: processed=${result.processedCount || 0}, matched=${result.matchedCount || 0}`
      );
    } catch (error) {
      console.error("[InboundEmailJob:ERROR] Scheduled sync failed:", error.message);
    }
  });

  console.log(`[InboundEmailJob] Background sync job scheduled (${cronSchedule})`);
};

module.exports = {
  startInboundEmailJob,
};
