const AuditLog = require("../models/AuditLog");

async function writeAuditLog({
  req,
  action,
  entityType = null,
  entityId = null,
  message = "",
  metadata = {},
}) {
  try {
    const actorUser = req?.user?.id || null;
    const actorRole = req?.user?.role || "anonymous";

    await AuditLog.create({
      actorUser,
      actorRole,
      action,
      entityType,
      entityId: entityId ? String(entityId) : null,
      message,
      metadata,
      ip: req?.clientIp || "",
      userAgent: req?.userAgent || "",
      requestId: req?.requestId || "",
    });
  } catch (err) {
    // Never break API because logging failed
    console.error("Audit log write failed:", err.message);
  }
}

module.exports = { writeAuditLog };
