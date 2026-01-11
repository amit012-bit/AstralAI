# Website Auto-Fill Functionality & Complete Flow Documentation

## 🔍 Website Auto-Fill Functionality

### Location
The website auto-fill functionality is located in:
- **Component**: `src/components/vendor-questionnaire/Step0UrlInput.tsx`
- **Hook**: `src/components/vendor-questionnaire/hooks/useUrlParsing.ts`
- **API Endpoints**:
  - `src/app/api/automation/vendor/parse-website/route.ts` (Non-streaming)
  - `src/app/api/automation/vendor/parse-website-stream/route.ts` (Streaming - Used in UI)
- **Prompts**: `src/components/prompts/vendor-questionnaire/`

### How It Works

#### Step 0: URL Input (Optional Step)
The vendor questionnaire has an **optional Step 0** where users can enter a website URL to automatically extract and fill company information.

**Component**: `Step0UrlInput.tsx`
- User enters a website URL
- Optional step - users can skip it
- Validates URL format (http/https)
- Calls the parsing API when submitted

#### URL Parsing Hook
**Hook**: `useUrlParsing.ts`
- Manages parsing state (isParsing, parseError)
- Calls `/api/automation/vendor/parse-website-stream` endpoint
- Uses Server-Sent Events (SSE) for real-time streaming of extracted data
- Merges extracted data into form as it arrives
- Automatically moves to Step 1 after parsing completes

#### API Endpoint: Streaming Version (Used in UI)
**Route**: `/api/automation/vendor/parse-website-stream`
- Uses Puppeteer to scrape the website
- Uses OpenAI GPT-4o-mini to extract structured data
- Streams results in real-time using Server-Sent Events (SSE)
- Processes sections sequentially:
  1. Company Overview
  2. Product Information
  3. Integrations
  4. Contact Information
  5. Compliance & Certifications
- Returns data as it's extracted (not all at once)

#### API Endpoint: Non-Streaming Version
**Route**: `/api/automation/vendor/parse-website`
- Same functionality but returns all data at once
- Restricted to superadmin only (`hitesh.ms24@gmail.com`)

#### Data Extraction Process

1. **Website Scraping**:
   - Uses Puppeteer (headless browser)
   - Extracts text content from the website
   - Handles JavaScript-rendered content

2. **AI-Powered Extraction**:
   - Uses OpenAI GPT-4o-mini model
   - Uses specialized prompts for each section
   - Prompt files located in `src/components/prompts/vendor-questionnaire/`:
     - `01-company-overview.txt`
     - `02-product-information.txt`
     - `03-integrations.txt`
     - `04-contact-information.txt`
     - `05-compliance-certifications.txt`
   - Each prompt guides the AI to extract specific structured data

3. **Data Merging**:
   - Extracted data is merged into the form state
   - Users can review and edit before submitting
   - Original website URL is preserved in the form

### Integration in VendorQuestionnaire

The `VendorQuestionnaire` component:
- Shows Step 0 (URL Input) as the first step
- Uses `useUrlParsing` hook to handle URL parsing
- Merges extracted data progressively as it arrives
- Automatically advances to Step 1 after parsing completes
- Users can skip Step 0 entirely

## 👥 Customer/Vendor Flow

### User Roles

1. **Customer** (Frontend) = **Buyer** (Backend) = Healthcare Institution
2. **Vendor** (Frontend) = **Seller** (Backend) = AI Solution Provider
3. **Superadmin** = System Administrator

### Complete Onboarding Flow

#### 1. User Registration & Authentication
- User signs up/logs in via Clerk
- User data synced to MongoDB `users` collection
- Clerk webhooks handle user lifecycle events

#### 2. OnboardingGuard Component

**Location**: `src/components/OnboardingGuard.tsx`

This component wraps the application and enforces onboarding:

**Checks Performed**:
- If user has no role → Show role selection
- If user is vendor and has no vendor profile → Show vendor questionnaire
- If user is customer and has no customer profile → Show customer questionnaire
- If user is superadmin → Allow access without profiles

**State Management**:
- `hasVendorProfile`: Tracks if vendor profile exists
- `hasBuyerProfile`: Tracks if customer profile exists
- `isOnboardingOpen`: Controls onboarding modal visibility

#### 3. OnboardingFlow Component

**Location**: `src/components/OnboardingFlow.tsx`

Unified onboarding flow that handles:
- Role selection (Customer/Vendor)
- Vendor questionnaire
- Customer questionnaire

**Steps**:
1. **Role Selection**:
   - User selects "Looking for Solutions" (Customer) or "Selling Solutions" (Vendor)
   - Selection saved via `POST /api/user` with role field
   - Backend maps roles appropriately

2. **Questionnaire Completion**:
   - **Vendors**: VendorQuestionnaire (7 steps, with optional Step 0 for URL parsing)
   - **Customers**: BuyerQuestionnaire (structure varies)

#### 4. Vendor Questionnaire Flow

