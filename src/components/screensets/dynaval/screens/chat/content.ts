// Chat content data with proper API schemas

// System prompts for the chat threads
export const SYSTEM_PROMPTS = [
  {
    "$schema": "https://example.com/schemas/SystemPrompt.json",
    "auto_update": true,
    "content": "You are a helpful AI assistant specialized in React development and modern web technologies.",
    "created_at": 1703097600000,
    "file_path": "/prompts/react-assistant.md",
    "id": "sys-prompt-react",
    "is_default": true,
    "is_global": false,
    "name": "React Development Assistant",
    "ui_meta": "{\"color\": \"blue\", \"icon\": \"react\"}",
    "updated_at": 1703097600000,
    "user_id": "user-123"
  },
  {
    "$schema": "https://example.com/schemas/SystemPrompt.json",
    "auto_update": true,
    "content": "You are an expert in API design and backend development best practices.",
    "created_at": 1703097500000,
    "file_path": "/prompts/api-expert.md",
    "id": "sys-prompt-api",
    "is_default": false,
    "is_global": true,
    "name": "API Design Expert",
    "ui_meta": "{\"color\": \"green\", \"icon\": \"api\"}",
    "updated_at": 1703097500000,
    "user_id": "user-123"
  },
  {
    "$schema": "https://example.com/schemas/SystemPrompt.json",
    "auto_update": false,
    "content": "You are a JavaScript expert.",
    "created_at": 1703097400000,
    "file_path": "/prompts/db-specialist.md",
    "id": "sys-javascript-expert",
    "is_default": false,
    "is_global": false,
    "name": "Database Specialist",
    "ui_meta": "{\"color\": \"purple\", \"icon\": \"database\"}",
    "updated_at": 1703097400000,
    "user_id": "user-123"
  },
  {
    "$schema": "https://example.com/schemas/SystemPrompt.json",
    "auto_update": true,
    "content": "You are a performance optimization expert focused on web application speed and efficiency.",
    "created_at": 1703097300000,
    "file_path": "/prompts/performance-expert.md",
    "id": "sys-prompt-perf",
    "is_default": false,
    "is_global": true,
    "name": "Performance Expert",
    "ui_meta": "{\"color\": \"orange\", \"icon\": \"speed\"}",
    "updated_at": 1703097300000,
    "user_id": "user-123"
  }
];

// Chat threads data
export const CHAT_THREADS_DATA = {
  "$schema": "https://example.com/schemas/ChatThreadAPIResponseListBody.json",
  "order": "last_msg_at_desc",
  "page_number": 1,
  "page_size": 50,
  "threads": [
    {
      "$schema": "https://example.com/schemas/ChatThread.json",
      "created_at": 1703097600000,
      "group_id": "group-dev-1",
      "id": "thread-react-components",
      "is_active": true,
      "is_deleted": false,
      "is_pinned": false,
      "is_public": false,
      "is_temporary": false,
      "last_msg_at": 1703185200000, // 2 hours ago
      "size_chars": 2847,
      "size_tokens": 642,
      "system_prompts": [SYSTEM_PROMPTS[0]],
      "tenant_id": "tenant-123",
      "title": "React Components Design",
      "updated_at": 1703185200000,
      "user_id": "user-123"
    },
    {
      "$schema": "https://example.com/schemas/ChatThread.json",
      "created_at": 1703011200000,
      "group_id": "group-backend-1",
      "id": "thread-api-integration",
      "is_active": true,
      "is_deleted": false,
      "is_pinned": true,
      "is_public": false,
      "is_temporary": false,
      "last_msg_at": 1703098800000, // 1 day ago
      "size_chars": 4512,
      "size_tokens": 1023,
      "system_prompts": [SYSTEM_PROMPTS[1]],
      "tenant_id": "tenant-123",
      "title": "API Integration Help",
      "updated_at": 1703098800000,
      "user_id": "user-123"
    },
    {
      "$schema": "https://example.com/schemas/ChatThread.json",
      "created_at": 1702924800000,
      "group_id": "group-db-1",
      "id": "thread-javascript-promises",
      "is_active": true,
      "is_deleted": false,
      "is_pinned": false,
      "is_public": false,
      "is_temporary": false,
      "last_msg_at": 1703012400000, // 2 days ago
      "size_chars": 3726,
      "size_tokens": 845,
      "system_prompts": [SYSTEM_PROMPTS[2]],
      "tenant_id": "tenant-123",
      "title": "JavaScript promises",
      "updated_at": 1703012400000,
      "user_id": "user-123"
    },
    {
      "$schema": "https://example.com/schemas/ChatThread.json",
      "created_at": 1702579200000,
      "group_id": "group-perf-1",
      "id": "thread-empty",
      "is_active": true,
      "is_deleted": false,
      "is_pinned": false,
      "is_public": false,
      "is_temporary": false,
      "last_msg_at": 1702580400000, // 1 week ago
      "size_chars": 1894,
      "size_tokens": 428,
      "system_prompts": [SYSTEM_PROMPTS[3]],
      "tenant_id": "tenant-123",
      "title": "Empty Chat",
      "updated_at": 1702580400000,
      "user_id": "user-123"
    }
  ],
  "total": 4
};

