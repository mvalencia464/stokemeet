# Custom Summary Profiles Integration Guide

## Overview

This guide shows how to integrate the custom summary profiles feature into your existing StokeМeet application.

## Components & Services Created

### 1. **Updated Types** (`types.ts`)
- Added `MeetingType.CUSTOM` enum value
- Added `CustomSummaryProfile` interface
- Updated `MeetingData` to support custom profiles

### 2. **Enhanced Constants** (`constants.ts`)
- Updated `MEETING_TYPES_CONFIG` with:
  - `description`: User-friendly descriptions for each type
  - `category`: Groups types (Free, Most Used, Sales, Customer Success, Internal & Operations)
  - `systemPrompt`: AI instructions for each summary type

### 3. **New Components**

#### `SummarySelector.tsx` (Enhanced)
- Custom dropdown with grouped categories
- Shows both type name and description
- Displays currently selected type with its description
- Supports custom profiles in a dedicated section

#### `CustomProfileModal.tsx`
- Modal form for creating/editing custom profiles
- Fields:
  - Profile Name (required)
  - Description (optional, shown in dropdown)
  - Custom Instructions (required, sent to AI)
- Includes tips for writing effective prompts

### 4. **New Services**

#### `customProfileService.ts`
Manages custom profiles stored in localStorage:
- `getProfiles()`: Retrieve all profiles
- `getProfile(id)`: Get specific profile
- `saveProfile()`: Create new profile
- `updateProfile()`: Update existing profile
- `deleteProfile()`: Delete profile
- `exportProfiles()`: Export as JSON
- `importProfiles()`: Import from JSON

#### `geminiService.ts` (Enhanced)
- `generateMeetingSummary()` now accepts `customSystemPrompt` parameter
- Uses system prompts from `MEETING_TYPES_CONFIG`
- Falls back to custom prompt if provided

## Integration Steps

### Step 1: Update Your Page/Component

In your meeting detail page, import and set up the new components:

```typescript
import { SummarySelector } from '../components/SummarySelector';
import { CustomProfileModal } from '../components/CustomProfileModal';
import { customProfileService } from '../services/customProfileService';

interface MeetingDetailProps {
  meetingId: string;
}

export const MeetingDetail: React.FC<MeetingDetailProps> = ({ meetingId }) => {
  const [selectedType, setSelectedType] = React.useState<string>(MeetingType.GENERAL);
  const [customProfiles, setCustomProfiles] = React.useState<CustomSummaryProfile[]>([]);
  const [isCustomModalOpen, setIsCustomModalOpen] = React.useState(false);
  const [meeting, setMeeting] = React.useState<MeetingData | null>(null);

  // Load custom profiles on mount
  React.useEffect(() => {
    const profiles = customProfileService.getProfiles();
    setCustomProfiles(profiles);
  }, []);

  // Generate summary
  const handleSummaryTypeChange = async (type: MeetingType | string) => {
    setSelectedType(type);
    
    if (!meeting) return;

    // Check if it's a custom profile
    const customProfile = customProfiles.find(p => p.id === type);
    
    const result = await generateMeetingSummary(
      meeting.transcript,
      type,
      meeting.date,
      meeting.attendees.map(a => a.name),
      customProfile?.systemPrompt // Pass custom prompt if applicable
    );

    setMeeting({
      ...meeting,
      summaryContent: result.content,
      actionItems: result.actionItems.map(item => ({
        ...item,
        id: `${Date.now()}_${Math.random()}`,
        completed: false
      })),
      currentType: type
    });
  };

  // Save new custom profile
  const handleSaveCustomProfile = (profile: Omit<CustomSummaryProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const savedProfile = customProfileService.saveProfile(profile);
    setCustomProfiles([...customProfiles, savedProfile]);
  };

  return (
    <div>
      {/* Summary Type Selector */}
      <SummarySelector
        selectedType={selectedType}
        onTypeChange={handleSummaryTypeChange}
        onCopy={() => {
          // Copy logic here
          navigator.clipboard.writeText(meeting?.summaryContent || '');
        }}
        customProfiles={customProfiles}
      />

      {/* Button to create new custom profile */}
      <button
        onClick={() => setIsCustomModalOpen(true)}
        className="ml-3 text-sm font-semibold px-4 py-2 rounded-lg bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20"
      >
        + New Custom Profile
      </button>

      {/* Custom Profile Modal */}
      <CustomProfileModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSave={handleSaveCustomProfile}
      />

      {/* Rest of your component */}
    </div>
  );
};
```

### Step 2: Update generateMeetingSummary Call

When calling `generateMeetingSummary`, check if a custom profile is selected:

