import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  isGroup: { type: Boolean, default: false },
  name: { type: String }, // for groups
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  time: { type: String, default: () =>
      new Date().toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}
});

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  content: { type: String },
  time: { type: String, default: () =>
      new Date().toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}
});


export const Conversation = mongoose.model("Conversation", conversationSchema);
export const Message = mongoose.model("Message", messageSchema);

