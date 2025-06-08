import { useEffect, useState } from "react";
import { WebSocketClient } from "../clients/WebSocket";
import { FPMessageBox } from "../components/FPMessageBox";
import { InputBox } from "../components/InputBox";
import { SearchBox } from "../components/SearchBox";
import { SPMessageBox } from "../components/SPMessageBox";
import { faCheck, faPaperPlane, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../Context/auth";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import type { User, Message, Conversation } from "../types";
import toast, { Toaster } from "react-hot-toast";


export function Home () {

    const [dropdownUsers, setDropdownUsers] = useState<User[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [currentParticipants, setCurrentParticipants] = useState<User[] | null>(null);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [lastMessage, setLastMessage] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState<string>("");
    const [showAddMembersModal, setShowAddMembersModal] = useState(false);
    const [selectedGroupUsers, setSelectedGroupUsers] = useState<User[]>([]);
    const [groupName, setGroupName] = useState<string>("");
    
    const ws = WebSocketClient.getClient()
    const navigate = useNavigate()
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [loading, navigate, user]);

    useEffect(() => {
        
        if (user) {
            ws.onopen = () => {
                if (user && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "getConversation", message: { userId: user._id }, currentUserId: user._id }));
                }
            }
        }

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data)
            const msg = message.msg;

            switch (msg) {
                case 'Conversation selected': {
                    const conversation = message.conversation as Conversation;
                    const participants = message.participants as User[];
                    const messages = message.messages as Message[];
                    setCurrentConversation(conversation);
                    setCurrentParticipants(participants);
                    setMessages(messages);
                    break;
                }
                case 'Conversations fetched': {
                    const conversations = message.conversations as Conversation[];
                    const lastMessage = message.lastMessage as Message[];
                    setConversations(conversations);
                    setLastMessage(lastMessage);
                    break;
                }
                case 'Message sent' : {
                    const newMsg = message.newMsg as Message;
                    if (currentConversation?._id === newMsg.conversationId) {
                        setMessages(prevMessages => [...prevMessages, newMsg]);
                    }
                    setLastMessage(prevLastMessages => {
                        const updated = prevLastMessages.filter(m => m.conversationId !== newMsg.conversationId);
                        return [{ ...newMsg }, ...updated];
                    });
                    setCurrentMessage("");
                    break;
                }
                case 'Conversation not found': {
                    if (user && user._id) {
                        const receiver = message.receiver as Conversation;
                        if (!receiver || !receiver._id) {
                            console.error("Receiver not found or invalid.");
                            return;
                        }

                        ws.send(JSON.stringify({
                            type: "selectConversation",
                            message: {
                                currentUserId: user._id,
                                receiverId: receiver._id,
                                isGroup: false
                            }
                        }));

                        setShowDropdown(false);
                    }
                    break;
                }
                case 'Group conversation created': {
                    const groupConversation = message.groupConversation as Conversation;
                    const participants = message.receivers as User[];
                    setCurrentConversation(groupConversation);
                    setCurrentParticipants(participants);
                }
            }
        }

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        }
    }, [user, ws, currentConversation]);

    const onSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const search = e.target.value;
        
        if (!search) {
            setDropdownUsers([]);
            setShowDropdown(false);
            return;
        }

        const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/getUsers`, { search });

        if (res && res.data.success) {
            setDropdownUsers(res.data.users);
            setShowDropdown(true);
        }
    }

    const toggleAddMembersModal = () => {
        setSelectedGroupUsers(user ? [user] : []);
        setShowAddMembersModal(prev => !prev);
    };


    const handleSendMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentMessage(e.target.value);
    }

    const handleGroupName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGroupName(e.target.value);
    }

    const logout = async () => {
        Cookies.remove("token");
        navigate('/login');
    }

    const selectConversation = (conversation: Conversation) => {
        if (user && conversation) {
            const message = {
                currentUserId: user?._id,
                receiverId: conversation.isGroup ? conversation._id : conversation.participants.find((p) => p._id !== user._id)?._id,
                isGroup: conversation.isGroup
            }
            console.log("in select conversation FE",message);
            
            ws.send(JSON.stringify({ type: "selectConversation", message }));
            // setCurrentConversation({
            //     _id: conversation._id,
            //     name: conversation.name,
            //     isGroup: conversation.isGroup,
            //     participants: conversation.participants,
            // });
            setShowDropdown(false);
        }
    }

    const addMembersinGroup = (cUser: User) => {
        
        if (user && !selectedGroupUsers.some(u => u._id === cUser._id)) {
            setSelectedGroupUsers(prev => [...prev, cUser]);
            setDropdownUsers(prev => prev.filter(u => u._id !== cUser._id));
        } else {
            if (cUser._id === user?._id) {
                setShowAddMembersModal(false);
            }
            setSelectedGroupUsers(prev => prev.filter(u => u._id !== cUser._id));
        }
    }

    const createGroupConversation = () => {
        if (selectedGroupUsers.length > 0 && user) {
            const groupConversation = {
                currentUserId: user?._id,
                name: groupName,
                participants: selectedGroupUsers.map(user => user._id),
                isGroup: true
            };
            ws.send(JSON.stringify({ type: "createGroupConversation", message: groupConversation }));
            setShowAddMembersModal(false);
            setSelectedGroupUsers([]);
        }
    }

    const sendMessage = () => {
        if (!currentMessage) {
            toast.error("Message cannot be empty");
            return;
        }

        if (currentConversation && user && user._id) {
            const message = {
                currentUserId: user._id,
                conversationId: currentConversation._id,
                content: currentMessage,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }

            ws.send(JSON.stringify({ type: "sendMessage", message }));
            setCurrentMessage("");
        }
    }
    
    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-electric-blue">
            <span className="text-2xl font-bold">Loading...</span>
        </div>
    }

    return (
        <>
            <Toaster/>
            <div className='flex'>
                <div className='relative basis-1/3 h-screen bg-electric-blue p-4 border-r'>
                    <div className='flex justify-between'>
                        <span className="text-2xl font-bold mb-4">
                            Welcome { user?.name }
                        </span>
                        <span className="text-lg mb-4 hover:cursor-pointer" onClick={logout}>
                            Logout
                        </span>
                    </div>
                    <SearchBox placeholder={"Search"} onSearch={onSearch}/>
                    {!showAddMembersModal && showDropdown && dropdownUsers.length > 0 && (
                        <div className="m-2 bg-white hover:bg-hover-electric-blue shadow-md rounded-md max-h-64 overflow-y-auto absolute w-11/12 ">
                            {dropdownUsers.map((dropdownUser) => (
                            <div
                                key={dropdownUser._id}
                                onClick={() => {
                                    if (user) {
                                        selectConversation({
                                            _id: dropdownUser._id,
                                            name: dropdownUser.name,
                                            isGroup: false,
                                            participants: [dropdownUser, user]
                                        });
                                    };
                                }}
                                className="flex flex-col p-2 cursor-pointer">
                                <span className="w-fit font-semibold">{dropdownUser.name}</span>
                                <span className="w-fit text-sm text-gray-500">{dropdownUser.username}</span>
                            </div>
                            ))}
                        </div>
                    )}

                    {conversations.length > 0 && lastMessage.length > 0 ? conversations.map((conversation, id) => (
                        <div key={id} onClick={() => {
                            if (user) {
                                selectConversation({
                                    _id: conversation._id,
                                    name: conversation.isGroup ? conversation.name : conversation.participants.filter((participant) => participant.name !== user?.name).map((p) => p.name)[0],
                                    isGroup: false,
                                    participants: conversation.participants
                                });
                                console.log("conversations FE", conversation
                            }
                        }} className="flex w-full p-2 justify-between hover:bg-hover-electric-blue hover:cursor-pointer border-b">
                            <span className="flex flex-col w-fit">
                                <span>
                                    {conversation.isGroup ? conversation.name : conversation.participants.find((participant) => participant._id !== user?._id)?.name}
                                </span>
                                <span>
                                    {lastMessage[id].lastMessage}
                                </span>
                            </span>
                            <span>
                                {conversation.time}
                            </span>
                        </div>
                    )) : <div className="flex items-center justify-center h-full"> Start a conversation with someone</div>}
                    <span onClick={toggleAddMembersModal} className="flex absolute bottom-2 right-0 p-4 m-4 w-fit hover:cursor-pointer bg-electric-blue rounded-full shadow-xl/20">
                        <FontAwesomeIcon icon={faUserGroup} className="self-end"/>
                    </span>
                </div>
                {currentConversation ? <div className="flex flex-col basis-2/3 justify-between">
                    <div className="flex flex-col font-bold p-4 bg-electric-blue">
                        {currentConversation.isGroup ? currentConversation.name : currentParticipants?.filter((participant) => (participant._id !== user?._id)).map((participant) => (participant.name))}
                    </div>
                    
                    {messages && <>
                        <div className={`flex-1 flex flex-col p-2 ${messages.length === 0 ? "justify-center items-center" : "justify-end"}`}>
                            {messages.length > 0 ? 
                                <>
                                    <div className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden flex-1">
                                    {messages.map((message, index) => (
                                        message.sender == user?._id ? <FPMessageBox key={index} message={message.content} time={message.time} /> : <SPMessageBox key={index} message={message.content} time={message.time}/>
                                    ))} 
                                    </div>
                                </>
                                : <span className="text-center text-gray-500">Start a conversation</span>}
                        </div>
                        <InputBox onInput={handleSendMessage} placeholder="Type a message..." >
                            <FontAwesomeIcon icon={faPaperPlane} className="p-2 hover: cursor-pointer" onClick={sendMessage}/>
                        </InputBox>        
                    </>}
                </div> : <div className="flex basis-2/3 items-center justify-center h-screen">
                        <span className="text-2xl">Select a user to chat with</span>
                    </div>}
                    {showAddMembersModal && (
                        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg w-96 shadow-xl relative">
                            <button className="absolute top-2 right-3 text-gray-600 text-lg hover:cursor-pointer" onClick={toggleAddMembersModal}>
                                ✕
                            </button>
                            <h2 className="text-lg font-semibold mb-4">Add Members</h2>
                            <span className="mx-3 font-bold">Group Name</span>
                            <InputBox placeholder="Search users to add..." onInput={handleGroupName} />
                            <SearchBox placeholder="Search users to add..." onSearch={onSearch}/>
                            {selectedGroupUsers.length > 0 && selectedGroupUsers.map((user, id) => (
                                <div key={id} onClick={() => addMembersinGroup(user)} className="flex justify-between items-center hover:bg-gray-200 p-2 cursor-pointer">
                                    <div className="flex flex-col">
                                        <span className="w-fit font-semibold">{user.name}</span>
                                        <span className="w-fit text-sm text-gray-500">{user.username}</span>
                                    </div>
                                    <FontAwesomeIcon icon={faCheck} />
                                </div>
                            ))}
                            {dropdownUsers.length > 0 && (
                                <div className="mt-2 max-h-40 overflow-y-auto">
                                {dropdownUsers.map(user => (
                                    <div key={user._id} className="flex flex-col border-b p-2 rounded hover:bg-gray-200 cursor-pointer" onClick={() => addMembersinGroup(user)}>
                                    <span>
                                        {user.name}
                                    </span>
                                    <span>
                                        {user.username}
                                    </span>
                                    </div>
                                ))}
                                </div>
                            )}

                            <button className="mt-4 w-full bg-electric-blue hover:bg-hover-electric-blue text-white py-2 px-4 rounded" onClick={createGroupConversation} >
                                Add Members
                            </button>
                            </div>
                        </div>
                        )}
            </div>      
        </>
    )
}