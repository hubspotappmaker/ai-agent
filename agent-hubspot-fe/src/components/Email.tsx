import React, { useEffect, useRef, useState } from 'react';
import JoditEditor from 'jodit-react';
import { Mail, Plus, Trash2, X } from 'lucide-react';
import { getCurrentEngine } from '../service/provider.service';
import { useHubspotParams } from '../context/HubspotParamsContext';
import { getAllTone, createNewTone, deleteToneById, changeToDefault, generateEmail as generateEmailAPI, saveTempleteEmail } from '../service/mail.service';
import { message, Modal } from 'antd';

type Tone = {
  id: string;
  title: string;
  description: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

const Email: React.FC = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [customContent, setCustomContent] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [generatedEmailHtml, setGeneratedEmailHtml] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [tones, setTones] = useState<Tone[]>([]);
  const [isLoadingTones, setIsLoadingTones] = useState<boolean>(false);
  const [isCreatingTone, setIsCreatingTone] = useState<boolean>(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState<boolean>(false);
  const [promptTitle, setPromptTitle] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const [deletingToneId, setDeletingToneId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const senderOptions = ['you@company.com', 'sales@company.com', 'support@company.com'];
  const recipientOptions = ['client.a@example.com', 'client.b@example.com', 'team@example.com'];
  const [sender, setSender] = useState<string>('you@company.com');
  const [recipient, setRecipient] = useState<string>('client.a@example.com');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendBanner, setSendBanner] = useState<string>('');
  const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null);
  const { params } = useHubspotParams();

  const generateEmail = async () => {
    if (!customContent.trim())
    {
      return;
    }

    setIsGeneratingEmail(true);
    try
    {
      const selectedTone = tones.find((tone) => tone.id === selectedPrompt) || tones.find((tone) => tone.isDefault) || tones[0];

      // Prepare content with tone context
      let contentToGenerate = customContent;
      if (selectedTone)
      {
        contentToGenerate = `Tone: ${selectedTone.title}\nTone Description: ${selectedTone.description}\n\nContent Request: ${customContent}`;
      }

      const response = await generateEmailAPI(params.portalId!, {
        content: contentToGenerate
      });

      if (response?.status && response?.data)
      {
        const emailContent = response.data;
        setGeneratedEmail(emailContent);
        setGeneratedEmailHtml(emailContent.replace(/\n/g, '<br/>'));
      } else
      {
        // Fallback if API fails
        const fallbackContent = selectedTone
          ? `Dear Sir/Madam,\n\n${selectedTone.description}\n\n${customContent}\n\nBest regards,\n[Your Name]`
          : customContent;
        setGeneratedEmail(fallbackContent);
        setGeneratedEmailHtml(fallbackContent.replace(/\n/g, '<br/>'));
      }
    } catch (error)
    {
      console.error('Error generating email:', error);
      // Fallback on error
      const selectedTone = tones.find((tone) => tone.id === selectedPrompt) || tones.find((tone) => tone.isDefault) || tones[0];
      const fallbackContent = selectedTone
        ? `Dear Sir/Madam,\n\n${selectedTone.description}\n\n${customContent}\n\nBest regards,\n[Your Name]`
        : customContent;
      setGeneratedEmail(fallbackContent);
      setGeneratedEmailHtml(fallbackContent.replace(/\n/g, '<br/>'));
    } finally
    {
      setIsGeneratingEmail(false);
    }
  };

  const clearGeneratedEmail = () => {
    setGeneratedEmail('');
    setGeneratedEmailHtml('');
    setSendBanner('');
    setCustomContent('');
    setSavedTemplateId(null);
    try
    {
      localStorage.removeItem('generated_email');
      localStorage.removeItem('generated_email_html');
      localStorage.removeItem('email_idea');
    } catch { }
  };

  useEffect(() => {
    // Load saved generated email on mount
    try
    {
      const saved = localStorage.getItem('generated_email');
      const savedHtml = localStorage.getItem('generated_email_html');
      const savedIdea = localStorage.getItem('email_idea');
      if (saved) setGeneratedEmail(saved);
      if (savedHtml) setGeneratedEmailHtml(savedHtml);
      if (savedIdea) setCustomContent(savedIdea);
    } catch { }
  }, []);

  useEffect(() => {
    // Persist generated email whenever it changes
    try
    {
      if (generatedEmail)
      {
        localStorage.setItem('generated_email', generatedEmail);
      } else
      {
        localStorage.removeItem('generated_email');
      }
    } catch { }
  }, [generatedEmail]);

  useEffect(() => {
    try
    {
      if (generatedEmailHtml)
      {
        localStorage.setItem('generated_email_html', generatedEmailHtml);
      } else
      {
        localStorage.removeItem('generated_email_html');
      }
    } catch { }
  }, [generatedEmailHtml]);

  useEffect(() => {
    // Persist Email Idea
    try
    {
      if (customContent)
      {
        localStorage.setItem('email_idea', customContent);
      } else
      {
        localStorage.removeItem('email_idea');
      }
    } catch { }
  }, [customContent]);

  useEffect(() => {
    if (generatedEmail)
    {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [generatedEmail]);

  const fetchTones = async () => {
    setIsLoadingTones(true);
    try
    {
      const response = await getAllTone();
      if (response?.status)
      {
        const list: Tone[] = response.data || [];
        setTones(list);
        // Set default selected tone if not selected or invalid
        if (!selectedPrompt || !list.some((t) => t.id === selectedPrompt))
        {
          const def = list.find((t) => t.isDefault) || list[0];
          if (def) setSelectedPrompt(def.id);
        }
      }
    } catch (error)
    {
      console.error('Error fetching tones:', error);
    } finally
    {
      setIsLoadingTones(false);
    }
  };

  useEffect(() => {
    const fetchEngine = async () => {
      try
      {
        const res = await getCurrentEngine(params.portalId!);
        const payload = res?.data?.data ?? res?.data ?? null;
        const typeKey = payload?.typeKey;
        if (typeKey)
        {
          localStorage.setItem('current_engine', typeKey);
        }
      } catch { }
    };
    fetchEngine();
    fetchTones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSaveTemplate = async () => {
    if (!generatedEmailHtml || !generatedEmailHtml.trim()) return;

    setIsSavingTemplate(true);
    try
    {
      const response = await saveTempleteEmail({
        content: generatedEmailHtml,
        portalId: params.portalId!
      });

      if (response?.status)
      {
        message.success('Template saved successfully');
        console.log('[SaveTemplate] Saved:', response.data);
        setSavedTemplateId(response.data?.id?.toString() || null);
      } else
      {
        message.error('Failed to save template');
      }
    } catch (error)
    {
      console.error('Error saving template:', error);
      message.error('Failed to save template');
    } finally
    {
      setIsSavingTemplate(false);
    }
  };

  const handleCreateTone = async () => {
    if (promptTitle.trim() && promptContent.trim())
    {
      setIsCreatingTone(true);
      try
      {
        const response = await createNewTone({
          title: promptTitle,
          description: promptContent,
        });
        if (response?.status)
        {
          await fetchTones();
          setShowModal(false);
          setPromptTitle('');
          setPromptContent('');
        }
      } catch (error)
      {
        console.error('Error creating tone:', error);
      } finally
      {
        setIsCreatingTone(false);
      }
    }
  };

  const confirmDeleteTone = (tone: Tone) => {
    Modal.confirm({
      icon: null,
      title: 'Delete Tone',
      content: (
        <div className="text-slate-600">
          Are you sure you want to delete the tone <span className="font-medium">{tone.title}</span>?
        </div>
      ),
      okText: 'Delete',
      cancelText: 'Cancel',
      okButtonProps: { style: { backgroundColor: '#667eea', color: 'white' } },
      onOk: async () => {
        setDeletingToneId(tone.id);
        try
        {
          const response = await deleteToneById(tone.id);
          if (response?.status)
          {
            await fetchTones();
          }
        } catch (error)
        {
          console.error('Error deleting tone:', error);
        } finally
        {
          setDeletingToneId(null);
        }
      },
    });
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
          New Tone
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Email Tone</label>
        <div className="relative">
          <div
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-[#667eea] focus-within:border-transparent flex items-center justify-between cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="flex-1 truncate">
              {selectedPrompt && tones.length > 0 ? (
                <>
                  {tones.find(tone => tone.id === selectedPrompt)?.title}
                  {tones.find(tone => tone.id === selectedPrompt)?.isDefault && (
                    <span className="inline-block ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Default</span>
                  )}
                </>
              ) : (
                isLoadingTones ? 'Loading tones...' : 'Select a tone'
              )}
            </div>
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'transform rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>

          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {tones.length === 0 ? (
                <div className="px-4 py-2 text-sm text-slate-500">No tones available</div>
              ) : (
                tones.map((tone) => (
                  <div key={tone.id} className="border-b border-slate-100 last:border-b-0">
                    <div className="flex items-center justify-between px-4 py-2 hover:bg-slate-50">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={async () => {
                          setSelectedPrompt(tone.id);
                          setShowDropdown(false);
                          try
                          {
                            await changeToDefault(tone.id);
                            await fetchTones();
                          } catch (error)
                          {
                            console.error('Error setting default tone:', error);
                          }
                        }}
                      >
                        <div className="font-medium text-slate-800">{tone.title}</div>
                        <div className="text-xs text-slate-500 truncate">{tone.description}</div>
                        {tone.isDefault && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Default</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteTone(tone);
                        }}
                        disabled={deletingToneId === tone.id}
                        className="ml-2 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        title="Delete tone"
                      >
                        {deletingToneId === tone.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        {/* {isLoadingTones && <p className="text-sm text-slate-500 mt-1">Loading tones...</p>} */}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Email Idea</label>
        <textarea
          rows={4}
          placeholder="Enter specific content for your email..."
          value={customContent}
          onChange={(e) => setCustomContent(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={generateEmail}
          disabled={isGeneratingEmail || !customContent.trim()}
          className="flex-1 py-3 bg-[#667eea] text-white rounded-lg hover:bg-[#5a6de0] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingEmail ? 'Generating…' : 'Generate Email'}
        </button>
      </div>

      {generatedEmail && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Generated Email</h4>
          <div className="bg-white border border-slate-200 rounded-lg">
            <JoditEditor
              value={generatedEmailHtml}
              onChange={(newContent) => setGeneratedEmailHtml(newContent)}
              className="min-h-[200px]"
              config={{
                readonly: false,
                height: 300,
                toolbarSticky: false,
                toolbarAdaptive: false,
                removeButtons: [],
                buttons: [
                  'source', '|',
                  'bold', 'italic', 'underline', 'strikethrough', 'eraser', '|',
                  'ul', 'ol', '|',
                  'font', 'fontsize', 'brush', 'paragraph', '|',
                  'image', 'table', 'link', '|',
                  'left', 'center', 'right', 'justify', '|',
                  'undo', 'redo', 'fullsize'
                ]
              }}
            />
          </div>

          {/* Action Panel */}
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Actions</span>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveTemplate}
                  disabled={!generatedEmailHtml || !generatedEmailHtml.trim() || isSavingTemplate}
                  className="px-3 py-1.5 bg-[#667eea] text-white rounded-md hover:bg-[#5a6de0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-xs font-medium flex items-center gap-1.5"
                  title="Save current content as template"
                >
                  {isSavingTemplate && (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isSavingTemplate ? 'Saving...' : 'Save Template'}
                </button>
                <button
                  onClick={clearGeneratedEmail}
                  className="px-3 py-1.5 flex items-center gap-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-xs font-medium"
                  title="Clear generated email"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Success Panel */}
          {savedTemplateId && (
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-[#667eea]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-slate-800 mb-1">Template Saved Successfully!</h4>
                  <p className="text-xs text-slate-600 mb-3">Your email template has been saved with ID: {savedTemplateId}</p>
                  <div className="flex gap-2">
                    <a
                      href={`https://app.hubspot.com/design-manager/${params.portalId}/code/${savedTemplateId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#667eea] text-white rounded-md hover:bg-[#5a6de0] transition-colors duration-200 text-xs font-medium"
                    >
                      <Mail className="w-3 h-3" />
                      Go to Template
                    </a>

                    <a
                      href={`https://app.hubspot.com/email/${params.portalId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#667eea] rounded-md hover:border-[#667eea] border border-transparent transition-colors duration-200 text-xs font-medium"
                    >
                      <Mail className="w-3 h-3" />
                      Go to send email
                    </a>

                    <button
                      onClick={() => setSavedTemplateId(null)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-blue-100 rounded-md transition-colors duration-200 text-xs font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* <div className="mt-4 border border-slate-200 rounded-lg p-4">
            {sendBanner && (
              <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-xs">{sendBanner}</div>
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
          </div> */}
        </div>
      )}
      <div ref={bottomRef} />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Tone</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tone Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Meeting Invitation Email"
                  value={promptTitle}
                  onChange={(e) => setPromptTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tone Description *</label>
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
                onClick={handleCreateTone}
                disabled={isCreatingTone}
                className="flex-1 py-2 px-4 bg-[#667eea] text-white rounded-lg hover:bg-[#5a6de0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isCreatingTone ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Email;
