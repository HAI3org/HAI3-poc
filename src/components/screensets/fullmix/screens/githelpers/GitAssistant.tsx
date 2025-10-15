import React, { useState } from 'react';
import {
  GitBranch,
  Shield,
  FileText,
  TrendingUp,
  Bug,
  Zap,
  Search,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  GitCommit,
  Calendar,
  User,
  Code,
  AlertCircle,
  Settings,
  RefreshCw
} from 'lucide-react';

// Interfaces
interface CodeContext {
  before?: string;
  problematic: string;
  after?: string;
}

interface Finding {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  message: string;
  file: string;
  line: number;
  codeContext?: CodeContext;
  suggestion?: string;
}

interface Commit {
  id: string;
  message: string;
  author: string;
  date: string;
  files: string[];
  riskScore: number;
  findings: Finding[];
  status: 'blocked' | 'warning' | 'passed';
}

interface UncommittedChanges {
  files: string[];
  riskScore: number;
  findings: Finding[];
}

interface NavTab {
  id: 'commits' | 'uncommitted' | 'overview' | 'rules';
  label: string;
  icon: React.ComponentType<any>;
}

const GitAssistant: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'commits' | 'uncommitted' | 'overview' | 'rules'>('commits');
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set());
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showOnlyIssues, setShowOnlyIssues] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const mockCommits: Commit[] = [
    {
      id: 'abc123',
      message: 'Add user authentication middleware',
      author: 'john.doe',
      date: '2025-08-28T10:30:00Z',
      files: ['src/auth/middleware.js', 'src/routes/api.js', 'package.json'],
      riskScore: 35,
      findings: [
        {
          type: 'security',
          severity: 'high',
          category: 'Secret Detection',
          message: 'Potential JWT secret hardcoded in middleware.js:42',
          file: 'src/auth/middleware.js',
          line: 42,
          codeContext: {
            before: 'const express = require(\'express\');\nconst jwt = require(\'jsonwebtoken\');\n',
            problematic: 'const JWT_SECRET = "hardcoded-secret-key-12345";',
            after: '\nfunction verifyToken(req, res, next) {\n  const token = req.headers.authorization;'
          },
          suggestion: 'Use environment variables: process.env.JWT_SECRET'
        },
        {
          type: 'security',
          severity: 'medium',
          category: 'AuthZ Gap',
          message: 'New endpoint lacks authorization check',
          file: 'src/routes/api.js',
          line: 15,
          codeContext: {
            before: 'const router = express.Router();\n',
            problematic: 'router.get(\'/admin/users\', (req, res) => {\n  // No authorization check here\n  res.json(users);\n});',
            after: '\nrouter.get(\'/public/health\', (req, res) => {'
          },
          suggestion: 'Add middleware: router.get(\'/admin/users\', authMiddleware, (req, res) => ...)'
        }
      ],
      status: 'blocked'
    },
    {
      id: 'def456',
      message: 'Refactor database connection pool',
      author: 'jane.smith',
      date: '2025-08-28T09:15:00Z',
      files: ['src/db/pool.js', 'src/db/connection.js', 'tests/db.test.js'],
      riskScore: 12,
      findings: [
        {
          type: 'reliability',
          severity: 'medium',
          category: 'Resource Leak',
          message: 'Connection pool may leak resources without proper cleanup',
          file: 'src/db/pool.js',
          line: 78,
          codeContext: {
            before: 'async function executeQuery(sql, params) {\n  const connection = await pool.getConnection();\n  try {',
            problematic: '    const result = await connection.execute(sql, params);\n    return result;\n  } catch (error) {\n    throw error;\n  }',
            after: '\n}'
          },
          suggestion: 'Add finally block: } finally { connection.release(); }'
        }
      ],
      status: 'warning'
    },
    {
      id: 'ghi789',
      message: 'Update dependencies and fix vulnerabilities',
      author: 'mike.wilson',
      date: '2025-08-28T08:45:00Z',
      files: ['package.json', 'package-lock.json', 'yarn.lock'],
      riskScore: 8,
      findings: [
        {
          type: 'security',
          severity: 'low',
          category: 'Vulnerable Dependencies',
          message: 'Updated lodash to fix CVE-2021-23337',
          file: 'package.json',
          line: 45,
          codeContext: {
            before: '  "dependencies": {\n    "express": "^4.18.0",',
            problematic: '    "lodash": "^4.17.20",',
            after: '    "mongoose": "^6.0.0"\n  }'
          },
          suggestion: 'Updated to lodash: "^4.17.21" to fix prototype pollution vulnerability'
        }
      ],
      status: 'passed'
    }
  ];

  const mockUncommitted: UncommittedChanges = {
    files: ['src/utils/validator.js', 'src/models/user.js'],
    riskScore: 15,
    findings: [
      {
        type: 'reliability',
        severity: 'medium',
        category: 'Data Validation',
        message: 'External input not validated against schema',
        file: 'src/utils/validator.js',
        line: 23,
        codeContext: {
          before: 'function validateUserInput(data) {',
          problematic: '  const user = JSON.parse(data);\n  return user;',
          after: '\n}'
        },
        suggestion: 'Add schema validation: const user = validateSchema(JSON.parse(data), userSchema);'
      },
      {
        type: 'maintainability',
        severity: 'low',
        category: 'Code Duplication',
        message: 'Similar validation logic found in user.model.js:156',
        file: 'src/models/user.js',
        line: 89,
        codeContext: {
          before: 'class User {\n  validate(userData) {',
          problematic: '    if (!userData.email || !userData.name) {\n      throw new Error("Invalid user data");\n    }',
          after: '    return true;\n  }\n}'
        },
        suggestion: 'Extract common validation logic to a shared utility function'
      }
    ]
  };

  const getSeverityColor = (severity: string): string => {
    if (severity === 'critical') return 'text-red-700 bg-red-100';
    if (severity === 'high') return 'text-red-600 bg-red-50';
    if (severity === 'medium') return 'text-yellow-600 bg-yellow-50';
    if (severity === 'low') return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusColor = (status: string): string => {
    if (status === 'blocked') return 'text-red-700 bg-red-100 border-red-300';
    if (status === 'warning') return 'text-yellow-700 bg-yellow-100 border-yellow-300';
    if (status === 'passed') return 'text-green-700 bg-green-100 border-green-300';
    return 'text-gray-700 bg-gray-100 border-gray-300';
  };

  const getRiskColor = (score: number): string => {
    if (score >= 20) return 'text-red-600 bg-red-100';
    if (score >= 10) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const toggleCommitExpansion = (commitId: string): void => {
    const newExpanded = new Set(expandedCommits);
    if (newExpanded.has(commitId)) {
      newExpanded.delete(commitId);
    } else {
      newExpanded.add(commitId);
    }
    setExpandedCommits(newExpanded);
  };

  const filteredCommits = mockCommits.filter(commit => {
    if (showOnlyIssues && commit.findings.length === 0) return false;
    if (searchTerm && !commit.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterSeverity !== 'all' && !commit.findings.some(f => f.severity === filterSeverity)) return false;
    return true;
  });

  const navTabs: NavTab[] = [
    { id: 'commits', label: 'Recent Commits', icon: GitCommit },
    { id: 'uncommitted', label: 'Uncommitted Changes', icon: FileText },
    { id: 'overview', label: 'Quality Overview', icon: TrendingUp },
    { id: 'rules', label: 'Analysis Rules', icon: Settings }
  ];

  return (
    <div className="h-full w-full flex flex-col p-4 overflow-y-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GitBranch className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Git Assistant</h1>
              <p className="text-sm text-gray-500">Code Quality & Security Analysis Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
              <RefreshCw className="w-4 h-4" />
              <span>Scan Changes</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 px-6">
        <nav className="flex space-x-8">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id)}
              className={`flex items-center space-x-2 px-3 py-4 border-b-2 text-sm font-medium ${
                selectedView === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search commits, files, or issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button
              onClick={() => setShowOnlyIssues(!showOnlyIssues)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
                showOnlyIssues ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {showOnlyIssues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{showOnlyIssues ? 'Show All' : 'Issues Only'}</span>
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {filteredCommits.length} commits • {filteredCommits.reduce((acc, c) => acc + c.findings.length, 0)} findings
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="">
        {selectedView === 'commits' && (
          <div className="space-y-4">
            {/* Uncommitted Changes */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Uncommitted Changes</h3>
                    <p className="text-sm text-gray-600">{mockUncommitted.files.length} modified files</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(mockUncommitted.riskScore)}`}>
                    Risk Score: {mockUncommitted.riskScore}
                  </span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    {mockUncommitted.findings.length} issues
                  </span>
                </div>
              </div>

              {mockUncommitted.findings.length > 0 && (
                <div className="mt-4 space-y-2">
                  {mockUncommitted.findings.map((finding, idx) => (
                    <div key={idx} className="flex flex-col space-y-3 p-4 bg-white rounded border">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                              {finding.severity.toUpperCase()}
                            </span>
                            <span className="text-xs font-medium text-gray-600">{finding.category}</span>
                          </div>
                          <p className="text-sm text-gray-800 mb-2">{finding.message}</p>
                          <p className="text-xs text-gray-500 mb-3">{finding.file}:{finding.line}</p>

                          {/* Code Context */}
                          {finding.codeContext && (
                            <div className="bg-gray-900 rounded-lg overflow-hidden">
                              <div className="bg-gray-800 px-3 py-1 text-xs text-gray-300 font-medium">
                                Code Context
                              </div>
                              <div className="p-3 font-mono text-sm">
                                {/* Before code */}
                                {finding.codeContext?.before && (
                                  <div className="text-gray-400 mb-1">
                                    {finding.codeContext.before.split('\n').map((line, i) => (
                                      <div key={i} className="flex">
                                        <span className="text-gray-600 mr-3 select-none w-6 text-right">
                                          {finding.line - (finding.codeContext?.before?.split('\n').length || 0) + i}
                                        </span>
                                        <span>{line}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Problematic code */}
                                <div className="bg-yellow-900 bg-opacity-30 border-l-2 border-yellow-500 pl-2 mb-1">
                                  {finding.codeContext?.problematic.split('\n').map((line, i) => (
                                    <div key={i} className="flex text-yellow-300">
                                      <span className="text-yellow-600 mr-3 select-none w-6 text-right font-bold">
                                        {finding.line + i}
                                      </span>
                                      <span>{line}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* After code */}
                                {finding.codeContext?.after && (
                                  <div className="text-gray-400">
                                    {finding.codeContext.after.split('\n').map((line, i) => (
                                      <div key={i} className="flex">
                                        <span className="text-gray-600 mr-3 select-none w-6 text-right">
                                          {finding.line + (finding.codeContext?.problematic.split('\n').length || 0) + i}
                                        </span>
                                        <span>{line}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Suggestion */}
                          {finding.suggestion && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                              <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                  <p className="text-sm font-medium text-blue-800 mb-1">Suggested Fix:</p>
                                  <p className="text-sm text-blue-700">{finding.suggestion}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Commit History */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Recent Commits</h3>
              {filteredCommits.map(commit => (
                <div key={commit.id} className="bg-white border border-gray-200 rounded-lg">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleCommitExpansion(commit.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {expandedCommits.has(commit.id) ?
                          <ChevronDown className="w-4 h-4 text-gray-400" /> :
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        }
                        <div>
                          <p className="font-medium text-gray-900">{commit.message}</p>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{commit.author}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(commit.date).toLocaleString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Code className="w-3 h-3" />
                              <span>{commit.files.length} files</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(commit.riskScore)}`}>
                          Risk: {commit.riskScore}
                        </span>
                        <span className={`px-2 py-1 rounded border text-xs font-medium ${getStatusColor(commit.status)}`}>
                          {commit.status.toUpperCase()}
                        </span>
                        {commit.findings.length > 0 && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            {commit.findings.length} issues
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedCommits.has(commit.id) && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Files Changed:</h4>
                        <div className="flex flex-wrap gap-2">
                          {commit.files.map(file => (
                            <span key={file} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                              {file}
                            </span>
                          ))}
                        </div>
                      </div>

                      {commit.findings.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Analysis Results:</h4>
                          <div className="space-y-2">
                            {commit.findings.map((finding, idx) => (
                              <div key={idx} className="flex flex-col space-y-3 p-4 bg-white rounded border">
                                <div className="flex items-start space-x-3">
                                  <AlertCircle className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                                        {finding.severity.toUpperCase()}
                                      </span>
                                      <span className="text-xs font-medium text-gray-600">{finding.category}</span>
                                    </div>
                                    <p className="text-sm text-gray-800 mb-2">{finding.message}</p>
                                    <p className="text-xs text-gray-500 mb-3">{finding.file}:{finding.line}</p>

                                    {/* Code Context */}
                                    {finding.codeContext && (
                                      <div className="bg-gray-900 rounded-lg overflow-hidden">
                                        <div className="bg-gray-800 px-3 py-1 text-xs text-gray-300 font-medium">
                                          Code Context
                                        </div>
                                        <div className="p-3 font-mono text-sm">
                                          {/* Before code */}
                                          {finding.codeContext?.before && (
                                            <div className="text-gray-400 mb-1">
                                              {finding.codeContext.before.split('\n').map((line, i) => (
                                                <div key={i} className="flex">
                                                  <span className="text-gray-600 mr-3 select-none w-6 text-right">
                                                    {finding.line - (finding.codeContext?.before?.split('\n').length || 0) + i}
                                                  </span>
                                                  <span>{line}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}

                                          {/* Problematic code */}
                                          <div className="bg-red-900 bg-opacity-30 border-l-2 border-red-500 pl-2 mb-1">
                                            {finding.codeContext?.problematic.split('\n').map((line, i) => (
                                              <div key={i} className="flex text-red-300">
                                                <span className="text-red-600 mr-3 select-none w-6 text-right font-bold">
                                                  {finding.line + i}
                                                </span>
                                                <span>{line}</span>
                                              </div>
                                            ))}
                                          </div>

                                          {/* After code */}
                                          {finding.codeContext?.after && (
                                            <div className="text-gray-400">
                                              {finding.codeContext.after.split('\n').map((line, i) => (
                                                <div key={i} className="flex">
                                                  <span className="text-gray-600 mr-3 select-none w-6 text-right">
                                                    {finding.line + (finding.codeContext?.problematic.split('\n').length || 0) + i}
                                                  </span>
                                                  <span>{line}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Suggestion */}
                                    {finding.suggestion && (
                                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                                        <div className="flex items-start space-x-2">
                                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                          <div>
                                            <p className="text-sm font-medium text-green-800 mb-1">Suggested Fix:</p>
                                            <p className="text-sm text-green-700">{finding.suggestion}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedView === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Risk Distribution</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">High Risk</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Medium Risk</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Low Risk</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">1</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'rules' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Analysis Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Security</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Secret Detection</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Vulnerability Scan</span>
                  </label>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Quality</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Code Complexity</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Test Coverage</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitAssistant;
