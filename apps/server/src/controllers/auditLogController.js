const { z } = require("zod");
const AuditLog = require("../models/AuditLog");

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  action: z.string().optional(),
  actorUser: z.string().optional(), // user id
  entityType: z.string().optional(),
  entityId: z.string().optional(),
});

async function listAuditLogs(req, res, next) {
  try {
    const { page, limit, action, actorUser, entityType, entityId } = querySchema.parse(req.query);

    const filter = {};
    if (action) filter.action = action;
    if (actorUser) filter.actorUser = actorUser;
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = entityId;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("actorUser", "name email role"),
      AuditLog.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({ items, page, limit, total, totalPages });
  } catch (err) {
    next(err);
  }
}

module.exports = { listAuditLogs };
