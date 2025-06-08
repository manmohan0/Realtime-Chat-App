"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccount = exports.verifyOtp = exports.generateOtp = void 0;
const zod_1 = require("zod");
const redis_1 = require("../config/redis");
const auth_1 = require("../models/auth");
const mongo_1 = require("../config/mongo");
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const generateOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
    }
    const userObject = zod_1.z.object({
        email: zod_1.z.string().email()
    });
    const parsedData = userObject.safeParse({ email });
    if (!parsedData.success) {
        res.json({ success: false, reason: "Invalid email" });
        return;
    }
    const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    const redisClient = yield (0, redis_1.connectRedis)();
    if (!redisClient) {
        res.json({ success: false, reason: "Internal server error" });
        return;
    }
    try {
        yield redisClient.set(`otp:${email}`, OTP, { 'EX': 300 });
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "skystargamers@gmail.com",
                pass: "yqhr ldsb bmdq zbzs",
            }
        });
        yield transporter.sendMail({
            from: 'Real-time Chat App',
            to: email,
            subject: 'Realtime Chat App OTP Code',
            html: `<p>Your OTP code is <strong>${OTP}</strong>. It is valid for 5 minutes.</p>`,
        });
    }
    catch (error) {
        res.json({ success: false, reason: "Failed to send OTP" });
        return;
    }
    res.json({ success: true, reason: "" });
    return;
});
exports.generateOtp = generateOtp;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, otp } = req.body;
    if (!email || !otp) {
        res.json({ success: false, reason: "OTP is required" });
        return;
    }
    const userObject = zod_1.z.object({
        email: zod_1.z.string().email(),
        otp: zod_1.z.string().length(6)
    });
    const parsedData = userObject.safeParse({ email, otp });
    if (!parsedData.success) {
        res.json({ success: false, reason: "Invalid OTP" });
        return;
    }
    const redisClient = yield (0, redis_1.connectRedis)();
    if (!redisClient) {
        res.json({ success: false, reason: "Internal server error" });
        return;
    }
    const storedOtp = yield redisClient.get(`otp:${email}`);
    if (storedOtp !== otp) {
        res.json({ success: false, reason: "Invalid OTP" });
        return;
    }
    yield redisClient.del(`otp:${email}`);
    const mongoDb = yield (0, mongo_1.connectDB)();
    if (!mongoDb) {
        res.json({ success: false, reason: "Internal server error" });
        return;
    }
    const User = yield auth_1.user.findOne({ email });
    if (User) {
        const encryptedUser = jsonwebtoken_1.default.sign(User.toJSON(), process.env.JWT_SECRET || "");
        res.json({ success: true, reason: "", token: encryptedUser });
        return;
    }
    res.json({ success: false, reason: "User not found" });
    return;
});
exports.verifyOtp = verifyOtp;
const createAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, username } = req.body;
    if (!name || !username) {
        res.json({ success: false, reason: "Name is required" });
        return;
    }
    const userObject = zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required"),
        email: zod_1.z.string().email()
    });
    const parsedData = userObject.safeParse({ name, email });
    if (!parsedData.success) {
        res.json({ success: false, reason: parsedData.error.errors[0].message });
        return;
    }
    try {
        const newUser = yield auth_1.user.create({
            name,
            username,
            email,
            createdAt: new Date(),
        });
        newUser.save();
        const encryptedUser = jsonwebtoken_1.default.sign(newUser.toJSON(), process.env.JWT_SECRET || "");
        res.json({ success: true, reason: "", token: encryptedUser });
        return;
    }
    catch (error) {
        res.json({ success: false, reason: "Failed to create account" });
        return;
    }
});
exports.createAccount = createAccount;
