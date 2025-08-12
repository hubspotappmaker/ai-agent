import React, { useState } from 'react';
import { History as HistoryIcon } from 'lucide-react';

type MailActivity = {
  id: string;
  subject: string;
  date: string;
  body: string;
};

const Activity: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMail, setSelectedMail] = useState<MailActivity | null>(null);

  const mailActivities: MailActivity[] = [
    {
      id: 'm1',
      subject: 'Follow-up on yesterday meeting',
      date: '2024-06-01 10:20',
      body:
        'Dear Team,\n\nThank you for your time yesterday. As discussed, please find the next steps and action items attached.\n\nBest regards,\nYou',
    },
  ];

  const handleView = (mail: MailActivity) => {
    setSelectedMail(mail);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMail(null);
  };

  return (
    <div className="h-[65vh] overflow-hidden flex flex-col p-6">
      <div className="flex items-center gap-2 mb-6">
        <HistoryIcon className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-800">Activity</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2" style={{ scrollbarWidth: 'thin' }}>
        {mailActivities.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{item.subject}</p>
              <p className="text-xs text-slate-500">{item.date}</p>
            </div>
            <button onClick={() => handleView(item)} className="text-blue-600 text-sm hover:underline">
              View
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && selectedMail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-base font-semibold text-slate-900">{selectedMail.subject}</h4>
                <p className="text-xs text-slate-500 mt-1">{selectedMail.date}</p>
              </div>
              <button onClick={closeModal} className="text-slate-600 hover:text-slate-900 text-sm">
                Close
              </button>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 whitespace-pre-wrap text-sm text-slate-800">
              {selectedMail.body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activity;


