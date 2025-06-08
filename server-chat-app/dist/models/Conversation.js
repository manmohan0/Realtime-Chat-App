"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.Conversation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const conversationSchema = new mongoose_1.default.Schema({
    isGroup: { type: Boolean, default: false },
    name: { type: String },
    participants: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    admins: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    time: { type: String, default: () => new Date().toLocaleString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }) }
});
const messageSchema = new mongoose_1.default.Schema({
    sender: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    conversation: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Conversation", required: true },
    content: { type: String },
    time: { type: String, default: () => new Date().toLocaleString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }) }
});
exports.Conversation = mongoose_1.default.model("Conversation", conversationSchema);
exports.Message = mongoose_1.default.model("Message", messageSchema);
