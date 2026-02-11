# Architecture Overview

## Component Hierarchy

```
App
└── MeetingPage/MeetingDetail
    ├── SummarySelector (ENHANCED)
    │   ├── Dropdown Button (shows selected type + description)
    │   ├── Dropdown Menu
    │   │   ├── Category Headers (Free, Most Used, Sales, etc.)
    │   │   ├── Type Options
    │   │   │   ├── Built-in Types (18 total)
    │   │   │   └── Custom Profiles (N total)
    │   │   └── Selected Indicator
    │   └── Copy Summary Button
    │
    ├── "+ New Custom Profile" Button
    │
    ├── CustomProfileModal (CONDITIONAL)
    │   ├── Form Fields
    │   │   ├── Profile Name Input
    │   │   ├── Description Input
    │   │   └── Custom Instructions Textarea
    │   ├── Tips Section
    │   └── Action Buttons (Cancel, Create)
    │
    └── Summary Display
        ├── Executive Summary
        ├── Key Takeaways
        ├── Topics & Discussion
        ├── Next Steps
        └── Action Items
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                         │
└─────────────────────────────────────────────────────────────────┘

                   ↓ User selects summary type

┌─────────────────────────────────────────────────────────────────┐
│                    SummarySelector Component                     │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Check selection type:                                      │ │
│  │  Is it a built-in type? → Continue to step 3              │ │
│  │  Is it a custom profile? → Get customProfile object       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

                   ↓ Built-in OR Custom?

        ┌─────────────────────┬─────────────────────┐
        ↓                     ↓                     ↓
    BUILT-IN             CUSTOM                  ERROR
        │                   │
        ├─→ MEETING_TYPES_  ├─→ customProfile
        │   CONFIG[type]    │   object.systemPrompt
        │   .systemPrompt   │
        │                   │
        └─────────┬─────────┘
                  ↓

┌─────────────────────────────────────────────────────────────────┐
│                  generateMeetingSummary()                        │
│                    (geminiService.ts)                            │
│                                                                 │
│  Parameters:                                                    │
│  ├─ transcript (required)                                      │
│  ├─ type: MeetingType | string (required)                      │
│  ├─ meetingDate (optional)                                     │
│  ├─ attendeeNames (optional)                                   │
│  └─ customSystemPrompt (optional) ←── Custom profiles use this │
│                                                                 │
│  Process:                                                       │
│  1. Get systemPrompt from either:                             │
│     - customSystemPrompt parameter, OR                        │
│     - MEETING_TYPES_CONFIG[type].systemPrompt                │
│  2. Build prompt template with metadata                        │
│  3. Send to Gemini API                                        │
│  4. Parse response for content + action items                  │
│  5. Return structured data                                     │
└─────────────────────────────────────────────────────────────────┘

                   ↓ API Response

┌─────────────────────────────────────────────────────────────────┐
│                   Update Meeting State                           │
│                                                                 │
│  ├─ summaryContent (markdown)                                  │
│  ├─ actionItems (parsed from summary)                          │
│  ├─ currentType (the type used)                                │
│  └─ customProfileId (if custom profile)                        │
└─────────────────────────────────────────────────────────────────┘

                   ↓ Re-render with results

┌─────────────────────────────────────────────────────────────────┐
│                 Display Summary to User                          │
└─────────────────────────────────────────────────────────────────┘
```

## Service Layer Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      Service Layer                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │          geminiService.ts (Enhanced)                      │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ Functions:                                                │ │
│  │  • generateMeetingSummary()                              │ │
│  │    ├─ Accepts customSystemPrompt parameter              │ │
│  │    ├─ Uses MEETING_TYPES_CONFIG for system prompts      │ │
│  │    └─ Returns { content, actionItems }                  │ │
│  │                                                           │ │
│  │  • askMeetingQuestion()                                 │ │
│  │  • generateFollowUpEmail()                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │       customProfileService.ts (New)                       │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ Storage: localStorage['stokemeet_custom_profiles']        │ │
│  │                                                            │ │
│  │ Functions:                                                │ │
│  │  • getProfiles()          → CustomSummaryProfile[]       │ │
│  │  • getProfile(id)         → CustomSummaryProfile | null  │ │
│  │  • saveProfile(profile)   → CustomSummaryProfile         │ │
│  │  • updateProfile(id, ...)  → CustomSummaryProfile | null │ │
│  │  • deleteProfile(id)      → boolean                      │ │
│  │  • exportProfiles()       → string (JSON)               │ │
│  │  • importProfiles(json)   → CustomSummaryProfile[]       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         Other Services (Unchanged)                        │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  • supabaseClient.ts                                     │ │
│  │  • fathomService.ts                                      │ │
│  │  • storageService.ts                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Type System

