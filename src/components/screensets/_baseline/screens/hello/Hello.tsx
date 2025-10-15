import React from 'react';
import { Heart, Sparkles, Code, Rocket } from 'lucide-react';

interface HelloProps {
  onScreensetChange?: (screensetId: string) => void;
}

function Hello({ onScreensetChange: onScreensetChange }: HelloProps): JSX.Element {
  return (
    <div className="h-full hx-body-primary flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Main Welcome Section */}
        <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
          {/* Animated Icon */}
          <div className="relative mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg">
              <Rocket className="w-12 h-12 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Hello <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">World!</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Welcome to the <strong>Baseline Screenset</strong> of HAI3 UI Demo.
            This is a simple demonstration showing how the screenset system works.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center mb-3">
                <Code className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-blue-900">Simple & Clean</h3>
              </div>
              <p className="text-blue-700">
                This baseline screenset demonstrates the minimal configuration with just one screen.
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center mb-3">
                <Sparkles className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-purple-900">Screenset System</h3>
              </div>
              <p className="text-purple-700">
                Switch between different UI screensets using the selector at the top-right of the screen.
              </p>
            </div>
          </div>

          {/* Action Section */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Try the Other Screensets</h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                🎯 Baseline (Current)
              </span>
              <button
                onClick={() => onScreensetChange?.('fullmix')}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium hover:bg-green-200 transition-colors cursor-pointer"
              >
                🚀 Full Mix - Complete Experimental Features
              </button>
              <button
                onClick={() => onScreensetChange?.('mockups')}
                className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium hover:bg-orange-200 transition-colors cursor-pointer"
              >
                💬 Mockups - Approved Features
              </button>
              <button
                onClick={() => onScreensetChange?.('drafts')}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium hover:bg-purple-200 transition-colors cursor-pointer"
              >
                🔬 Drafts - Upcoming Release Cycle
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-center text-gray-500">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 mx-2" />
            <span>using React & Tailwind CSS</span>
          </div>
        </div>

        {/* Development Info */}
        <div className="mt-6 text-sm text-gray-500">
          <p>
            💡 <strong>Tip:</strong> Use the screenset selector at the top-right to explore different UI configurations.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Hello;
