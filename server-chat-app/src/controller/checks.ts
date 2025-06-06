import { Request, Response } from "express";
import { user } from "../models/auth";

export const checkUsername = async (req: Request, res: Response): Promise<void> => {
    const { username } = req.body;
    const User = await user.findOne({ username });
    if (User) {
        res.json({ success: false, reason: "Username already exists" });
    } else {
        res.json({ success: true, reason: "" });
    }
}