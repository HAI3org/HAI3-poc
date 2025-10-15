import React, { useMemo, useState } from 'react';
import { Users, MessagesSquare, Cpu, BarChart2, ChevronRight } from 'lucide-react';

// Types for audit data
interface User {
  id: string;
  user: string;
  org_unit: string;
  chats: number;
  messages: number;
  tokens: number;
  tokensPerMsg: number;
  likes: number;
  dislikes: number;
}

interface Conversation {
  id: string;
  user: string;
  org_unit: string;
  title: string;
  lastMessage: string;
  totalTokens: number;
  likes: number;
  dislikes: number;
}

interface Model {
  id: string;
  vendor: string;
  model: string;
  sizeGB: number;
  lastMessage: string;
  messages: number;
  tokens: number;
  likes: number;
  dislikes: number;
}

interface AuditProps {
  setActiveTab?: (tab: string) => void;
}

interface TabButtonProps {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
}

const Audit: React.FC<AuditProps> = (props) => {
  const { setActiveTab } = props;

  const [tab, setTab] = useState<'users' | 'conversations' | 'models'>('users');
  const [userQuery, setUserQuery] = useState<string>('');
  const [conversationQuery, setConversationQuery] = useState<string>('');
  const [modelQuery, setModelQuery] = useState<string>('');

  // Mock data
  const users: User[] = [
    { id: 'u1', user: 'alice', org_unit: 'Engineering', chats: 12, messages: 248, tokens: 154_320, tokensPerMsg: 622, likes: 34, dislikes: 2 },
    { id: 'u2', user: 'bob', org_unit: 'Support', chats: 7, messages: 98, tokens: 43_510, tokensPerMsg: 444, likes: 12, dislikes: 1 },
    { id: 'u3', user: 'carol', org_unit: 'Design', chats: 19, messages: 410, tokens: 286_002, tokensPerMsg: 697, likes: 55, dislikes: 4 },
  ];

  const conversations: Conversation[] = [
    { id: 'c1', user: 'alice', org_unit: 'Engineering', title: 'Refactor data layer', lastMessage: 'Looks good, ship it.', totalTokens: 12_540, likes: 8, dislikes: 0 },
    { id: 'c2', user: 'bob', org_unit: 'Support', title: 'Debug Node memory leak', lastMessage: 'Try heap snapshots.', totalTokens: 8_322, likes: 3, dislikes: 1 },
    { id: 'c3', user: 'carol', org_unit: 'Design', title: 'Design system tokens', lastMessage: 'Adopt semantic colors.', totalTokens: 15_910, likes: 10, dislikes: 0 },
  ];

  const models: Model[] = [
    { id: 'm1', vendor: 'OpenAI', model: 'GPT-4 Turbo', sizeGB: 24, lastMessage: 'Generate test cases', messages: 1200, tokens: 640_000, likes: 120, dislikes: 6 },
    { id: 'm2', vendor: 'Anthropic', model: 'Claude 3 Opus', sizeGB: 48, lastMessage: 'Summarize PR', messages: 870, tokens: 510_400, likes: 95, dislikes: 3 },
    { id: 'm3', vendor: 'Meta', model: 'Llama 3 70B', sizeGB: 64, lastMessage: 'Explain algorithm', messages: 560, tokens: 302_210, likes: 60, dislikes: 5 },
  ];

  const numberFmt = (n: number): string => n.toLocaleString();

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      (u.user && u.user.toLowerCase().includes(q)) ||
      (u.org_unit && u.org_unit.toLowerCase().includes(q))
    );
  }, [userQuery, users]);

  const filteredConversations = useMemo(() => {
    const q = conversationQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      (c.user && c.user.toLowerCase().includes(q)) ||
      (c.org_unit && c.org_unit.toLowerCase().includes(q))
    );
  }, [conversationQuery, conversations]);

  const filteredModels = useMemo(() => {
    const q = modelQuery.trim().toLowerCase();
    if (!q) return models;
    return models.filter((m) =>
      (m.vendor && m.vendor.toLowerCase().includes(q)) ||
      (m.model && m.model.toLowerCase().includes(q))
    );
  }, [modelQuery, models]);

  const TabButton: React.FC<TabButtonProps> = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setTab(id as 'users' | 'conversations' | 'models')}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${tab === id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div className="h-full w-full flex flex-col p-4 gap-4 overflow-y-auto">
      <div className="hx-card">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold inline-flex items-center gap-2">
            <BarChart2 size={16} /> Audit
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <TabButton id="users" icon={Users} label="Users" />
          <TabButton id="conversations" icon={MessagesSquare} label="Conversations" />
          <TabButton id="models" icon={Cpu} label="Models" />
        </div>
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="hx-card overflow-auto">
          <div className="mb-2">
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Search user or org unit..."
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase">
                <th>User</th>
                <th>Org unit</th>
                <th>Chat sessions</th>
                <th>Messages</th>
                <th>Tokens</th>
                <th>Tokens/message</th>
                <th>Likes</th>
                <th>Dislikes</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.user}</td>
                  <td>{u.org_unit}</td>
                  <td>{numberFmt(u.chats)}</td>
                  <td>{numberFmt(u.messages)}</td>
                  <td>{numberFmt(u.tokens)}</td>
                  <td>{numberFmt(u.tokensPerMsg)}</td>
                  <td>{numberFmt(u.likes)}</td>
                  <td>{numberFmt(u.dislikes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Conversations Tab */}
      {tab === 'conversations' && (
        <div className="hx-card overflow-auto">
          <div className="mb-2">
            <input
              type="text"
              value={conversationQuery}
              onChange={(e) => setConversationQuery(e.target.value)}
              placeholder="Search user or org unit..."
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500">
                <th>User</th>
                <th>Org unit</th>
                <th>Chat title</th>
                <th>Last message</th>
                <th>Total tokens</th>
                <th>Total likes</th>
                <th>Total dislikes</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredConversations.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setActiveTab && setActiveTab('chat')}>
                  <td>{c.user}</td>
                  <td>{c.org_unit}</td>
                  <td>{c.title}</td>
                  <td>{c.lastMessage}</td>
                  <td>{numberFmt(c.totalTokens)}</td>
                  <td>{numberFmt(c.likes)}</td>
                  <td>{numberFmt(c.dislikes)}</td>
                  <td><ChevronRight size={16} className="text-gray-400" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Models Tab */}
      {tab === 'models' && (
        <div className="hx-card overflow-auto">
          <div className="mb-2">
            <input
              type="text"
              value={modelQuery}
              onChange={(e) => setModelQuery(e.target.value)}
              placeholder="Search vendor or model..."
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500">
                <th>Vendor</th>
                <th>Model</th>
                <th>Model size (GB)</th>
                <th>Last message</th>
                <th>Messages total</th>
                <th>Tokens total</th>
                <th>Total likes</th>
                <th>Total dislikes</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredModels.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td>{m.vendor}</td>
                  <td>{m.model}</td>
                  <td>{m.sizeGB}</td>
                  <td>{m.lastMessage}</td>
                  <td>{numberFmt(m.messages)}</td>
                  <td>{numberFmt(m.tokens)}</td>
                  <td>{numberFmt(m.likes)}</td>
                  <td>{numberFmt(m.dislikes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Audit;
