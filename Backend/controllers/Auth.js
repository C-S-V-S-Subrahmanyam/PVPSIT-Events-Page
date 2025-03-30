import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserModel } from "../models/User.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../middlewares/Email.js";
import { generateTokenAndSetCookies } from "../middlewares/GenerateToken.js";

dotenv.config(); // Load environment variables

/**
 * @desc Register User
 * @route POST /api/auth/register
 */
const Register = async (req, res) => {
    try {
        const { email, password, name, role, isHOD } = req.body;
        if (!email || !password || !name || !role) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User Already Exists. Please Login" });
        }

        // Hash the password before storing
        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new UserModel({
            email,
            password: hashedPassword,
            name,
            role, // Store role in DB
            isHOD: isHOD || false, // Default to false if not provided
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // Token expires in 24 hours
        });

        await user.save();

        generateTokenAndSetCookies(res, user._id);

        // Send verification email
        await sendVerificationEmail(user.email, verificationToken);

        return res.status(201).json({ success: true, message: "User Registered Successfully. Please verify your email.", user });

    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @desc Verify Email
 * @route POST /api/auth/verifyEmail
 */
const VerifyEmail = async (req, res) => {
    try {
        const { code } = req.body;
        const user = await UserModel.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or Expired Code" });
        }

        // Mark user as verified
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();
        await sendWelcomeEmail(user.email, user.name);

        return res.status(200).json({ success: true, message: "Email Verified Successfully" });

    } catch (error) {
        console.error("Email Verification Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @desc Sign in User (Supports both email & username login)
 * @route POST /api/auth/signin
 */
const Signin = async (req, res) => {
    try {
        const { identifier, password } = req.body; // Accepts either email or username

        // Check if user exists by email or username
        const user = await UserModel.findOne({
            $or: [{ email: identifier }, { name: identifier }] // Search by email or username
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // Compare password
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Generate JWT token and store it in cookies automatically
        const token = generateTokenAndSetCookies(res, user._id);

        return res.status(200).json({
            success: true,
            message: "Signin successful",
            email: user.email,
            role: user.role, // Send role to frontend
            name: user.name, // Send name to frontend
            isHOD: user.isHOD, // Include HOD status
            token // Include token in response
        });

    } catch (error) {
        console.error("Signin Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @desc Logout User
 * @route POST /api/auth/logout
 */
const Logout = (req, res) => {
    res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
    return res.status(200).json({ success: true, message: "User logged out successfully" });
};

/**
 * @desc Get Authenticated User
 * @route GET /api/auth/user
 * @access Private
 */
const getUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({
            success: true,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            isFacultyVerified: user.isFacultyVerified,
            verifiedBy: user.verifiedBy,
            canAddEvent: user.canAddEvent  // ✅ Ensure this is included
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @desc Verify a student as a faculty
 * @route PUT /api/auth/verify-student/:id
 * @access Faculty Only
 */
const verifyStudent = async (req, res) => {
    try {
        const facultyId = req.userId; // Extract faculty ID from authenticated user
        const { id } = req.params; // Student ID from request

        const faculty = await UserModel.findById(facultyId);
        if (!faculty || faculty.role !== "faculty") {
            return res.status(403).json({ success: false, message: "Only faculty can verify students" });
        }

        const student = await UserModel.findById(id);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        student.isFacultyVerified = true;
        student.verifiedBy = facultyId; // Store faculty ID in student record
        student.canAddEvent = true; // Grant event-adding permission
        await student.save();

        return res.status(200).json({ success: true, message: "Student verified successfully" });
    } catch (error) {
        console.error("Verification Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getStudents = async (req, res) => {
    try {
        const facultyId = req.userId; // Get faculty ID from authenticated request
        const faculty = await UserModel.findById(facultyId);

        if (!faculty || faculty.role !== "faculty") {
            return res.status(403).json({ success: false, message: "Only faculty can view students" });
        }

        const students = await UserModel.find({ role: "student", isFacultyVerified: true })
            .populate("verifiedBy", "name email") // ✅ Populate verifiedBy with faculty name and email
            .select("-password"); // Exclude passwords for security

        return res.status(200).json({ success: true, students });
    } catch (error) {
        console.error("Error fetching students:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @desc Unverify a student as a faculty
 * @route PUT /api/auth/unverify-student/:id
 * @access Faculty Only
 */
const unverifyStudent = async (req, res) => {
    try {
        const facultyId = req.userId; // Extract faculty ID from authenticated user
        const { id } = req.params; // Student ID from request

        const faculty = await UserModel.findById(facultyId);
        if (!faculty || faculty.role !== "faculty") {
            return res.status(403).json({ success: false, message: "Only faculty can unverify students" });
        }

        const student = await UserModel.findById(id);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Revoke verification
        student.isFacultyVerified = false;
        student.verifiedBy = null; // Remove faculty reference
        student.canAddEvent = false; // Remove event-adding permission
        await student.save();

        return res.status(200).json({ success: true, message: "Student unverified successfully" });
    } catch (error) {
        console.error("Unverification Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getStudentByEmail = async (req, res) => {
    try {
        const { email } = req.params; // Extract email from request params
        const student = await UserModel.findOne({ email, role: "student" });

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        return res.status(200).json({ success: true, student });
    } catch (error) {
        console.error("Error fetching student by email:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getStudentByIdentifier = async (req, res) => {
    try {
        const { identifier } = req.params; // Extract identifier from request params

        // Search for student by either email or name
        const student = await UserModel.findOne({
            role: "student",
            $or: [{ email: identifier }, { name: identifier }]
        });

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        return res.status(200).json({ success: true, student });
    } catch (error) {
        console.error("Error fetching student by identifier:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export { Register, VerifyEmail, Signin, Logout, getUser, verifyStudent, getStudents, unverifyStudent, getStudentByEmail, getStudentByIdentifier };