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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUsername = void 0;
const auth_1 = require("../models/auth");
const checkUsername = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    const User = yield auth_1.user.findOne({ username });
    if (User) {
        res.json({ success: false, reason: "Username already exists" });
    }
    else {
        res.json({ success: true, reason: "" });
    }
});
exports.checkUsername = checkUsername;
