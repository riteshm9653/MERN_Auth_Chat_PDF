import React, { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Send,
  FileText,
  Bot,
  User,
  Zap,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const ChatPage = () => {
  // Mock pdfId for demo - replace with actual useParams in your app
  const pdfId = "demo-pdf-id";
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your PDF AI assistant. Ask me anything about the document you've uploaded.",
      sender: "ai",
      timestamp: new Date().toISOString(),
      sourceInfo: null,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate typing animation
  const simulateTyping = async (text, callback) => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate processing time
    setIsTyping(false);
    callback(text);
  };

  const handleSendMessage = async () => {
    if (!question.trim()) return;

    const userMessage = {
      text: question,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const currentQuestion = question;
    setQuestion("");
    setError(null);
    setLoading(true);

    try {
      // Replace with your actual API call
      /*
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/`,
        { pdfId, question: currentQuestion }
      );
      */

      // Demo response - replace with actual API response
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const demoResponse = {
        answer: `Here's a comprehensive answer about "${currentQuestion}". This is a detailed explanation based on the PDF content. The system has analyzed the document and found relevant information across multiple pages to provide you with the most accurate response possible.`,
        sourceInfo: [
          { pageNum: 1, score: 0.8873136043548584 },
          { pageNum: 3, score: 0.8629637956619263 },
          { pageNum: 5, score: 0.8418327569961548 },
        ],
      };

      const aiMessage = {
        text: demoResponse.answer,
        sender: "ai",
        sourceInfo: demoResponse.sourceInfo,
        timestamp: new Date().toISOString(),
      };

      await simulateTyping(aiMessage.text, () => {
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      });
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = {
        text: "❌ I'm having trouble processing your request. Please try again or check if the service is running.",
        sender: "ai",
        timestamp: new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const TypingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 text-gray-700 px-6 py-3 rounded-2xl max-w-[70%] shadow-sm">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-purple-600" />
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <span className="text-sm text-purple-600">AI is thinking...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  PDF Chat Assistant
                </h1>
                <p className="text-sm text-gray-500">
                  Intelligent document analysis powered by AI
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Chat Messages */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 mb-6">
          <div className="h-[65vh] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } animate-in slide-in-from-bottom-4 duration-500`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`max-w-[75%] ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "bg-gradient-to-r from-gray-50 to-white text-gray-800 shadow-md border border-gray-100"
                  } rounded-2xl px-6 py-4 relative group hover:shadow-lg transition-all duration-300`}
                >
                  {/* Avatar */}
                  <div
                    className={`absolute -top-2 ${
                      msg.sender === "user" ? "-right-2" : "-left-2"
                    } 
                    w-8 h-8 rounded-full flex items-center justify-center shadow-md
                    ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-blue-500 to-purple-500"
                        : "bg-gradient-to-r from-purple-500 to-pink-500"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="mt-2">
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.text}
                    </div>

                    {/* Source Information */}
                    {msg.sourceInfo && msg.sourceInfo.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-200/50">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="w-3 h-3 text-purple-500" />
                          <span className="text-xs font-semibold text-purple-600">
                            Sources Found
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.sourceInfo.map((source, idx) => (
                            <div
                              key={idx}
                              className="bg-purple-50 rounded-lg px-3 py-2 flex items-center justify-between hover:bg-purple-100 transition-colors"
                            >
                              <div className="flex items-center space-x-2">
                                <FileText className="w-3 h-3 text-purple-500" />
                                <span className="text-xs font-medium">
                                  Page {source.pageNum}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-1000"
                                    style={{ width: `${source.score * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-purple-600 font-medium">
                                  {(source.score * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div
                      className={`flex items-center justify-end mt-2 space-x-1 ${
                        msg.sender === "user"
                          ? "text-blue-100"
                          : "text-gray-400"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">
                        {formatTime(msg.timestamp)}
                      </span>
                      {msg.sender === "user" && (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {(loading || isTyping) && <TypingIndicator />}

            <div ref={messageEndRef}></div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 animate-in slide-in-from-top-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="font-medium">Error</span>
            </div>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-4">
          <div className="flex items-end space-x-4">
            {/* Input Field */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your PDF document..."
                className="w-full max-h-32 min-h-[60px] px-6 py-4 pr-12 bg-gray-50/50 border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none placeholder-gray-400 transition-all duration-300"
                disabled={loading}
                rows="1"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              />
              {/* Character count */}
              <div className="absolute bottom-2 right-4 text-xs text-gray-400">
                {question.length}/500
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={loading || !question.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin relative z-10" />
              ) : (
                <Send className="w-6 h-6 relative z-10" />
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/50">
            <div className="flex space-x-2">
              {[
                "What's the main topic?",
                "Summarize this document",
                "Key findings?",
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuestion(suggestion)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 rounded-full text-sm hover:from-purple-100 hover:to-blue-100 transition-all duration-300 border border-purple-200/50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-400">
              Press Enter to send • Shift+Enter for new line
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>
            Powered by AI • Processing your PDF with advanced language models
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
