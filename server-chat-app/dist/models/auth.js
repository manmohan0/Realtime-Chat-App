"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    email: { type: String, unique: true },
    name: String,
    username: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now },
});
exports.user = mongoose_1.default.model("User", UserSchema);
