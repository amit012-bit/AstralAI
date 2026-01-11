# New Add Solution Page Design

## Structure

### Tabbed Interface
- **Vendor Tab** (Primary tab)

### Vendor Tab Sections:

1. **Section 1: Parse Website**
   - URL input field
   - Parse button
   - Shows progress/status
   - After parsing: Shows success message and summary (X products found, vendor info extracted)

2. **Section 2: Vendor Basic Details**
   - Company name
   - Company type
   - Location (state, country)
   - Address
   - Primary contact (name, title, email, phone)
   - Website URL
   - All fields auto-filled from parsing, editable

3. **Section 3: Products List**
   - Shows all products/solutions found from parsing
   - Each product shows:
     - Product name
     - Short description/overview
     - Edit button (opens modal/form to complete product details)
     - Status (draft/pending/completed)
   - Add new product button
   - For each product, vendor can fill:
     - Full description
     - Category, industry, subcategory
     - Tags
     - Features
     - Pricing
     - Deployment
     - Technical details
     - Contact info (inherits from vendor if not specified)
     - All customer-focused fields

## Data Flow

1. **Parse Website** → Backend extracts:
   - Vendor info (company, contact)
   - Array of products (each with name, overview, url)

2. **Vendor Details** → Stored/updated in vendor profile

3. **Products List** → Each product becomes a solution entry
   - Initially: Basic info (name, overview from parsing)
   - After editing: Full solution details
   - Can create multiple solutions from one parsing session

## Backend Requirements

1. New endpoint: `/api/automation/vendor/parse-website`
   - Similar to solutions-hub-main
   - Returns vendor info + products array

2. Solution creation:
   - Each product in the list can be saved as a solution
   - Inherits vendor contact info if not specified

## Implementation Plan

1. Create new page structure with tabs
2. Create parsing section component
3. Create vendor details form component
4. Create products list component
5. Create product edit modal/form
6. Update backend API for vendor parsing
7. Wire everything together
