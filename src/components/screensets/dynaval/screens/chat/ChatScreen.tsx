import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import ReactDOM from 'react-dom';
import { Send, User, Bot, Paperclip, X, File, Image, FileText, Copy, Edit3, RotateCcw, ThumbsUp, ThumbsDown, Trash2, ChevronDown, Monitor, Cloud } from 'lucide-react';

import { Message, AttachedFile } from './types';
import { generateUUID } from './api';
import ChatScreenRSideBar from './ChatScreenRSideBar';

interface Context {
  id: string;
  name: string;
  color: string;
}

interface ChatScreenProps {
  toggleChatTemporary?: (chatId: string) => void;
  isChatTemporary?: (chatId: string) => boolean;
  currentChatId?: string;
  chatData?: { [key: string]: Message[] };
  sendMessage?: (content: string, files?: any[]) => Promise<any>;
  onNewChat?: () => void;
  onSwitchToChat?: (chatId: string) => void;
}

interface ChatScreenRef {
  resetMessages: (newMessages: Message[]) => void;
  loadMessages: (msgs: Message[], chatId: string) => void;
  attachExternalFile: (file: { path: string; name?: string }) => void;
  newChat: () => void;
  switchToChat: (chatId: string) => void;
}

const ChatScreen = forwardRef<ChatScreenRef, ChatScreenProps>(function ChatScreen(props, ref) {
  const { toggleChatTemporary, isChatTemporary } = props;


  // Fallback data - now minimal since content comes from API via ChatScreenWrapper
  const fallbackChatData: { [key: string]: Message[] } = {
    'default': [
      {
        id: generateUUID(),
        type: 'assistant',
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        timestamp: new Date()
      }
    ],
    'previous': [
      {
        id: generateUUID(),
        type: 'user',
        content: 'Can you help me understand JavaScript promises?',
        timestamp: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        id: generateUUID(),
        type: 'assistant',
        content: 'Of course! JavaScript promises are objects that represent the eventual completion or failure of an asynchronous operation. They help handle async code more elegantly than traditional callbacks.',
        timestamp: new Date(Date.now() - 86400000)
      },
      {
        id: generateUUID(),
        type: 'user',
        content: 'Can you show me an example?',
        timestamp: new Date(Date.now() - 86400000)
      },
      {
        id: generateUUID(),
        type: 'assistant',
        content: 'OK, Here\'s a simple example:\n\n```javascript\nconst fetchData = () => {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      resolve("Data fetched successfully!");\n    }, 1000);\n  });\n};\n\nfetchData().then(data => console.log(data));\n```',
        timestamp: new Date(Date.now() - 86400000)
      }
    ],
    'another': [
      {
        id: generateUUID(),
        type: 'user',
        content: 'What are the best practices for API design?',
        timestamp: new Date(Date.now() - 172800000) // 2 days ago
      },
      {
        id: generateUUID(),
        type: 'assistant',
        content: 'Great question! Here are some key API design best practices:\n\n1. Use RESTful principles\n2. Consistent naming conventions\n3. Proper HTTP status codes\n4. Version your APIs\n5. Include comprehensive documentation\n6. Implement proper error handling\n7. Use HTTPS for security',
        timestamp: new Date(Date.now() - 172800000)
      },
      {
        id: generateUUID(),
        type: 'user',
        content: 'Tell me more about HTTP status codes',
        timestamp: new Date(Date.now() - 172800000)
      },
      {
        id: generateUUID(),
        type: 'assistant',
        content: 'HTTP status codes communicate the result of API requests:\n\n• 2xx Success (200 OK, 201 Created, 204 No Content)\n• 3xx Redirection (301 Moved Permanently, 304 Not Modified)\n• 4xx Client Error (400 Bad Request, 401 Unauthorized, 404 Not Found)\n• 5xx Server Error (500 Internal Server Error, 503 Service Unavailable)\n\nUsing the right codes helps clients handle responses appropriately.',
        timestamp: new Date(Date.now() - 172800000)
      }
    ],
    'react': [
      {
        id: generateUUID(),
        type: 'user',
        content: 'How do I create a reusable button component in React?',
        timestamp: new Date(Date.now() - 259200000) // 3 days ago
      },
      {
        id: generateUUID(),
        type: 'assistant',
        content: 'Here\'s how to create a reusable Button component:\n\n```jsx\nconst Button = ({ \n  children, \n  onClick, \n  variant = "primary", \n  size = "medium",\n  disabled = false,\n  ...props \n}) => {\n  const baseClasses = "rounded font-medium transition-colors";\n  const variants = {\n    primary: "bg-blue-500 hover:bg-blue-600 text-white",\n    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800"\n  };\n  const sizes = {\n    small: "px-3 py-1 text-sm",\n    medium: "px-4 py-2",\n    large: "px-6 py-3 text-lg"\n  };\n  \n  return (\n    <button \n      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}\n      onClick={onClick}\n      disabled={disabled}\n      {...props}\n    >\n      {children}\n    </button>\n  );\n};\n```',
        timestamp: new Date(Date.now() - 259200000)
      },
      {
        id: generateUUID(),
        type: 'user',
        content: 'How would I use this component?',
        timestamp: new Date(Date.now() - 259200000)
      },
      {
        id: generateUUID(),
        type: 'assistant',
        content: 'You can use the Button component like this:\n\n```jsx\n// Basic usage\n<Button onClick={() => alert("Clicked!")}>Click Me</Button>\n\n// With different variants and sizes\n<Button variant="secondary" size="large">Secondary Button</Button>\n<Button variant="primary" size="small" disabled>Disabled Button</Button>\n\n// With additional props\n<Button \n  onClick={handleSubmit}\n  variant="primary"\n  type="submit"\n  className="w-full mt-4"\n>\n  Submit Form\n</Button>\n```\n\nThis approach makes your buttons consistent and easy to maintain across your app!',
        timestamp: new Date(Date.now() - 259200000)
      }
    ]
  };

  // Find the latest chat (most recent timestamp) or default to 'react' as latest
  const getLatestChatId = (): string => {
    const chatIds = Object.keys(fallbackChatData);
    if (chatIds.includes('react')) return 'react'; // 'react' is our latest chat
    return chatIds[chatIds.length - 1] || 'default';
  };

  const initialChatId = props.currentChatId || getLatestChatId();
  const providedChatData = props.chatData;
  // Only use fallback data if no chatData is provided at all, otherwise wait for real data
  const initialMessages = providedChatData?.[initialChatId] || (providedChatData ? [] : fallbackChatData['default']);

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
  const [contextDropdownOpen, setContextDropdownOpen] = useState<boolean>(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('bartowski/deepseek-r1-distill-qwen-32b');
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [currentChatId, setCurrentChatId] = useState<string>(initialChatId);
  // Keep internal currentChatId in sync with prop (selection coming from history)
  useEffect(() => {
    if (props.currentChatId && props.currentChatId !== currentChatId) {
      setCurrentChatId(props.currentChatId);
    }
  }, [props.currentChatId]);

  // Update messages when chatData prop changes
  useEffect(() => {
    console.log('🖥️ ChatScreen chatData effect:', {
      currentChatId,
      propsCurrentChatId: props.currentChatId,
      providedChatData: props.chatData ? Object.keys(props.chatData) : 'no chatData',
      messagesAvailable: props.chatData?.[currentChatId]?.length || 0
    });

    if (props.chatData && currentChatId && props.chatData[currentChatId]) {
      console.log('🖥️ Updating messages from chatData for:', currentChatId);
      setMessages(props.chatData[currentChatId]);
    }
  }, [props.chatData, currentChatId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputRows, setInputRows] = useState<number>(1);

  // Chat header title editing
  const [editingTitle, setEditingTitle] = useState(false);

  // Right sidebar state
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [showAddInstruction, setShowAddInstruction] = useState(false);
  const [instructionText, setInstructionText] = useState('');
  const [instructionName, setInstructionName] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [headerPortal, setHeaderPortal] = useState<HTMLElement | null>(null);

  // Listen for title updates from the history component
  useEffect(() => {
    const handleTitleTyping = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.screensetKey === 'fullmix' && customEvent.detail?.chatId === currentChatId) {
        setEditedTitle(customEvent.detail.newTitle);
      }
    };

    window.addEventListener('chat-title-typing', handleTitleTyping);
    return () => {
      window.removeEventListener('chat-title-typing', handleTitleTyping);
    };
  }, [currentChatId]);

  // When the chat switches, get the title from localStorage
  useEffect(() => {
    try {
      const key = 'fullmix-chat-titles';
      const stored = localStorage.getItem(key);
      const titleMap = stored ? JSON.parse(stored) : {};
      const currentTitle = titleMap[currentChatId] || (currentChatId ? currentChatId.charAt(0).toUpperCase() + currentChatId.slice(1) : 'Chat');
      setEditedTitle(currentTitle);
    } catch {
      const fallbackTitle = currentChatId ? currentChatId.charAt(0).toUpperCase() + currentChatId.slice(1) : 'Chat';
      setEditedTitle(fallbackTitle);
    }
  }, [currentChatId]);

  const handleTitleChange = (newTitle: string) => {
    setEditedTitle(newTitle);
    // Dispatch event for ChatHistory to hear
    window.dispatchEvent(new CustomEvent('chat-title-typing', {
      detail: { screensetKey: 'fullmix', chatId: currentChatId, newTitle }
    }));
  };

  const handleTitleSave = () => {
    setEditingTitle(false);
    // Persist to localStorage on save
    try {
      const key = 'fullmix-chat-titles';
      const map = JSON.parse(localStorage.getItem(key) || '{}');
      map[currentChatId] = editedTitle.trim();
      localStorage.setItem(key, JSON.stringify(map));
    } catch {}
    // Dispatch a final update event
    window.dispatchEvent(new CustomEvent('chat-title-update', {
      detail: { screensetKey: 'fullmix', chatId: currentChatId, newTitle: editedTitle.trim() }
    }));
  };

  // Available context items for the dropdown
  const availableContexts: Context[] = [
    { id: '1', name: 'context 1', color: 'bg-yellow-400' },
    { id: '2', name: 'Work 1', color: 'bg-black' },
    { id: '3', name: 'Hobby', color: 'bg-blue-600' },
    { id: '4', name: 'Test', color: 'bg-cyan-400' },
    { id: '5', name: 'Cooking.', color: 'bg-purple-400' },
    { id: '6', name: 'Books', color: 'bg-yellow-600' },
    { id: '7', name: 'Private docs', color: 'bg-red-500' }
  ];

  // Available models for the dropdown
  const availableModels: string[] = [
    'bartowski/deepseek-r1-distill-qwen-32b',
    'codellama-70b-hf-mlx',
    'codellama-70b-python-hf-mlx',
    'deepseek-coder-33b-instruct-hf-mlx',
    'deepseek-coder-v2-lite-instruct',
    'deepseek-r1-distill-qwen-32b-mlx@4bit',
    'deepseek-r1-distill-qwen-32b-mlx@8bit',
    'deepseek-v3',
    'distilgpt2',
    // Cloud models (examples)
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'claude-3-opus',
    'gemini-pro'
  ];

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-resize textarea function
  const autoResize = (value: string): void => {
    const lines = value.split('\n').length;
    const newRows = Math.min(Math.max(lines, 1), 14); // Min 1, max 14 rows
    setInputRows(newRows);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const value = e.target.value;
    setInputValue(value);
    autoResize(value);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle currentChatId prop changes
  useEffect(() => {
    if (props.currentChatId && props.currentChatId !== currentChatId) {
      switchToChat(props.currentChatId);
    }
  }, [props.currentChatId, currentChatId]);

  // Close context dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (contextDropdownOpen && !(event.target as Element).closest('.context-dropdown')) {
        setContextDropdownOpen(false);
      }
      if (modelDropdownOpen && !(event.target as Element).closest('.model-dropdown')) {
        setModelDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextDropdownOpen, modelDropdownOpen]);

  const handleSendMessage = async (): Promise<void> => {
    if (!inputValue.trim() && attachedFiles.length === 0) return;

    console.log('📤 Sending message:', {
      content: inputValue.substring(0, 50) + '...',
      currentChatId,
      hasFilesAttached: attachedFiles.length > 0
    });

    // If we have the sendMessage prop from ChatScreenWrapper, use it (with API)
    if (props.sendMessage && currentChatId) {
      try {
        setIsTyping(true);

        // Use the API-based message sending
        await props.sendMessage(inputValue, attachedFiles);

        // Clear input after successful send
        setInputValue('');
        setInputRows(1);
        setAttachedFiles([]);

      } catch (error) {
        console.error('Failed to send message:', error);
      } finally {
        setIsTyping(false);
      }
    } else {
      // Fallback to local message handling (for backward compatibility)
      const userMessage: Message = {
        id: generateUUID(),
        type: 'user',
        content: inputValue,
        files: [...attachedFiles],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setInputRows(1); // Reset to minimum rows
      setAttachedFiles([]);
      setIsTyping(true);

      // Simulate AI response (fallback)
      setTimeout(() => {
        const responses = [
          "I understand your question. Let me help you with that.",
          "That's an interesting point. Here's what I think...",
          "Based on what you've shared, I'd suggest considering these options:",
          "I can definitely help you with this. Let me break it down:",
          "Great question! This is a topic I can provide some insights on."
        ];

        const assistantMessage: Message = {
          id: generateUUID(),
          type: 'assistant',
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1000 + Math.random() * 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files || []);
    const fileObjects: AttachedFile[] = files.map(file => ({
      id: generateUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setAttachedFiles(prev => [...prev, ...fileObjects]);
    event.target.value = '';
  };

  const removeFile = (fileId: string): void => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string): React.ReactElement => {
    if (fileType.startsWith('image/')) return <Image size={16} />;
    if (fileType.includes('text') || fileType.includes('document')) return <FileText size={16} />;
    return <File size={16} />;
  };

  // Determine if a model is cloud-based or local
  const isCloudModel = (modelName: string): boolean => {
    // Cloud model patterns (API-based models)
    const cloudPatterns = [
      'gpt-', 'claude-', 'gemini-', 'anthropic-', 'openai-',
      'api', 'remote', 'cloud', 'azure-', 'aws-', 'google-'
    ];

    // Local model indicators (models running locally)
    const localIndicators = [
      'mlx', '@4bit', '@8bit', '@q4', '@q8', 'gguf', 'ggml',
      '-hf-', 'instruct', 'chat', 'local'
    ];

    const lowerModelName = modelName.toLowerCase();

    // If it has local indicators, it's definitely local
    if (localIndicators.some(indicator => lowerModelName.includes(indicator))) {
      return false;
    }

    // Check for cloud patterns
    return cloudPatterns.some(pattern => lowerModelName.includes(pattern));
  };

  // Get the appropriate icon and label for the current model
  const getModelEnvironment = (): { icon: React.ReactElement; label: string; color: string } => {
    const isCloud = isCloudModel(selectedModel);
    return {
      icon: isCloud ? <Cloud size={16} className="text-blue-500" /> : <Monitor size={16} className="text-green-600" />,
      label: isCloud ? 'Cloud' : 'Local PC',
      color: isCloud ? 'text-blue-500' : 'text-green-600'
    };
  };

  const newChat = (): void => {
    const newChatMessages: Message[] = [{
      id: generateUUID(),
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }];
    setMessages(newChatMessages);
    setCurrentChatId('default');
    setAttachedFiles([]);
  };

  const switchToChat = (chatId: string): void => {
    setCurrentChatId(chatId);
    const data = providedChatData || fallbackChatData;

    // Check if chat exists in data, if not create default messages for new chat
    let chatMessages: Message[];
    if (data[chatId]) {
      chatMessages = data[chatId];
    } else if (chatId.startsWith('chat-')) {
      // This is a new chat created from ChatHistory
      chatMessages = [{
        id: generateUUID(),
        type: 'assistant',
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        timestamp: new Date()
      }];
    } else {
      // Fallback to default
      chatMessages = data['default'] || [{
        id: generateUUID(),
        type: 'assistant',
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        timestamp: new Date()
      }];
    }

    setMessages(chatMessages);
    setAttachedFiles([]);
    setEditingMessage(null);
    setEditedContent('');
  };

  const toggleContext = (contextId: string): void => {
    setSelectedContexts(prev => {
      if (prev.includes(contextId)) {
        return prev.filter(id => id !== contextId);
      } else {
        return [...prev, contextId];
      }
    });
  };

  const removeContext = (contextId: string): void => {
    setSelectedContexts(prev => prev.filter(id => id !== contextId));
  };

  const selectModel = (model: string): void => {
    setSelectedModel(model);
    setModelDropdownOpen(false);
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const editMessage = (messageId: string, content: string): void => {
    setEditingMessage(messageId);
    setEditedContent(content);
  };

  const saveEditedMessage = (): void => {
    setMessages(prev => prev.map(msg =>
      msg.id === editingMessage
        ? { ...msg, content: editedContent }
        : msg
    ));
    setEditingMessage(null);
    setEditedContent('');
  };

  const editAndResetMessage = (): void => {
    const messageIndex = messages.findIndex(msg => msg.id === editingMessage);
    if (messageIndex !== -1) {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[messageIndex].content = editedContent;
        return newMessages.slice(0, messageIndex + 1);
      });
    }
    setEditingMessage(null);
    setEditedContent('');
  };

  const deleteMessage = (messageId: string): void => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const cancelEdit = (): void => {
    setEditingMessage(null);
    setEditedContent('');
  };

  // Function to render markdown content with code blocks
  const renderMessageContent = (content: string): React.ReactElement[] => {
    // Split content by code blocks (```...```)
    const parts = content.split(/(```[\s\S]*?```)/);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code
        const codeContent = part.slice(3, -3);
        const lines = codeContent.split('\n');
        const language = lines[0].trim();
        const code = lines.slice(1).join('\n');

        return (
          <div key={index} className="my-2">
            <div className="hx-chat-markdown-outer rounded-t-lg px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-mono font-medium">{language || 'code'}</span>
              <button
                onClick={() => copyToClipboard(code)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                Copy
              </button>
            </div>
            <div className="hx-chat-markdown-middle rounded-b-lg p-3 overflow-x-auto">
              <pre className="hx-chat-markdown-inner text-sm font-mono leading-snug m-0 border-0">
                <code className="">{code}</code>
              </pre>
            </div>
          </div>
        );
      } else {
        // Regular text content
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      }
    });
  };

  // Right sidebar handlers
  const handleToggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
  };

  const handleCloseRightSidebar = () => {
    setRightSidebarOpen(false);
  };

  const handleCancelAddInstruction = () => {
    setShowAddInstruction(false);
    setInstructionText('');
    setInstructionName('');
  };

  const handleAddInstruction = () => {
    // Add instruction logic here (for now just close the form)
    console.log('Adding instruction:', { name: instructionName, text: instructionText });
    setShowAddInstruction(false);
    setInstructionText('');
    setInstructionName('');
  };

  // Expose imperative API for parent via ref
  useImperativeHandle(ref, () => ({
    resetMessages: (newMessages: Message[]) => {
      if (Array.isArray(newMessages)) {
        setMessages(newMessages);
        setAttachedFiles([]);
        setEditingMessage(null);
        setEditedContent('');
      }
    },
    loadMessages: (msgs: Message[], chatId: string) => {
      if (Array.isArray(msgs)) setMessages(msgs);
      if (chatId) setCurrentChatId(chatId);
      setAttachedFiles([]);
      setEditingMessage(null);
      setEditedContent('');
    },
    attachExternalFile: (file: { path: string; name?: string }) => {
      // file: { path, name? }
      if (!file || !file.path) return;
      const name = file.name || file.path.split('/').pop();
      const fileObj: AttachedFile = {
        id: generateUUID(),
        name: name || 'Unknown file',
        size: 0,
        type: 'application/octet-stream',
        path: file.path,
        external: true,
      };
      setAttachedFiles(prev => [...prev, fileObj]);
      // Focus input to allow immediate messaging
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    newChat,
    switchToChat
  }));

  // Chat Header Component
  const ChatHeader = () => (
    <div className="flex items-center gap-2">
      <span className="text-gray-400">-</span>
      {editingTitle ? (
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTitleSave();
            if (e.key === 'Escape') {
              setEditingTitle(false);
              // Re-fetch title from storage to cancel changes
              try {
                const key = 'fullmix-chat-titles';
                const stored = localStorage.getItem(key);
                const titleMap = stored ? JSON.parse(stored) : {};
                setEditedTitle(titleMap[currentChatId] || editedTitle);
              } catch {}
            }
          }}
          className="text-lg font-medium bg-transparent border-b-2 border-blue-500 focus:outline-none min-w-0"
          autoFocus
        />
      ) : (
        <span
          className="text-lg font-medium cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => setEditingTitle(true)}
          title="Click to edit chat title"
        >
          {editedTitle}
        </span>
      )}
      <button
        onClick={() => setEditingTitle(true)}
        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded transition-opacity"
        title="Edit title"
      >
        <Edit3 size={14} />
      </button>
    </div>
  );

  // Safely find the portal target after mount
  useEffect(() => {
    const portalNode = document.getElementById('dynamic-header-content');
    setHeaderPortal(portalNode);
  }, []);

  // Setup header portal
  useEffect(() => {
    const headerContainer = document.getElementById('dynamic-header-content');
    if (headerContainer) {
      headerContainer.classList.add('group'); // Add group class for hover effects

      return () => {
        if (headerContainer) {
          headerContainer.classList.remove('group');
        }
      };
    }
  }, []);

  return (
    <>
      {/* Render chat header in portal only when the target is found */}
      {headerPortal && ReactDOM.createPortal(
        <ChatHeader />,
        headerPortal
      )}

      <div className="relative flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto hx-body-primary">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className="mb-8 group"
              onMouseEnter={() => setHoveredMessage(message.id)}
              onMouseLeave={() => setHoveredMessage(null)}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-green-500 text-white'
                  }`}>
                    {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="prose prose-sm max-w-none">
                    {editingMessage === message.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEditedMessage}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={editAndResetMessage}
                            className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
                          >
                            Save & Reset
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="leading-relaxed">
                        {renderMessageContent(message.content)}
                      </div>
                    )}
                    {/* File attachments */}
                    {message.files && message.files.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.files.map((file) => (
                          <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border">
                            <div className="text-gray-600">
                              {getFileIcon(file.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Message Actions */}
                  {editingMessage !== message.id && (
                    <div className="flex items-center gap-1 mt-2">
                      {/* Always visible copy button */}
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                        title="Copy message"
                      >
                        <Copy size={14} />
                      </button>

                      {/* Additional buttons visible on hover */}
                      <div className={`flex items-center gap-1 transition-opacity duration-200 ${
                        hoveredMessage === message.id ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <button
                          onClick={() => editMessage(message.id, message.content)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                          title="Edit message"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            editMessage(message.id, message.content);
                            // We'll handle the reset part in editAndResetMessage function
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                          title="Edit and reset conversation"
                        >
                          <RotateCcw size={14} />
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-green-600"
                          title="Like message"
                        >
                          <ThumbsUp size={14} />
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-red-600"
                          title="Dislike message"
                        >
                          <ThumbsDown size={14} />
                        </button>
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-red-600"
                          title="Delete message"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="mb-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500 text-white">
                    <Bot size={16} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-gray-500">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 hx-body-secondary p-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          {/* Model status and temporary chat toggle */}
          <div className="mb-3 text-sm text-gray-600 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {getModelEnvironment().icon}
              <span className={`font-medium ${getModelEnvironment().color}`}>
                {getModelEnvironment().label}
              </span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-green-600 font-medium">lm_studio</span>
              <span className="text-gray-400 mx-1">/</span>
            <div className="inline-block relative model-dropdown">
              <button
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="text-green-600 font-medium hover:underline cursor-pointer"
              >
                {selectedModel}
              </button>

              {modelDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-medium text-gray-900">Select Model</h3>
                  </div>
                  <div className="py-1">
                    {availableModels.map((model) => (
                      <button
                        key={model}
                        onClick={() => selectModel(model)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          selectedModel === model ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                        }`}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-gray-500 ml-2">is ready to answer</span>
            </div>

            {/* Temporary Chat Toggle for current chat */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Temporary Chat</span>
              <button
                onClick={() => toggleChatTemporary && toggleChatTemporary(currentChatId)}
                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 ${
                  isChatTemporary && isChatTemporary(currentChatId) ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                title={isChatTemporary && isChatTemporary(currentChatId) ? "Disable temporary chat for this conversation" : "Enable temporary chat for this conversation"}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    isChatTemporary && isChatTemporary(currentChatId) ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Context display */}
          {selectedContexts.length > 0 && (
            <div className="mb-3 text-sm">
              <span className="text-gray-600">In the context of</span>
              <div className="flex items-center gap-2 mt-2">
                {selectedContexts.map(contextId => {
                  const context = availableContexts.find(c => c.id === contextId);
                  if (!context) return null;
                  return (
                    <div key={contextId} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                      <div className={`w-3 h-3 ${context.color} rounded`}></div>
                      <span>{context.name}</span>
                      <button
                        onClick={() => removeContext(contextId)}
                        className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-gray-600">Ask me anything...</div>
            </div>
          )}

          {/* File attachments preview */}
          {attachedFiles.length > 0 && (
            <div className="mb-4 space-y-2">
              {attachedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-gray-600">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Message ..."
                className="w-full px-4 py-3 pr-32 border rounded-xl hx-input-primary resize-none"
                rows={inputRows}
                style={{ minHeight: '50px' }}
              />
              <div className="absolute right-2 bottom-4 flex items-center gap-1">
                {/* Context dropdown */}
                <div className="relative context-dropdown">
                  <button
                    onClick={() => setContextDropdownOpen(!contextDropdownOpen)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Add context"
                  >
                    <ChevronDown size={16} />
                  </button>

                  {contextDropdownOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="p-3 border-b border-gray-200">
                        <h3 className="font-medium text-gray-900">Add Context</h3>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {availableContexts.map((context) => (
                          <button
                            key={context.id}
                            onClick={() => {
                              toggleContext(context.id);
                              setContextDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                              selectedContexts.includes(context.id) ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className={`w-3 h-3 ${context.color} rounded`}></div>
                            <span className="text-sm text-gray-900 truncate">{context.name}</span>
                            {selectedContexts.includes(context.id) && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="*/*"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Attach files"
                >
                  <Paperclip size={16} />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() && attachedFiles.length === 0}
                  className={`p-2 rounded-lg transition-colors ${
                    (inputValue.trim() || attachedFiles.length > 0)
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI can make mistakes. Consider checking important information.
          </p>
        </div>

        {/* Right Sidebar */}
        <ChatScreenRSideBar
          rightSidebarOpen={rightSidebarOpen}
          onToggle={handleToggleRightSidebar}
          onClose={handleCloseRightSidebar}
          showAddInstruction={showAddInstruction}
          setShowAddInstruction={setShowAddInstruction}
          instructionText={instructionText}
          setInstructionText={setInstructionText}
          instructionName={instructionName}
          setInstructionName={setInstructionName}
          onAddInstruction={handleAddInstruction}
          onCancelAddInstruction={handleCancelAddInstruction}
          availableContexts={[
            { id: '1', name: 'React Documentation', color: 'bg-blue-500' },
            { id: '2', name: 'TypeScript Guide', color: 'bg-green-500' },
            { id: '3', name: 'Project Requirements', color: 'bg-purple-500' }
          ]}
        />
      </div>
    </div>
    </>
  );
});

export default ChatScreen;
