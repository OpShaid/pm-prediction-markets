import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/services/api'
import { Market } from '@/types'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  markets?: Market[]
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm PredictBot 🤖\n\nTry asking:\n• 'Show me popular markets'\n• 'What are the stats?'\n• 'How do I start?'",
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getBotResponse = async (userMessage: string): Promise<{ text: string; markets?: Market[] }> => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return { text: "Hello! I'm PredictBot. I can show you live markets, stats, or help you get started. Try asking about 'popular markets' or 'how to start trading'!" }
    }

    if (lowerMessage.includes('market') || lowerMessage.includes('show') || lowerMessage.includes('list') || lowerMessage.includes('popular')) {
      try {
        const response = await apiClient.getMarkets({ pageSize: 3 })
        const markets = response.data
        let text = `Here are ${markets.length} live markets right now:\n\n`
        markets.forEach((m: Market, i: number) => {
          const price = m.options?.[0]?.lastPrice || 0
          text += `${i + 1}. ${m.title}\n   Current: $${price.toFixed(2)} | Volume: $${m.totalVolume.toFixed(0)}\n`
        })
        text += `\nTotal markets available: ${response.total || 'Many'}`
        return { text, markets }
      } catch (error) {
        return { text: "I'm having trouble fetching live markets right now. Please try browsing the Markets page directly!" }
      }
    }

    if (lowerMessage.includes('stat') || lowerMessage.includes('volume') || lowerMessage.includes('user')) {
      return { text: "📊 PredictMarkets Stats:\n• $10M+ Total Trading Volume\n• 50,000+ Active Traders\n• 1,000+ Live Markets\n• Kalshi & Polymarket Integration\n\nWe're growing fast!" }
    }

    if (lowerMessage.includes('how') && (lowerMessage.includes('start') || lowerMessage.includes('begin'))) {
      return { text: "Getting started is easy!\n\n1. Sign up for a free account, or\n2. Try Guest Mode with $10,000 virtual funds\n3. Browse markets on the Markets page\n4. Place your first trade!\n\nGuest mode is perfect for learning without risk." }
    }

    if (lowerMessage.includes('guest') || lowerMessage.includes('demo')) {
      return { text: "Guest Mode gives you $10,000 virtual funds to explore PredictMarkets risk-free. Click 'Try Demo' on the home page to start!" }
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('what can you')) {
      return { text: "I can help you with:\n• Show live markets & prices\n• Platform statistics\n• Getting started guide\n• Trading info & fees\n• Account questions\n\nJust ask!" }
    }

    if (lowerMessage.includes('fee') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
      return { text: "Pricing:\n• Account creation: FREE\n• Guest mode: FREE\n• Trading fees: Competitive rates (vary by market)\n• No hidden charges!\n\nYou can trade risk-free in Guest Mode first." }
    }

    if (lowerMessage.includes('secure') || lowerMessage.includes('safe')) {
      return { text: "Security features:\n• Enterprise-grade encryption\n• Secure OAuth authentication\n• Regular security audits\n• Industry best practices\n\nYour data and funds are protected 24/7." }
    }

    if (lowerMessage.includes('kalshi') || lowerMessage.includes('polymarket')) {
      return { text: "We aggregate markets from both Kalshi and Polymarket, giving you access to thousands of prediction markets in one place. Trade on politics, sports, crypto, and more!" }
    }

    if (lowerMessage.includes('trade') || lowerMessage.includes('buy') || lowerMessage.includes('sell')) {
      return { text: "To trade:\n1. Go to Markets page\n2. Click on any market\n3. Choose Yes or No\n4. Enter your amount\n5. Confirm trade\n\nStart in Guest Mode to practice!" }
    }

    return { text: "I'm here to help! Try asking:\n• 'Show me popular markets'\n• 'What are the stats?'\n• 'How do I start trading?'\n\nWhat would you like to know?" }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    }

    const userInput = input
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate bot typing delay
    setTimeout(async () => {
      try {
        const response = await getBotResponse(userInput)
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response.text,
          sender: 'bot',
          timestamp: new Date(),
          markets: response.markets,
        }
        setMessages((prev) => [...prev, botResponse])
      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I encountered an error. Please try again!",
          sender: 'bot',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsTyping(false)
      }
    }, 800 + Math.random() * 700)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <>
      {/* Chatbot Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-xl bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 z-50 group transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </Button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-80 h-[450px] shadow-2xl border-2 border-border z-50 flex flex-col bg-background/95 backdrop-blur-xl animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="p-1.5 bg-white/20 backdrop-blur-xl rounded-full">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full border border-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">PredictBot</h3>
                <p className="text-[10px] text-white/80">Online</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide text-xs">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2 animate-slide-up',
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <div
                  className={cn(
                    'flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center',
                    message.sender === 'bot'
                      ? 'bg-gradient-to-r from-gray-700 to-gray-900'
                      : 'bg-gradient-to-r from-gray-600 to-gray-800'
                  )}
                >
                  {message.sender === 'bot' ? (
                    <Bot className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-white" />
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-3 py-2',
                    message.sender === 'bot'
                      ? 'bg-muted text-foreground'
                      : 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
                  )}
                >
                  <p className="whitespace-pre-line leading-relaxed text-xs">{message.text}</p>
                  <p
                    className={cn(
                      'text-[10px] mt-1',
                      message.sender === 'bot' ? 'text-muted-foreground' : 'text-white/70'
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 animate-slide-up">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="bg-muted rounded-2xl px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-muted/30">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 border-2 focus:border-white h-9 text-xs"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 transition-all hover:scale-105 h-9 w-9 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