```
┌──────────────────────────────────────────────────────────────────┐
│                    Type Definitions                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  enum MeetingType (UPDATED)                                     │
│  ├─ CHRONOLOGICAL = 'Chronological'                             │
│  ├─ GENERAL = 'General'                                         │
│  ├─ SALES = 'Sales'                                             │
│  ├─ SALES_SANDLER = 'Sales - Sandler'                           │
│  ├─ SALES_SPICED = 'Sales - SPICED'                             │
│  ├─ SALES_MEDDPICC = 'Sales - MEDDPICC'                         │
│  ├─ SALES_BANT = 'Sales - BANT'                                 │
│  ├─ QA = 'Q&A'                                                  │
│  ├─ DEMO = 'Demo'                                               │
│  ├─ CUSTOMER_SUCCESS = 'Customer Success'                       │
│  ├─ CUSTOMER_SUCCESS_REACH = 'Customer Success - REACH™'        │
│  ├─ ONE_ON_ONE = 'One-on-One'                                   │
│  ├─ PROJECT_UPDATE = 'Project Update'                           │
│  ├─ PROJECT_KICK_OFF = 'Project Kick-Off'                       │
│  ├─ CANDIDATE_INTERVIEW = 'Candidate Interview'                 │
│  ├─ RETROSPECTIVE = 'Retrospective'                             │
│  ├─ STAND_UP = 'Stand Up'                                       │
│  └─ CUSTOM = 'Custom' (NEW)                                     │
│                                                                  │
│  ─────────────────────────────────────────────────────          │
│                                                                  │
│  interface CustomSummaryProfile (NEW)                           │
│  ├─ id: string                    (unique identifier)           │
│  ├─ name: string                  (user-friendly name)          │
│  ├─ description: string            (shown in dropdown)          │
│  ├─ systemPrompt: string           (sent to Gemini)             │
│  ├─ createdAt: string              (ISO timestamp)              │
│  └─ updatedAt: string              (ISO timestamp)              │
│                                                                  │
│  ─────────────────────────────────────────────────────          │
│                                                                  │
│  interface MeetingTypeConfig (UPDATED)                          │
│  ├─ description: string            (shown in dropdown)          │
│  ├─ category?: string              (grouping in dropdown)       │
│  └─ systemPrompt: string           (sent to Gemini)             │
│                                                                  │
│  ─────────────────────────────────────────────────────          │
│                                                                  │
│  interface MeetingData (UPDATED)                                │
│  ├─ ... existing fields ...                                     │
│  ├─ currentType: MeetingType | string (was just MeetingType)    │
│  └─ customProfileId?: string       (NEW - if custom used)       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## State Management

```
Component State (React)
│
├─ selectedType: MeetingType | string
│  └─ Current selection in dropdown
│
├─ customProfiles: CustomSummaryProfile[]
│  └─ Loaded from localStorage on mount
│  └─ Updated when profiles created/deleted
│
├─ isCustomModalOpen: boolean
│  └─ Controls visibility of CustomProfileModal
│
├─ copied: boolean
│  └─ Copy button feedback state
│
├─ isDropdownOpen: boolean
│  └─ SummarySelector dropdown visibility
│
└─ meeting: MeetingData
   ├─ summaryContent (updated after API call)
   ├─ actionItems (updated after API call)
   ├─ currentType (updated after selection)
   └─ customProfileId (set if custom profile used)
```

## localStorage Structure

```
Browser Local Storage
│
└─ Key: 'stokemeet_custom_profiles'
   └─ Value: JSON array of CustomSummaryProfile objects
   
   Example:
   [
     {
       "id": "custom_1707123456789_abc123def456",
       "name": "Technical Deep Dive",
       "description": "Focused analysis of technical decisions",
       "systemPrompt": "Focus on technical implementation details...",
       "createdAt": "2024-02-06T10:30:00.000Z",
       "updatedAt": "2024-02-06T10:30:00.000Z"
     },
     {
       "id": "custom_1707123456789_def456ghi789",
       "name": "Executive Summary",
       "description": "High-level business impact and decisions",
       "systemPrompt": "Provide a concise executive brief...",
       "createdAt": "2024-02-06T10:35:00.000Z",
       "updatedAt": "2024-02-06T10:35:00.000Z"
     }
   ]
