import React, { useEffect, useMemo, useState } from 'react';
import { Settings as SettingsIcon, Eye, EyeOff } from 'lucide-react';
import { useHubspotParams } from '../context/HubspotParamsContext';
import { getProviders, selectProvider, updateProvider } from '../service/provider.service';

type ProviderType = {
  name: string;
  model: string[];
};

type Provider = {
  id: string;
  name: string;
  key: string | null;
  maxToken: number;
  typeKey: string;
  type: ProviderType;
  isUsed: boolean;
  defaultModel?: number | null;
};

const Settings: React.FC = () => {
  const { params } = useHubspotParams();
  const portalId = params.portalId || '';

  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [model, setModel] = useState<string>('');
  const [maxTokens, setMaxTokens] = useState<number>(1000);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [savedBanner, setSavedBanner] = useState<string>('');

  const selectedProvider = useMemo(() => providers.find(p => p.id === selectedProviderId), [providers, selectedProviderId]);

  const pickModelByIndex = (models: string[], indexMaybe: number | null | undefined): string => {
    if (!Array.isArray(models) || models.length === 0) return '';
    const index = typeof indexMaybe === 'number' && indexMaybe >= 0 && indexMaybe < models.length ? indexMaybe : 0;
    return models[index] ?? models[0] ?? '';
  };

  useEffect(() => {
    if (!portalId) return;
    let isMounted = true;
    const loadProviders = async () => {
      setIsLoading(true);
      try
      {
        const res = await getProviders(portalId);
        const list: Provider[] = Array.isArray(res?.data) ? res.data as Provider[] : [];
        if (!isMounted) return;
        setProviders(list);
        const active = list.find(p => p.isUsed) || list[0];
        if (active)
        {
          setSelectedProviderId(active.id);
          setApiKey(active.key || '');
          setMaxTokens(typeof active.maxToken === 'number' ? active.maxToken : 0);
          const models = Array.isArray(active.type?.model) ? active.type.model : [];
          const nextModel = pickModelByIndex(models, active.defaultModel ?? null);
          setModel(nextModel);
        }
      } finally
      {
        if (isMounted) setIsLoading(false);
      }
    };
    loadProviders();
    return () => {
      isMounted = false;
    };
  }, [portalId]);

  const handleEngineChange = async (providerId: string) => {
    if (!portalId) return;
    setIsLoading(true);
    try
    {
      await selectProvider(portalId, providerId);
      const found = providers.find(p => p.id === providerId);
      setSelectedProviderId(providerId);
      if (found)
      {
        setApiKey(found.key || '');
        setMaxTokens(typeof found.maxToken === 'number' ? found.maxToken : 0);
        const models = Array.isArray(found.type?.model) ? found.type.model : [];
        const nextModel = pickModelByIndex(models, found.defaultModel ?? null);
        setModel(nextModel);
      }
      setProviders(prev => prev.map(p => ({ ...p, isUsed: p.id === providerId })));
    } finally
    {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!portalId || !selectedProviderId) return;
    setIsSaving(true);
    try
    {
      const models = selectedProvider?.type?.model || [];
      const index = models.indexOf(model);
      const defaultModelIndex = index >= 0 ? index : 0;
      await updateProvider(portalId, selectedProviderId, { key: apiKey, maxToken: maxTokens, defaultModel: defaultModelIndex });
      setSavedBanner('Saved successfully');
      setTimeout(() => setSavedBanner(''), 2000);
      try
      {
        const refreshed = await getProviders(portalId);
        const list: Provider[] = Array.isArray(refreshed?.data) ? refreshed.data as Provider[] : [];
        setProviders(list);
        // sync current model from refreshed provider data by defaultModel index
        const now = list.find(p => p.id === selectedProviderId);
        const models = now?.type?.model || [];
        const nextModel = pickModelByIndex(models, now?.defaultModel ?? null);
        setModel(nextModel);
      } catch { }
    } finally
    {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-5 h-5 text-[#667eea]" />
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
            value={selectedProviderId}
            onChange={(e) => handleEngineChange(e.target.value)}
            disabled={isLoading || !providers.length}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Model</label>
          <select
            value={model}
            onChange={async (e) => {
              const value = e.target.value;
              setModel(value);
              if (portalId && selectedProvider)
              {
                const models = selectedProvider?.type?.model || [];
                const index = models.indexOf(value);
                const defaultModelIndex = index >= 0 ? index : 0;
                try
                {
                  await updateProvider(portalId, selectedProvider.id, { key: apiKey, maxToken: maxTokens, defaultModel: defaultModelIndex });
                  // reflect in local state
                  setProviders(prev => prev.map(p => p.id === selectedProvider.id ? { ...p, defaultModel: defaultModelIndex } : p));
                } catch { }
              }
            }}
            disabled={!selectedProvider || !(selectedProvider?.type?.model?.length)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
          >
            {(selectedProvider?.type?.model || []).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2 pr-20 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
            />
            <button
              type="button"
              aria-label={showKey ? 'Hide API key' : 'Show API key'}
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#667eea] hover:text-[#5a6de0] p-1 rounded"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">Key will be saved to your workspace settings.</p>
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Max tokens</label>
          <input
            type="number"
            min={1}
            placeholder="e.g. 4000"
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
          />
          <p className="text-xs text-slate-500 mt-2">Maximum tokens per response for this provider.</p>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading || !selectedProviderId}
          className="px-4 py-2 bg-[#667eea] text-white rounded-lg hover:bg-[#5a6de0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default Settings;


