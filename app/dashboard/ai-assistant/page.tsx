"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Lightbulb,
  TrendingUp,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Search,
  Zap
} from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your AI assistant for the Grievance Management System. I can help you with:\n\n• Querying grievance data and statistics\n• Analyzing trends and patterns\n• Generating reports and insights\n• Answering questions about the system\n• Providing recommendations\n\nWhat would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "Show me recent grievances",
        "What are the most common issues?",
        "Generate a performance report",
        "How many grievances are pending?"
      ]
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const quickQueries = [
    {
      title: "Grievance Overview",
      query: "Show me a summary of all grievances by status",
      icon: FileText
    },
    {
      title: "Performance Metrics",
      query: "What are the current performance metrics?",
      icon: TrendingUp
    },
    {
      title: "Category Analysis",
      query: "Which categories have the most grievances?",
      icon: BarChart3
    },
    {
      title: "Officer Workload",
      query: "Show me officer workload distribution",
      icon: Users
    },
    {
      title: "Response Times",
      query: "What are the average response times?",
      icon: Clock
    },
    {
      title: "Trends",
      query: "Show me grievance trends over the last month",
      icon: TrendingUp
    }
  ]

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
        suggestions: [
          "Show me more details",
          "Generate a report",
          "What are the trends?",
          "Compare with last month"
        ]
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes("recent") || lowerQuery.includes("latest")) {
      return `Here are the recent grievances:\n\n• **GRV-001**: Road Repair on Main Street (In Progress)\n• **GRV-002**: Water Supply Disruption (Pending)\n• **GRV-003**: Street Light Repair (Resolved)\n• **GRV-004**: Garbage Collection Issue (In Progress)\n\nTotal: 4 grievances in the last 7 days.`
    }
    
    if (lowerQuery.includes("performance") || lowerQuery.includes("metrics")) {
      return `**Current Performance Metrics:**\n\n• **Resolution Rate**: 92.8%\n• **Average Response Time**: 2.3 days\n• **Citizen Satisfaction**: 94.2%\n• **Pending Grievances**: 89\n• **In Progress**: 156\n• **Resolved This Month**: 1,158\n\nPerformance is above target in all categories.`
    }
    
    if (lowerQuery.includes("category") || lowerQuery.includes("categories")) {
      return `**Grievance Distribution by Category:**\n\n• **Infrastructure**: 456 grievances (36.6%)\n• **Utilities**: 234 grievances (18.8%)\n• **Healthcare**: 189 grievances (15.2%)\n• **Education**: 156 grievances (12.5%)\n• **Others**: 212 grievances (17.0%)\n\nInfrastructure issues are the most common, followed by utilities.`
    }
    
    if (lowerQuery.includes("officer") || lowerQuery.includes("workload")) {
      return `**Officer Workload Distribution:**\n\n• **Officer Kumar**: 45 active grievances\n• **Officer Sharma**: 38 active grievances\n• **Officer Patel**: 42 active grievances\n• **Officer Reddy**: 31 active grievances\n\nAll officers are within acceptable workload limits.`
    }
    
    if (lowerQuery.includes("trend") || lowerQuery.includes("month")) {
      return `**Grievance Trends (Last 30 Days):**\n\n• **Total Received**: 1,247 (+12% vs last month)\n• **Resolved**: 1,158 (+8% vs last month)\n• **Average Resolution Time**: 3.2 days (-0.5 days)\n• **Top Category**: Infrastructure (456 grievances)\n• **Peak Day**: Tuesday (average 45 grievances)\n\nOverall performance is improving month-over-month.`
    }
    
    return `I understand you're asking about "${query}". Let me provide you with relevant information from the grievance management system. Could you please be more specific about what data or insights you're looking for? I can help with statistics, trends, reports, and analysis.`
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const handleQuickQuery = (query: string) => {
    setInputValue(query)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Assistant</h2>
          <p className="text-gray-600">ChatGPT-like interface for grievance management queries</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            AI Powered
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Assistant Chat
              </CardTitle>
              <CardDescription>
                Ask questions about grievances, performance, and system data
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === "assistant" 
                          ? "bg-blue-100 text-blue-600" 
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {message.type === "assistant" ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`rounded-lg p-3 ${
                          message.type === "assistant" 
                            ? "bg-blue-50 border border-blue-200" 
                            : "bg-gray-50 border border-gray-200"
                        }`}>
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                        </div>
                        {message.suggestions && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="text-xs"
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-gray-600">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="mt-4 flex gap-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about grievances, performance, or system data..."
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Queries Sidebar */}
        <div className="space-y-6">
          {/* Quick Queries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Quick Queries
              </CardTitle>
              <CardDescription>
                Common questions and insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => handleQuickQuery(query.query)}
                >
                  <div className="flex items-start gap-3">
                    <query.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{query.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{query.query}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* System Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Grievances</span>
                <Badge variant="secondary">1,247</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending</span>
                <Badge variant="destructive">89</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">In Progress</span>
                <Badge variant="default">156</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Resolved</span>
                <Badge variant="outline" className="border-green-500 text-green-700">1,158</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Response Time</span>
                <span className="text-sm font-medium">2.3 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Satisfaction Rate</span>
                <span className="text-sm font-medium">94.2%</span>
              </div>
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Data Analysis
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Trend Detection
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Report Generation
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Performance Insights
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Recommendations
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
