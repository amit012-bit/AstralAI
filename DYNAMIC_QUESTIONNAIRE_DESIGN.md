# Dynamic Questionnaire System Design

## Overview
A flexible questionnaire system where:
1. **Auto-filled fields**: Fields automatically populated from website parsing (marked visually)
2. **Manual fields**: Fields for vendors to fill based on their choice
3. **Dynamic sections**: Sections are created dynamically based on parsed data
4. **Vendor choice**: Vendors can choose which sections to complete

## Architecture

### Field Metadata Structure
```typescript
interface FieldMetadata {
  fieldKey: string;
  value: any;
  autoFilled: boolean;  // Was this field auto-filled?
  required: boolean;    // Is this field required?
  editable: boolean;    // Can vendor edit this field?
  source?: string;      // Source of data (e.g., "website", "manual")
}

interface SectionMetadata {
  sectionId: string;
  sectionName: string;
  fields: FieldMetadata[];
  autoFilled: boolean;  // Are all fields auto-filled?
  completed: boolean;   // Has vendor completed this section?
  required: boolean;    // Is this section required?
  enabled: boolean;     // Should this section be shown?
}
```

### Form Data Structure
```typescript
interface SolutionFormData {
  // Actual data
  title: string;
  description: string;
  // ... other fields
  
  // Metadata (stored separately)
  _metadata?: {
    fields: Record<string, FieldMetadata>;
    sections: SectionMetadata[];
    autoFilledFields: string[]; // List of auto-filled field keys
    manualFields: string[];      // List of manual field keys
  };
}
```

## Flow

1. **URL Parsing**:
   - User enters URL
   - Backend parses and extracts data
   - Returns data with metadata marking which fields were extracted
   
2. **Auto-fill**:
   - Frontend receives parsed data
   - Marks fields as `autoFilled: true`
   - Creates sections dynamically based on available data
   - Shows questionnaire with auto-filled fields highlighted
   
3. **Vendor Interaction**:
   - Vendor sees auto-filled fields (with visual indicator)
   - Vendor can edit auto-filled fields
   - Vendor can enable/disable sections
   - Vendor fills manual/required fields
   
4. **Section Management**:
   - Sections are shown/hidden based on:
     - Whether data exists for that section
     - Vendor's selection
     - Required vs optional sections

## Visual Design

### Auto-filled Field Indicator
- Badge/icon showing "Auto-filled"
- Different background color (e.g., light blue)
- Editable but clearly marked

### Manual Field
- Normal input styling
- Clear indication it needs to be filled

### Section Toggle
- Checkbox/toggle to enable/disable sections
- Shows completion status
- Shows auto-filled status

## Implementation Steps

1. Update backend to return field metadata
2. Update frontend to track field metadata
3. Create section management system
4. Update UI to show auto-filled indicators
5. Add section enable/disable functionality
6. Update form submission to include only enabled sections
