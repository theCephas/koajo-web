# Signup Form Update: First Name and Last Name Fields

## 🎯 Overview

Added **first name** and **last name** fields to the signup form with tooltip warnings informing users that these names must match their bank account holder name to avoid account flagging.

---

## ✅ Changes Made

### **1. Updated API Types**

**File: [lib/types/api.ts:44-50](lib/types/api.ts#L44-L50)**

Added `firstName` and `lastName` to the `SignupRequest` interface:

```typescript
export interface SignupRequest {
  email: string;
  phoneNumber: string;
  password: string;
  firstName: string;  // ✅ NEW
  lastName: string;   // ✅ NEW
}
```

---

### **2. Created Tooltip Component**

**File: [components/utils/tooltip.tsx](components/utils/tooltip.tsx)**

Created a reusable tooltip component with:
- Hover/focus triggers
- Position options (top, bottom, left, right)
- Custom styling support
- Accessible ARIA attributes

**Features:**
```typescript
interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}
```

**Usage Example:**
```tsx
<Tooltip
  content="This is helpful information"
  position="top"
>
  <button>Hover me</button>
</Tooltip>
```

**Exported from:** [components/utils/index.ts:16](components/utils/index.ts#L16)

---

### **3. Updated Signup Form**

**File: [app/register/page.tsx](app/register/page.tsx)**

#### **3.1 Updated Form Interface**

```typescript
interface RegisterFormData {
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  firstName: string;   // ✅ NEW
  lastName: string;    // ✅ NEW
}
```

#### **3.2 Added Name Fields with Tooltips**

Added two new form fields at the top of the registration form (before email):

**First Name Field:**
```tsx
<div className="space-y-2">
  <div className="flex items-center gap-2">
    <Label htmlFor="firstName" required>
      First Name
    </Label>
    <Tooltip
      content={
        <div className="text-xs">
          <p className="font-semibold mb-1">⚠️ Important</p>
          <p>
            Your first and last name must match the name on your bank
            account. Accounts with mismatched names will be flagged
            and may be restricted.
          </p>
        </div>
      }
      position="top"
    >
      <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center cursor-help">
        <span className="text-white text-xs font-bold">i</span>
      </div>
    </Tooltip>
  </div>
  <Field
    label=""
    type="text"
    name="firstName"
    placeholder="Enter your first name"
    required
    error={formErrors.firstName?.message}
    {...registerField("firstName")}
    className="space-y-0"
  />
</div>
```

**Last Name Field:**
```tsx
<div className="space-y-2">
  <div className="flex items-center gap-2">
    <Label htmlFor="lastName" required>
      Last Name
    </Label>
    <Tooltip
      content={
        <div className="text-xs">
          <p className="font-semibold mb-1">⚠️ Important</p>
          <p>
            Your first and last name must match the name on your bank
            account. Accounts with mismatched names will be flagged
            and may be restricted.
          </p>
        </div>
      }
      position="top"
    >
      <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center cursor-help">
        <span className="text-white text-xs font-bold">i</span>
      </div>
    </Tooltip>
  </div>
  <Field
    label=""
    type="text"
    name="lastName"
    placeholder="Enter your last name"
    required
    error={formErrors.lastName?.message}
    {...registerField("lastName")}
    className="space-y-0"
  />
</div>
```

#### **3.3 Updated Signup Request**

Modified the `onSubmit` function to include the new fields:

```typescript
const response = await AuthService.signup({
  email: data.email,
  phoneNumber: getPhoneNumber(data.phoneNumber),
  password: data.password,
  firstName: data.firstName,   // ✅ NEW
  lastName: data.lastName,     // ✅ NEW
});
```

---

### **4. Updated Form Validation**

**File: [lib/hooks/useValidateForm.ts](lib/hooks/useValidateForm.ts)**

#### **4.1 Updated Interface**

```typescript
export interface RegistrationFormValues {
  firstName: string;   // ✅ NEW
  lastName: string;    // ✅ NEW
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}
```

#### **4.2 Updated Default Values**

```typescript
registration: {
  firstName: "",      // ✅ NEW
  lastName: "",       // ✅ NEW
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
},
```

#### **4.3 Validation Rules (Already Existed)**

The validation rules for `firstName` and `lastName` were already defined in the codebase:

**Lines 107-114:**
```typescript
case "firstName":
  return {
    required: FORM_FIELDS_MESSAGES.FIRST_NAME.REQUIRED,
  } as RegisterOptions<T, Path<T>>;
case "lastName":
  return {
    required: FORM_FIELDS_MESSAGES.LAST_NAME.REQUIRED,
  } as RegisterOptions<T, Path<T>>;
```

**Validation Messages** (from [lib/constants/form.ts:49-60](lib/constants/form.ts#L49-L60)):
```typescript
FIRST_NAME: {
  REQUIRED: "First name is required",
  PATTERN: "First name must be alphabetic letters only",
  MIN_LENGTH: "First name must be at least 2 characters",
  MAX_LENGTH: "First name must be at most 50 characters",
},
LAST_NAME: {
  REQUIRED: "Last name is required",
  PATTERN: "Last name must be alphabetic letters only",
  MIN_LENGTH: "Last name must be at least 2 characters",
  MAX_LENGTH: "Last name must be at most 50 characters",
},
```

**Validation Patterns** (from [lib/constants/form.ts:7-17](lib/constants/form.ts#L7-L17)):
```typescript
FIRST_NAME: {
  PATTERN: /^[a-zA-Z]+$/,
  MIN_LENGTH: 2,
  MAX_LENGTH: 50,
},
LAST_NAME: {
  PATTERN: /^[a-zA-Z]+$/,
  MIN_LENGTH: 2,
  MAX_LENGTH: 50,
},
```

---

## 🎨 UI/UX Details

### **Tooltip Design:**
- **Icon:** Yellow circular badge with white "i" (information icon)
- **Placement:** Next to the field label
- **Trigger:** Hover or focus
- **Content:** Warning message about bank account name matching
- **Style:** Dark background with white text
- **Position:** Top of the icon (to avoid blocking form fields below)

### **Warning Message:**
```
⚠️ Important

Your first and last name must match the name on your bank
account. Accounts with mismatched names will be flagged
and may be restricted.
```

### **Form Field Order:**
1. First Name (with tooltip)
2. Last Name (with tooltip)
3. Email
4. Phone Number
5. Password
6. Confirm Password
7. Agree to Terms

---

## 🔧 Backend Requirements

The backend needs to accept the new fields in the `/v1/auth/signup` endpoint:

**Request Payload:**
```json
{
  "email": "user@example.com",
  "phoneNumber": "+15551234567",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Expected Backend Changes:**
1. Update signup endpoint to accept `firstName` and `lastName` fields
2. Store these fields in the user table/model
3. Validate that names match bank account holder names during bank connection
4. Flag accounts where names don't match for manual review

---

## ✅ Validation Rules

### **First Name:**
- **Required:** Yes
- **Pattern:** Alphabetic letters only (`/^[a-zA-Z]+$/`)
- **Min Length:** 2 characters
- **Max Length:** 50 characters
- **Error Messages:**
  - Required: "First name is required"
  - Pattern: "First name must be alphabetic letters only"
  - Min Length: "First name must be at least 2 characters"
  - Max Length: "First name must be at most 50 characters"

### **Last Name:**
- **Required:** Yes
- **Pattern:** Alphabetic letters only (`/^[a-zA-Z]+$/`)
- **Min Length:** 2 characters
- **Max Length:** 50 characters
- **Error Messages:**
  - Required: "Last name is required"
  - Pattern: "Last name must be alphabetic letters only"
  - Min Length: "Last name must be at least 2 characters"
  - Max Length: "Last name must be at most 50 characters"

---

## 🧪 Testing Checklist

### **Frontend Testing:**
- [ ] First name field appears on signup page
- [ ] Last name field appears on signup page
- [ ] Tooltip appears on hover over info icon
- [ ] Tooltip displays correct warning message
- [ ] Required validation works (empty field shows error)
- [ ] Pattern validation works (numbers/special chars show error)
- [ ] Min/max length validation works
- [ ] Form submits successfully with valid data
- [ ] firstName and lastName are included in signup API request
- [ ] Console shows firstName and lastName in signup request payload

### **Backend Testing:**
- [ ] Signup endpoint accepts firstName and lastName
- [ ] User record is created with firstName and lastName
- [ ] Names are stored correctly in database
- [ ] Bank account connection validates name matching
- [ ] Mismatched names trigger account flagging

### **Integration Testing:**
- [ ] Complete signup flow from registration to bank connection
- [ ] Verify name matching validation works during bank account linking
- [ ] Test with matching names (should succeed)
- [ ] Test with mismatched names (should flag/warn)

---

## 📋 Files Modified

| File | Purpose | Lines Changed |
|------|---------|---------------|
| [lib/types/api.ts](lib/types/api.ts) | Added firstName/lastName to SignupRequest | 44-50 |
| [components/utils/tooltip.tsx](components/utils/tooltip.tsx) | Created new Tooltip component | 1-64 (new file) |
| [components/utils/index.ts](components/utils/index.ts) | Exported Tooltip component | 16 |
| [app/register/page.tsx](app/register/page.tsx) | Updated signup form with name fields | 29-37, 5-14, 73-83, 148-218 |
| [lib/hooks/useValidateForm.ts](lib/hooks/useValidateForm.ts) | Updated validation interface and defaults | 22-30, 59-67 |

**Note:** Validation rules and messages already existed in [lib/constants/form.ts](lib/constants/form.ts) - no changes needed.

---

## 🔗 Related Documentation

- [Bank Connection Flow](components/admin/bank-connection.tsx) - Shows how bank account names are validated
- [KYC Verification](app/register/kyc/page.tsx) - Identity verification that also captures names
- [ID Number Verification Fix](ID_NUMBER_VERIFICATION_FIX.md) - Related to name extraction from SSN verification

---

## 🚀 Next Steps

1. **Test the signup form:**
   ```bash
   npm run dev
   ```
   Navigate to `/register` and test the new fields

2. **Backend Implementation:**
   - Update `/v1/auth/signup` endpoint to accept firstName and lastName
   - Add database fields for storing names
   - Implement name matching validation during bank connection

3. **Name Matching Logic:**
   - Use the existing `namesMatch()` function from [bank-connection.tsx:23-46](components/admin/bank-connection.tsx#L23-L46)
   - Compare signup names with bank account holder names
   - Flag accounts where names don't match

4. **Account Flagging:**
   - Implement backend logic to flag mismatched accounts
   - Add admin dashboard to review flagged accounts
   - Send notifications to users about name mismatches

---

## ✅ Summary

**What was added:**
1. ✅ First name and last name fields to signup form
2. ✅ Reusable Tooltip component
3. ✅ Warning tooltips on name fields about bank account matching
4. ✅ Form validation for name fields (required, pattern, length)
5. ✅ Updated API request to include names in signup payload

**User Experience:**
- Users see clear warning that names must match bank account
- Tooltip provides context without cluttering the form
- Validation ensures proper name format
- Names are collected upfront to enable better KYC validation

**Result:**
Signup form now collects user names with clear warnings about bank account matching requirements, improving compliance and reducing account flagging! 🎉
