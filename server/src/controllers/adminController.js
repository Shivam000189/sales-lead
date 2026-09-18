const { checkInbox } = require("../services/inboundEmailService");

const syncInbox = async (req, res) => {
  try {
    const result = await checkInbox();

    if (!result.success && !result.isMock) {
      return res.status(502).json({
        success: false,
        message: `IMAP sync failed: ${result.message}`,
      });
    }

    res.json({
      success: true,
      message: result.message || "Inbox check completed",
      data: {
        processedCount: result.processedCount || 0,
        matchedCount: result.matchedCount || 0,
        isMock: result.isMock || false,
        skipped: result.skipped || false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  syncInbox,
};
