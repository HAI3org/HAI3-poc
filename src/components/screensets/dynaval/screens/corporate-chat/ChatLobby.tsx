import React, { useState } from 'react';
import { Plus, Users, Crown, MessageSquare, Settings, ArrowRight, Bot, Shield } from 'lucide-react';

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  participantCount: number;
  aiAgentCount: number;
  moderators: string[];
  participants: string[];
  isPrivate: boolean;
  lastActivity: Date;
  userRole: 'moderator' | 'participant';
}

interface ChatLobbyProps {
  onJoinChat: (chatId: string) => void;
  onCreateChat: () => void;
  currentUserId: string;
}

// Mock chat rooms data
const mockChatRooms: ChatRoom[] = [
  {
    id: 'q2-strategy',
    name: 'Q2 Product Strategy',
    description: 'Discussing mobile optimization vs AI features for Q2 roadmap',
    participantCount: 4,
    aiAgentCount: 3,
    moderators: ['sarah-johnson'],
    participants: ['sarah-johnson', 'mike-chen', 'david-kim', 'emily-rodriguez'],
    isPrivate: false,
    lastActivity: new Date(Date.now() - 300000), // 5 minutes ago
    userRole: 'moderator'
  },
  {
    id: 'tech-review',
    name: 'Technical Architecture Review',
    description: 'Weekly technical discussion with AI consultants',
    participantCount: 6,
    aiAgentCount: 2,
    moderators: ['mike-chen', 'alex-thompson'],
    participants: ['mike-chen', 'alex-thompson', 'sarah-johnson', 'david-kim', 'lisa-wang', 'james-brown'],
    isPrivate: false,
    lastActivity: new Date(Date.now() - 1800000), // 30 minutes ago
    userRole: 'participant'
  },
  {
    id: 'marketing-campaign',
    name: 'Q3 Marketing Campaign',
    description: 'Planning marketing strategy with creative AI assistance',
    participantCount: 5,
    aiAgentCount: 4,
    moderators: ['marketing-lead'],
    participants: ['marketing-lead', 'sarah-johnson', 'creative-director', 'content-manager', 'social-media-manager'],
    isPrivate: true,
    lastActivity: new Date(Date.now() - 3600000), // 1 hour ago
    userRole: 'participant'
  },
  {
    id: 'executive-briefing',
    name: 'Executive Strategy Briefing',
    description: 'High-level strategic discussions with AI analysis',
    participantCount: 3,
    aiAgentCount: 5,
    moderators: ['ceo', 'cto'],
    participants: ['ceo', 'cto', 'sarah-johnson'],
    isPrivate: true,
    lastActivity: new Date(Date.now() - 7200000), // 2 hours ago
    userRole: 'moderator'
  },
  {
    id: 'design-feedback',
    name: 'Design Review & Feedback',
    description: 'UX/UI design discussions with AI design assistants',
    participantCount: 4,
    aiAgentCount: 2,
    moderators: ['emily-rodriguez'],
    participants: ['emily-rodriguez', 'sarah-johnson', 'mike-chen', 'design-intern'],
    isPrivate: false,
    lastActivity: new Date(Date.now() - 10800000), // 3 hours ago
    userRole: 'participant'
  }
];

export const ChatLobby: React.FC<ChatLobbyProps> = ({
  onJoinChat,
  onCreateChat,
  currentUserId = 'sarah-johnson'
}) => {
  const [chatRooms] = useState<ChatRoom[]>(mockChatRooms);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'moderator' | 'participant'>('all');

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const filteredChats = chatRooms.filter(chat => {
    if (selectedFilter === 'all') return true;
    return chat.userRole === selectedFilter;
  });

  const getRoleIcon = (role: 'moderator' | 'participant') => {
    return role === 'moderator' ? Crown : Users;
  };

  const getRoleBadge = (role: 'moderator' | 'participant') => {
    if (role === 'moderator') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
          <Crown size={10} />
          Moderator
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
        <Users size={10} />
        Participant
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Corporate AI Chat Rooms</h1>
            <p className="text-gray-600 mt-1">Join conversations with your team and AI assistants</p>
          </div>
          <button
            onClick={onCreateChat}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            Create Chat Room
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mt-6 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'all', label: 'All Chats', icon: MessageSquare },
            { key: 'moderator', label: 'Moderating', icon: Crown },
            { key: 'participant', label: 'Participating', icon: Users }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedFilter(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedFilter === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Rooms List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 max-w-4xl">
          {filteredChats.map(chat => (
            <div
              key={chat.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onJoinChat(chat.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{chat.name}</h3>
                    {getRoleBadge(chat.userRole)}
                    {chat.isPrivate && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        <Shield size={10} />
                        Private
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4">{chat.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{chat.participantCount} participants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bot size={14} />
                      <span>{chat.aiAgentCount} AI agents</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Crown size={14} />
                      <span>{chat.moderators.length} moderator{chat.moderators.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div>
                      Last activity: {formatLastActivity(chat.lastActivity)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {chat.userRole === 'moderator' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle settings click
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Chat Settings"
                    >
                      <Settings size={16} />
                    </button>
                  )}
                  <ArrowRight size={20} className="text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredChats.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No chat rooms found</h3>
            <p className="text-gray-600 mb-4">
              {selectedFilter === 'all' 
                ? "There are no chat rooms available." 
                : `You are not ${selectedFilter === 'moderator' ? 'moderating' : 'participating in'} any chat rooms.`}
            </p>
            <button
              onClick={onCreateChat}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={16} />
              Create Your First Chat Room
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLobby;
