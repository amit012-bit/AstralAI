# Complete Implementation Plan - New Add Solution Page

## Overview
Complete redesign of `/solutions/new` page with:
- Tabbed interface (Vendor tab)
- Website parsing that extracts vendor info + multiple products
- Vendor details form
- Products list with edit capability

## Files to Create/Update

### Frontend Files

1. **`frontend/src/pages/solutions/new.tsx`** (COMPLETE REWRITE)
   - Tabbed interface
   - Vendor tab with 3 sections
   - State management for vendor data and products list

2. **`frontend/src/components/solutions/VendorTab.tsx`** (NEW)
   - Main vendor tab component
   - Contains all 3 sections

3. **`frontend/src/components/solutions/ParseWebsiteSection.tsx`** (NEW)
   - Section 1: URL input, parse button, results display

4. **`frontend/src/components/solutions/VendorDetailsSection.tsx`** (NEW)
   - Section 2: Vendor basic details form

5. **`frontend/src/components/solutions/ProductsListSection.tsx`** (NEW)
   - Section 3: Products list with edit capability

6. **`frontend/src/components/solutions/ProductEditModal.tsx`** (NEW)
   - Modal for editing/completing product details

7. **`frontend/src/hooks/useVendorParsing.ts`** (NEW/UPDATE)
   - Hook for vendor website parsing
   - Returns vendor info + products array

### Backend Files

1. **`backend/controllers/automation/vendorParserController.js`** (NEW)
   - Controller for vendor website parsing
   - Extracts vendor info + products

2. **`backend/routes/automation.js`** (UPDATE)
   - Add route: POST /api/automation/vendor/parse-website

3. **`backend/prompts/vendor-parser/`** (NEW DIRECTORY)
   - Prompt files for vendor extraction (similar to solutions-hub-main)

## Implementation Steps

### Phase 1: Backend API
1. Create vendor parser controller
2. Create prompt files
3. Add route
4. Test API

### Phase 2: Frontend Structure
1. Create new page structure with tabs
2. Create vendor tab component
3. Create section components

### Phase 3: Integration
1. Connect parsing to backend
2. Wire up vendor details form
3. Implement products list
4. Add product edit functionality

### Phase 4: Testing & Refinement
1. Test end-to-end flow
2. Fix bugs
3. Polish UI
