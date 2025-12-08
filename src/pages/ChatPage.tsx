// src/pages/ChatPage.tsx
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import styles from "../styles/ChatPage.module.css";
import { useAuth } from "../context/AuthContext";

interface Message {
  id?: number;
  senderId: number;
  receiverId: number;
  text: string;
  timestamp?: string;
}

const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { email } = useAuth();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [receiverId, setReceiverId] = useState<number | null>(null);

  const chatBoxRef = useRef<HTMLDivElement>(null);

  // ---------------- GET LOGGED-IN USER ID ----------------
  useEffect(() => {
    if (!email) return;

    const fetchUserId = async () => {
      try {
        const res = await fetch(`http://localhost:3000/users/get-by-email?email=${email}`);
        const user = await res.json();
        setUserId(user.id);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUserId();
  }, [email]);

  // ---------------- PARSE RECEIVER ID ----------------
  useEffect(() => {
    if (!userId || !chatId) return;
    const [id1, id2] = chatId.split("-").map(Number);
    setReceiverId(id1 === userId ? id2 : id1);
  }, [chatId, userId]);

  // ---------------- SOCKET INIT ----------------
  useEffect(() => {
    const newSocket: Socket = io("http://localhost:3000", { transports: ["websocket"] });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // ---------------- JOIN & LEAVE CHAT ROOM ----------------
  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit("join_room", chatId);

    return () => {
      socket.emit("leave_room", chatId);
    };
  }, [socket, chatId]);

  // ---------------- RECEIVE MESSAGES ----------------
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg: Message) => setMessages((prev) => [...prev, msg]);
    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [socket]);

  // ---------------- LOAD CHAT HISTORY ----------------
  useEffect(() => {
    if (!userId || !receiverId) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:3000/chat/history?user1=${userId}&user2=${receiverId}`);
        const msgs: Message[] = await res.json();
        setMessages(msgs);
      } catch (err) {
        console.error("Error loading chat history:", err);
      }
    };

    fetchHistory();
  }, [userId, receiverId]);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // ---------------- SEND MESSAGE ----------------
  const sendMessage = () => {
    if (!socket || !userId || !receiverId || !input.trim()) return;

    const msg: Message = { senderId: userId, receiverId, text: input };
    socket.emit("send_message", { ...msg, chatId });
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  if (!userId || !receiverId) return <p>Loading chat...</p>;

  return (
    <div className={styles.chatContainer}>
      <h2 className={styles.header}>Chat</h2>

      <div ref={chatBoxRef} className={styles.chatBox}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={msg.senderId === userId ? styles.myMessage : styles.theirMessage}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className={styles.inputArea}>
        <input
          type="text"
          placeholder="Type a message..."
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className={styles.sendBtn} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