```

## API Integration

```
StokeMeet Client
    │
    ├─ User selects summary type
    ├─ System prompt determined (built-in or custom)
    │
    └─→ generateMeetingSummary()
        │
        └─→ Gemini API (google/genai)
            │
            POST /gemini-2.0-flash
            {
              "model": "gemini-2.0-flash",
              "contents": prompt_with_system_instructions
            }
            │
            ↓
            {
              "text": "# Summary Type\n> Executive Summary...",
              ...
            }
            │
            ↓
        Parse Response
        ├─ Extract summary content (markdown)
        ├─ Parse action items section
        └─ Structure as { content, actionItems }
            │
            ↓
        Return to Component
        │
        ↓
        Update UI with results
```

## File Dependencies

```
components/
  ├─ SummarySelector.tsx
  │  ├─ imports: types.ts, constants.ts
  │  └─ props: CustomSummaryProfile[]
  │
  └─ CustomProfileModal.tsx
     └─ imports: types.ts

services/
  ├─ geminiService.ts (UPDATED)
  │  ├─ imports: types.ts, constants.ts
  │  └─ uses: MEETING_TYPES_CONFIG system prompts
  │
  └─ customProfileService.ts (NEW)
     └─ imports: types.ts

types.ts (UPDATED)
  ├─ exports: MeetingType enum (with CUSTOM)
  ├─ exports: CustomSummaryProfile interface
  └─ imports: (none - base types file)

constants.ts (UPDATED)
  ├─ imports: types.ts
  └─ exports: MEETING_TYPES_CONFIG with system prompts
```

## User Journey

```
1. User Opens Meeting
   └─→ customProfileService.getProfiles() loads saved profiles
   └─→ SummarySelector renders with built-in + custom types

2. User Sees Dropdown
   └─→ 18 built-in types grouped by category
   └─→ N custom profiles in "Custom Profiles" section
   └─→ Each option shows description

3. Option A: Select Built-in Type
   ├─→ onTypeChange() called with type string
   ├─→ Check: Is it a custom profile? NO
   ├─→ Get systemPrompt from MEETING_TYPES_CONFIG[type]
   ├─→ Call generateMeetingSummary(transcript, type, ..., systemPrompt)
   ├─→ Display summary results
   └─→ User can switch to different type anytime

4. Option B: Create Custom Profile
   ├─→ Click "+ New Custom Profile"
   ├─→ CustomProfileModal opens
   ├─→ Fill in: Name, Description, Custom Instructions
   ├─→ Click "Create Profile"
   ├─→ customProfileService.saveProfile() stores in localStorage
   ├─→ setCustomProfiles() updates component state
   ├─→ Profile now appears in dropdown
   └─→ Can be selected like any built-in type

5. Select Custom Profile
   ├─→ onTypeChange() called with profile.id
   ├─→ Check: Is it a custom profile? YES
   ├─→ Get customProfile from customProfiles array
   ├─→ Get systemPrompt from customProfile.systemPrompt
   ├─→ Call generateMeetingSummary(transcript, profileId, ..., systemPrompt)
   ├─→ Display custom summary
   └─→ User satisfaction ✓
```

## Error Handling

```
generateMeetingSummary()
  │
  ├─→ Try Gemini API call
  │  ├─ Success → Parse and return results
  │  └─ Error → Return fallback error message
  │
  └─→ Error case:
     └─ Return { content: "Error message...", actionItems: [] }

customProfileService
  │
  ├─→ localStorage operations wrapped in try-catch
  ├─→ Parse errors caught and logged
  ├─→ graceful fallbacks (returns empty array if error)
  └─→ Console errors for debugging

CustomProfileModal
  │
  ├─→ Form validation before submit
  ├─→ Required field validation
  ├─→ Try-catch around onSave callback
  └─→ Error alert to user if save fails
```

---

This architecture ensures:
- ✅ Separation of concerns (components, services, types, constants)
- ✅ Minimal dependencies between modules
- ✅ No backend required (localStorage-based)
- ✅ Easy to extend (add new services, components without affecting others)
- ✅ Testable (services are pure, components are isolated)
- ✅ Performant (lazy loading of modals, efficient state updates)