// Chat messages for React Components thread
export const REACT_COMPONENTS_MESSAGES = {
  "$schema": "https://example.com/schemas/ChatMessageAPIResponseListBody.json",
  "messages": [
    {
      "$schema": "https://example.com/schemas/ChatMessage.json",
      "attached_file_extension": null,
      "attached_file_name": null,
      "chars_per_sec": 0,
      "completed": true,
      "content": "How do I create a reusable button component in React with TypeScript? I want it to support different variants like primary, secondary, and danger, plus custom styling props.",
      "created_at": 1703097600000,
      "error": null,
      "finish_reason": "stop",
      "full_content_length": 178,
      "id": "msg-react-1",
      "is_file_attachment": false,
      "is_truncated": false,
      "like": 0,
      "max_tokens": 0,
      "model_name": null,
      "original_file_size": 0,
      "role": "user",
      "size_chars": 178,
      "size_tokens": 42,
      "temperature": 0,
      "thread_id": "thread-react-components",
      "tokens_per_sec": 0,
      "truncated_content_length": 0,
      "updated_at": 1703097600000,
      "user_id": "user-123"
    },
    {
      "$schema": "https://example.com/schemas/ChatMessage.json",
      "attached_file_extension": null,
      "attached_file_name": null,
      "chars_per_sec": 45.2,
      "completed": true,
      "content": "I'll help you create a flexible and reusable Button component in React with TypeScript. Here's a comprehensive implementation:\n\n```typescript\nimport React from 'react';\nimport { cn } from '@/lib/utils'; // utility for className merging\n\n// Define the button variants\ntype ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';\ntype ButtonSize = 'sm' | 'md' | 'lg';\n\ninterface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {\n  variant?: ButtonVariant;\n  size?: ButtonSize;\n  isLoading?: boolean;\n  leftIcon?: React.ReactNode;\n  rightIcon?: React.ReactNode;\n  children: React.ReactNode;\n}\n\nconst Button: React.FC<ButtonProps> = ({\n  variant = 'primary',\n  size = 'md',\n  isLoading = false,\n  leftIcon,\n  rightIcon,\n  className,\n  disabled,\n  children,\n  ...props\n}) => {\n  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';\n  \n  const variantClasses = {\n    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',\n    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',\n    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',\n    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'\n  };\n  \n  const sizeClasses = {\n    sm: 'px-3 py-1.5 text-sm',\n    md: 'px-4 py-2 text-base',\n    lg: 'px-6 py-3 text-lg'\n  };\n\n  return (\n    <button\n      className={cn(\n        baseClasses,\n        variantClasses[variant],\n        sizeClasses[size],\n        className\n      )}\n      disabled={disabled || isLoading}\n      {...props}\n    >\n      {isLoading ? (\n        <svg className=\"animate-spin -ml-1 mr-2 h-4 w-4\" fill=\"none\" viewBox=\"0 0 24 24\">\n          <circle className=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" strokeWidth=\"4\" />\n          <path className=\"opacity-75\" fill=\"currentColor\" d=\"m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\" />\n        </svg>\n      ) : leftIcon ? (\n        <span className=\"mr-2\">{leftIcon}</span>\n      ) : null}\n      \n      {children}\n      \n      {rightIcon && !isLoading && (\n        <span className=\"ml-2\">{rightIcon}</span>\n      )}\n    </button>\n  );\n};\n\nexport default Button;\n```\n\n**Usage Examples:**\n\n```typescript\n// Basic usage\n<Button onClick={() => console.log('clicked')}>Click me</Button>\n\n// Different variants\n<Button variant=\"secondary\">Secondary</Button>\n<Button variant=\"danger\">Delete</Button>\n<Button variant=\"ghost\">Ghost</Button>\n\n// Different sizes\n<Button size=\"sm\">Small</Button>\n<Button size=\"lg\">Large</Button>\n\n// With icons\n<Button leftIcon={<PlusIcon />}>Add Item</Button>\n<Button rightIcon={<ArrowIcon />}>Next</Button>\n\n// Loading state\n<Button isLoading>Processing...</Button>\n\n// Custom styling\n<Button className=\"w-full\" variant=\"primary\">Full Width</Button>\n```\n\n**Key Features:**\n- **TypeScript Support**: Full type safety with proper prop interfaces\n- **Variant System**: Easy to extend with new button styles\n- **Size Options**: Multiple size presets\n- **Icon Support**: Left and right icon slots\n- **Loading State**: Built-in loading spinner\n- **Accessibility**: Proper focus states and disabled handling\n- **Custom Styling**: Accepts additional className props\n- **Flexible**: Extends native button props\n\nThis component is highly reusable and follows React best practices. You can easily extend it with more variants or customize the styling to match your design system!",
      "created_at": 1703097720000,
      "error": null,
      "finish_reason": "stop",
      "full_content_length": 2669,
      "id": "msg-react-2",
      "is_file_attachment": false,
      "is_truncated": false,
      "like": 1,
      "max_tokens": 4096,
      "model_name": "gpt-4-turbo",
      "original_file_size": 0,
      "role": "assistant",
      "size_chars": 2669,
      "size_tokens": 600,
      "temperature": 0.7,
      "thread_id": "thread-react-components",
      "tokens_per_sec": 13.3,
      "truncated_content_length": 0,
      "updated_at": 1703097720000,
      "user_id": "assistant"
    }
  ],
  "order": "created_at_asc",
  "page_number": 1,
  "page_size": 50,
  "total": 2
};

