import React from 'react';
import { BookOutlined, SettingOutlined, MessageOutlined, MailOutlined, UserOutlined, KeyOutlined, ThunderboltOutlined, SaveOutlined, DeleteOutlined, PlusOutlined, BulbOutlined } from '@ant-design/icons';

const UserGuide: React.FC = () => {
  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-2">
        <BookOutlined className="text-[#667eea] text-xl" />
        <h3 className="text-lg font-semibold text-slate-800">User Guide</h3>
      </div>

      <div className="space-y-6 text-sm text-slate-700">
        {/* Account Association */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <UserOutlined className="text-blue-600 text-lg" />
            <h4 className="font-semibold text-slate-900">1. Link HubSpot Account</h4>
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>Step 1:</strong> Log into your HubSpot account</p>
            <p><strong>Step 2:</strong> Access the application and select the "Account" tab</p>
            <p><strong>Step 3:</strong> Enter your HubSpot Portal ID (can be found in the URL when logging into HubSpot)</p>
            <p><strong>Step 4:</strong> Click "Associate Account" to link</p>
            <p className="text-xs text-blue-600 mt-2"><BulbOutlined className="mr-1" /> <strong>Note:</strong> Portal ID usually has the format: 12345678 (8-digit number)</p>
          </div>
        </div>

        {/* Settings Configuration */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <SettingOutlined className="text-green-600 text-lg" />
            <h4 className="font-semibold text-slate-900">2. Configure AI Engine</h4>
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>Step 1:</strong> Select the "Settings" tab in the application</p>
            <p><strong>Step 2:</strong> Choose the AI Engine you want to use:</p>
            <p><strong>Step 3:</strong> Enter the API Key corresponding to the selected engine</p>
            <p><strong>Step 4:</strong> Click "Save Settings" to save the configuration</p>
            <p className="text-xs text-green-600 mt-2"><BulbOutlined className="mr-1" /> <strong>Note:</strong> API Key is securely stored in your browser</p>
          </div>
        </div>

        {/* Chat Function */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageOutlined className="text-purple-600 text-lg" />
            <h4 className="font-semibold text-slate-900">3. Chat with AI Assistant</h4>
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>How to use:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• Enter your question or request in the chat box</li>
              <li>• Press <strong>Enter</strong> to send message</li>
              <li>• Press <strong>Shift + Enter</strong> for new line</li>
              <li>• AI will respond based on the configured engine</li>
            </ul>
            <p><strong>Features:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• <strong>Chat history:</strong> View previous conversations</li>
              <li>• <strong>Clear chat:</strong> Clear current conversation</li>
              <li>• <strong>Copy:</strong> Copy chat content</li>
            </ul>
            <p className="text-xs text-purple-600 mt-2"><BulbOutlined className="mr-1" /> <strong>Tip:</strong> You can ask AI about any topic related to work, marketing, or customer support</p>
          </div>
        </div>

        {/* Email Generator */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <MailOutlined className="text-orange-600 text-lg" />
            <h4 className="font-semibold text-slate-900">4. Generate Email with AI</h4>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium mb-2">A. Manage Email Tone:</p>
              <ul className="ml-4 space-y-1">
                <li>• <strong>Create new tone:</strong> Click <PlusOutlined className="text-orange-600" /> "New Tone" button</li>
                <li>• <strong>Select tone:</strong> Dropdown to choose appropriate tone</li>
                <li>• <strong>Set default:</strong> Click on tone to set as default</li>
                <li>• <strong>Delete tone:</strong> Click <DeleteOutlined className="text-red-500" /> next to tone</li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium mb-2">B. Generate Email:</p>
              <ul className="ml-4 space-y-1">
                <li>• <strong>Enter idea:</strong> Write the content you want in the email</li>
                <li>• <strong>Choose tone:</strong> Select tone appropriate for the purpose</li>
                <li>• <strong>Generate:</strong> Click "Generate Email" to create</li>
                <li>• <strong>Edit:</strong> Use editor to modify content</li>
              </ul>
            </div>

            <div>
              <p className="font-medium mb-2">C. Save and Manage:</p>
              <ul className="ml-4 space-y-1">
                <li>• <strong>Save Template:</strong> Save email as template in HubSpot</li>
                <li>• <strong>Go to Template:</strong> Open template in HubSpot Designer</li>
                <li>• <strong>Go to send email:</strong> Navigate to HubSpot send email page</li>
                <li>• <strong>Clear:</strong> Clear generated email</li>
              </ul>
            </div>
            
            <p className="text-xs text-orange-600 mt-2"><BulbOutlined className="mr-1" /> <strong>Note:</strong> Saved templates will have unique IDs and can be reused in HubSpot</p>
          </div>
        </div>

        {/* Tips and Best Practices */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ThunderboltOutlined className="text-yellow-600 text-lg" />
            <h4 className="font-semibold text-slate-900">5. Tips and Best Practices</h4>
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>For best results:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• <strong>Detailed description:</strong> Provide specific information about email purpose</li>
              <li>• <strong>Choose appropriate tone:</strong> Formal for customers, Casual for internal</li>
              <li>• <strong>Review before sending:</strong> Always review generated content</li>
              <li>• <strong>Save good templates:</strong> Create tones for commonly used email types</li>
              <li>• <strong>Update API Key:</strong> Ensure API Key is still valid</li>
            </ul>
            <p className="text-xs text-yellow-600 mt-2"><BulbOutlined className="mr-1" /> <strong>Support:</strong> If you encounter issues, check API Key configuration and internet connection</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserGuide;


