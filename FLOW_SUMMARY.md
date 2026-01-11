# Solutions Hub - User Flow and System Architecture

## 🔍 Website Auto-Fill Functionality
**Status: NOT IMPLEMENTED**
- The website field in the vendor questionnaire (`VendorStep1CompanyInfo.tsx`) is a standard URL input field
- There is NO automatic data fetching/scraping from website URLs to fill questionnaire fields
- Users must manually enter all information

## 👥 User Roles and Flow

### Role Types
1. **Buyer** (Frontend) = **Customer** (Backend) = Healthcare Institution
2. **Seller** (Frontend) = **Vendor** (Backend) = AI Solution Provider
3. **Superadmin** (Both) = System Administrator

### Complete User Flow

#### 1. User Registration & Authentication
- User signs up/logs in via Clerk (solutions-hub-main) or backend auth (frontend)
- User data is synced to MongoDB `users` collection
- Clerk webhooks handle user.created, user.updated, user.deleted events

#### 2. Onboarding Flow (First Time Users)

**Step 1: Role Selection**
- Location: `OnboardingGuard` component
- User is prompted to select role: **Buyer** or **Seller**
- Selection saved via `POST /api/user` with role field
- Backend maps: `buyer` → `customer`, `seller` → `vendor`

**Step 2: Questionnaire Completion**
- After role selection, questionnaire modal opens automatically
- **Buyers** see: `InstitutionQuestionnaire` (4 steps)
- **Sellers** see: `VendorQuestionnaire` (7 steps)

**Step 3: Profile Submission**
- Questionnaire data saved via:
  - Buyers: `POST /api/institution`
  - Sellers: `POST /api/vendor`
- User profile flags updated:
  - `hasInstitutionProfile` (buyers)
  - `hasVendorProfile` (sellers)
  - `profileCompletedAt` timestamp set

**Step 4: Redirect**
- After questionnaire submission, user redirected to `/profile` page

#### 3. Profile Page Flow

**Access Points:**
- `/profile` - Main profile page
- User can view/edit their profile data
- Shows different views based on role (buyer/seller)

**Profile Actions:**
- View profile data
- Edit profile (opens questionnaire modal with existing data)
- Role selection (if no role selected)
- Switch between buyer/seller roles (if allowed)

#### 4. Solutions Hub Flow

**Access:**
- `/solutions-hub` - Browse solutions (buyers)
- Sellers are redirected to `/profile` when accessing solutions-hub

**Buyer Flow:**
1. Browse solution cards
2. View solution details (`/solutions-hub/[id]`)
3. Create queries/requests
4. Get matched with vendors

**Seller Flow:**
1. Complete vendor profile
2. View/manage their solution listings
3. Get matched with buyers
4. Receive queries from buyers

## 📋 Questionnaire Structures

### Institution Questionnaire (Buyers)
**Location:** `src/components/InstitutionQuestionnaire.tsx`
**Steps:** 4 steps
**API Endpoint:** `POST /api/institution`

**Step 1:** AI Solutions Available
- Selected AI solutions

**Step 2:** General Information
- Institution name, type, location
- Primary/secondary contact information
- Preferred contact method
- Best time to contact

**Step 3:** Medical Information
- Medical specialties
- Patient volume
- Current systems
- Compliance requirements
- Data sharing preferences
- Integration requirements
- Data security needs

**Step 4:** Problems & AI Solutions Needed
- Primary challenges
- Pain points
- Goals
- Interested solution areas
- Must-have/nice-to-have features
- Budget range
- Timeline
- Decision makers
- Procurement process
- Additional notes

### Vendor Questionnaire (Sellers)
**Location:** `src/components/vendor-questionnaire/VendorQuestionnaire.tsx`
**Steps:** 7 steps
**API Endpoint:** `POST /api/vendor`

**Step 1:** Company Information
- Company name, type, website
- Founded year, size
- Location (state, country)

**Step 2:** Contact Information
- Primary/secondary contact details
- Preferred contact method
- Best time to contact

