import React from 'react'
import "@/styles/chat/chatinput.css"

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSend: () => void;
  onTyping: () => void;
}

const ChatInput = ({ message, setMessage, onSend, onTyping }: ChatInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSend();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTyping();
  };

  const handleSend = () => {
    if (message.trim()) {      
      onSend();
    }
  };

  return (
    <div className="chat-input-container">
      <textarea
        className="chat-input"
        value={message}
        onChange={(e)=>handleChange(e)}
        onKeyDown={(e)=>handleKeyPress(e)}
        placeholder="Type a message..."
        rows={1}
      />
      <button 
        className="send-button"
        onClick={()=>handleSend()}
        disabled={!message.trim()}
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;