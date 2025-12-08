import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io, { Socket } from "socket.io-client";
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
  const { chatId } = useParams();
  const { email } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [receiverId, setReceiverId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ---------------- GET LOGGED-IN USER ID ----------------
  useEffect(() => {
    if (!email) return;
    fetch(`http://localhost:3000/users/get-by-email?email=${email}`)
      .then((res) => res.json())
      .then((user) => setUserId(user.id))
      .catch((err) => console.error("Error fetching user:", err));
  }, [email]);

  // ---------------- PARSE RECEIVER ID ----------------
  useEffect(() => {
    if (!userId || !chatId) return;
    const [id1, id2] = chatId.split("-").map(Number);
    setReceiverId(id1 === userId ? id2 : id1);
  }, [chatId, userId]);

  // ---------------- SOCKET INIT ----------------
  useEffect(() => {
    const newSocket: Socket = io("http://localhost:3000", {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  // ---------------- RECEIVE MESSAGES ----------------
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage); // use the same reference
    };
  }, [socket]);

  // ---------------- LOAD PREVIOUS MESSAGES ----------------
  useEffect(() => {
    if (!userId || !receiverId) return;
    fetch(
      `http://localhost:3000/chat/history?user1=${userId}&user2=${receiverId}`
    )
      .then((res) => res.json())
      .then((msgs: Message[]) => setMessages(msgs))
      .catch((err) => console.error("Error loading chat history:", err));
  }, [userId, receiverId]);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!socket || !userId || !receiverId || input.trim() === "") return;

    const msg: Message = {
      senderId: userId,
      receiverId,
      text: input,
      timestamp: new Date().toISOString(),
    };

    socket.emit("send_message", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!userId || !receiverId) return <p>Loading chat...</p>;

  return (
    <div className={styles.chatContainer}>
      <h2 className={styles.header}>Chat</h2>

      <div className={styles.chatBox}>
        {messages.map((msg, index) => {
          const isMine = msg.senderId === userId;
          return (
            <div
              key={index}
              className={`${styles.message} ${
                isMine ? styles.mine : styles.theirs
              }`}
            >
              <p>{msg.text}</p>
              {msg.timestamp && (
                <span className={styles.time}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <textarea
          placeholder="Type a message..."
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button className={styles.sendBtn} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
