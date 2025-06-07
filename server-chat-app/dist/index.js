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
const ws_1 = __importDefault(require("ws"));
const app_1 = require("./app");
const Conversation_1 = require("./models/Conversation");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("./models/auth");
const wss = new ws_1.default.Server({ server: app_1.server });
const userConnections = new Map();
wss.on('connection', (ws) => {
    ws.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        const msg = JSON.parse(message.toString());
        const type = msg.type;
        const cMessage = msg.message;
        ws.userId = cMessage.currentUserId;
        ws.userId = cMessage.currentUserId;
        if (!userConnections.has(cMessage.currentUserId)) {
            userConnections.set(cMessage.currentUserId, new Set());
        }
        userConnections.get(cMessage.currentUserId).add(ws);
        switch (type) {
            case "getConversation": {
                const conversation = yield Conversation_1.Conversation.find({ participants: new mongoose_1.default.Types.ObjectId(cMessage.userId) }).populate('participants');
                const lastMessage = yield Promise.all(conversation.map((conv) => __awaiter(void 0, void 0, void 0, function* () {
                    const convMsgs = yield Conversation_1.Message.find({
                        conversation: new mongoose_1.default.Types.ObjectId(conv._id)
                    });
                    const lastMsg = convMsgs.length > 0 ? convMsgs[convMsgs.length - 1].content : null;
                    return {
                        lastMessage: lastMsg || null
                    };
                })));
                wss.clients.forEach(client => {
                    if (client.readyState === ws_1.default.OPEN) {
                        const eClient = client;
                        if (eClient.userId === cMessage.currentUserId) {
                            eClient.send(JSON.stringify({ msg: 'Conversations fetched', conversations: conversation, lastMessage }));
                        }
                    }
                });
                return;
            }
            case "selectConversation": {
                if (!cMessage.currentUserId || !cMessage.receiverId) {
                    ws.send(JSON.stringify({ msg: 'Invalid conversation selection format' }));
                    return;
                }
                let conversation;
                if (cMessage.isGroup) {
                    conversation = yield Conversation_1.Conversation.findOne({ _id: cMessage.receiverId, isGroup: true });
                }
                else {
                    conversation = yield Conversation_1.Conversation.findOne({ participants: { $all: [cMessage.currentUserId, cMessage.receiverId] } });
                }
                if (!conversation) {
                    const newConversation = yield Conversation_1.Conversation.create({
                        isGroup: false,
                        participants: [cMessage.currentUserId, cMessage.receiverId]
                    });
                    newConversation.save();
                    const receiver = yield auth_1.user.findById(cMessage.receiverId);
                    ws.send(JSON.stringify({ msg: 'Conversation not found', receiver }));
                    return;
                }
                const participants = yield auth_1.user.find({ _id: { $in: conversation.participants } });
                const messages = yield Conversation_1.Message.find({ conversation: conversation._id });
                ws.send(JSON.stringify({ msg: 'Conversation selected', conversation, participants, messages }));
                break;
            }
            case 'sendMessage': {
                if (!cMessage.currentUserId || !cMessage.conversationId || !cMessage.content) {
                    ws.send(JSON.stringify({ msg: 'Invalid message format' }));
                    return;
                }
                const conversation = yield Conversation_1.Conversation.findById(cMessage.conversationId);
                if (!conversation) {
                    const newConversation = yield Conversation_1.Conversation.create({
                        isGroup: false,
                        participants: [cMessage.currentUserId, cMessage.receiverId]
                    });
                    newConversation.save();
                    const receiver = yield auth_1.user.findById(newConversation.participants);
                    ws.send(JSON.stringify({ msg: 'Conversation not found', receiver }));
                    return;
                }
                const participants = conversation.participants.map(participant => participant.toString());
                const newMessage = yield Conversation_1.Message.create({
                    sender: new mongoose_1.default.Types.ObjectId(cMessage.currentUserId),
                    conversation: new mongoose_1.default.Types.ObjectId(conversation._id),
                    content: cMessage.content,
                });
                newMessage.save();
                const newMsg = {
                    sender: cMessage.currentUserId,
                    conversationId: cMessage.conversationId,
                    content: cMessage.content,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                participants.forEach(userId => {
                    const connections = userConnections.get(userId);
                    if (connections) {
                        connections.forEach(client => {
                            if (client.readyState === ws_1.default.OPEN) {
                                client.send(JSON.stringify({ msg: 'Message sent', newMsg, conversationId: conversation._id }));
                            }
                        });
                    }
                });
            }
            case "createGroupConversation": {
                if (!cMessage.currentUserId || !cMessage.participants || !cMessage.name) {
                    ws.send(JSON.stringify({ msg: 'Invalid group conversation format' }));
                    return;
                }
                const groupConversation = yield Conversation_1.Conversation.create({
                    isGroup: true,
                    participants: cMessage.participants,
                    name: cMessage.name,
                    admin: [cMessage.currentUserId]
                });
                groupConversation.save();
                const participants = yield Promise.all(yield auth_1.user.find({ _id: { $in: cMessage.participants } }));
                wss.clients.forEach(client => {
                    if (client.readyState === ws_1.default.OPEN) {
                        const eClient = client;
                        if (cMessage.participants.includes(eClient.userId || '')) {
                            eClient.send(JSON.stringify({ msg: 'Group conversation created', groupConversation, participants }));
                        }
                    }
                });
            }
        }
    }));
    ws.on('close', () => {
        const userId = ws.userId;
        if (!userId)
            return;
        const connections = userConnections.get(userId);
        if (connections) {
            connections.delete(ws);
            if (connections.size === 0) {
                userConnections.delete(userId);
            }
        }
    });
});
