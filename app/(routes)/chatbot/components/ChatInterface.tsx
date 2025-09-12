"use client"
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { Loader2, AlertCircle } from 'lucide-react'

interface ChatMessage {
  id: number
  content: string
  role: 'user' | 'assistant'
  createdAt: string
}

interface ChatThread {
  id: number
  title: string
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
}

interface ChatInterfaceProps {
  threadId: number | null
  onThreadUpdate: () => void
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ threadId, onThreadUpdate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  // }

  // useEffect(() => {
  //   scrollToBottom()
  // }, [messages])

  useEffect(() => {
    if (threadId) {
      loadThreadMessages()
    } else {
      setMessages([])
    }
  }, [threadId])

  const loadThreadMessages = async () => {
    if (!threadId) return

    try {
      setError(null)
      const response = await axios.get(`/api/chatbot?threadId=${threadId}`)
      setMessages(response.data.messages || [])
    } catch (error) {
      console.error('Error loading messages:', error)
      setError('Failed to load messages')
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!threadId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post('/api/chatbot', {
        message,
        threadId
      })

      // Add both user and assistant messages
      setMessages(prev => [
        ...prev,
        response.data.userMessage,
        response.data.assistantMessage
      ])

      // Update thread list
      onThreadUpdate()
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!threadId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Health AI</h3>
          <p className="text-gray-500">Select a conversation or start a new one to begin chatting.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="INTERFACE">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center empytchat">
              {/* <div className="iconchatemp">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div> */}
              <h1 className="hed">Carex Ai</h1>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
              <p className="text-gray-500">Type your message below to begin chatting with the AI.</p>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3 p-4 bg-gray-50">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-700 mb-1">AI Assistant</div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border-t border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={!!error}
      />
    </div>
  )
}

export default ChatInterface
