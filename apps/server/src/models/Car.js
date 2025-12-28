const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
    {
        // Example: "Toyota"
        brand: { 
            type: String, 
            required: true, 
            trim: true, 
            maxlength: 60 
        },
        // Example: "Camry"
        model: { 
            type: String, 
            required: true, 
            trim: true, 
            maxlength: 60 
        },
        // Example: 2022
        year: { 
            type: Number, 
            required: true, 
            min: 1990, 
            max: 2050 
        },
        // Example: "Sedan", "SUV"
        category: { 
            type: String, 
            required: true, 
            trim: true, 
            maxlength: 40 
        },
        // Price per day in USD (we keep it integer-friendly)
        // Example: 75
        pricePerDay: { type: Number, required: true, min: 1 },

        // Example: "Automatic"
        transmission: { type: String, required: true, trim: true, maxlength: 20 },

        // Example: "Petrol", "Diesel", "Electric"
        fuelType: { type: String, required: true, trim: true, maxlength: 20 },

        // Example: 5 seats
        seats: { type: Number, required: true, min: 1, max: 12 },

        // If car is temporarily unavailable
        isActive: { type: Boolean, default: true },

        // Optional: a main image URL (later we can add uploads)
        imageUrl: { type: String, default: "" },
    },
    { timestamps: true }
);

// Helpful index for common search/filter usage
carSchema.index({ brand: 1, model: 1, category: 1, pricePerDay: 1, isActive: 1 });

module.exports = mongoose.model("Car", carSchema);
