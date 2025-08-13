import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { Modal } from 'antd';
import { getHubspotAccount } from '../service/auth.service';

type HubspotAccount = {
  id: string;
  email: string;
  portalId: string;
  accountType: string;
};

const Account: React.FC = () => {
  const [accounts, setAccounts] = useState<HubspotAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res: any = await getHubspotAccount();
        // Support both axios original and normalized wrapper shapes
        const raw = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
        setAccounts(raw as HubspotAccount[]);
      } catch (e: any) {
        setError(e?.message || 'Failed to load accounts');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleDelete = (account: HubspotAccount) => {
    Modal.confirm({
      icon: null,
      title: 'Delete account',
      content: `Are you sure you want to delete HubSpot account ${account.portalId}?`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okButtonProps: { style: { backgroundColor: '#667eea', color: 'white' } },
      onOk: async () => {
        // TODO: call backend delete endpoint when provided, then refresh list
      },
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="w-5 h-5 text-[#667eea]" />
        <h3 className="text-lg font-semibold text-slate-800">HubSpot Accounts</h3>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Portal ID</th>
                <th className="text-left px-4 py-3 font-medium">Account Type</th>
                <th className="text-right px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={4}>Loading…</td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={4}>No accounts found</td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-slate-800">{acc.email}</td>
                    <td className="px-4 py-3 text-slate-800">{acc.portalId}</td>
                    <td className="px-4 py-3 text-slate-800">{acc.accountType}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(acc)}
                        className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Account;


