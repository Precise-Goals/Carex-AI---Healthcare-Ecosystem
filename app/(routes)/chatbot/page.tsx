"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatSidebar from "./components/ChatSidebar";
import ChatInterface from "./components/ChatInterface";
import { Loader2, AlertCircle } from "lucide-react";

interface ChatThread {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: number;
    content: string;
    role: string;
    createdAt: string;
  }>;
}

function ChatbotPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadThreads();
  }, []);

  // Separate effect for auto-selecting first thread
  useEffect(() => {
    if (threads.length > 0 && activeThreadId === null) {
      setActiveThreadId(threads[0].id);
    }
  }, [threads, activeThreadId]);

  const loadThreads = async () => {
    try {
      setError(null);
      const response = await axios.get("/api/chatbot");
      const threadsData = response.data;
      setThreads(threadsData);
    } catch (error) {
      console.error("Error loading threads:", error);
      setError("Failed to load chats");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewThread = async () => {
    try {
      const response = await axios.post("/api/chatbot/threads", {
        title: "New Chat",
      });

      const newThread = {
        ...response.data,
        messages: [], // Add empty messages array to match interface
      };
      setThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(newThread.id);
    } catch (error) {
      console.error("Error creating thread:", error);
      setError("Failed to create new chat");
    }
  };

  const handleThreadSelect = (threadId: number) => {
    setActiveThreadId(threadId);
  };

  const handleDeleteThread = async (threadId: number) => {
    if (!confirm("Are you sure you want to delete this chat?")) {
      return;
    }

    try {
      await axios.delete(`/api/chatbot/threads?threadId=${threadId}`);

      // Update threads and handle active thread selection
      setThreads((prev) => {
        const remainingThreads = prev.filter(
          (thread) => thread.id !== threadId
        );

        // If deleted thread was active, select another one
        if (activeThreadId === threadId) {
          setActiveThreadId(
            remainingThreads.length > 0 ? remainingThreads[0].id : null
          );
        }

        return remainingThreads;
      });
    } catch (error) {
      console.error("Error deleting thread:", error);
      setError("Failed to delete chat");
    }
  };

  const handleRenameThread = async (threadId: number, newTitle: string) => {
    try {
      // For now, we'll just update the local state
      // In a real app, you'd want to add an API endpoint for renaming
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId ? { ...thread, title: newTitle } : thread
        )
      );
    } catch (error) {
      console.error("Error renaming thread:", error);
      setError("Failed to rename chat");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading AI assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="Chatbot">
      {/* Sidebar */}
      <ChatSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onThreadSelect={handleThreadSelect}
        onNewThread={handleNewThread}
        onDeleteThread={handleDeleteThread}
        onRenameThread={handleRenameThread}
      />

      {/* Main Chat Area */}
      <ChatInterface threadId={activeThreadId} onThreadUpdate={loadThreads} />

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatbotPage;
