import React from 'react';
import { BookOpen } from 'lucide-react';

const UserGuide: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-800">User Guide</h3>
      </div>

      <div className="space-y-4 text-sm text-slate-700">
        <div>
          <h4 className="font-semibold text-slate-900 mb-1">Chat</h4>
          <p>Use the Chat tab to converse with the AI assistant. Press Enter to send, Shift+Enter for a new line.</p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 mb-1">Email</h4>
          <p>Select a template, add your additional content, then click Generate. Create reusable prompts via New Prompt.</p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 mb-1">Settings</h4>
          <p>Choose one AI engine used across the app and provide your API key. Data is saved in your browser.</p>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;


