import React, { useState, useRef } from 'react';
import {
  Upload,
  Settings,
  Download,
  Copy,
  FileText,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  X,
  FileDown,
  FileType
} from 'lucide-react';

interface Document {
  id: number;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  status: 'pending' | 'processing' | 'completed';
  originalContent: string;
  summary: string | null;
  summaryOptions: any;
  processingOptions?: ProcessingOptions;
  summaryDate: string | null;
  model: string | null;
  timeTaken: number | null;
  cost: string | null;
  style: string | null;
}

interface ProcessingOptions {
  action: string;
  size: string;
  style: string;
  customLength: number;
  language: string;
  correctErrors: boolean;
  resizeType: string;
  customPercentage: number;
  model: string;
  instructions: string;
}

interface Model {
  id: string;
  vendor: string;
  name: string;
  size: string;
  category: string;
}

interface ModelCost {
  inputTokens: number;
  outputTokens: number;
  inputCost: string;
  outputCost: string;
  totalCost: string;
  isLocal: boolean;
}

const DocumentsProcessing: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      name: 'Sample Document.pdf',
      size: 1024000,
      type: 'application/pdf',
      uploadDate: '2024-01-15T10:30:00Z',
      status: 'completed',
      originalContent: 'This is a sample document content that would be extracted from the PDF file.',
      summary: 'This document provides a comprehensive overview of the subject matter, covering key points and important details that are essential for understanding the topic.',
      summaryOptions: { size: 'medium', style: 'professional' },
      summaryDate: '2024-01-15T10:35:00Z',
      model: 'gpt-4o-mini',
      timeTaken: 25,
      cost: '0.0023',
      style: 'professional'
    }
  ]);

  const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    action: 'summarize',
    size: 'medium',
    style: 'professional',
    customLength: 500,
    language: 'original',
    correctErrors: false,
    resizeType: 'original',
    customPercentage: 100,
    model: 'gpt-4o-mini',
    instructions: ''
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [modelSearch, setModelSearch] = useState<string>('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<string>('asc');
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Model data
  const models: Model[] = [
    { id: 'gpt-4o-mini', vendor: 'OpenAI', name: 'GPT-4o Mini', size: '0.1', category: 'Fast & cost-effective' },
    { id: 'gpt-4o', vendor: 'OpenAI', name: 'GPT-4o', size: '0.5', category: 'High quality & detailed' },
    { id: 'claude-3-haiku', vendor: 'Anthropic', name: 'Claude 3 Haiku', size: '0.2', category: 'Fast & accurate' },
    { id: 'claude-3-sonnet', vendor: 'Anthropic', name: 'Claude 3 Sonnet', size: '0.8', category: 'Excellent quality' },
    { id: 'llama-3.1-8b', vendor: 'Meta', name: 'Llama 3.1 8B', size: '8', category: 'Free & accurate' },
    { id: 'llama-3.1-70b', vendor: 'Meta', name: 'Llama 3.1 70B', size: '70', category: 'Best quality, local' },
    { id: 'gemini-pro', vendor: 'Google', name: 'Gemini Pro', size: '0.3', category: 'Fast & cost-effective' },
    { id: 'gemini-ultra', vendor: 'Google', name: 'Gemini Ultra', size: '1.2', category: 'Excellent quality' },
    { id: 'mistral-7b', vendor: 'Mistral', name: 'Mistral 7B', size: '7', category: 'Free & accurate' },
    { id: 'mixtral-8x7b', vendor: 'Mistral', name: 'Mixtral 8x7B', size: '56', category: 'Best quality, local' }
  ];

  const getModelCost = (model: string, documentSize: number): ModelCost => {
    const costs: Record<string, { input: number; output: number }> = {
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'gpt-4o': { input: 0.005, output: 0.015 },
      'claude-3-haiku': { input: 0.00025, output: 0.00125 },
      'claude-3-sonnet': { input: 0.003, output: 0.015 },
      'llama-3.1-8b': { input: 0, output: 0 }, // Local model
      'llama-3.1-70b': { input: 0, output: 0 }, // Local model
      'gemini-pro': { input: 0.000125, output: 0.000375 },
      'gemini-ultra': { input: 0.0075, output: 0.03 },
      'mistral-7b': { input: 0, output: 0 }, // Local model
      'mixtral-8x7b': { input: 0, output: 0 }  // Local model
    };

    const modelCost = costs[model] || costs['gpt-4o-mini'];
    const estimatedInputTokens = Math.ceil(documentSize / 4); // Rough estimate: 4 chars per token
    const estimatedOutputTokens = processingOptions.size === 'sentence' ? 25 :
                                 processingOptions.size === 'paragraph' ? 100 :
                                 processingOptions.size === 'paragraphs' ? 400 :
                                 processingOptions.size === 'page' ? 800 :
                                 processingOptions.customLength;

    const inputCost = (estimatedInputTokens / 1000) * modelCost.input;
    const outputCost = (estimatedOutputTokens / 1000) * modelCost.output;
    const totalCost = inputCost + outputCost;

    return {
      inputTokens: estimatedInputTokens,
      outputTokens: estimatedOutputTokens,
      inputCost: inputCost.toFixed(4),
      outputCost: outputCost.toFixed(4),
      totalCost: totalCost.toFixed(4),
      isLocal: modelCost.input === 0
    };
  };

  const sortModels = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedModels = models
    .filter(model =>
      model.vendor.toLowerCase().includes(modelSearch.toLowerCase()) ||
      model.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      model.category.toLowerCase().includes(modelSearch.toLowerCase())
    )
    .sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortField) {
        case 'vendor':
          aVal = a.vendor;
          bVal = b.vendor;
          break;
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'size':
          aVal = parseFloat(a.size);
          bVal = parseFloat(b.size);
          break;
        case 'category':
          aVal = a.category;
          bVal = b.category;
          break;
        case 'cost':
          const aCost = getModelCost(a.id, currentDoc?.size || 0);
          const bCost = getModelCost(b.id, currentDoc?.size || 0);
          aVal = aCost.isLocal ? 0 : parseFloat(aCost.totalCost);
          bVal = bCost.isLocal ? 0 : parseFloat(bCost.totalCost);
          break;
        default:
          aVal = a.name;
          bVal = b.name;
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  // Simulated document processing
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newDoc: Document = {
      id: Date.now(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      status: 'pending',
      originalContent: `This is a simulated preview of ${file.name}. In a real implementation, this would contain the actual document content extracted from the uploaded file.`,
      summary: null,
      summaryOptions: null,
      summaryDate: null,
      model: null,
      timeTaken: null,
      cost: null,
      style: null
    };

    setDocuments(prev => [newDoc, ...prev]);
    setCurrentDoc(newDoc);
    setActiveTab('configure');

    // Start processing immediately
    processDocument(newDoc.id);
  };

  const processDocument = async (docId: number) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    // Update status to processing
    setDocuments(prev => prev.map(d =>
      d.id === docId ? { ...d, status: 'processing' } : d
    ));

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    const costInfo = getModelCost(processingOptions.model, doc.size);
    const timeTaken = Math.floor(Math.random() * 30) + 10; // 10-40 seconds

    const processedDoc: Document = {
      ...doc,
      status: 'completed',
      summary: generateMockSummary(doc.name, processingOptions),
      processingOptions: { ...processingOptions },
      summaryDate: new Date().toISOString(),
      model: processingOptions.model,
      timeTaken: timeTaken,
      cost: costInfo.totalCost,
      style: processingOptions.style
    };

    setDocuments(prev => prev.map(d => d.id === docId ? processedDoc : d));
  };

  const generateMockSummary = (fileName: string, options: ProcessingOptions): string => {
    const summaries: Record<string, string> = {
      short: `Brief summary of ${fileName}: Key points extracted and condensed into essential information.`,
      medium: `This document summary provides a comprehensive overview of ${fileName}. The content has been analyzed and the most important concepts, findings, and conclusions have been extracted. This ${options.style} summary maintains the core message while reducing the overall length by approximately 70-80%.`,
      long: `Detailed summary of ${fileName}: This comprehensive analysis covers all major topics, themes, and conclusions presented in the original document. The summary maintains the document's structure and flow while condensing the information into a more digestible format. Key insights, supporting evidence, and important details have been preserved to ensure nothing critical is lost in the summarization process. This ${options.style} approach ensures readers can quickly grasp the full scope and significance of the original content.`,
      custom: `Custom summary of ${fileName} (${options.customLength} words): This tailored summary has been generated according to your specific requirements, balancing comprehensiveness with brevity to deliver exactly the level of detail you requested.`
    };

    return summaries[options.size] || summaries.medium;
  };

  const handleDownload = (format: string, docId: number) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    const content = doc.summary || doc.originalContent;

    if (format === 'txt') {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.name}_summary.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'word') {
      // For Word format, we'll create a simple HTML file that Word can open
      const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>${doc.name} Summary</title>
          </head>
          <body>
            <h1>${doc.name} Summary</h1>
            <p>${content.replace(/\n/g, '</p><p>')}</p>
          </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.name}_summary.html`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // For PDF, we'll create a simple text file for now
      // In a real implementation, you'd use a PDF library
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.name}_summary.txt`;
      a.click();
      URL.revokeObjectURL(url);
      alert('PDF download not implemented yet. Downloaded as text file instead.');
    } else if (format === 'copy') {
      navigator.clipboard.writeText(content);
      alert('Summary copied to clipboard!');
    }
  };

  const deleteDocument = (docId: number) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    if (currentDoc && currentDoc.id === docId) {
      setCurrentDoc(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'processing':
        return <Clock size={16} className="text-blue-500" />;
      case 'pending':
        return <AlertCircle size={16} className="text-yellow-500" />;
      default:
        return <FileText size={16} className="text-gray-400" />;
    }
  };

  interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    [key: string]: any;
  }

  const Button: React.FC<ButtonProps> = ({ children, variant = "primary", className = "", size = "md", ...props }) => {
    const baseClasses = "rounded-lg font-medium transition-colors";
    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
    };
    const variantClasses = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white",
      secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
      danger: "bg-red-600 hover:bg-red-700 text-white"
    };
    return (
      <button className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...props}>
        {children}
      </button>
    );
  };

  return (
    <div className="h-full w-full flex p-4 gap-6 overflow-y-auto">
      {/* Left Half - Wizard */}
      <div className="w-1/2">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {[
                { id: 'upload', label: 'Upload Document', icon: Upload },
                                  { id: 'configure', label: 'Configure', icon: Settings }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Upload Document</h2>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 cursor-pointer transition-colors"
                >
                  <Upload size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-gray-500">
                    Support for PDF, DOCX, TXT files up to 10MB
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Configure Tab */}
            {activeTab === 'configure' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Configure</h2>

                {currentDoc && (
                  <div className="space-y-6">
                    {/* Document Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{currentDoc.name}</h3>
                      <p className="text-sm text-gray-600">{formatFileSize(currentDoc.size)}</p>
                    </div>

                    {/* Action Selector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Processing Action
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { value: 'summarize', label: 'Summarize' },
                          { value: 'correct', label: 'Correct errors' },
                          { value: 'translate', label: 'Translate' },
                          { value: 'custom', label: 'Custom' }
                        ].map(action => (
                          <label key={action.value} className="relative">
                            <input
                              type="radio"
                              name="action"
                              value={action.value}
                              checked={processingOptions.action === action.value}
                              onChange={(e) => setProcessingOptions(prev => ({ ...prev, action: e.target.value }))}
                              className="sr-only"
                            />
                            <div className={`p-2 rounded-lg border cursor-pointer transition-colors text-center ${
                              processingOptions.action === action.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}>
                              <p className="font-medium text-sm">{action.label}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Summarize Options */}
                    {processingOptions.action === 'summarize' && (
                      <>
                        <div className="grid grid-cols-3 gap-4">
                          {/* Summary Length */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Length
                            </label>
                            <select
                              value={processingOptions.size}
                              onChange={(e) => setProcessingOptions(prev => ({ ...prev, size: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="sentence">1 Sentence</option>
                              <option value="paragraph">1 Paragraph</option>
                              <option value="paragraphs">3-5 Paragraphs</option>
                              <option value="page">1 Page</option>
                              <option value="custom">Custom</option>
                            </select>
                          </div>

                          {/* Summary Style */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Style
                            </label>
                            <select
                              value={processingOptions.style}
                              onChange={(e) => setProcessingOptions(prev => ({ ...prev, style: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="professional">Professional</option>
                              <option value="casual">Casual</option>
                              <option value="academic">Academic</option>
                              <option value="technical">Technical</option>
                              <option value="executive">Executive</option>
                            </select>
                          </div>

                          {/* Language */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Language
                            </label>
                            <select
                              value={processingOptions.language}
                              onChange={(e) => setProcessingOptions(prev => ({ ...prev, language: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="original">Original</option>
                              <option value="english">English</option>
                              <option value="spanish">Spanish</option>
                              <option value="french">French</option>
                              <option value="german">German</option>
                              <option value="italian">Italian</option>
                              <option value="portuguese">Portuguese</option>
                              <option value="russian">Russian</option>
                              <option value="chinese">Chinese</option>
                              <option value="japanese">Japanese</option>
                              <option value="korean">Korean</option>
                            </select>
                          </div>
                        </div>

                        {/* Custom Length Input */}
                        {processingOptions.size === 'custom' && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Word count</label>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              placeholder="500"
                              value={processingOptions.customLength}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value > 0 && Number.isInteger(value)) {
                                  setProcessingOptions(prev => ({ ...prev, customLength: value }));
                                }
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* Correct Options */}
                    {processingOptions.action === 'correct' && (
                      <div>
                        {/* Only Instructions and Model Selection for Correct */}
                      </div>
                    )}

                    {/* Translate Options */}
                    {processingOptions.action === 'translate' && (
                      <div className="grid grid-cols-2 gap-4">
                        {/* Language */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Language
                          </label>
                          <select
                            value={processingOptions.language}
                            onChange={(e) => setProcessingOptions(prev => ({ ...prev, language: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="english">English</option>
                            <option value="spanish">Spanish</option>
                            <option value="french">French</option>
                            <option value="german">German</option>
                            <option value="italian">Italian</option>
                            <option value="portuguese">Portuguese</option>
                            <option value="russian">Russian</option>
                            <option value="chinese">Chinese</option>
                            <option value="japanese">Japanese</option>
                            <option value="korean">Korean</option>
                          </select>
                        </div>

                        {/* Style */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Translation Style
                          </label>
                          <select
                            value={processingOptions.style}
                            onChange={(e) => setProcessingOptions(prev => ({ ...prev, style: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="original">Close to   original</option>
                            <option value="professional">Professional</option>
                            <option value="casual">Casual</option>
                            <option value="kids">Kids</option>
                            <option value="university">University</option>
                            <option value="academic">Academic</option>
                            <option value="technical">Technical</option>
                            <option value="executive">Executive</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Custom Options */}
                    {processingOptions.action === 'custom' && (
                      <>
                        {/* Resize */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Resize
                          </label>
                          <select
                            value={processingOptions.resizeType}
                            onChange={(e) => setProcessingOptions(prev => ({ ...prev, resizeType: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="original">Original</option>
                            <option value="resize">Resize %</option>
                            <option value="words">Words count</option>
                          </select>

                          {processingOptions.resizeType === 'resize' && (
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                              <input
                                type="number"
                                min="1"
                                max="500"
                                placeholder="100"
                                value={processingOptions.customPercentage}
                                onChange={(e) => setProcessingOptions(prev => ({ ...prev, customPercentage: parseInt(e.target.value) || 100 }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          )}

                          {processingOptions.resizeType === 'words' && (
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Word count</label>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                placeholder="500"
                                value={processingOptions.customLength}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (value > 0 && Number.isInteger(value)) {
                                    setProcessingOptions(prev => ({ ...prev, customLength: value }));
                                  }
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          {/* Resize */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Resize
                            </label>
                            <select
                              value={processingOptions.resizeType}
                              onChange={(e) => setProcessingOptions(prev => ({ ...prev, resizeType: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="original">Original</option>
                              <option value="resize">Resize %</option>
                              <option value="words">Words count</option>
                            </select>
                          </div>

                          {/* Style */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Style
                            </label>
                            <select
                              value={processingOptions.style}
                              onChange={(e) => setProcessingOptions(prev => ({ ...prev, style: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="professional">Professional</option>
                              <option value="casual">Casual</option>
                              <option value="academic">Academic</option>
                              <option value="technical">Technical</option>
                              <option value="executive">Executive</option>
                            </select>
                          </div>

                          {/* Language */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Language
                            </label>
                            <select
                              value={processingOptions.language}
                              onChange={(e) => setProcessingOptions(prev => ({ ...prev, language: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="original">Original</option>
                              <option value="english">English</option>
                              <option value="spanish">Spanish</option>
                              <option value="french">French</option>
                              <option value="german">German</option>
                              <option value="italian">Italian</option>
                              <option value="portuguese">Portuguese</option>
                              <option value="russian">Russian</option>
                              <option value="chinese">Chinese</option>
                              <option value="japanese">Japanese</option>
                            </select>
                          </div>
                        </div>

                        {/* Conditional Inputs */}
                        {processingOptions.resizeType === 'resize' && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                            <input
                              type="number"
                              min="1"
                              max="500"
                              placeholder="100"
                              value={processingOptions.customPercentage}
                              onChange={(e) => setProcessingOptions(prev => ({ ...prev, customPercentage: parseInt(e.target.value) || 100 }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}

                        {processingOptions.resizeType === 'words' && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Word count</label>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              placeholder="500"
                              value={processingOptions.customLength}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value > 0 && Number.isInteger(value)) {
                                  setProcessingOptions(prev => ({ ...prev, customLength: value }));
                                }
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}

                        {/* Correct Errors */}
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={processingOptions.correctErrors}
                              onChange={(e) => setProcessingOptions(prev => ({ ...prev, correctErrors: e.target.checked }))}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Correct errors</span>
                          </label>
                        </div>

                        {/* Custom Instructions - Only for Custom */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom instructions
                          </label>
                          <textarea
                            value={processingOptions.instructions}
                            onChange={(e) => setProcessingOptions(prev => ({ ...prev, instructions: e.target.value }))}
                            placeholder="Focus on technical details, emphasize key findings, maintain professional tone..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[60px] placeholder-gray-400"
                            rows={2}
                          />
                        </div>
                      </>
                    )}

                                        {/* AI Model Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        AI Model Selection
                      </label>

                      {/* Search */}
                      <div className="mb-3">
                        <input
                          type="text"
                          placeholder="Search models..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onChange={(e) => setModelSearch(e.target.value)}
                        />
                      </div>

                      {/* Model Table */}
                      <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                          <div className="grid grid-cols-5 gap-4 text-xs font-semibold text-gray-800">
                            <div className="cursor-pointer hover:text-blue-600" onClick={() => sortModels('vendor')}>
                              Vendor {sortField === 'vendor' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </div>
                            <div className="cursor-pointer hover:text-blue-600" onClick={() => sortModels('name')}>
                              Model Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </div>
                            <div className="cursor-pointer hover:text-blue-600" onClick={() => sortModels('size')}>
                              Size (GB) {sortField === 'size' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </div>
                            <div className="cursor-pointer hover:text-blue-600" onClick={() => sortModels('category')}>
                              Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </div>
                            <div className="cursor-pointer hover:text-blue-600" onClick={() => sortModels('cost')}>
                              Est. Cost {sortField === 'cost' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </div>
                          </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto bg-white">
                          {filteredAndSortedModels.map(model => {
                            const costInfo = getModelCost(model.id, currentDoc.size);
                            return (
                              <div
                                key={model.id}
                                className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                                  processingOptions.model === model.id ? 'bg-blue-200 border-blue-400 shadow-md' : ''
                                }`}
                                onClick={() => setProcessingOptions(prev => ({ ...prev, model: model.id }))}
                              >
                                <div className="grid grid-cols-5 gap-4 text-sm">
                                  <div className="font-medium">{model.vendor}</div>
                                  <div>{model.name}</div>
                                  <div>{model.size}</div>
                                  <div className="text-xs text-gray-600">{model.category}</div>
                                  <div className="text-xs font-medium">
                                    {costInfo.isLocal ? (
                                      <span className="text-green-600 bg-green-100 px-2 py-1 rounded">Free</span>
                                    ) : (
                                      <span className="bg-gray-100 px-2 py-1 rounded">${costInfo.totalCost}</span>
                                    )}
                                  </div>
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Process Button */}
                      <div className="mt-6">
                        <button
                          onClick={() => {
                            if (currentDoc && processingOptions.model) {
                              processDocument(currentDoc.id);
                            }
                          }}
                          disabled={!processingOptions.model || !currentDoc}
                          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                            processingOptions.model && currentDoc
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {processingOptions.model ? (
                            <>
                              <Play size={16} className="inline-block mr-2" />
                              {processingOptions.action === 'summarize' && `Summarize with ${models.find(m => m.id === processingOptions.model)?.name} model`}
                              {processingOptions.action === 'correct' && `Correct errors with ${models.find(m => m.id === processingOptions.model)?.name} model`}
                              {processingOptions.action === 'translate' && `Translate with ${models.find(m => m.id === processingOptions.model)?.name} model`}
                              {processingOptions.action === 'custom' && `Process with ${models.find(m => m.id === processingOptions.model)?.name} model`}
                              {currentDoc && (
                                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                  getModelCost(processingOptions.model, currentDoc.size).isLocal
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {getModelCost(processingOptions.model, currentDoc.size).isLocal ? 'Free' : `$${getModelCost(processingOptions.model, currentDoc.size).totalCost}`}
                                </span>
                              )}
                            </>
                          ) : (
                            'Select a model to continue'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Half - Processed Documents */}
      <div className="w-1/2">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Documents Processing</h3>
            {documents.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all document history? This action cannot be undone.')) {
                    setDocuments([]);
                    setCurrentDoc(null);
                  }
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Clear History"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div className="p-4 overflow-y-auto h-full">
            {documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className={`border rounded-lg cursor-pointer transition-colors ${
                      selectedDocument === doc.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedDocument(selectedDocument === doc.id ? null : doc.id)}
                  >
                                        {/* Document Header */}
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(doc.status)}
                            <p className="font-medium text-sm truncate">{doc.name}</p>
                          </div>
                        </div>

                        {/* Action Icons - Always Visible */}
                        {doc.status === 'completed' && (
                          <div className="flex space-x-1 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload('copy', doc.id);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                              title="Copy text"
                            >
                              <Copy size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload('txt', doc.id);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                              title="Download as text"
                            >
                              <FileText size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload('word', doc.id);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                              title="Download as Word"
                            >
                              <FileType size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload('pdf', doc.id);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                              title="Download as PDF"
                            >
                              <FileDown size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteDocument(doc.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                              title="Delete document"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar for Processing */}
                      {doc.status === 'processing' && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Processing...</p>
                        </div>
                      )}

                                            {/* Status Info */}
                      {doc.status === 'completed' && (
                        <div className="mt-3 flex justify-between items-start">
                          {/* Left side - File info */}
                          <div className="text-xs text-gray-500 flex-shrink-0">
                            <div>{formatFileSize(doc.size)}</div>
                            <div>{new Date(doc.uploadDate).toLocaleDateString()}</div>
                          </div>

                          {/* Center - Style and Model */}
                          <div className="text-xs text-gray-600 text-right flex-1 px-2">
                            <div>Style: {doc.style || 'N/A'}</div>
                            <div>Model: {doc.model || 'N/A'}</div>
                          </div>

                          {/* Right side - Time and Cost */}
                          <div className="text-xs text-gray-600 text-right flex-shrink-0">
                            <div>Time: {doc.timeTaken || 'N/A'}s</div>
                            <div>Cost: {doc.cost === '0.0000' ? 'Free' : `$${doc.cost || 'N/A'}`}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expanded Summary */}
                    {selectedDocument === doc.id && doc.summary && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="mt-3">
                          <h4 className="font-medium text-sm text-gray-900 mb-2">Summary</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{doc.summary}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No documents yet</p>
                <p className="text-xs">Upload a document to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsProcessing;
