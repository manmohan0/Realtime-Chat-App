import { Request, Response } from "express";
import { z } from "zod";
import { connectRedis } from "../config/redis";
import { user } from "../models/auth";
import { connectDB } from "../config/mongo";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken";

dotenv.config();

export const generateOtp = async (req : Request, res : Response) : Promise<void> => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ error: "Email is required" });
        return
    }

    const userObject = z.object({
        email: z.string().email()
    })

    const parsedData = userObject.safeParse({ email });

    if (!parsedData.success) {
        res.json({ success: false, reason: "Invalid email" });
        return;
    }

    const OTP = Math.floor(100000 + Math.random() * 900000).toString();

    const redisClient = await connectRedis()

    if (!redisClient) {
        res.json({ success: false, reason: "Internal server error" });
        return;
    }

    try {
        await redisClient.set(`otp:${email}`, OTP, { 'EX' : 300 });
    
        const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: "skystargamers@gmail.com",
                    pass: "yqhr ldsb bmdq zbzs",
                }
            });
        
        await transporter.sendMail({
            from: 'Real-time Chat App',
            to: email,
            subject: 'Realtime Chat App OTP Code',
            html: `<p>Your OTP code is <strong>${OTP}</strong>. It is valid for 5 minutes.</p>`,
        })
    } catch (error) {
        res.json({ success: false, reason: "Failed to send OTP" });
        return
    }
    
    res.json({ success: true, reason: "" });
    return;
}

export const verifyOtp = async (req : Request, res : Response) : Promise<void> => {
    const { name, email, otp } = req.body;

    if (!email || !otp) {
        res.json({ success: false, reason: "OTP is required" });
        return
    }

    const userObject = z.object({
        email: z.string().email(),
        otp: z.string().length(6)
    })

    const parsedData = userObject.safeParse({ email, otp });
    
    if (!parsedData.success) {
        res.json({ success: false, reason: "Invalid OTP" });
        return;
    }
    
    const redisClient = await connectRedis()
    
    if (!redisClient) {
        res.json({ success: false, reason: "Internal server error" });
        return;
    }
    
    const storedOtp = await redisClient.get(`otp:${email}`);
    
    if (storedOtp !== otp) {
        res.json({ success: false, reason: "Invalid OTP" });
        return;
    }

    await redisClient.del(`otp:${email}`);

    const mongoDb = await connectDB();

    if (!mongoDb) {
        res.json({ success: false, reason: "Internal server error" });
        return;
    }

    const User = await user.findOne({ email })

    if (User) {
        const encryptedUser = jsonwebtoken.sign(User.toJSON(), process.env.JWT_SECRET || "")

        res.json({ success: true, reason: "", token: encryptedUser });
        return
    }

    res.json({ success: false, reason: "User not found" });
    return;
}

export const createAccount = async (req : Request, res : Response) : Promise<void> => {

    const { name, email, username } = req.body;

    if (!name || !username) {
        res.json({ success: false, reason: "Name is required" });
        return;
    }

    const userObject = z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email()
    });

    const parsedData = userObject.safeParse({ name, email });

    if (!parsedData.success) {
        res.json({ success: false, reason: parsedData.error.errors[0].message });
        return;
    }

    try {
        const newUser = await user.create({
            name,
            username,
            email,
            createdAt: new Date(),
        });
        
        newUser.save();

        const encryptedUser = jsonwebtoken.sign(newUser.toJSON(), process.env.JWT_SECRET || "");

        res.json({ success: true, reason: "", token: encryptedUser });
        return;
    } catch (error) {
        res.json({ success: false, reason: "Failed to create account" });
        return;
    }
}