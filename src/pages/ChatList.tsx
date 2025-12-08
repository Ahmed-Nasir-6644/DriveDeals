import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/ChatList.module.css";
import { useAuth } from "../context/AuthContext";
import {io} from "socket.io-client"
const socket = io("http://localhost:3000")

interface Chat {
  chatId: string;
  otherUserName: string;
  last_message: string;
  updated_at: string;
  unread?: boolean; // optional unread indicator
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  text: string;
  created_at: string;
  senderEmail: string;
  receiverEmail: string;
}

const ChatList: React.FC = () => {
  const { email } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  // Get logged-in user ID
  useEffect(() => {
    if (!email) return;
    fetch(`http://localhost:3000/users/get-by-email?email=${email}`)
      .then((res) => res.json())
      .then((data) => setUserId(data.id))
      .catch((err) => console.error("Error fetching user:", err));
  }, [email]);

  // Fetch chats
  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:3000/chat/user-chats?userId=${userId}`)
      .then((res) => res.json())
      .then((messages: Message[]) => {
        const convMap: Record<number, Message> = {};

        messages.forEach((msg) => {
          const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;

          if (!convMap[otherUserId] || new Date(msg.created_at) > new Date(convMap[otherUserId].created_at)) {
            convMap[otherUserId] = msg;
          }
        });

        const chatList: Chat[] = Object.entries(convMap).map(([otherUserId, msg]) => ({
          chatId: `${Math.min(userId, Number(otherUserId))}-${Math.max(userId, Number(otherUserId))}`,
          otherUserName: msg.senderId === userId ? msg.receiverEmail : msg.senderEmail,
          last_message: msg.text,
          updated_at: msg.created_at,
          unread: msg.senderId !== userId && !msg.text.includes("read"), // simple unread check
        }
      )
      );

        chatList.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        setChats(chatList);
        chatList.forEach(chat => {
          socket.emit("join_chat_room", chat.chatId);
        });
      })
      .catch((err) => console.error("Error fetching chats:", err));
  }, [userId]);
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg: Message) => {
      const chatId = `${Math.min(msg.senderId, msg.receiverId)}-${Math.max(msg.senderId, msg.receiverId)}`;

      setChats((prevChats) => {
        // Check if the chat already exists
        const chatExists = prevChats.find((c) => c.chatId === chatId);

        if (chatExists) {
          // Update the existing chat
          return prevChats.map((c) =>
            c.chatId === chatId
              ? {
                  ...c,
                  last_message: msg.text,
                  updated_at: msg.created_at,
                  unread: msg.senderId !== userId, // mark unread if received from other user
                }
              : c
          ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()); // sort by latest
        } else {
          // Add new chat if it doesn't exist
          const newChat: Chat = {
            chatId,
            otherUserName: msg.senderId === userId ? msg.receiverEmail : msg.senderEmail,
            last_message: msg.text,
            updated_at: msg.created_at,
            unread: msg.senderId !== userId,
          };
          return [newChat, ...prevChats].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        }
      });
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [socket, userId]);


  if (!email) return <p>Loading user...</p>;

  return (
    <main className={styles.container}>
      <section className={styles.header}>
        <h1 className={styles.title}>Your Conversations</h1>
        <p className={styles.subtitle}>Chat with buyers and sellers</p>
      </section>

      <div className={styles.chatList}>
        {chats.length === 0 && <p className={styles.noChats}>No chats found.</p>}
        {chats.map((chat) => (
          <Link to={`/chat/${chat.chatId}`} key={chat.chatId} className={styles.chatCard}>
            <div className={styles.cardLeft}>
              <h3>{chat.otherUserName}</h3>
              <p className={styles.lastMessage}>{chat.last_message}</p>
            </div>
            <div className={styles.cardRight}>
              <span className={styles.time}>{new Date(chat.updated_at).toLocaleDateString()}</span>
              {chat.unread && <span className={styles.unreadBadge}>●</span>}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
};

export default ChatList;
