const express = require("express");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { listAuditLogs } = require("../controllers/auditLogController");

const router = express.Router();

// Admin-only
router.get("/", requireAuth, requireRole("admin"), listAuditLogs);

module.exports = router;