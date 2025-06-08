export type AuthContextType = {
    user: User | null, 
    setUser: React.Dispatch<React.SetStateAction<User | null>>,
    fetchData: () => Promise<void>,
    loading: boolean,
    logout: () => Promise<void>
};

export type User = {
    _id: string;
    name: string;
    username: string;
};

export type Message = {
    lastMessage?: string;
    sender: string;
    conversationId: string;
    content: string;
    time: string;
};

export type Conversation = {
  _id: string;
  name: string;
  isGroup: boolean;
  participants: User[];
  lastMessage?: string;
  time?: string;
}