// Chat messages for API Integration thread
export const API_INTEGRATION_MESSAGES = {
  "$schema": "https://example.com/schemas/ChatMessageAPIResponseListBody.json",
  "messages": [
    {
      "$schema": "https://example.com/schemas/ChatMessage.json",
      "attached_file_extension": null,
      "attached_file_name": null,
      "chars_per_sec": 0,
      "completed": true,
      "content": "What are the best practices for API design? I'm building a REST API for a mobile app and want to ensure it's scalable and maintainable.",
      "created_at": 1703011200000,
      "error": null,
      "finish_reason": "stop",
      "full_content_length": 149,
      "id": "msg-api-1",
      "is_file_attachment": false,
      "is_truncated": false,
      "like": 0,
      "max_tokens": 0,
      "model_name": null,
      "original_file_size": 0,
      "role": "user",
      "size_chars": 149,
      "size_tokens": 35,
      "temperature": 0,
      "thread_id": "thread-api-integration",
      "tokens_per_sec": 0,
      "truncated_content_length": 0,
      "updated_at": 1703011200000,
      "user_id": "user-123"
    },
    {
      "$schema": "https://example.com/schemas/ChatMessage.json",
      "attached_file_extension": null,
      "attached_file_name": null,
      "chars_per_sec": 42.8,
      "completed": true,
      "content": "Excellent question! Here are the key best practices for designing scalable and maintainable REST APIs:\n\n## 1. **Resource-Based URLs**\n```\n✅ Good: /api/v1/users/123/orders\n❌ Bad: /api/v1/getUserOrders?userId=123\n```\n\n## 2. **HTTP Methods Correctly**\n- `GET` - Retrieve data\n- `POST` - Create new resources\n- `PUT` - Update/replace entire resource\n- `PATCH` - Partial updates\n- `DELETE` - Remove resources\n\n## 3. **Consistent Response Format**\n```json\n{\n  \"success\": true,\n  \"data\": {...},\n  \"message\": \"Operation successful\",\n  \"timestamp\": \"2024-01-15T10:30:00Z\"\n}\n```\n\n## 4. **Proper Status Codes**\n- `200` - Success\n- `201` - Created\n- `400` - Bad Request\n- `401` - Unauthorized\n- `404` - Not Found\n- `500` - Internal Server Error\n\n## 5. **Versioning Strategy**\n```\n/api/v1/users\n/api/v2/users\n```\n\n## 6. **Pagination & Filtering**\n```\nGET /api/v1/users?page=1&limit=20&sort=created_at&filter=active\n```\n\n## 7. **Security Best Practices**\n- Use HTTPS everywhere\n- Implement proper authentication (JWT/OAuth)\n- Rate limiting\n- Input validation\n- CORS configuration\n\n## 8. **Error Handling**\n```json\n{\n  \"success\": false,\n  \"error\": {\n    \"code\": \"VALIDATION_ERROR\",\n    \"message\": \"Invalid email format\",\n    \"details\": {\n      \"field\": \"email\",\n      \"value\": \"invalid-email\"\n    }\n  }\n}\n```\n\n## 9. **Documentation**\n- Use OpenAPI/Swagger\n- Include examples\n- Keep it updated\n\n## 10. **Performance Optimization**\n- Implement caching (Redis)\n- Use compression (gzip)\n- Database query optimization\n- Background job processing\n\nWould you like me to elaborate on any of these points or discuss specific implementation details?",
      "created_at": 1703011320000,
      "error": null,
      "finish_reason": "stop",
      "full_content_length": 1589,
      "id": "msg-api-2",
      "is_file_attachment": false,
      "is_truncated": false,
      "like": 1,
      "max_tokens": 4096,
      "model_name": "gpt-4-turbo",
      "original_file_size": 0,
      "role": "assistant",
      "size_chars": 1589,
      "size_tokens": 388,
      "temperature": 0.7,
      "thread_id": "thread-api-integration",
      "tokens_per_sec": 11.5,
      "truncated_content_length": 0,
      "updated_at": 1703011320000,
      "user_id": "assistant"
    }
  ],
  "order": "created_at_asc",
  "page_number": 1,
  "page_size": 50,
  "total": 2
};

