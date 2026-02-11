# Getting Started with Custom Summary Profiles

## 5-Minute Quick Start

### What You're Getting

A complete enhancement to your summary type selector that adds:
1. **Descriptive dropdown** showing what each summary type does
2. **Custom profile creation** so users can define their own summary frameworks
3. **System prompts** that guide the AI how to analyze meetings

### Files Already Created

All code is ready to use. No additional installations needed.

```
✅ types.ts - Updated with custom profile types
✅ constants.ts - Enhanced with descriptions and system prompts
✅ components/SummarySelector.tsx - Beautiful grouped dropdown
✅ components/CustomProfileModal.tsx - Form for creating profiles
✅ services/geminiService.ts - Enhanced to use system prompts
✅ services/customProfileService.ts - Manages profiles in localStorage
✅ Full documentation and guides
```

### Integration (Copy-Paste Ready)

Find your meeting detail component and make these changes:

#### 1. Add imports
```typescript
import { customProfileService } from '../services/customProfileService';
import { CustomProfileModal } from '../components/CustomProfileModal';
import { CustomSummaryProfile } from '../types';
```

#### 2. Add state (near top of component)
```typescript
const [customProfiles, setCustomProfiles] = React.useState<CustomSummaryProfile[]>([]);
const [isCustomModalOpen, setIsCustomModalOpen] = React.useState(false);

// Load profiles on mount
React.useEffect(() => {
  const profiles = customProfileService.getProfiles();
  setCustomProfiles(profiles);
}, []);
```

#### 3. Update SummarySelector component
```typescript
// Find this:
<SummarySelector
  selectedType={selectedType}
  onTypeChange={handleTypeChange}
  onCopy={handleCopy}
/>

// Change to this:
<SummarySelector
  selectedType={selectedType}
  onTypeChange={handleTypeChange}
  onCopy={handleCopy}
  customProfiles={customProfiles}  // ← Add this line
/>
```

#### 4. Add modal and button
```typescript
// Add this button near the selector
<button
  onClick={() => setIsCustomModalOpen(true)}
  className="ml-3 text-sm font-semibold px-4 py-2 rounded-lg bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20"
>
  + New Custom Profile
</button>

// Add modal component at the bottom
<CustomProfileModal
  isOpen={isCustomModalOpen}
  onClose={() => setIsCustomModalOpen(false)}
  onSave={(profile) => {
    const saved = customProfileService.saveProfile(profile);
    setCustomProfiles([...customProfiles, saved]);
  }}
/>
```

#### 5. Update summary generation
```typescript
// Find your summary generation function and update it:
const handleSummaryTypeChange = async (type: MeetingType | string) => {
  setSelectedType(type);
  
  if (!meeting) return;

  // NEW: Check if it's a custom profile
  const customProfile = customProfiles.find(p => p.id === type);
  
  // NEW: Pass customSystemPrompt if it's a custom profile
  const result = await generateMeetingSummary(
    meeting.transcript,
    type,
    meeting.date,
    meeting.attendees.map(a => a.name),
    customProfile?.systemPrompt  // ← Add this parameter
  );

  setMeeting({
    ...meeting,
    summaryContent: result.content,
    actionItems: result.actionItems.map((item, idx) => ({
      id: `action-${idx}-${Date.now()}`,
      text: item.text,
      assignee: item.assignee,
      completed: false
    })),
    currentType: type,
    customProfileId: customProfile?.id  // ← Optional: track which profile was used
  });
};
```

That's it! 

### Test It

1. **Open a meeting** in your app
2. **Click the summary selector** - you'll see the new grouped dropdown with descriptions
3. **Click "+ New Custom Profile"** - fill in the form and create a profile
4. **Select it from the dropdown** - it appears in the "Custom Profiles" section
5. **Generate a summary** - it uses your custom instructions

### What Users See

**Before:** Simple dropdown with just type names

**After:** Beautiful dropdown with:
- Type names and descriptions
- Categories (Free, Most Used, Sales, Customer Success, Internal & Operations)
- Custom profiles section
- Current selection highlighted

### How It Works

When a user selects a summary type:
1. Check if it's a custom profile or built-in type
2. Get the system prompt (from built-in config or custom profile)
3. Send transcript + system prompt to Gemini API
4. Get back a structured summary
5. Display results

The system prompt is like giving the AI instructions on what to look for and how to organize the summary.

### Example: What a User Creates

User creates a "Executive Summary" profile:

```
Name: Executive Summary
Description: High-level business decisions and impact
Custom Instructions:
"Focus on the business impact. Identify:
1) Strategic decisions made
2) Financial implications
3) Timeline commitments
4) Key stakeholders involved
Exclude technical implementation details."
```

Now every time they select "Executive Summary" from the dropdown, the AI will analyze the meeting transcript looking specifically for those elements.

### Files Documentation

If you want more details:

- **README_CUSTOM_PROFILES.md** - Complete feature overview
- **CUSTOM_PROFILES_INTEGRATION.md** - Detailed integration guide
- **IMPLEMENTATION_CHECKLIST.md** - Step-by-step with testing
- **SYSTEM_PROMPTS_REFERENCE.md** - All prompts + custom examples
- **FEATURE_SUMMARY.md** - Visual mockups and user examples
- **ARCHITECTURE.md** - Technical architecture details

### Key Features

✅ **No Backend Needed** - Profiles stored in browser localStorage
✅ **Persistent** - Profiles survive page refreshes
✅ **Simple** - Copy-paste integration
✅ **Flexible** - Users create their own frameworks
✅ **Well-Documented** - Tons of examples and guides

### Browser Support

Works on all modern browsers:
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅

### Questions?

Check these files in order:

1. Something not working? → **IMPLEMENTATION_CHECKLIST.md**
2. Want to understand the code? → **ARCHITECTURE.md**
3. Need custom prompt examples? → **SYSTEM_PROMPTS_REFERENCE.md**
4. Want to see what users see? → **FEATURE_SUMMARY.md**
5. Complete overview? → **README_CUSTOM_PROFILES.md**

### Next Steps

1. ✅ Copy the integration code (Step 1-5 above)
2. ✅ Test with your app
3. ✅ Create a test custom profile
4. ✅ Deploy to production
5. ✅ Tell your users about it!

---

## Common Questions

**Q: Will this break my existing code?**
A: No. The SummarySelector component is backwards compatible. It just adds the `customProfiles` prop as optional.

**Q: Where are profiles stored?**
A: In the browser's localStorage. Each browser/device has its own copy. No server needed.

**Q: Can multiple users share profiles?**
A: Not built-in, but you could export/import via JSON. Check `customProfileService.exportProfiles()` and `importProfiles()`.

**Q: How many profiles can a user create?**
A: Browser localStorage has ~5-10MB limit. Each profile is ~1-5KB, so typically 1000+ profiles.

**Q: What if I want to store profiles on a server?**
A: You can replace the localStorage calls with API calls to your backend. The interface is the same.

**Q: Can users import/export their profiles?**
A: Yes! Use `customProfileService.exportProfiles()` to get JSON, and `importProfiles(json)` to load them.

---

**Ready?** Start with the integration code above, then check IMPLEMENTATION_CHECKLIST.md if you hit any issues.
