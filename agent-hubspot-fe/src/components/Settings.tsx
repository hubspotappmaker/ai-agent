import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

type AIEngine = 'deepseek' | 'gpt' | 'grok';

const MODEL_OPTIONS: Record<AIEngine, string[]> = {
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  gpt: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
  grok: ['grok-2-mini', 'grok-2'],
};

const Settings: React.FC = () => {
  const [engine, setEngine] = useState<AIEngine>('deepseek');
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [maxTokens, setMaxTokens] = useState<number>(1000);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedBanner, setSavedBanner] = useState<string>('');

  useEffect(() => {
    try {
      const storedEngine = localStorage.getItem('settings.engine') as AIEngine | null;
      const storedKey = localStorage.getItem('settings.apiKey');
      const storedModel = localStorage.getItem('settings.model');
      const storedMaxTokens = localStorage.getItem('settings.maxTokens');

      const effectiveEngine = storedEngine ?? 'deepseek';
      setEngine(effectiveEngine);
      if (storedKey) setApiKey(storedKey);
      if (storedModel) {
        setModel(storedModel);
      } else {
        setModel(MODEL_OPTIONS[effectiveEngine][0]);
      }
      if (storedMaxTokens) setMaxTokens(Number(storedMaxTokens));
    } catch {}
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('settings.engine', engine);
      localStorage.setItem('settings.apiKey', apiKey);
      localStorage.setItem('settings.model', model);
      localStorage.setItem('settings.maxTokens', String(maxTokens));
      setSavedBanner('Saved successfully');
      setTimeout(() => setSavedBanner(''), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-800">Settings</h3>
      </div>

      {savedBanner && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-2 text-sm">
          {savedBanner}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">AI Engine</label>
          <select
            value={engine}
            onChange={(e) => {
              const newEngine = e.target.value as AIEngine;
              setEngine(newEngine);
              const options = MODEL_OPTIONS[newEngine];
              if (!options.includes(model)) {
                setModel(options[0]);
              }
            }}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="deepseek">Deepseek</option>
            <option value="gpt">GPT</option>
            <option value="grok">Grok</option>
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {MODEL_OPTIONS[engine].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
          <input
            type="password"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-slate-500 mt-2">Your key is stored locally in your browser.</p>
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Max tokens</label>
          <input
            type="number"
            min={1}
            placeholder="e.g. 4000"
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-slate-500 mt-2">Maximum tokens per response. Stored locally.</p>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving || !apiKey.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default Settings;


