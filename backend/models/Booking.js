import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    packageId: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    wedding_type:
        {
            type: String,
            required: false
        },
    price: {
        type: Number,
        required: false
    },
    preview_image:
        { type: String
        },
    features:
        { type: [String],
            required: false
        },
    phoneNumber: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    bookedAt:
        { type: Date,
            default: Date.now
        },
});

export default mongoose.model("Booking", BookingSchema);
