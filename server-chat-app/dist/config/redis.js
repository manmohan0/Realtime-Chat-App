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
exports.connectRedis = void 0;
const redis_1 = require("redis");
const connectRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const redisClient = (0, redis_1.createClient)({
            url: process.env.REDIS,
        });
        redisClient.on('error', (err) => {
            console.log('Redis Client Error', err);
            throw err;
        });
        yield redisClient.connect();
        console.log("Connected to Redis");
        return redisClient;
    }
    catch (e) {
        console.log('Redis Connection Error', e);
        return null;
    }
});
exports.connectRedis = connectRedis;
