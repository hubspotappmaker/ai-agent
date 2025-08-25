import React, { useEffect, useState } from 'react';
import { Spin, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useHubspotParams } from '../context/HubspotParamsContext';
import { getHubspotInstallLink, hasHubspot } from '../service/auth.service';

const HubspotInstall: React.FC = () => {
  const { params, navigateWithParams } = useHubspotParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [installUrl, setInstallUrl] = useState<string>('');
  const [messageApi, contextHolder] = message.useMessage();
  const [isPolling, setIsPolling] = useState<boolean>(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        if (!params.portalId) {
          messageApi.error('Missing HubSpot portalId.');
          return;
        }
        // If already associated, go back home
        const check = await hasHubspot(params.portalId);
        const has = check && check.data === true;
        if (has) {
          navigateWithParams('/');
          return;
        }
        const res = await getHubspotInstallLink();
        const link = res && res.data ? String(res.data) : '';
        setInstallUrl(link);
      } catch (e: any) {
        messageApi.error(e?.message || 'Failed to load install link');
      } finally {
        setLoading(false);
      }
    };
    prepare();
  }, [params.portalId, navigateWithParams, messageApi]);

  const onAssociate = () => {
    if (installUrl) {
      window.open(installUrl, '_blank', 'noopener,noreferrer');
      setIsPolling(true);
    }
  };

  useEffect(() => {
    if (!isPolling || !params.portalId) return;
    let timer: number | undefined;
    const poll = async () => {
      try {
        const check = await hasHubspot(params.portalId!);
        const associated = check && check.data === true;
        if (associated) {
          messageApi.success('HubSpot connected successfully.');
          navigateWithParams('/chat', { replace: true });
          return;
        }
      } catch {}
      timer = window.setTimeout(poll, 5000);
    };
    timer = window.setTimeout(poll, 5000);
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [isPolling, params.portalId, navigateWithParams, messageApi]);

  const copyPortalId = () => {
    const portalId = params.portalId || '';
    
    // Phương pháp 1: Thử Clipboard API trước
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(portalId)
        .then(() => {
          messageApi.success('Portal ID copied to clipboard!');
        })
        .catch(() => {
          // Fallback to method 2
          fallbackCopy(portalId);
        });
    } else {
      // Phương pháp 2: Fallback với execCommand
      fallbackCopy(portalId);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      // Tạo textarea tạm thời
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      // Focus và select text
      textArea.focus();
      textArea.select();
      
      // Thực hiện copy
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        messageApi.success('Portal ID copied to clipboard!');
      } else {
        messageApi.error('Copy failed. Please copy manually: ' + text);
      }
    } catch (err) {
      messageApi.error('Copy failed. Please copy manually: ' + text);
    }
  };

  return (
    <div className="p-6">
      {contextHolder}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Connect HubSpot</h3>
        <p className="text-sm text-slate-600">We need to associate this workspace with your HubSpot account.</p>
        {params.portalId && (
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-slate-500">Portal ID: {params.portalId}</p>
            <button
              onClick={copyPortalId}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors duration-200"
              title="Copy Portal ID"
            >
              <CopyOutlined className="text-xs" />
            </button>
          </div>
        )}
      </div>

      <div className="pt-2">
        {loading ? (
          <div className="flex items-center gap-2"><Spin /> <span>Preparing install link...</span></div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={onAssociate}
              disabled={!installUrl || isPolling}
              className="px-4 py-2 bg-[#667eea] text-white rounded-lg hover:bg-[#5a6de0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isPolling ? 'Installing...' : 'associate with this account'}
            </button>
            {isPolling && installUrl && (
              <button
                onClick={() => window.open(installUrl, '_blank', 'noopener,noreferrer')}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors duration-200"
              >
                Reopen
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HubspotInstall;