```typescript
const customProfile = customProfiles.find(p => p.id === selectedType);

const result = await generateMeetingSummary(
  transcript,
  selectedType,
  meetingDate,
  attendeeNames,
  customProfile?.systemPrompt // Only pass if custom profile
);
```

### Step 3: (Optional) Add Profile Management UI

Create a settings modal to:
- View all custom profiles
- Edit profiles
- Delete profiles
- Export/import profiles

```typescript
export const ProfileManagementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  profiles: CustomSummaryProfile[];
  onDelete: (id: string) => void;
  onEdit: (profile: CustomSummaryProfile) => void;
}> = ({ isOpen, onClose, profiles, onDelete, onEdit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1117] border border-[#30363d] rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-[#30363d]">
          <h2 className="text-xl font-bold text-[#e6edf3]">Manage Custom Profiles</h2>
        </div>

        <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
          {profiles.length === 0 ? (
            <p className="text-[#8b949e] text-sm">No custom profiles yet. Create one to get started!</p>
          ) : (
            profiles.map(profile => (
              <div key={profile.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-[#e6edf3]">{profile.name}</h3>
                  <p className="text-xs text-[#8b949e] mt-1">{profile.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(profile)}
                    className="px-3 py-1 text-xs bg-[#ccff00]/10 text-[#ccff00] rounded hover:bg-[#ccff00]/20"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this profile?')) {
                        onDelete(profile.id);
                      }
                    }}
                    className="px-3 py-1 text-xs bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-[#30363d] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-[#161b22] border border-[#30363d] rounded-lg hover:bg-[#1c2128]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
```

## Example Custom Profile Templates

### Technical Deep Dive
**Name:** Technical Deep Dive  
**Description:** Focused analysis of technical decisions and architecture  
**Instructions:** "Focus on technical implementation details. Identify architecture decisions, technology choices, specific frameworks/libraries mentioned, and potential bottlenecks. Include code patterns discussed and technical trade-offs mentioned."

### Executive Summary
**Name:** Executive Summary  
**Description:** High-level business impact and decisions  
**Instructions:** "Provide a concise executive summary focused on business impact. Identify strategic decisions, financial implications, timeline commitments, and key stakeholders involved. Avoid technical details unless they directly impact business outcomes."

### Risk & Opportunities
**Name:** Risk & Opportunities  
**Description:** Identify risks, blockers, and growth opportunities  
**Instructions:** "Identify and analyze: 1) Risks and potential blockers mentioned, 2) Opportunities for growth or improvement, 3) Dependencies or constraints, 4) Confidence levels in decisions made. Format as a risk/opportunity matrix."

### Competitive Analysis
**Name:** Competitive Analysis  
**Description:** Competitive landscape and positioning  
**Instructions:** "Extract details about: 1) Competitors mentioned and their strengths/weaknesses, 2) Our competitive advantages, 3) Market positioning discussed, 4) Pricing and value propositions, 5) Customer feedback about alternatives."

## Data Storage

Custom profiles are stored in **localStorage** under the key: `stokemeet_custom_profiles`

### Format:
```json
[
  {
    "id": "custom_1707123456789_abc123def456",
    "name": "Technical Deep Dive",
    "description": "Focused analysis of technical decisions",
    "systemPrompt": "Focus on technical implementation details...",
    "createdAt": "2024-02-06T10:30:00.000Z",
    "updatedAt": "2024-02-06T10:30:00.000Z"
  }
]
```

## Tips for Effective Custom Prompts

1. **Be Specific:** Instead of "analyze the meeting," say "Extract all technical decisions, frameworks mentioned, and architectural trade-offs discussed."

2. **Define Structure:** "Organize findings into: Architecture, Technology Choices, Risks, and Recommended Next Steps, each with bullet points."

3. **Include Tone:** "Use a technical but accessible tone suitable for engineering managers unfamiliar with implementation details."

4. **Reference Frameworks:** "Use the RACI matrix to identify who is Responsible, Accountable, Consulted, and Informed for each decision."

5. **Set Boundaries:** "Focus only on technical topics; ignore general business discussions unrelated to implementation."

## Browser Compatibility

- **localStorage supported:** All modern browsers (Chrome, Firefox, Safari, Edge)
- **Data persists:** Across browser sessions
- **Storage limit:** Typically 5-10MB per domain (usually sufficient for 100+ profiles)

## Troubleshooting

### Profiles not appearing
1. Check browser localStorage is enabled
2. Verify no private/incognito mode (localStorage disabled)
3. Check browser console for errors

### Changes not saving
1. Check localStorage quota not exceeded
2. Verify data is being passed correctly to `customProfileService.saveProfile()`
3. Check browser console for errors

### Custom prompts not affecting summaries
1. Verify custom profile is selected in dropdown
2. Confirm `customSystemPrompt` is being passed to `generateMeetingSummary()`
3. Check Gemini API responses in browser console

