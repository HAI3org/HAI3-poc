// Simulated backend API for chat functionality
import { ChatTitle, Message, ChatThread, ChatMessage, ChatThreadAPIResponse, ChatMessageAPIResponse } from './types';
import { CHAT_THREADS_DATA, ALL_CHAT_MESSAGES, formatTimestamp, getChatPreview } from './content';

// UUID generation utility
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper function to convert ChatThread to ChatTitle (for backward compatibility)
const chatThreadToChatTitle = (thread: ChatThread): ChatTitle => {
  const result = {
    id: thread.id,
    title: thread.title,
    timestamp: formatTimestamp(thread.last_msg_at),
    preview: getChatPreview(thread.id)
  };
  console.log('🔄 chatThreadToChatTitle:', {
    threadId: thread.id,
    threadTitle: thread.title,
    result
  });
  return result;
};

// Helper function to convert ChatMessage to Message (for backward compatibility)
const chatMessageToMessage = (chatMessage: ChatMessage): Message => ({
  id: chatMessage.id,
  type: chatMessage.role as 'user' | 'assistant',
  content: chatMessage.content,
  timestamp: new Date(chatMessage.created_at),
  files: chatMessage.is_file_attachment ? [{
    id: generateUUID(),
    name: chatMessage.attached_file_name || 'Unknown',
    size: chatMessage.original_file_size,
    type: chatMessage.attached_file_extension || 'unknown',
    external: true
  }] : undefined
});

// Simulated in-memory database
class ChatAPI {
  private _chatThreadsData: ChatThreadAPIResponse;
  private _chatMessagesData: { [threadId: string]: ChatMessageAPIResponse };

  constructor() {
    // Initialize with data from content.ts (deep clone to avoid mutations)
    this._chatThreadsData = JSON.parse(JSON.stringify(CHAT_THREADS_DATA));
    this._chatMessagesData = JSON.parse(JSON.stringify(ALL_CHAT_MESSAGES));
  }

  // Trim messages starting from a given message (inclusive) down to the end.
  // If the target is an assistant message, we trim back to the previous user message.
  // Returns the user message content that should be regenerated.
  async trimMessagesFrom(chatId: string, messageId: string): Promise<{ userMessageContent: string } | null> {
    await this.delay(100);

    const messagesData = this._chatMessagesData[chatId];
    if (!messagesData) return null;

    const msgs = messagesData.messages;
    const idx = msgs.findIndex(m => m.id === messageId);
    if (idx === -1) return null;

    // Find the user message index to keep up to (inclusive)
    let userIdx = idx;
    if (msgs[userIdx].role !== 'user') {
      // go backwards to previous user
      for (let i = idx - 1; i >= 0; i--) {
        if (msgs[i].role === 'user') { userIdx = i; break; }
      }
    }

    if (msgs[userIdx].role !== 'user') return null;

    const userMessageContent = msgs[userIdx].content;

    // Trim
    const kept = msgs.slice(0, userIdx + 1);
    messagesData.messages = kept;
    messagesData.total = kept.length;

    // Recompute thread stats
    const thread = this._chatThreadsData.threads.find(t => t.id === chatId);
    if (thread) {
      thread.size_chars = kept.reduce((acc, m) => acc + m.full_content_length, 0);
      thread.size_tokens = kept.reduce((acc, m) => acc + Math.ceil(m.full_content_length / 4), 0);
      thread.last_msg_at = kept.length > 0 ? kept[kept.length - 1].created_at : Date.now();
      thread.updated_at = Date.now();
    }

    return { userMessageContent };
  }

  // Simulate API delay
  private delay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get all chat threads (returns ChatTitle[] for backward compatibility)
  async getChatThreads(): Promise<ChatTitle[]> {
    await this.delay();

    const filteredThreads = this._chatThreadsData.threads
      .filter(thread => !thread.is_deleted && thread.is_active && !thread.is_temporary)
      .sort((a, b) => b.last_msg_at - a.last_msg_at);

    console.log('📊 getChatThreads - raw threads:', this._chatThreadsData.threads.map(t => ({
      id: t.id,
      title: t.title,
      last_msg_at: t.last_msg_at
    })));

    const result = filteredThreads.map(chatThreadToChatTitle);
    console.log('📊 getChatThreads result:', result);

    return result;
  }

