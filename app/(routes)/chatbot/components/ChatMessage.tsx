"use client";
import React from "react";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
interface ChatMessageProps {
  message: {
    id: number;
    content: string;
    role: "user" | "assistant";
    createdAt: string;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 p-4 ${isUser ? "bg-gray-50" : "bg-white"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? "bg-blue-500" : "bg-green-500"
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-700">
            {isUser ? "You" : "Carex Ai"}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
        </div>
        
        <div className="text-gray-800 whitespace-pre-wrap">
          <ReactMarkdown>
          {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
