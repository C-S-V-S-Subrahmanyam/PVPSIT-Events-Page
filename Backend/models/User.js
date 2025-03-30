import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["student", "faculty"], // No separate HOD role, just faculty
        required: true,
        default: "student",
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    isFacultyVerified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    
    canAddEvent: {
        type: Boolean,
        default: false,
    },    

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,

}, { timestamps: true });

export const UserModel = mongoose.model('User', userSchema);