# Implementation Checklist

## Files to Update/Create

### ✅ Already Created/Updated
- [x] `types.ts` - Added CustomSummaryProfile interface and CUSTOM enum
- [x] `constants.ts` - Enhanced MEETING_TYPES_CONFIG with descriptions and system prompts
- [x] `components/SummarySelector.tsx` - Replaced with descriptive dropdown
- [x] `components/CustomProfileModal.tsx` - NEW modal for creating profiles
- [x] `services/geminiService.ts` - Enhanced to use system prompts and custom prompts
- [x] `services/customProfileService.ts` - NEW localStorage service for profile management

## Integration Steps

### Step 1: Import Custom Profile Service
In your main component file (e.g., `MeetingDetail.tsx`), add:

```typescript
import { customProfileService } from '../services/customProfileService';
import { CustomProfileModal } from '../components/CustomProfileModal';
import { CustomSummaryProfile, MeetingType } from '../types';
```

### Step 2: Add State Management
```typescript
const [customProfiles, setCustomProfiles] = React.useState<CustomSummaryProfile[]>([]);
const [selectedType, setSelectedType] = React.useState<string>(MeetingType.GENERAL);
const [isCustomModalOpen, setIsCustomModalOpen] = React.useState(false);

// Load profiles on component mount
React.useEffect(() => {
  const profiles = customProfileService.getProfiles();
  setCustomProfiles(profiles);
}, []);
```

### Step 3: Update SummarySelector Usage
```typescript
// OLD:
<SummarySelector
  selectedType={selectedType}
  onTypeChange={setSelectedType}
  onCopy={handleCopy}
/>

// NEW:
<SummarySelector
  selectedType={selectedType}
  onTypeChange={setSelectedType}
  onCopy={handleCopy}
  customProfiles={customProfiles}  // ← Add this
/>
```

### Step 4: Add Custom Modal
```typescript
<CustomProfileModal
  isOpen={isCustomModalOpen}
  onClose={() => setIsCustomModalOpen(false)}
  onSave={(profile) => {
    const saved = customProfileService.saveProfile(profile);
    setCustomProfiles([...customProfiles, saved]);
  }}
/>
```

### Step 5: Add "New Profile" Button
```typescript
<button
  onClick={() => setIsCustomModalOpen(true)}
  className="ml-3 text-sm font-semibold px-4 py-2 rounded-lg bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20 transition-colors"
>
  + New Custom Profile
</button>
```

### Step 6: Update Summary Generation
When generating a summary, check for custom profiles:

```typescript
const handleSummaryTypeChange = async (type: MeetingType | string) => {
  setSelectedType(type);
  
  if (!meeting) return;

  // Find if it's a custom profile
  const customProfile = customProfiles.find(p => p.id === type);
  
  // Generate summary with appropriate prompt
  const result = await generateMeetingSummary(
    meeting.transcript,
    type,
    meeting.date,
    meeting.attendees.map(a => a.name),
    customProfile?.systemPrompt  // Pass custom prompt if exists
  );

  // Update meeting with results
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
    customProfileId: customProfile?.id
  });
};
```

## Quick Testing

### Test 1: Built-in Types Still Work
- [ ] Open dropdown
- [ ] Select each category (Free, Most Used, Sales, etc.)
- [ ] Verify descriptions appear
- [ ] Click a type and verify summary generates

### Test 2: Create Custom Profile
- [ ] Click "+ New Custom Profile"
- [ ] Fill in name: "Test Profile"
- [ ] Fill in description: "Test description"
- [ ] Fill in instructions: "Summarize the meeting in 3 bullet points"
- [ ] Click "Create Profile"
- [ ] Verify profile appears in dropdown under "Custom Profiles"
- [ ] Select it and verify summary generates

### Test 3: Profile Persistence
- [ ] Create a custom profile
- [ ] Refresh the page
- [ ] Verify profile still appears in dropdown
- [ ] Delete profile (or manually clear localStorage)
- [ ] Refresh page - verify it's gone

### Test 4: Multiple Custom Profiles
- [ ] Create 2-3 different profiles
- [ ] Switch between them
- [ ] Verify correct summaries generate for each
- [ ] Verify descriptions appear in dropdown

## Troubleshooting

### "customProfileService is not defined"
**Solution:** Make sure you've created `services/customProfileService.ts`

### Dropdown not showing descriptions
**Solution:** Check that `MEETING_TYPES_CONFIG` was updated with `description` and `systemPrompt` fields

### Custom profile prompts not affecting summary
**Solution:** 
1. Verify `customProfile?.systemPrompt` is passed to `generateMeetingSummary()`
2. Check browser console for errors
3. Verify Gemini API key is valid

### localStorage errors in private/incognito mode
**Solution:** 
1. localStorage is disabled in private browsing
2. Use regular (non-private) browser window for testing
3. Consider adding try-catch blocks in customProfileService

### Profiles disappearing after page refresh
**Solution:**
1. Check browser localStorage quota hasn't been exceeded
2. Verify localStorage is enabled in browser settings
3. Check browser console for errors

## File Sizes & Performance

| Component | Size | Impact |
|-----------|------|--------|
| SummarySelector.tsx | ~5KB | Minimal, used once per page |
| CustomProfileModal.tsx | ~3KB | Minimal, only shown when needed |
| customProfileService.ts | ~2KB | Minimal, lightweight utility |
| Updated geminiService.ts | +0.5KB | Negligible |
| Updated types.ts | +0.5KB | Negligible |
| Updated constants.ts | +3KB | Loaded once on app init |
| **Total Added** | **~14KB** | **Minimal impact** |

## Browser DevTools Tips

### View Custom Profiles in localStorage
```javascript
// In browser console:
JSON.parse(localStorage.getItem('stokemeet_custom_profiles'))

// To clear all profiles:
localStorage.removeItem('stokemeet_custom_profiles')

// To add a test profile:
const testProfile = {
  id: 'test-123',
  name: 'Test Profile',
  description: 'Test description',
  systemPrompt: 'Test prompt',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
const existing = JSON.parse(localStorage.getItem('stokemeet_custom_profiles') || '[]');
localStorage.setItem('stokemeet_custom_profiles', JSON.stringify([...existing, testProfile]));
```

### Test System Prompts
```typescript
// Verify system prompt for a type:
import { MEETING_TYPES_CONFIG } from './constants';
console.log(MEETING_TYPES_CONFIG['Sales - BANT'].systemPrompt);
```

## Performance Checklist

- [ ] localStorage calls only on mount/save (not on every render)
- [ ] Dropdown closure when selecting a type
- [ ] Debounce or throttle if adding real-time search
- [ ] Lazy load CustomProfileModal (only render when open)
- [ ] Memoize dropdown groups to prevent unnecessary recalculations

## Accessibility Checklist

- [ ] Dropdown keyboard navigation (arrow keys)
- [ ] Escape key to close dropdown
- [ ] Focus management in modal
- [ ] ARIA labels for form fields
- [ ] Color contrast for readability

## Security Considerations

- [ ] Validate user input in custom prompts
- [ ] Sanitize profile names (prevent XSS)
- [ ] Don't expose system prompts to end users
- [ ] localStorage data is client-side only (no server sync)

## Next Steps

1. **Implement** the integration steps above
2. **Test** using the quick testing checklist
3. **Deploy** to production
4. **Monitor** user feedback on custom profiles feature
5. **Consider** future enhancements (sharing, templates, etc.)

