import React, { useState } from 'react';
import { CustomSummaryProfile } from '../types';

interface CustomProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Omit<CustomSummaryProfile, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  profile?: CustomSummaryProfile;
}

export const CustomProfileModal: React.FC<CustomProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  profile
}) => {
  const [name, setName] = useState(profile?.name || '');
  const [description, setDescription] = useState(profile?.description || '');
  const [systemPrompt, setSystemPrompt] = useState(profile?.systemPrompt || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !systemPrompt.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      onSave({
        name: name.trim(),
        description: description.trim(),
        systemPrompt: systemPrompt.trim()
      }, profile?.id);
      setName('');
      setDescription('');
      setSystemPrompt('');
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1117] border border-[#30363d] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#30363d]">
          <h2 className="text-xl font-bold text-[#e6edf3]">
            {profile ? 'Edit Custom Profile' : 'Create Custom Profile'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Name */}
          <div>
            <label className="block text-sm font-semibold text-[#e6edf3] mb-2">
              Profile Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Executive Overview, Technical Deep Dive"
              className="w-full bg-[#161b22] border border-[#30363d] text-[#e6edf3] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#ccff00]"
            />
            <p className="text-xs text-[#8b949e] mt-1">
              A unique name for your custom summary profile
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#e6edf3] mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this profile does"
              className="w-full bg-[#161b22] border border-[#30363d] text-[#e6edf3] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#ccff00]"
            />
            <p className="text-xs text-[#8b949e] mt-1">
              Shown in the dropdown when selecting a summary type
            </p>
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-sm font-semibold text-[#e6edf3] mb-2">
              Custom Instructions *
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder={`Example: Focus on technical implementation details. Identify architecture decisions, technology choices, and potential bottlenecks. Include specific code patterns and libraries mentioned.`}
              rows={8}
              className="w-full bg-[#161b22] border border-[#30363d] text-[#e6edf3] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#ccff00] font-mono"
            />
            <p className="text-xs text-[#8b949e] mt-2">
              These instructions will be sent to the AI to guide how it analyzes and summarizes your meeting transcripts.
              Be specific about what elements you want captured and how you want them organized.
            </p>
          </div>

          {/* Tips Section */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-[#e6edf3] mb-2">💡 Tips for Effective Prompts</h3>
            <ul className="text-xs text-[#8b949e] space-y-1">
              <li>• Be specific about what you want extracted (decisions, risks, opportunities, etc.)</li>
              <li>• Specify the format you prefer (bullet points, sections, tables, etc.)</li>
              <li>• Mention any frameworks or methodologies you want applied</li>
              <li>• Include tone preferences (concise, detailed, technical, business-focused, etc.)</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-[#30363d]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-[#8b949e] bg-[#161b22] border border-[#30363d] rounded-lg hover:bg-[#1c2128] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-black bg-[#ccff00] rounded-lg hover:bg-[#e6ff33] transition-colors disabled:opacity-50 cursor-disabled flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  {profile ? 'Update Profile' : 'Create Profile'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