**Component**: `src/components/vendor-questionnaire/VendorQuestionnaire.tsx`

**Steps**:
- **Step 0**: Parse Website (Optional - Auto-fill from URL) ⭐ **This is the auto-fill feature**
- **Step 1**: Company Overview
- **Step 2**: Contact Information
- **Step 3**: Product Information
- **Step 4**: Integrations
- **Step 5**: Compliance
- **Step 6**: Summary

**API Endpoint**: `POST /api/vendor/questionnaire`

**After Submission**:
- Vendor profile created/updated in MongoDB
- User redirected to `/vendor/[userId]` page
- Profile flags updated in user document

#### 5. Customer/Buyer Questionnaire Flow

**Component**: `src/components/buyer-questionnaire/BuyerQuestionnaire.tsx`

**API Endpoint**: `POST /api/buyer/questionnaire`

**After Submission**:
- Buyer profile created/updated in MongoDB
- User redirected to `/solutions-hub`
- Profile flags updated in user document

### API Endpoints

#### User Management
- `GET /api/user` - Get user data with profile flags
- `POST /api/user` - Update user role

#### Vendor (Sellers)
- `POST /api/vendor/questionnaire` - Create/update vendor profile
- `GET /api/vendor` - Get current user's vendor profile
- `GET /api/vendor/[userId]` - Get vendor by userId

#### Buyer (Customers)
- `POST /api/buyer/questionnaire` - Create/update buyer profile
- `GET /api/buyer` - Get current user's buyer profile
- `GET /api/buyer/[userId]` - Get buyer by userId

#### Website Parsing (Auto-fill)
- `POST /api/automation/vendor/parse-website-stream` - Stream website data extraction (Used in UI)
- `POST /api/automation/vendor/parse-website` - Non-streaming version (Superadmin only)

### Database Schema

#### Collections
1. **users** - Central user management (Clerk synced)
2. **vendors** - Vendor profiles (sellers)
3. **buyers** - Buyer profiles (customers/healthcare institutions)
4. **listings** - Solution listings
5. **proposals** - Proposals from buyers to vendors
6. **matches** - Matching relationships
7. **messages** - Communication
8. **notifications** - User notifications

### Key Features

#### Website Auto-Fill Features:
- ✅ Optional Step 0 in vendor questionnaire
- ✅ Puppeteer-based website scraping
- ✅ OpenAI GPT-4o-mini for intelligent extraction
- ✅ Real-time streaming of extracted data (SSE)
- ✅ Progressive form filling
- ✅ Section-by-section extraction
- ✅ Users can review and edit before submitting

#### Role-Based Features:
- ✅ Separate questionnaires for vendors and customers
- ✅ Role-based profile requirements
- ✅ Superadmin access without profile requirements
- ✅ Automatic redirects after profile completion
- ✅ Profile completion tracking

## 🔄 Complete User Journey

### Vendor Journey
1. Sign up/Login
2. Select "Selling Solutions" role
3. **Optional**: Enter website URL for auto-fill (Step 0)
4. Complete vendor questionnaire (Steps 1-6)
5. Review summary (Step 6)
6. Submit → Redirected to `/vendor/[userId]`
7. Can create listings, receive proposals, etc.

### Customer Journey
1. Sign up/Login
2. Select "Looking for Solutions" role
3. Complete buyer questionnaire
4. Submit → Redirected to `/solutions-hub`
5. Can browse solutions, create proposals, etc.

## 📝 Technical Details

### Website Parsing Stack
- **Puppeteer**: Web scraping
- **OpenAI GPT-4o-mini**: AI-powered data extraction
- **Server-Sent Events (SSE)**: Real-time streaming
- **Prompt Engineering**: Section-specific prompts for accurate extraction

### Security
- Website parsing endpoints require authentication
- Non-streaming endpoint restricted to superadmin
- URL validation (http/https only)
- Error handling and fallbacks

### Data Flow for Auto-Fill
```
User enters URL in Step 0
    ↓
useUrlParsing hook calls /api/automation/vendor/parse-website-stream
    ↓
API uses Puppeteer to scrape website
    ↓
Website content sent to OpenAI with section-specific prompts
    ↓
AI extracts structured data section by section
    ↓
Data streamed back via SSE in real-time
    ↓
Form data merged progressively as sections arrive
    ↓
User reviews/edits extracted data
    ↓
User proceeds through remaining steps
    ↓
Final submission saves complete profile
```

## 🎯 Key Differences from Previous Version

This version (from GitHub) has:
- ✅ Website auto-fill functionality (Step 0)
- ✅ Streaming API for real-time updates
- ✅ Separate buyer/vendor questionnaires
- ✅ Updated onboarding flow (OnboardingFlow component)
- ✅ Different API structure (`/api/vendor/questionnaire` vs `/api/vendor`)
- ✅ Enhanced vendor questionnaire with products array
- ✅ More sophisticated data extraction
