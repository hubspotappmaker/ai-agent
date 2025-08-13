import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Mail, Plus } from 'lucide-react';

type CustomPrompt = { key: string; title: string; content: string };

const Email: React.FC = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<string>('business');
  const [customContent, setCustomContent] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [generatedEmailHtml, setGeneratedEmailHtml] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([]);
  const [promptTitle, setPromptTitle] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const senderOptions = ['you@company.com', 'sales@company.com', 'support@company.com'];
  const recipientOptions = ['client.a@example.com', 'client.b@example.com', 'team@example.com'];
  const [sender, setSender] = useState<string>('you@company.com');
  const [recipient, setRecipient] = useState<string>('client.a@example.com');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendBanner, setSendBanner] = useState<string>('');

  const predefinedPrompts = {
    business: 'Professional Business Email',
    thank: 'Thank You Email',
    follow: 'Follow-up Email',
    marketing: 'Marketing Email',
  } as const;

  type PredefinedKey = keyof typeof predefinedPrompts;

  const generateEmail = () => {
    const sampleEmails: Record<PredefinedKey, string> = {
      business: `Dear Sir/Madam,

I hope this email finds you well.

${customContent}

I look forward to collaborating with you in the near future.

Best regards,
[Your Name]`,
      thank: `Dear Sir/Madam,

I would like to express my sincere gratitude.

${customContent}

Thank you once again for your valuable time and consideration.

Best regards,
[Your Name]`,
      follow: `Dear Sir/Madam,

Thank you for taking the time to meet with us yesterday.

${customContent}

I will monitor the progress and report back to you next week.

Best regards,
[Your Name]`,
      marketing: `Dear Valued Customer,

We are excited to introduce our new product/service.

${customContent}

Contact us now to receive special offers!

Best regards,
Marketing Team`,
    };

    const isPredefinedKey = (key: string): key is PredefinedKey => key in predefinedPrompts;

    if (isPredefinedKey(selectedPrompt)) {
      setGeneratedEmail(sampleEmails[selectedPrompt]);
      setGeneratedEmailHtml(sampleEmails[selectedPrompt].replace(/\n/g, '<br/>'));
      return;
    }

    const label = predefinedPrompts[selectedPrompt as PredefinedKey] ?? 'Custom Prompt';
    const plain = `Email generated from prompt: ${label}\n\n${customContent}`;
    setGeneratedEmail(plain);
    setGeneratedEmailHtml(plain.replace(/\n/g, '<br/>'));
  };

  useEffect(() => {
    if (generatedEmail) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [generatedEmail]);

  const handleSendEmail = () => {
    if (!sender || !recipient || !generatedEmail) return;
    setIsSending(true);
    setSendBanner('');
    setTimeout(() => {
      setIsSending(false);
      setSendBanner('Email sent successfully');
      setTimeout(() => setSendBanner(''), 2000);
    }, 800);
  };

  const handleCreatePrompt = () => {
    if (promptTitle.trim() && promptContent.trim()) {
      const newPrompt = {
        key: `custom_${Date.now()}`,
        title: promptTitle,
        content: promptContent,
      };
      setCustomPrompts([...customPrompts, newPrompt]);
      setShowModal(false);
      setPromptTitle('');
      setPromptContent('');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#667eea]" />
          <h3 className="text-lg font-semibold text-slate-800">Email Generator</h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          New Prompt
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Email Template</label>
        <select
          value={selectedPrompt}
          onChange={(e) => setSelectedPrompt(e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
        >
          <option value="business">Business Email</option>
          <option value="thank">Thank You Email</option>
          <option value="follow">Follow-up Email</option>
          <option value="marketing">Marketing Email</option>
          {customPrompts.map((prompt) => (
            <option key={prompt.key} value={prompt.key}>
              {prompt.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Additional Content</label>
        <textarea
          rows={4}
          placeholder="Enter specific content for your email..."
          value={customContent}
          onChange={(e) => setCustomContent(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent resize-none"
        />
      </div>

      <button
        onClick={generateEmail}
        className="w-full py-3 bg-[#667eea] text-white rounded-lg hover:bg-[#5a6de0] transition-colors duration-200 font-medium"
      >
        Generate Email
      </button>

      {generatedEmail && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Generated Email</h4>
          <div className="bg-white border border-slate-200 rounded-lg">
            <ReactQuill
              theme="snow"
              value={generatedEmailHtml}
              onChange={setGeneratedEmailHtml}
              className="min-h-[200px]"
            />
          </div>
          {/* Send panel */}
          <div className="mt-4 border border-slate-200 rounded-lg p-4">
            {sendBanner && (
              <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-xs">
                {sendBanner}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Sender</label>
                <select
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent text-sm"
                >
                  {senderOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Recipient</label>
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent text-sm"
                >
                  {recipientOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleSendEmail}
                disabled={isSending || !sender || !recipient}
                className="px-4 py-2 bg-[#667eea] text-white rounded-lg hover:bg-[#5a6de0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
              >
                {isSending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Prompt</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prompt Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Meeting Invitation Email"
                  value={promptTitle}
                  onChange={(e) => setPromptTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prompt Description *</label>
                <textarea
                  rows={3}
                  placeholder="Describe how to create this email..."
                  value={promptContent}
                  onChange={(e) => setPromptContent(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 px-4 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePrompt}
                className="flex-1 py-2 px-4 bg-[#667eea] text-white rounded-lg hover:bg-[#5a6de0] transition-colors duration-200"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Email;


