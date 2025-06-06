"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRouter = void 0;
const express_1 = require("express");
const checks_1 = require("../controller/checks");
const checkRouter = (0, express_1.Router)();
exports.checkRouter = checkRouter;
checkRouter.post('/Username', checks_1.checkUsername);
