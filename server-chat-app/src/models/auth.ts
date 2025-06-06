import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  name: String,
  username: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export const user = mongoose.model("User", UserSchema);