// Chat messages for Database Schema thread
export const JAVASCRIPT_PROMISES_MESSAGES = {
  "$schema": "https://example.com/schemas/ChatMessageAPIResponseListBody.json",
  "messages": [
    {
      "$schema": "https://example.com/schemas/ChatMessage.json",
      "attached_file_extension": null,
      "attached_file_name": null,
      "chars_per_sec": 0,
      "completed": true,
      "content": "Can you help me understand JavaScript promises and how they work with database operations? I'm confused about async/await vs .then().catch().",
      "created_at": 1702924800000,
      "error": null,
      "finish_reason": "stop",
      "full_content_length": 157,
      "id": "msg-db-1",
      "is_file_attachment": false,
      "is_truncated": false,
      "like": 0,
      "max_tokens": 0,
      "model_name": null,
      "original_file_size": 0,
      "role": "user",
      "size_chars": 157,
      "size_tokens": 37,
      "temperature": 0,
      "thread_id": "thread-javascript-promises",
      "tokens_per_sec": 0,
      "truncated_content_length": 0,
      "updated_at": 1702924800000,
      "user_id": "user-123"
    },
    {
      "$schema": "https://example.com/schemas/ChatMessage.json",
      "attached_file_extension": null,
      "attached_file_name": null,
      "chars_per_sec": 38.9,
      "completed": true,
      "content": "Great question! Let me explain JavaScript Promises and their relationship with database operations.\n\n## What are Promises?\n\nPromises represent the eventual completion (or failure) of an asynchronous operation. They have three states:\n- **Pending**: Initial state\n- **Fulfilled**: Operation completed successfully\n- **Rejected**: Operation failed\n\n## Traditional Promise Syntax (.then/.catch)\n\n```javascript\n// Database query with traditional promises\nfunction getUserData(userId) {\n  return database.query('SELECT * FROM users WHERE id = ?', [userId])\n    .then(result => {\n      console.log('User found:', result[0]);\n      return result[0];\n    })\n    .catch(error => {\n      console.error('Database error:', error);\n      throw error;\n    });\n}\n\n// Usage\ngetUserData(123)\n  .then(user => {\n    console.log('User:', user);\n  })\n  .catch(error => {\n    console.error('Failed to get user:', error);\n  });\n```\n\n## Modern Async/Await Syntax\n\n```javascript\n// Same operation with async/await\nasync function getUserData(userId) {\n  try {\n    const result = await database.query('SELECT * FROM users WHERE id = ?', [userId]);\n    console.log('User found:', result[0]);\n    return result[0];\n  } catch (error) {\n    console.error('Database error:', error);\n    throw error;\n  }\n}\n\n// Usage\nasync function handleUser() {\n  try {\n    const user = await getUserData(123);\n    console.log('User:', user);\n  } catch (error) {\n    console.error('Failed to get user:', error);\n  }\n}\n```\n\n## Key Differences\n\n| Aspect | .then/.catch | async/await |\n|--------|--------------|-------------|\n| **Readability** | Can become nested (\"callback hell\") | Linear, easier to read |\n| **Error Handling** | .catch() for each promise | Single try/catch block |\n| **Debugging** | Harder to debug | Easier to set breakpoints |\n| **Browser Support** | Older browsers | Modern browsers (ES2017+) |\n\n## Complex Example: Multiple Database Operations\n\n```javascript\n// With .then/.catch (can get messy)\nfunction createUserWithProfile(userData, profileData) {\n  return database.query('INSERT INTO users SET ?', userData)\n    .then(userResult => {\n      profileData.user_id = userResult.insertId;\n      return database.query('INSERT INTO profiles SET ?', profileData);\n    })\n    .then(profileResult => {\n      return database.query('SELECT * FROM users WHERE id = ?', [profileData.user_id]);\n    })\n    .then(userWithProfile => {\n      return userWithProfile[0];\n    })\n    .catch(error => {\n      console.error('Transaction failed:', error);\n      throw error;\n    });\n}\n\n// With async/await (much cleaner)\nasync function createUserWithProfile(userData, profileData) {\n  try {\n    const userResult = await database.query('INSERT INTO users SET ?', userData);\n    profileData.user_id = userResult.insertId;\n    \n    await database.query('INSERT INTO profiles SET ?', profileData);\n    \n    const userWithProfile = await database.query('SELECT * FROM users WHERE id = ?', [userResult.insertId]);\n    \n    return userWithProfile[0];\n  } catch (error) {\n    console.error('Transaction failed:', error);\n    throw error;\n  }\n}\n```\n\n## When to Use Each\n\n**Use async/await when:**\n- You want cleaner, more readable code\n- Multiple sequential operations\n- Complex error handling scenarios\n- Modern JavaScript environment\n\n**Use .then/.catch when:**\n- Working with older codebases\n- Simple, one-off promises\n- Need to support older browsers\n- Functional programming style",
      "created_at": 1702925000000,
      "error": null,
      "finish_reason": "stop",
      "full_content_length": 3569,
      "id": "msg-db-2",
      "is_file_attachment": false,
      "is_truncated": false,
      "like": 1,
      "max_tokens": 4096,
      "model_name": "gpt-4-turbo",
      "original_file_size": 0,
      "role": "assistant",
      "size_chars": 3569,
      "size_tokens": 808,
      "temperature": 0.7,
      "thread_id": "thread-javascript-promises",
      "tokens_per_sec": 10.2,
      "truncated_content_length": 0,
      "updated_at": 1702925000000,
      "user_id": "assistant"
    }
  ],
  "order": "created_at_asc",
  "page_number": 1,
  "page_size": 50,
  "total": 2
};

