import WebSocket from 'ws';
import { server } from './app';
import { Conversation, Message } from './models/Conversation';
import mongoose from 'mongoose';
import { ExtendedWebSocket } from './types';
import { user } from './models/auth';

const wss = new WebSocket.Server({ server })

const userConnections = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws: WebSocket) => {
  
  ws.on('message', async (message) => {
    const msg = JSON.parse(message.toString());
    const type = msg.type;
    const cMessage = msg.message;
    (ws as unknown as ExtendedWebSocket).userId = cMessage.currentUserId;
   
    (ws as unknown as ExtendedWebSocket).userId = cMessage.currentUserId;

    if (!userConnections.has(cMessage.currentUserId)) {
      userConnections.set(cMessage.currentUserId, new Set());
    }
    userConnections.get(cMessage.currentUserId)!.add(ws);
    
    switch (type) {
      case "getConversation" : {
        const conversation = await Conversation.find({ participants: new mongoose.Types.ObjectId(cMessage.userId) }).populate('participants');
        const lastMessage = await Promise.all(conversation.map(async (conv): Promise<any> => {
          const convMsgs = await Message.find({ 
            conversation: new mongoose.Types.ObjectId(conv._id)
          });

          const lastMsg = convMsgs.length > 0 ? convMsgs[convMsgs.length - 1].content : null;
          return {
            lastMessage: lastMsg || null
          };
        }))
        
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            const eClient = client as unknown as ExtendedWebSocket;
            if (eClient.userId === cMessage.currentUserId) {
              eClient.send(JSON.stringify({ msg: 'Conversations fetched', conversations: conversation, lastMessage }));
            }
          }})
        return
      }
      case "selectConversation" : {
        if (!cMessage.currentUserId || !cMessage.receiverId) {
          ws.send(JSON.stringify({ msg: 'Invalid conversation selection format' }));
          return;
        }
        
        let conversation;
        if (cMessage.isGroup) {
          conversation = await Conversation.findOne({ _id: cMessage.receiverId, isGroup: true });
        } else {
          conversation = await Conversation.findOne({ participants: { $all: [cMessage.currentUserId, cMessage.receiverId] } });
        }

        if (!conversation) {
          const newConversation = await Conversation.create({
            isGroup: false,
            participants: [cMessage.currentUserId, cMessage.receiverId]
          });
          await newConversation.save();

          const receiver = await user.findById(cMessage.receiverId);
          
          ws.send(JSON.stringify({ msg: 'Conversation not found', receiver }));
          return;
        }

        const participants = await user.find({ _id: { $in: conversation.participants } });
        
        const messages = await Message.find({ conversation: conversation._id });
        
        ws.send(JSON.stringify({ msg: 'Conversation selected', conversation, participants, messages }));
        break;
      }
      case 'sendMessage': {
        if (!cMessage.currentUserId || !cMessage.conversationId || !cMessage.content) {  
          ws.send(JSON.stringify({ msg: 'Invalid message format' }));
          return;
        }

        const conversation = await Conversation.findById(cMessage.conversationId);
        
        if (!conversation) {          
          const newConversation = await Conversation.create({
            isGroup: false,
            participants: [cMessage.currentUserId, cMessage.receiverId]
          });
          await newConversation.save();

          const receiver = await user.findById(newConversation.participants);

          ws.send(JSON.stringify({ msg: 'Conversation not found', receiver }));
          return;
        }

        const participants = conversation.participants.map(participant => participant.toString());
        
        const newMessage = await Message.create({
          sender: new mongoose.Types.ObjectId(cMessage.currentUserId),
          conversation: new mongoose.Types.ObjectId(conversation._id),
          content: cMessage.content,
        })
        await newMessage.save();

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
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ msg: 'Message sent', newMsg, conversationId: conversation._id }));
              }
            });
          }
        });

      }
      case "createGroupConversation" : {
        
        if (!cMessage.currentUserId || !cMessage.participants || !cMessage.name) {
          ws.send(JSON.stringify({ msg: 'Invalid group conversation format' }));
          return;
        }

        const groupConversation = await Conversation.create({
          isGroup: true,
          participants: cMessage.participants,
          name: cMessage.name,
          admin: [cMessage.currentUserId]
        });
        await groupConversation.save();

        const participants = await Promise.all(await user.find({ _id: { $in: cMessage.participants } }));

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            const eClient = client as unknown as ExtendedWebSocket;
            if (cMessage.participants.includes(eClient.userId || '')) {
              eClient.send(JSON.stringify({ msg: 'Group conversation created', groupConversation, participants }));
            }
          }
        });
      }
    } 
  });
  ws.on('close', () => {
    const userId = (ws as unknown as ExtendedWebSocket).userId;
    if (!userId) return;
    const connections = userConnections.get(userId);
    if (connections) {
      connections.delete(ws);
      if (connections.size === 0) {
        userConnections.delete(userId);
      }
    }
  });

});