  // Get raw chat threads data (new API method)
  async getChatThreadsRaw(): Promise<ChatThreadAPIResponse> {
    await this.delay();
    return JSON.parse(JSON.stringify(this._chatThreadsData));
  }

  // Create a new chat thread
  async createChatThread(title?: string): Promise<ChatTitle> {
    await this.delay(150);

    const threadId = generateUUID();
    const now = Date.now();
    const defaultTitle = title || `New Chat ${new Date().toLocaleDateString()}`;

    console.log('🆕 Creating new chat thread:', { threadId, title: defaultTitle });
    console.log('🆕 Generated UUID:', threadId);
    console.log('🆕 Existing thread IDs:', this._chatThreadsData.threads.map(t => t.id));

    const newThread: ChatThread = {
      $schema: "https://example.com/schemas/ChatThread.json",
      created_at: now,
      group_id: "group-general-1",
      id: threadId,
      is_active: true,
      is_deleted: false,
      is_pinned: false,
      is_public: false,
      is_temporary: true, // Mark as temporary initially
      last_msg_at: now,
      size_chars: 0,
      size_tokens: 0,
      system_prompts: [{
        $schema: "https://example.com/schemas/SystemPrompt.json",
        auto_update: true,
        content: "You are a helpful AI assistant ready to help with any questions or tasks.",
        created_at: now,
        file_path: "/prompts/general-assistant.md",
        id: `sys-prompt-${threadId}`,
        is_default: true,
        is_global: false,
        name: "General Assistant",
        ui_meta: "{\"color\": \"blue\", \"icon\": \"assistant\"}",
        updated_at: now,
        user_id: "user-123"
      }],
      tenant_id: "tenant-123",
      title: defaultTitle,
      updated_at: now,
      user_id: "user-123"
    };

    // Add to threads data (insert at beginning for latest-first sorting)
    this._chatThreadsData.threads.unshift(newThread);
    this._chatThreadsData.total += 1;

    // Initialize messages for this thread as EMPTY; keep is_temporary true until first user message
    this._chatMessagesData[threadId] = {
      $schema: "https://example.com/schemas/ChatMessageAPIResponseListBody.json",
      messages: [],
      order: "created_at_asc",
      page_number: 1,
      page_size: 50,
      total: 0
    };

    // Thread stats remain zero until first message
    newThread.size_chars = 0;
    newThread.size_tokens = 0;
    newThread.last_msg_at = now;

    console.log('🆕 New chat thread created successfully (EMPTY, temporary):', {
      threadId,
      title: defaultTitle,
      messageCount: 0,
      is_temporary: true
    });

    return chatThreadToChatTitle(newThread);
  }

  // Update chat thread title
  async updateChatTitle(chatId: string, newTitle: string): Promise<void> {
    await this.delay(100);

    const thread = this._chatThreadsData.threads.find(t => t.id === chatId);
    if (thread) {
      thread.title = newTitle;
      thread.updated_at = Date.now();
    }
  }

  // Delete chat thread
  async deleteChatThread(chatId: string): Promise<void> {
    await this.delay(150);

    const thread = this._chatThreadsData.threads.find(t => t.id === chatId);
    if (thread) {
      thread.is_deleted = true;
      thread.updated_at = Date.now();
    }

    // Remove messages for deleted thread
    delete this._chatMessagesData[chatId];
  }

  // Get chat thread by ID
  async getChatById(chatId: string): Promise<ChatTitle | undefined> {
    await this.delay(50);

    const thread = this._chatThreadsData.threads.find(t => t.id === chatId && !t.is_deleted);
    return thread ? chatThreadToChatTitle(thread) : undefined;
  }

  // Get messages for a specific chat (returns Message[] for backward compatibility)
  async getChatMessages(chatId: string): Promise<Message[]> {
    await this.delay(120);

    console.log('💬 getChatMessages called with chatId:', chatId);
    console.log('💬 Available message keys:', Object.keys(this._chatMessagesData));

    const messagesData = this._chatMessagesData[chatId];
    if (!messagesData) {
      console.log('❌ No messages found for chatId:', chatId);
      return [];
    }

    console.log('✅ Found messages for chatId:', chatId, messagesData.messages.length, 'messages');

    const result = messagesData.messages
      .sort((a, b) => a.created_at - b.created_at)
      .map(chatMessageToMessage);

    console.log('💬 getChatMessages result:', result.map(m => ({
      id: m.id,
      type: m.type,
      content: m.content.substring(0, 50) + '...'
    })));

    return result;
  }

