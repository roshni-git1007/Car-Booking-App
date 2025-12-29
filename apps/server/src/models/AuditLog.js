const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        // who did it
        actorUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        actorRole: {
            type: String,
            default: "anonymous"
        },

        // what happened
        action: {
            type: String,
            required: true
        }, // e.g. BOOKING_CREATED, PAYMENT_SUCCEEDED
        entityType: {
            type: String,
            default: null
        }, // e.g. Booking, Car, User
        entityId: {
            type: String,
            default: null
        },   // store as string for flexibility

        // extra info (safe metadata)
        message: {
            type: String,
            default: ""
        },
        metadata: {
            type: Object,
            default: {}
        },

        // request context
        ip: {
            type: String,
            default: ""
        },
        userAgent: {
            type: String,
            default: ""
        },
        requestId: {
            type: String,
            default: ""
        },
    },
    { timestamps: true }
);

auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ actorUser: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
