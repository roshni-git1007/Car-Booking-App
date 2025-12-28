const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 80
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
},{ timestamps: true }
);

// Hide sensitive fields when converting to JSON
userSchema.set("toJSON", {
    transform: function (doc, ret) {
        delete ret.passwordHash;
        return ret;
    },
});

module.exports = mongoose.model("User", userSchema);