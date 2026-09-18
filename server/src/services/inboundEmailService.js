const { ImapFlow } = require("imapflow");
const { simpleParser } = require("mailparser");
const Lead = require("../models/Lead");
const Activity = require("../models/Activity");
const SyncState = require("../models/SyncState");
const { emitLeadActivityAdded } = require("./socketEvents");

let isSyncing = false;

/**
 * Retrieve or initialize persistent sync state
 */
const getSyncState = async () => {
  let state = await SyncState.findOne({ key: "inbound_email" });
  if (!state) {
    state = await SyncState.create({ key: "inbound_email", processedUids: [] });
  }
  return state;
};

/**
 * Connect to IMAP inbox, fetch unseen messages, match senders against leads,
 * log EMAIL_RECEIVED activities, and update sync state.
 */
const checkInbox = async () => {
  if (isSyncing) {
    console.log("[InboundEmail] Sync already in progress. Skipping overlapping run.");
    return { success: true, message: "Sync already in progress", skipped: true };
  }

  const { IMAP_HOST, IMAP_PORT, IMAP_USER, IMAP_PASS, IMAP_TLS } = process.env;

  if (!IMAP_HOST || !IMAP_USER || !IMAP_PASS) {
    console.warn(
      "[InboundEmail:DEV_MODE] IMAP credentials not configured in environment. Skipping inbox check."
    );
    return {
      success: true,
      message: "IMAP credentials not configured (Dev mode)",
      isMock: true,
      processedCount: 0,
      matchedCount: 0,
    };
  }

  isSyncing = true;
  let client = null;
  let lock = null;
  let processedCount = 0;
  let matchedCount = 0;

  try {
    const state = await getSyncState();

    client = new ImapFlow({
      host: IMAP_HOST,
      port: Number(IMAP_PORT) || 993,
      secure: IMAP_TLS === "true" || Number(IMAP_PORT) === 993,
      auth: {
        user: IMAP_USER,
        pass: IMAP_PASS,
      },
      logger: false,
    });

    await client.connect();
    lock = await client.getMailboxLock("INBOX");

    // Search for unseen messages
    const searchCriteria = { seen: false };
    const messages = await client.search(searchCriteria, { uid: true });

    if (messages && messages.length > 0) {
      const processedSet = new Set(state.processedUids || []);
      const uidsToProcess = messages.filter((uid) => !processedSet.has(String(uid)));

      for (const uid of uidsToProcess) {
        processedCount++;
        try {
          const messageData = await client.fetchOne(uid, { source: true, uid: true });
          if (!messageData || !messageData.source) {
            continue;
          }

          const parsed = await simpleParser(messageData.source);

          // Extract and normalize sender address
          const rawFrom = parsed.from?.value?.[0]?.address || parsed.from?.text || "";
          const fromAddress = rawFrom.trim().toLowerCase();
          const subject = parsed.subject || "(No Subject)";
          const rawBody = parsed.text || parsed.html || "";
          const snippet = rawBody.replace(/\s+/g, " ").trim().slice(0, 200);

          if (!fromAddress) {
            console.warn(`[InboundEmail] Could not extract from address for UID ${uid}. Skipping.`);
            await client.messageFlagsAdd({ uid }, ["\\Seen"]);
            state.processedUids.push(String(uid));
            continue;
          }

          // Case-insensitive exact match for lead by email
          const escapedFrom = fromAddress.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const lead = await Lead.findOne({
            email: { $regex: new RegExp(`^${escapedFrom}$`, "i") },
          });

          if (lead) {
            matchedCount++;
            const activity = await Activity.create({
              leadId: lead._id,
              action: `Email Received: ${subject}`,
              performedBy: null,
              type: "EMAIL_RECEIVED",
              metadata: {
                from: fromAddress,
                snippet,
                messageId: parsed.messageId || null,
                uid: String(uid),
              },
              createdAt: parsed.date || new Date(),
            });

            // Live WebSocket push to active viewers of this lead
            emitLeadActivityAdded(lead._id, activity);

            console.log(
              `[InboundEmail] Logged EMAIL_RECEIVED for lead "${lead.name}" (${lead.email}) from ${fromAddress}`
            );
          } else {
            console.log(
              `[InboundEmail] No matching lead for sender "${fromAddress}" (UID ${uid}). Safely skipped.`
            );
          }

          // Mark message as seen and record processed UID
          await client.messageFlagsAdd({ uid }, ["\\Seen"]);
          state.processedUids.push(String(uid));
        } catch (msgErr) {
          console.error(`[InboundEmail] Error processing message UID ${uid}:`, msgErr.message);
        }
      }
    }

    // Keep processed UIDs array bounded (last 2000 UIDs)
    if (state.processedUids.length > 2000) {
      state.processedUids = state.processedUids.slice(-2000);
    }
    state.lastCheckedAt = new Date();
    await state.save();

    return {
      success: true,
      message: "Inbox checked successfully",
      processedCount,
      matchedCount,
    };
  } catch (error) {
    console.error("[InboundEmail:ERROR] Inbox check failed:", error.message);
    return {
      success: false,
      message: error.message,
      processedCount,
      matchedCount,
    };
  } finally {
    if (lock) {
      try {
        lock.release();
      } catch {
        /* ignore release error */
      }
    }
    if (client) {
      try {
        await client.logout();
      } catch {
        /* ignore logout error */
      }
    }
    isSyncing = false;
  }
};

module.exports = {
  checkInbox,
};
