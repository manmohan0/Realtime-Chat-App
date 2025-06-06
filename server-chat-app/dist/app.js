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
exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = require("./routes/authRoutes");
const mongo_1 = require("./config/mongo");
const checks_1 = require("./routes/checks");
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND : 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express_1.default.json());
app.use('/auth', authRoutes_1.authRoutes);
app.use('/check', checks_1.checkRouter);
const port = process.env.PORT || 8080;
(() => __awaiter(void 0, void 0, void 0, function* () { return yield (0, mongo_1.connectDB)(); }))();
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
exports.server = server;
