# Dynamic Questionnaire Implementation Plan

## Issues Fixed
1. ✅ **Redirect Issue**: Removed automatic navigation after parsing - form data is filled but user stays on Step 0

## New System Design

### Architecture
- **Auto-filled Fields**: Fields automatically populated from website (marked with visual indicator)
- **Manual Fields**: Fields vendors must fill (can be required or optional)
- **Dynamic Sections**: Sections created based on parsed data
- **Vendor Choice**: Vendors can enable/disable optional sections

### Implementation Status

#### Completed ✅
1. Fixed redirect - form fills but doesn't navigate
2. Created type definitions (`frontend/src/types/solutionForm.ts`)
3. Created section utilities (`frontend/src/utils/solutionFormSections.ts`)
4. Design document created

#### In Progress 🔄
1. Update Step 0 to show preview after parsing
2. Update hook to create metadata
3. Create dynamic section renderer
4. Add visual indicators for auto-filled fields
5. Add section enable/disable functionality

### Next Steps

1. **Update useSolutionUrlParsing hook**:
   - Create metadata for fields
   - Mark which fields are auto-filled
   - Return metadata along with form data

2. **Update Step 0 Component**:
   - Show success message after parsing
   - Display preview of auto-filled fields
   - Add "Continue to Form" button

3. **Create Dynamic Section Renderer**:
   - Render sections based on configuration
   - Show/hide sections based on enabled state
   - Mark auto-filled fields visually

4. **Update Form Steps**:
   - Use dynamic sections instead of hardcoded steps
   - Show section toggles for optional sections
   - Display auto-filled indicators

5. **Backend Updates** (if needed):
   - Return field metadata from parsing API
   - Mark which fields were successfully extracted

### Key Files
- `frontend/src/types/solutionForm.ts` - Type definitions
- `frontend/src/utils/solutionFormSections.ts` - Section configuration
- `frontend/src/hooks/useSolutionUrlParsing.ts` - Parsing hook (needs update)
- `frontend/src/components/solutions/Step0UrlInput.tsx` - URL input (needs update)
- `frontend/src/pages/solutions/new.tsx` - Main form (needs update)
