"use client";
import React from "react";
import { Plus, MessageSquare, Trash2, Edit3, Bot, Edit2 } from "lucide-react";
import { RiEditFill } from "react-icons/ri";
import { MdDelete, MdEditDocument } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

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

interface ChatSidebarProps {
  threads: ChatThread[];
  activeThreadId: number | null;
  onThreadSelect: (threadId: number) => void;
  onNewThread: () => void;
  onDeleteThread: (threadId: number) => void;
  onRenameThread: (threadId: number, newTitle: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  threads,
  activeThreadId,
  onThreadSelect,
  onNewThread,
  onDeleteThread,
  onRenameThread,
}) => {
  const [editingThread, setEditingThread] = React.useState<number | null>(null);
  const [editTitle, setEditTitle] = React.useState("");

  const handleRename = (threadId: number, currentTitle: string) => {
    setEditingThread(threadId);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = () => {
    if (editingThread && editTitle.trim()) {
      onRenameThread(editingThread, editTitle.trim());
    }
    setEditingThread(null);
    setEditTitle("");
  };

  const handleCancelRename = () => {
    setEditingThread(null);
    setEditTitle("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="chatwrappersidebar">
      {/* Header */}
      <div className="sidebarstar">
        <img src="robot.png" alt="logo" />
        <button onClick={onNewThread} className="newchat">
          <span>New Chat</span>
        </button>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="threads">
            {threads.map((thread) => (
              <>
                <div
                  key={thread.id}
                  className={`thrd ${
                    activeThreadId === thread.id ? "selectiv" : "hover:bg-white"
                  }`}
                >
                  <button
                    onClick={() => onThreadSelect(thread.id)}
                    className="w-full p-3 text-left"
                  >
                    {editingThread === thread.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename();
                            if (e.key === "Escape") handleCancelRename();
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveRename();
                          }}
                          className="text-green-600 hover:text-green-700"
                        >
                          ✓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelRename();
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-sm text-gray-800 truncate">
                          {thread.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(thread.updatedAt)}
                        </div>
                      </div>
                    )}
                  </button>

                  {/* Action buttons */}
                  {editingThread !== thread.id && (
                    <div className="buttonssa">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRename(thread.id, thread.title);
                        }}
                        className="editbutn"
                      >
                        <FaEdit className="edt" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteThread(thread.id);
                        }}
                        className="deltbtn"
                      >
                        <MdDelete className="dlt" />
                      </button>
                    </div>
                  )}
                </div>
                <hr className="showthre" />
              </>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
