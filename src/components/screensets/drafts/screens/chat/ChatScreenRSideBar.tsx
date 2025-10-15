import React from 'react';
import { ChevronLeft, ChevronRight, Settings, BookOpen, Wrench, Edit3, X, User, FileText, ChevronDown } from 'lucide-react';

// Types for context data
interface Context {
  id: string;
  name: string;
  color: string;
}

interface ChatScreenRSideBarProps {
  rightSidebarOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  showAddInstruction: boolean;
  setShowAddInstruction: (show: boolean) => void;
  instructionText: string;
  setInstructionText: (text: string) => void;
  instructionName: string;
  setInstructionName: (name: string) => void;
  onAddInstruction: () => void;
  onCancelAddInstruction: () => void;
  availableContexts?: Context[];
}

const ChatScreenRSideBar: React.FC<ChatScreenRSideBarProps> = ({
  rightSidebarOpen,
  onToggle,
  onClose,
  showAddInstruction,
  setShowAddInstruction,
  instructionText,
  setInstructionText,
  instructionName,
  setInstructionName,
  onAddInstruction,
  onCancelAddInstruction,
  availableContexts = [],
}) => {
  return (
    <>
      {/* Right rail - toggle handle */}
      <div className={`absolute py-8 top-0 z-40 w-12 h-full hx-rsidebar-rail flex flex-col items-center py-8 gap-2 transition-all duration-300 ${rightSidebarOpen ? 'right-[480px]' : 'right-0'}`}>
        <button
          onClick={onToggle}
          className="p-2 hx-rail-btn rounded-lg"
          title={rightSidebarOpen ? 'Collapse context' : 'Show context'}
        >
          {rightSidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <button className="p-2 hx-rail-btn rounded-lg" title="Context">
          <BookOpen size={16} />
        </button>
        <button className="p-2 hx-rail-btn rounded-lg" title="Settings">
          <Settings size={16} />
        </button>
        <button className="p-2 hx-rail-btn rounded-lg" title="Tools">
          <Wrench size={16} />
        </button>
      </div>

      {/* Right overlay panel */}
      <div className={`absolute py-4 top-0 z-30 h-full w-[480px] hx-rsidebar transition-all duration-300 ${rightSidebarOpen ? 'right-0' : '-right-[480px]'}`}>
        <div className="flex h-full flex-col">
          <div className="px-4 py-3 hx-rsidebar-header flex items-center justify-between">
            <h2 className="text-lg font-semibold hx-rsidebar-title">Context</h2>
            <div className="flex gap-2">
              <button className="p-1 hx-rail-close-btn rounded transition-colors">
                <Edit3 size={16} />
              </button>
              <button onClick={onClose} className="p-1 hx-rail-close-btn rounded transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 hx-body-primary">
            {showAddInstruction ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold hx-rsidebar-title">Add Instruction</h3>
                  <button onClick={onCancelAddInstruction} className="p-1 hx-rail-close-btn rounded transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <p className="text-sm opacity-80">Select existing or add new items to the chat context.</p>

                <div className="flex items-center gap-3 text-green-600">
                  <User size={20} />
                  <span className="text-lg font-medium">Add Instruction</span>
                  <ChevronDown size={16} />
                </div>

                <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50 dark:bg-transparent">
                  <textarea
                    value={instructionText}
                    onChange={(e) => setInstructionText(e.target.value)}
                    placeholder="Enter an instruction here or select a file to use as instruction"
                    className="hx-textarea-primary w-full h-64 p-3 rounded-lg resize-none"
                  />
                  <div className="flex justify-start mt-3">
                    <button className="hx-btn hx-btn-ghost p-2 rounded-lg">
                      <FileText size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Edit3 size={20} className="text-white" />
                  </div>
                  <input
                    type="text"
                    value={instructionName}
                    onChange={(e) => setInstructionName(e.target.value)}
                    placeholder="New instruction's name"
                    className="hx-input-primary flex-1 px-3 py-2 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button onClick={onCancelAddInstruction} className="hx-btn hx-btn-secondary px-6 py-2 rounded-lg">
                    Cancel
                  </button>
                  <button
                    onClick={onAddInstruction}
                    disabled={!instructionText?.trim() || !instructionName?.trim()}
                    className={`hx-btn px-6 py-2 rounded-lg ${
                      instructionText?.trim() && instructionName?.trim() ? 'hx-btn-primary' : 'hx-btn-secondary cursor-not-allowed'
                    }`}
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm opacity-80 mb-4">Select existing or add new items to the chat context.</p>

                <div className="space-y-2 mb-6">
                  <button
                    onClick={() => setShowAddInstruction(true)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg border transition-colors"
                  >
                    <User size={16} className="text-green-600" />
                    <div>
                      <div className="text-sm font-medium text-green-600">Add Instruction</div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 ml-auto" />
                  </button>

                  <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg border transition-colors">
                    <FileText size={16} className="text-green-600" />
                    <div>
                      <div className="text-sm font-medium text-green-600">Add Information</div>
                      <div className="text-xs text-gray-500">(Work in progress)</div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 ml-auto" />
                  </button>

                  <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">
                    <Wrench size={16} className="text-green-600" />
                    <div>
                      <div className="text-sm font-medium text-green-600">Add Tool</div>
                      <div className="text-xs text-gray-500">(Work in progress)</div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 ml-auto" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Filter contexts"
                      className="hx-input-primary flex-1 px-3 py-2 text-sm rounded-lg"
                    />
                    <div className="flex gap-1">
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input type="checkbox" className="hx-checkbox w-3 h-3" />
                        Is Default
                      </label>
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input type="checkbox" className="hx-checkbox w-3 h-3" />
                        Is File
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {availableContexts.map((context) => (
                    <div key={context.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                      <input type="checkbox" className="hx-checkbox w-4 h-4" />
                      <div className={`w-3 h-3 ${context.color} rounded`}></div>
                      <User size={14} className="text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{context.name}</div>
                      </div>
                      <div className="text-xs text-gray-500">1 week ago</div>
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit3 size={12} className="text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <X size={12} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatScreenRSideBar;
