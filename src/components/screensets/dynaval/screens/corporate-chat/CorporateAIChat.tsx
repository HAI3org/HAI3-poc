import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Users, Plus, MessageSquare, Brain, Sparkles, Zap, Globe, ChevronDown, X, ArrowLeft, Settings, UserPlus, UserMinus, Shield } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isOnline: boolean;
}

interface AIAgent {
  id: string;
  name: string;
  model: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  isActive: boolean;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'employee' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface CorporateAIChatProps {
  chatId?: string | null;
  onBackToLobby?: () => void;
}

// Mock employees data
const mockEmployees: Employee[] = [
  {
    id: 'emp1',
    name: 'Sarah Johnson',
    role: 'Product Manager',
    avatar: 'SJ',
    isOnline: true
  },
  {
    id: 'emp2',
    name: 'Mike Chen',
    role: 'Lead Developer',
    avatar: 'MC',
    isOnline: true
  },
  {
    id: 'emp3',
    name: 'Emily Rodriguez',
    role: 'UX Designer',
    avatar: 'ER',
    isOnline: false
  },
  {
    id: 'emp4',
    name: 'David Kim',
    role: 'Data Scientist',
    avatar: 'DK',
    isOnline: true
  }
];

// Available AI agents
const availableAgents: AIAgent[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    model: 'DeepSeek-V2',
    description: 'Advanced reasoning and code analysis',
    icon: Brain,
    color: 'purple',
    isActive: false
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    model: 'GPT-4',
    description: 'Conversational AI and creative tasks',
    icon: MessageSquare,
    color: 'green',
    isActive: false
  },
  {
    id: 'gemini',
    name: 'Gemini',
    model: 'Gemini Pro',
    description: 'Multimodal AI and analysis',
    icon: Sparkles,
    color: 'blue',
    isActive: false
  },
  {
    id: 'claude',
    name: 'Claude',
    model: 'Claude-3',
    description: 'Helpful, harmless, and honest AI',
    icon: Zap,
    color: 'orange',
    isActive: false
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    model: 'Perplexity AI',
    description: 'Research and fact-checking',
    icon: Globe,
    color: 'teal',
    isActive: false
  }
];

// Mock ongoing conversation
const mockMessages: Message[] = [
  {
    id: 'msg1',
    senderId: 'emp1',
    senderName: 'Sarah Johnson',
    senderType: 'employee',
    content: "Hey team! I've been thinking about our Q2 product roadmap. We need to decide between focusing on mobile optimization or adding AI features to our platform.",
    timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
  },
  {
    id: 'msg2',
    senderId: 'emp2',
    senderName: 'Mike Chen',
    senderType: 'employee',
    content: "From a technical perspective, the AI features would require significant backend changes. Mobile optimization might be more achievable in Q2.",
    timestamp: new Date(Date.now() - 1680000) // 28 minutes ago
  },
  {
    id: 'msg3',
    senderId: 'emp4',
    senderName: 'David Kim',
    senderType: 'employee',
    content: "I've been analyzing our user data. 68% of our traffic comes from mobile devices, but engagement drops by 40% compared to desktop. That's a significant opportunity cost.",
    timestamp: new Date(Date.now() - 1560000) // 26 minutes ago
  },
  {
    id: 'msg4',
    senderId: 'emp1',
    senderName: 'Sarah Johnson',
    senderType: 'employee',
    content: "That's a compelling data point, David. But our competitors are already rolling out AI features. We risk falling behind if we don't innovate.",
    timestamp: new Date(Date.now() - 1440000) // 24 minutes ago
  },
  {
    id: 'msg5',
    senderId: 'emp2',
    senderName: 'Mike Chen',
    senderType: 'employee',
    content: "What if we could do a phased approach? Start with mobile optimization in Q2, then AI features in Q3?",
    timestamp: new Date(Date.now() - 1320000) // 22 minutes ago
  }
];