**Step 3:** Solution Information
- Solution name, description
- Solution category
- Target specialties/institution types
- Key features
- Technology stack
- Deployment options
- Integration capabilities

**Step 4:** Compliance & Security
- Compliance certifications
- Security features
- Data handling

**Step 5:** Business Information
- Pricing model, range
- Contract terms
- Implementation time
- Support offered
- Training provided

**Step 6:** Market & Clients
- Current clients
- Client count
- Case studies
- Testimonials
- Awards

**Step 7:** Additional Information
- Competitive advantages
- Future roadmap
- Additional notes

## 🔄 Data Flow

### User Data Flow
```
Clerk/Backend Auth → MongoDB Users Collection
                    ↓
              Role Selection (buyer/seller)
                    ↓
         Questionnaire Completion
                    ↓
    HealthcareInstitution or Vendor Collection
                    ↓
          Profile Flags Updated
```

### API Endpoints

**User Management:**
- `GET /api/user` - Get user data with profile flags
- `POST /api/user` - Update user role

**Institution (Buyers):**
- `POST /api/institution` - Create/update institution profile
- `GET /api/institution` - Get current user's institution profile
- `GET /api/institution/[userId]` - Get institution by userId

**Vendor (Sellers):**
- `POST /api/vendor` - Create/update vendor profile
- `GET /api/vendor` - Get current user's vendor profile
- `GET /api/vendor/[userId]` - Get vendor by userId

## 🗄️ Database Schema

### Collections
1. **users** - Central user management (Clerk synced)
2. **healthcareinstitutions** - Buyer profiles
3. **vendors** - Seller profiles
4. **solutioncards** - Solution listings
5. **matches** - Buyer-seller matches
6. **messages** - Communication between matches
7. **notifications** - User notifications
8. **activitylogs** - Audit trail
9. **savedsearches** - Saved search criteria

### Key Relationships
- `users` 1:1 `healthcareinstitutions` (buyers)
- `users` 1:1 `vendors` (sellers)
- `users` 1:many `matches`
- `matches` 1:many `messages`

## 🔐 Authentication & Authorization

### solutions-hub-main (Clerk-based)
- Uses Clerk for authentication
- Clerk webhooks sync user data to MongoDB
- User context: `UserContext.tsx` (Clerk-based)

### frontend (Backend Auth)
- Uses custom backend authentication
- JWT tokens stored in cookies/headers
- User context: `AuthContext.tsx` (custom backend)
- User context: `UserContext.tsx` (custom backend, adapted)

## 📍 Key Components

### Onboarding
- `OnboardingGuard.tsx` - Enforces role selection and questionnaire completion
- `RoleSelection.tsx` - Role selection modal
- `InstitutionQuestionnaire.tsx` - Buyer questionnaire
- `VendorQuestionnaire.tsx` - Seller questionnaire

### Profile Management
- `/profile` page - Profile display and editing
- Profile data fetched based on user role
- Questionnaires opened with existing data for editing

### Navigation
- `HamburgerMenu.tsx` - Mobile navigation
- `Sidebar.tsx` - Desktop navigation
- Solutions hub access restricted for sellers

## 🔄 Migration Notes (solutions-hub-main → frontend)

### Changes Required
1. Replace Clerk authentication with backend auth
2. Update `UserContext` to use backend APIs
3. Map roles: `buyer` ↔ `customer`, `seller` ↔ `vendor`
4. Update API endpoints to use backend routes
5. Adapt questionnaire components to use `useAuth` instead of `useUser`
6. Update profile flags tracking

### Already Migrated
- ✅ Questionnaire components structure
- ✅ UserContext adapted for backend
- ✅ RoleSelection component
- ✅ API client functions in `lib/api.ts`

### Still Needed
- ⏳ OnboardingGuard adaptation
- ⏳ Profile page migration
- ⏳ HamburgerMenu adaptation
- ⏳ Supporting components