  // Get raw messages data (new API method)
  async getChatMessagesRaw(chatId: string): Promise<ChatMessageAPIResponse | null> {
    await this.delay(120);

    const messagesData = this._chatMessagesData[chatId];
    return messagesData ? JSON.parse(JSON.stringify(messagesData)) : null;
  }

  // Add a new message to a chat
  async addMessage(chatId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    await this.delay(200);

    const messagesData = this._chatMessagesData[chatId];
    if (!messagesData) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }

    const messageId = generateUUID();
    const now = Date.now();

    const newChatMessage: ChatMessage = {
      $schema: "https://example.com/schemas/ChatMessage.json",
      attached_file_extension: message.files && message.files.length > 0 ? message.files[0].name.split('.').pop() || null : null,
      attached_file_name: message.files && message.files.length > 0 ? message.files[0].name : null,
      chars_per_sec: 0,
      completed: true,
      content: message.content,
      created_at: now,
      error: null,
      finish_reason: "stop",
      full_content_length: message.content.length,
      id: messageId,
      is_file_attachment: !!(message.files && message.files.length > 0),
      is_truncated: false,
      like: 0,
      max_tokens: message.type === 'user' ? 0 : 4096,
      model_name: message.type === 'user' ? null : 'gpt-4-turbo',
      original_file_size: message.files && message.files.length > 0 ? message.files[0].size || 0 : 0,
      role: message.type,
      size_chars: message.content.length,
      size_tokens: Math.ceil(message.content.length / 4), // Rough token estimate
      temperature: message.type === 'user' ? 0 : 0.7,
      thread_id: chatId,
      tokens_per_sec: message.type === 'user' ? 0 : 12.5,
      truncated_content_length: 0,
      updated_at: now,
      user_id: message.type === 'user' ? 'user-123' : 'assistant'
    };

    // Add message to thread
    messagesData.messages.push(newChatMessage);
    messagesData.total += 1;

    // Update thread's last message timestamp
    const thread = this._chatThreadsData.threads.find(t => t.id === chatId);
    if (thread) {
      thread.last_msg_at = now;
      thread.updated_at = now;
      thread.size_chars += message.content.length;
      thread.size_tokens += Math.ceil(message.content.length / 4);
      // If this is the first user message, make the thread visible in Recent Chats
      if (thread.is_temporary) {
        thread.is_temporary = false;
      }
    }

    console.log('💬 Message added successfully:', { messageId, chatId, type: message.type });