// Chat messages for Performance Optimization thread
export const EMPTY_CHAT_MESSAGES = {
  "$schema": "https://example.com/schemas/ChatMessageAPIResponseListBody.json",
  "messages": [
    {
      "$schema": "https://example.com/schemas/ChatMessage.json",
      "attached_file_extension": null,
      "attached_file_name": null,
      "chars_per_sec": 0,
      "completed": true,
      "content": "Hello! I'm your AI assistant. How can I help you today?",
      "created_at": 1702579200000,
      "error": null,
      "finish_reason": "stop",
      "full_content_length": 55,
      "id": "msg-perf-1",
      "is_file_attachment": false,
      "is_truncated": false,
      "like": 0,
      "max_tokens": 4096,
      "model_name": "gpt-4-turbo",
      "original_file_size": 0,
      "role": "assistant",
      "size_chars": 55,
      "size_tokens": 15,
      "temperature": 0.7,
      "thread_id": "thread-empty",
      "tokens_per_sec": 0,
      "truncated_content_length": 0,
      "updated_at": 1702579200000,
      "user_id": "assistant"
    }
  ],
  "order": "created_at_asc",
  "page_number": 1,
  "page_size": 50,
  "total": 1
};

// All messages organized by thread ID
export const ALL_CHAT_MESSAGES = {
  "thread-react-components": REACT_COMPONENTS_MESSAGES,
  "thread-api-integration": API_INTEGRATION_MESSAGES,
  "thread-javascript-promises": JAVASCRIPT_PROMISES_MESSAGES,
  "thread-empty": EMPTY_CHAT_MESSAGES
};

// Helper function to get formatted timestamp
export const formatTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  console.log('🕒 formatTimestamp:', { timestamp, now, diff, diffInMinutes: diff / (1000 * 60) });

  // Handle future timestamps or very recent (less than 1 minute)
  if (diff < 0) return 'just now';
  if (diff < 60000) return 'just now'; // Less than 1 minute

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));

  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
};

// Helper function to get chat preview from messages
export const getChatPreview = (threadId: string): string => {
  console.log('📖 getChatPreview called for threadId:', threadId);
  console.log('📖 Available message keys:', Object.keys(ALL_CHAT_MESSAGES));

  const messages = ALL_CHAT_MESSAGES[threadId as keyof typeof ALL_CHAT_MESSAGES];
  if (!messages || messages.messages.length === 0) {
    console.log('📖 No messages found for threadId:', threadId);
    return "No messages yet...";
  }

  const lastMessage = messages.messages[messages.messages.length - 1];
  const content = lastMessage.content;
  const preview = content.length > 100 ? content.substring(0, 100) + "..." : content;

  console.log('📖 Generated preview for', threadId, ':', preview);

  // Return first 100 characters with ellipsis if longer
  return preview;
};