export const CorporateAIChat: React.FC<CorporateAIChatProps> = ({ 
  chatId, 
  onBackToLobby 
}) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [employees] = useState<Employee[]>(mockEmployees);
  const [agents, setAgents] = useState<AIAgent[]>(availableAgents);
  const [newMessage, setNewMessage] = useState('');
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isRequestingOpinion, setIsRequestingOpinion] = useState(false);
  const [showOnlineMenu, setShowOnlineMenu] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<'moderator' | 'participant'>('moderator'); // Based on chatId
  const [showManagementPanel, setShowManagementPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `msg${Date.now()}`,
      senderId: 'current-user',
      senderName: 'You',
      senderType: 'employee',
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);

    // Check if message contains @mention for AI agent
    const mentionMatch = newMessage.match(/@(\w+)/);
    if (mentionMatch) {
      const mentionedAgentName = mentionMatch[1];
      const mentionedAgent = agents.find(agent => 
        agent.name.toLowerCase().replace(/\s+/g, '').includes(mentionedAgentName.toLowerCase()) ||
        agent.name.toLowerCase() === mentionedAgentName.toLowerCase()
      );
      
      if (mentionedAgent && mentionedAgent.isActive) {
        // Simulate AI response after a short delay
        setTimeout(() => {
          simulateAgentResponse(mentionedAgent.id);
        }, 1500);
      }
    }

    setNewMessage('');
  };

  const toggleAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, isActive: !agent.isActive }
        : agent
    ));
  };

  const addAgentMention = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    // Add @mention to the input field
    setNewMessage(prev => prev + `@${agent.name} `);
  };

  const requestAgentOpinion = async (agentId: string) => {
    simulateAgentResponse(agentId);
  };

  const simulateAgentResponse = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    setIsRequestingOpinion(true);
    setSelectedAgent(agentId);

    // Add typing indicator
    const typingMessage: Message = {
      id: `typing-${agentId}`,
      senderId: agentId,
      senderName: agent.name,
      senderType: 'ai',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, typingMessage]);

    // Simulate AI response delay
    setTimeout(() => {
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== `typing-${agentId}`));

      // Add AI response based on agent type
      const responses = {
        deepseek: "Based on the technical complexity analysis, I recommend prioritizing mobile optimization first. The 40% engagement drop represents immediate revenue impact. AI features, while important for competitive positioning, require 3-4x more development resources. A phased approach would optimize ROI: Q2 mobile optimization could increase engagement by 25-30%, providing resources for Q3 AI implementation.",
        chatgpt: "This is a classic strategic dilemma! Looking at both perspectives, I'd suggest a hybrid approach. Consider implementing lightweight AI features (like smart search or basic recommendations) alongside mobile optimization. This gives you competitive differentiation without the full technical overhead. The key is finding AI features that enhance the mobile experience rather than competing with it for resources.",
        gemini: "Analyzing the conversation data and market trends, mobile optimization should be the priority. The 68% mobile traffic with 40% engagement drop indicates a critical user experience gap. However, consider AI-powered mobile features like intelligent content curation or predictive user interfaces. This combines both initiatives while addressing the core mobile engagement issue.",
        claude: "I appreciate the thoughtful discussion here. From a strategic standpoint, the data strongly supports mobile optimization as the foundation. Poor mobile experience will undermine any AI features you add later. However, I'd recommend conducting user interviews to understand *why* mobile engagement drops. Sometimes the solution isn't just optimization but reimagining the mobile experience entirely.",
        perplexity: "Research shows that mobile optimization typically yields 15-25% engagement improvements within 2-3 months, while AI feature adoption takes 6-12 months to show measurable impact. Current market analysis indicates that 73% of users prioritize performance over advanced features. Given your 40% mobile engagement drop, addressing this foundational issue first would likely provide better short-term and long-term ROI."
      };

      const aiResponse: Message = {
        id: `ai-${agentId}-${Date.now()}`,
        senderId: agentId,
        senderName: agent.name,
        senderType: 'ai',
        content: responses[agentId as keyof typeof responses] || "I'd be happy to provide my perspective on this discussion.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsRequestingOpinion(false);
      setSelectedAgent(null);
    }, 2000 + Math.random() * 2000); // 2-4 second delay
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getAgentColor = (color: string) => {
    const colors = {
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      orange: 'bg-orange-500',
      teal: 'bg-teal-500'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBackToLobby && (
              <button
                onClick={onBackToLobby}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Chat Lobby"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">Q2 Product Strategy</h1>
              <p className="text-sm text-gray-600">Corporate AI Chat Room</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Active Agents */}
            <div className="flex items-center gap-2">
              {agents.filter(agent => agent.isActive).map(agent => {
                const IconComponent = agent.icon;
                return (
                  <button
                    key={agent.id}
                    onClick={() => addAgentMention(agent.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs hover:opacity-80 transition-opacity cursor-pointer ${getAgentColor(agent.color)}`}
                    title={`Mention ${agent.name}`}
                  >
                    <IconComponent size={12} />
                    <span>{agent.name}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Participants */}
            <div className="relative">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                onMouseEnter={() => setShowOnlineMenu(true)}
                onMouseLeave={() => setShowOnlineMenu(false)}
              >
                <Users size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  {employees.filter(emp => emp.isOnline).length} online
                </span>
              </div>

              {/* Online Users Menu */}
              {showOnlineMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Online Participants</h3>
                    <div className="space-y-2">
                      {employees.filter(emp => emp.isOnline).map(employee => (
                        <div key={employee.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700">
                            {employee.avatar}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                            <p className="text-xs text-gray-500">{employee.role}</p>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Management Panel (Moderator Only) */}
            {currentUserRole === 'moderator' && (
              <button
                onClick={() => setShowManagementPanel(!showManagementPanel)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                title="Manage Participants & AI Agents"
              >
                <Settings size={16} />
                <span>Manage</span>
              </button>
            )}

            {/* Agent Panel Toggle */}
            <button
              onClick={() => setShowAgentPanel(!showAgentPanel)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Bot size={16} />
              <span>AI Agents</span>
              <ChevronDown size={14} className={`transition-transform ${showAgentPanel ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Management Panel (Moderator Only) */}
        {showManagementPanel && currentUserRole === 'moderator' && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={16} className="text-purple-600" />
              Chat Management
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Participant Management */}
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-3 flex items-center gap-2">
                  <Users size={14} />
                  Participants
                </h4>
                <div className="space-y-2 mb-3">
                  {employees.map(employee => (
                    <div key={employee.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700">
                          {employee.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                          <p className="text-xs text-gray-500">{employee.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Remove participant"
                        >
                          <UserMinus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                  <UserPlus size={14} />
                  Add Participant
                </button>
              </div>

              {/* AI Agent Management */}
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-3 flex items-center gap-2">
                  <Bot size={14} />
                  AI Agents
                </h4>
                <div className="space-y-2">
                  {agents.map(agent => {
                    const IconComponent = agent.icon;
                    return (
                      <div
                        key={agent.id}
                        className={`p-2 rounded border transition-colors ${
                          agent.isActive 
                            ? 'bg-white border-blue-300' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${getAgentColor(agent.color)}`}>
                              <IconComponent size={12} className="text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                              <p className="text-xs text-gray-500">{agent.model}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleAgent(agent.id)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              agent.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {agent.isActive ? 'Remove' : 'Add'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agent Panel */}
        {showAgentPanel && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-medium text-gray-900 mb-3">Available AI Agents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {agents.map(agent => {
                const IconComponent = agent.icon;
                return (
                  <div
                    key={agent.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      agent.isActive 
                        ? 'bg-white border-blue-300 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getAgentColor(agent.color)}`}>
                          <IconComponent size={16} className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-900">{agent.name}</h4>
                          <p className="text-xs text-gray-500">{agent.model}</p>
                        </div>
                      </div>
                      {currentUserRole === 'participant' && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          agent.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {agent.isActive ? 'Active' : 'Inactive'}
                        </span>
                      )}
                      {currentUserRole === 'moderator' && (
                        <button
                          onClick={() => toggleAgent(agent.id)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            agent.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {agent.isActive ? 'Remove' : 'Add'}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{agent.description}</p>
                    {agent.isActive && (
                      <button
                        onClick={() => requestAgentOpinion(agent.id)}
                        disabled={isRequestingOpinion}
                        className="w-full px-3 py-2 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {selectedAgent === agent.id ? 'Thinking...' : 'Ask for Opinion'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => {
          const isAI = message.senderType === 'ai';
          const agent = isAI ? agents.find(a => a.id === message.senderId) : null;
          
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.senderId === 'current-user' ? 'flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                isAI 
                  ? `${getAgentColor(agent?.color || 'gray')} text-white`
                  : message.senderId === 'current-user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-700'
              }`}>
                {isAI ? (
                  agent ? React.createElement(agent.icon, { size: 14 }) : <Bot size={14} />
                ) : (
                  message.senderId === 'current-user' 
                    ? 'You'
                    : employees.find(emp => emp.id === message.senderId)?.avatar || 'U'
                )}
              </div>

              {/* Message */}
              <div className={`flex-1 max-w-2xl ${
                message.senderId === 'current-user' ? 'text-right' : ''
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {message.senderName}
                  </span>
                  {isAI && (
                    <span className={`px-2 py-0.5 rounded-full text-xs text-white ${getAgentColor(agent?.color || 'gray')}`}>
                      AI Agent
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                {message.isTyping ? (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                ) : (
                  <div className={`rounded-lg p-3 ${
                    isAI
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
                      : message.senderId === 'current-user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-200'
                  }`}>
                    <p className={`text-sm ${
                      message.senderId === 'current-user' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {message.content}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorporateAIChat;