    return chatMessageToMessage(newChatMessage);
  }

  // Simulate LLM response to a user message
  async generateResponse(chatId: string, userMessage: string): Promise<Message> {
    await this.delay(1500); // Simulate thinking time

    console.log('🤖 Generating LLM response for:', { chatId, userMessage: userMessage.substring(0, 50) + '...' });

    // Generate a simulated response based on the user message
    const response = this.generateSimulatedResponse(userMessage);

    // Add the assistant response to the chat
    const assistantMessage = await this.addMessage(chatId, {
      type: 'assistant',
      content: response,
      files: []
    });

    console.log('🤖 LLM response generated and added:', { messageId: assistantMessage.id, chatId });

    return assistantMessage;
  }

  // Generate simulated AI responses based on user input
  private generateSimulatedResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // Simple keyword-based response generation
    if (lowerMessage.includes('react') || lowerMessage.includes('component')) {
      return `Great question about React! Here's what I can help you with:

**React Components** are the building blocks of React applications. Here are some key concepts:

1. **Functional vs Class Components**: Modern React primarily uses functional components with hooks
2. **Props**: Data passed from parent to child components
3. **State**: Internal component data that can change over time
4. **Hooks**: Functions like useState, useEffect that add functionality to functional components

**Example:**
\`\`\`jsx
function Welcome({ name }) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

Would you like me to explain any specific React concept in more detail?`;
    }

    if (lowerMessage.includes('api') || lowerMessage.includes('rest') || lowerMessage.includes('endpoint')) {
      return `I'd be happy to help with API design! Here are some best practices:

**REST API Design Principles:**

1. **Resource-Based URLs**
   - ✅ \`/api/v1/users/123\`
   - ❌ \`/api/v1/getUser?id=123\`

2. **HTTP Methods**
   - \`GET\` - Retrieve data
   - \`POST\` - Create new resources
   - \`PUT\` - Update/replace entire resource
   - \`PATCH\` - Partial updates
   - \`DELETE\` - Remove resources

3. **Status Codes**
   - \`200\` - Success
   - \`201\` - Created
   - \`400\` - Bad Request
   - \`404\` - Not Found
   - \`500\` - Server Error

4. **Consistent Response Format**
\`\`\`json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
\`\`\`

What specific aspect of API design would you like to explore further?`;
    }

    if (lowerMessage.includes('javascript') || lowerMessage.includes('js') || lowerMessage.includes('promise') || lowerMessage.includes('async')) {
      return `JavaScript is a powerful language! Let me help you with that:

**Key JavaScript Concepts:**

1. **Promises & Async/Await**
\`\`\`javascript
// Promise
fetch('/api/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));

// Async/Await (cleaner syntax)
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
\`\`\`

2. **Modern ES6+ Features**
   - Arrow functions: \`() => {}\`
   - Destructuring: \`const { name, age } = user\`
   - Template literals: \`\`Hello \${name}\`\`
   - Spread operator: \`...array\`

3. **Array Methods**
   - \`map()\`, \`filter()\`, \`reduce()\`
   - \`find()\`, \`some()\`, \`every()\`

What specific JavaScript topic would you like to dive deeper into?`;
    }

    if (lowerMessage.includes('database') || lowerMessage.includes('sql') || lowerMessage.includes('schema')) {
      return `Database design is crucial for application performance! Here's some guidance:

**Database Schema Best Practices:**

1. **Normalization**
   - Eliminate data redundancy
   - Ensure data integrity
   - Follow 1NF, 2NF, 3NF rules

2. **Indexing Strategy**
\`\`\`sql
-- Primary key (automatically indexed)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
\`\`\`

3. **Relationships**
   - One-to-Many: \`user_id\` foreign key
   - Many-to-Many: Junction tables
   - One-to-One: Shared primary key

4. **Data Types**
   - Use appropriate types for storage efficiency
   - \`VARCHAR\` vs \`TEXT\`
   - \`INT\` vs \`BIGINT\`

What aspect of database design would you like to explore further?`;
    }

    // Default response for general questions
    return `Thank you for your question! I'm here to help you with:

🔧 **Development Topics:**
- React & Frontend Development
- API Design & Backend Development
- JavaScript & Programming Concepts
- Database Design & SQL
- Performance Optimization
- Best Practices & Code Quality

💡 **How I can assist:**
- Provide code examples and explanations
- Review and suggest improvements
- Help debug issues
- Explain complex concepts
- Share best practices

Could you tell me more about what specific topic you'd like to explore? I'm ready to provide detailed explanations, code examples, and practical guidance!`;
  }

  // Update message like status
  async updateMessageLike(messageId: string, like: number): Promise<void> {
    await this.delay(50);

    // Find message across all threads
    for (const threadMessages of Object.values(this._chatMessagesData)) {
      const message = threadMessages.messages.find(m => m.id === messageId);
      if (message) {
        message.like = like;
        message.updated_at = Date.now();
        break;
      }
    }
  }

  // Search messages across all threads
  async searchMessages(query: string): Promise<{ threadId: string; messages: Message[] }[]> {
    await this.delay(200);

    const results: { threadId: string; messages: Message[] }[] = [];

    for (const [threadId, messagesData] of Object.entries(this._chatMessagesData)) {
      const matchingMessages = messagesData.messages
        .filter(msg => msg.content.toLowerCase().includes(query.toLowerCase()))
        .map(chatMessageToMessage);

      if (matchingMessages.length > 0) {
        results.push({ threadId, messages: matchingMessages });
      }
    }

    return results;
  }

  // Get thread statistics
  async getThreadStats(chatId: string): Promise<{
    messageCount: number;
    totalChars: number;
    totalTokens: number;
    lastActivity: number;
  } | null> {
    await this.delay(80);

    const thread = this._chatThreadsData.threads.find(t => t.id === chatId);
    if (!thread) return null;

    const messagesData = this._chatMessagesData[chatId];
    const messageCount = messagesData?.messages.length || 0;

    return {
      messageCount,
      totalChars: thread.size_chars,
      totalTokens: thread.size_tokens,
      lastActivity: thread.last_msg_at
    };
  }
}

// Export singleton instance
export const chatAPI = new ChatAPI();
