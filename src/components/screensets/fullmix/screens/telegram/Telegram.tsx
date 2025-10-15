import React, { useMemo, useState } from 'react';
import { Send, Search, Filter, MessageSquare, Users, Smile, Bot, Target, TrendingUp, TrendingDown, RefreshCw, Repeat2, Heart } from 'lucide-react';
import { Card, CardHeader, CardDescription, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';

interface Message {
  id: string;
  datetime: string;
  text: string;
  mood: number; // 0-100 positive index
  agreement: number; // 0-100 agreement index
  reposts: number; // Number of reposts to public chats
  reactions: number; // Number of reactions to the message
}

const mockMessages: Message[] = [
  { id: 't2m1', datetime: '2025-08-29T10:12:00Z', text: 'Shipped new documents flow. Thoughts?', mood: 72, agreement: 78, reposts: 24, reactions: 156 },
  { id: 't2m2', datetime: '2025-08-28T18:42:00Z', text: 'Roadmap update: Git Assistant preview.', mood: 63, agreement: 69, reposts: 18, reactions: 132 },
  { id: 't2m3', datetime: '2025-08-28T07:05:00Z', text: 'What metrics matter most to you?', mood: 58, agreement: 61, reposts: 12, reactions: 89 },
  { id: 't2m4', datetime: '2025-08-27T21:17:00Z', text: 'Docs Q&A received new adjudication tooling.', mood: 60, agreement: 66, reposts: 8, reactions: 76 },
  { id: 't2m5', datetime: '2025-08-26T16:20:00Z', text: 'Real-time collaboration is live!', mood: 76, agreement: 81, reposts: 31, reactions: 203 },
  { id: 't2m6', datetime: '2025-08-26T09:45:00Z', text: 'Performance improvements: 40% faster loading.', mood: 78, agreement: 82, reposts: 27, reactions: 189 },
  { id: 't2m7', datetime: '2025-08-25T14:30:00Z', text: 'Security update: 2FA now required for admins.', mood: 58, agreement: 68, reposts: 9, reactions: 67 },
  { id: 't2m8', datetime: '2025-08-25T08:15:00Z', text: 'Bug fixes: uploads and search stability.', mood: 64, agreement: 71, reposts: 14, reactions: 102 },
  { id: 't2m9', datetime: '2025-08-24T19:50:00Z', text: 'Community feedback session next Tuesday 3pm PT.', mood: 67, agreement: 73, reposts: 16, reactions: 124 },
  { id: 't2m10', datetime: '2025-08-24T09:10:00Z', text: 'Docs: new API endpoints for webhooks.', mood: 61, agreement: 65, reposts: 11, reactions: 85 },
];

type Severity = 'high' | 'medium' | 'low';
type ActionType = 'request' | 'moderation' | 'content';

interface ActionItem {
  id: number;
  type: ActionType;
  severity: Severity;
  message: string;
  evidence: string;
  recommendation: string;
}

const mockActions: ActionItem[] = [
  { id: 1, type: 'request', severity: 'high', message: 'Users request a pinned onboarding post', evidence: '23 comments in last post', recommendation: 'Create and pin an onboarding guide' },
  { id: 2, type: 'moderation', severity: 'medium', message: 'Toxic thread in Post #482 comments', evidence: '6 toxic msgs, 2 users repeating', recommendation: 'Soft-warn users, tighten filter for 24h' },
  { id: 3, type: 'content', severity: 'low', message: 'Interest in roadmap timelines', evidence: 'Most liked comment asks ETA', recommendation: 'Publish a short roadmap update' },
  { id: 4, type: 'request', severity: 'low', message: 'Dark theme tweaks requested', evidence: '12 mentions of contrast', recommendation: 'Adjust background/border contrast by 5%' },
  { id: 5, type: 'moderation', severity: 'high', message: 'Spam links detected overnight', evidence: '4 domains flagged', recommendation: 'Add domains to denylist, notify admins' },
];

export default function Telegram2(): React.ReactElement {
  // Filters for Messages
  const [filter, setFilter] = useState<'all' | 'high-agreement' | 'high-mood'>('all');
  const [messageSearch, setMessageSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 5;

  const filteredMessages = useMemo(() => {
    let res = mockMessages;
    if (messageSearch) {
      const q = messageSearch.toLowerCase();
      res = res.filter(m => m.text.toLowerCase().includes(q) || new Date(m.datetime).toLocaleString().toLowerCase().includes(q));
    }
    if (filter === 'high-agreement') res = res.filter(m => m.agreement >= 70);
    if (filter === 'high-mood') res = res.filter(m => m.mood >= 70);
    return res;
  }, [messageSearch, filter]);

  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage) || 1;
  const paginatedMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * messagesPerPage;
    return filteredMessages.slice(startIndex, startIndex + messagesPerPage);
  }, [filteredMessages, currentPage]);

  // Action Items filtering
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all');
  const [actionSearch, setActionSearch] = useState('');

  const filteredActions = useMemo(() => {
    return mockActions
      .filter(a => severityFilter === 'all' || a.severity === severityFilter)
      .filter(a => !actionSearch || a.message.toLowerCase().includes(actionSearch.toLowerCase()));
  }, [severityFilter, actionSearch]);

  return (
    <div className="h-full w-full flex-1 flex flex-col min-h-0 gap-4 p-4 ui-bg overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send size={18} className="opacity-80" />
          <h2 className="text-sm font-semibold">Telegram — Channel Insights</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg border ui-border">
            <Filter size={14} className="opacity-70" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'high-agreement' | 'high-mood')}
              className="text-sm bg-transparent outline-none ui-fg"
            >
              <option value="all">All</option>
              <option value="high-agreement">High agreement</option>
              <option value="high-mood">High mood</option>
            </select>
          </div>
          <Button variant="outline" className="h-8" onClick={() => { setFilter('all'); setMessageSearch(''); setCurrentPage(1); }}>Reset</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <CardHeader className="mb-1"><Users size={14}/> Audience</CardHeader>
          <CardTitle>12,450 <span className="text-xs font-normal opacity-70">active</span></CardTitle>
          <CardDescription>3,750 inactive • 3.2% 7d growth</CardDescription>
        </Card>
        <Card className="p-4">
          <CardHeader className="mb-1"><Bot size={14}/> Suspected bots</CardHeader>
          <CardTitle>640</CardTitle>
          <CardDescription>Confidence 82%</CardDescription>
        </Card>
        <Card className="p-4">
          <CardHeader className="mb-1"><Smile size={14}/> Mood</CardHeader>
          <CardTitle>62% positive</CardTitle>
          <CardDescription>23% neutral • 15% negative</CardDescription>
        </Card>
        <Card className="p-4">
          <CardHeader className="mb-1"><Target size={14}/> Alignment</CardHeader>
          <CardTitle>71% agreement</CardTitle>
          <CardDescription>12% polarization</CardDescription>
        </Card>
      </div>

      {/* Supporters */}
      <Card className="p-4">
        <CardHeader className="mb-2"><Users size={14} /> Supporters</CardHeader>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
          <div>
            <div className="opacity-70 mb-1">Core</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold">1,480</div>
              <span className="flex items-center gap-1 text-xs ui-accent rounded-full px-1.5 py-0.5"><TrendingUp size={12}/> +2.3%</span>
            </div>
          </div>
          <div>
            <div className="opacity-70 mb-1">Advocates</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold">220</div>
              <span className="flex items-center gap-1 text-xs ui-secondary rounded-full px-1.5 py-0.5"><TrendingDown size={12}/> -0.8%</span>
            </div>
          </div>
          <div>
            <div className="opacity-70 mb-1">Influencers</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold">35</div>
              <span className="flex items-center gap-1 text-xs ui-secondary rounded-full px-1.5 py-0.5"><TrendingUp size={12}/> +0.4%</span>
            </div>
          </div>
          <div>
            <div className="opacity-70 mb-1 flex items-center gap-1"><Repeat2 size={12}/> Total Reposts</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold">{mockMessages.reduce((sum, m) => sum + m.reposts, 0)}</div>
              <span className="flex items-center gap-1 text-xs ui-accent rounded-full px-1.5 py-0.5"><TrendingUp size={12}/> +5.2%</span>
            </div>
          </div>
          <div>
            <div className="opacity-70 mb-1 flex items-center gap-1"><Heart size={12}/> Total Reactions</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold">{mockMessages.reduce((sum, m) => sum + m.reactions, 0)}</div>
              <span className="flex items-center gap-1 text-xs ui-accent rounded-full px-1.5 py-0.5"><TrendingUp size={12}/> +7.8%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Messages table */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs opacity-70"><MessageSquare size={14} /> Recent messages</div>
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg border ui-border">
            <Search size={14} className="opacity-70" />
            <Input
              className="text-sm bg-transparent border-none px-0 py-0 h-6"
              placeholder="Search messages..."
              value={messageSearch}
              onChange={(e) => { setMessageSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left opacity-70">
                <th className="py-2 pr-4">Date/Time</th>
                <th className="py-2 pr-4">Message</th>
                <th className="py-2 pr-4">Mood</th>
                <th className="py-2 pr-4">Agreement</th>
                <th className="py-2 pr-4">Reposts</th>
                <th className="py-2 pr-4">Reactions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMessages.map(m => (
                <tr key={m.id} className="border-t ui-border align-top">
                  <td className="py-2 pr-4 whitespace-nowrap opacity-90">{new Date(m.datetime).toLocaleString()}</td>
                  <td className="py-2 pr-4">
                    <div className="line-clamp-2 opacity-95">{m.text}</div>
                  </td>
                  <td className="py-2 pr-4">
                    <Badge variant="secondary">{m.mood}% pos</Badge>
                  </td>
                  <td className="py-2 pr-4">
                    <Badge variant="accent">{m.agreement}% agree</Badge>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-1">
                      <Repeat2 size={12} className="opacity-60" />
                      <span className="font-medium">{m.reposts}</span>
                    </div>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-1">
                      <Heart size={12} className="opacity-60" />
                      <span className="font-medium">{m.reactions}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedMessages.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center opacity-70">No messages found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t ui-border">
            <div className="text-xs opacity-70">
              Showing {((currentPage - 1) * messagesPerPage) + 1} to {Math.min(currentPage * messagesPerPage, filteredMessages.length)} of {filteredMessages.length}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-8"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >Previous</Button>
              <div className="text-xs opacity-80">Page {currentPage} of {totalPages}</div>
              <Button variant="outline" className="h-8"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* AI-Generated Action Items */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs opacity-70">AI-Generated Action Items</div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg border ui-border">
              <Filter size={14} className="opacity-70" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')}
                className="text-sm bg-transparent outline-none ui-fg"
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg border ui-border">
              <Search size={14} className="opacity-70" />
              <Input
                className="text-sm bg-transparent border-none px-0 py-0 h-6"
                placeholder="Search actions..."
                value={actionSearch}
                onChange={(e) => setActionSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {filteredActions.map((action) => (
            <div key={action.id} className="border ui-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-1 rounded font-medium ${
                    action.severity === 'high' ? 'ui-destructive' : action.severity === 'medium' ? 'ui-accent' : 'ui-secondary'
                  }`}>
                    {action.severity.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded font-medium ${
                    action.type === 'request' ? 'ui-secondary' : action.type === 'moderation' ? 'ui-accent' : 'ui-primary'
                  }`}>
                    {action.type}
                  </span>
                </div>
                <RefreshCw size={16} className="opacity-60" />
              </div>
              <div className="text-sm font-medium mb-1">{action.message}</div>
              <div className="text-xs opacity-70 mb-2">Evidence: {action.evidence}</div>
              <div className="text-xs ui-accent rounded p-2">
                <strong>Recommendation:</strong> {action.recommendation}
              </div>
            </div>
          ))}
          {filteredActions.length === 0 && (
            <div className="text-center py-6 opacity-70 text-sm">No action items found</div>
          )}
        </div>
      </Card>
    </div>
  );
}
