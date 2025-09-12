  // "use client"
  // import React, { useState, useEffect } from 'react'
  // import ChatWindow from './components/ChatWindow'
  // import Sidebar from './components/ChatSidebar'
  // import { Loader2 } from 'lucide-react'

  // function ChatbotLegacyPage() {
  //   const [currentThreadId, setCurrentThreadId] = useState(null)
  //   const [isLoading, setIsLoading] = useState(true)

  //   useEffect(() => {
  //     // Simulate loading
  //     setTimeout(() => setIsLoading(false), 1000)
  //   }, [])

  //   const handleNewChat = () => {
  //     setCurrentThreadId(null)
  //   }

  //   const handleSelectThread = (threadId) => {
  //     setCurrentThreadId(threadId)
  //   }

  //   const handleNewThread = (threadId) => {
  //     setCurrentThreadId(threadId)
  //   }

  //   if (isLoading) {
  //     return (
  //       <div className="h-screen flex items-center justify-center bg-gray-50">
  //         <div className="text-center">
  //           <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
  //           <p className="text-gray-600">Loading AI Assistant...</p>
  //         </div>
  //       </div>
  //     )
  //   }

  //   return (
  //     <div className="h-screen flex bg-gray-100">
  //       {/* Sidebar */}
  //       <Sidebar
  //         currentThreadId={currentThreadId}
  //         onSelectThread={handleSelectThread}
  //         onNewChat={handleNewChat}
  //       />

  //       {/* Main Chat Area */}
  //       <div className="flex-1 flex flex-col">
  //         <ChatWindow
  //           threadId={currentThreadId}
  //           onNewThread={handleNewThread}
  //         />
  //       </div>
  //     </div>
  //   )
  // }

  // export default ChatbotLegacyPage
