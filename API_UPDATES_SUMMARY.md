# API Endpoint Updates Summary

## Changes Made

### 1. **Bank Account Endpoint (`POST /auth/stripe/bank-account`)**

#### Updated Request Body:

```typescript
{
  "id": "string",              // Stripe Financial Connections account ID
  "customer_id": "string",     // Stripe customer ID
  "bank_name": "string",       // Bank name (e.g., "Chase", "Bank of America")
  "account_first_name": "string",  // First name of account holder (required)
  "account_last_name": "string",   // Last name of account holder (required)
  "account_last4": "string"        // Last 4 digits of account number (required)
}
```

#### Changes:
- ✅ Added `account_last4` field (required)
- ✅ Made `account_first_name` required
- ✅ Made `account_last_name` required
- ❌ Removed `account_name`, `account_type`, and optional `last4`

#### Files Updated:
- [lib/types/api.ts:206-213](lib/types/api.ts#L206-L213) - Updated `LinkStripeBankAccountRequest` interface
- [components/admin/bank-connection.tsx:228-235](components/admin/bank-connection.tsx#L228-L235) - Updated bank account data extraction

---

### 2. **Identity Verification Endpoint (`POST /auth/identity-verification`)**

#### Updated Request Body:

```typescript
{
  "id": "string",              // User ID
  "session_id": "string",      // Stripe verification session ID
  "result_id": "string",       // Stripe verification result/report ID
  "status": "string",          // Verification status (verified, processing, etc.)
  "type": "string",            // Verification type (document, id_number)
  "first_name": "string",      // ✅ NEW: First name from verification
  "last_name": "string"        // ✅ NEW: Last name from verification
}
```

#### Changes:
- ✅ Added `first_name` field (extracted from id_number verification)
- ✅ Added `last_name` field (extracted from id_number verification)
- 📝 For `document` verification: first_name and last_name will be extracted from the document name
- 📝 For `id_number` verification: first_name and last_name will be extracted from the SSN verification inputs

#### Files Updated:
- [lib/types/api.ts:156-166](lib/types/api.ts#L156-L166) - Updated `IdentityVerificationRecord` interface
- [lib/types/api.ts:513-523](lib/types/api.ts#L513-L523) - Updated `RawIdentityVerificationRecord` interface
- [lib/services/authService.ts:531-547](lib/services/authService.ts#L531-L547) - Updated transformation function
- [app/register/kyc/page.tsx:428-436](app/register/kyc/page.tsx#L428-L436) - Updated sync request to include first_name and last_name

---

## How It Works Now

### **Bank Account Connection:**

```typescript
// When user connects bank account:
const bankAccountData = {
  id: connectedAccount.id,                          // From Stripe
  customer_id: customer.customerId,                 // From Stripe
  account_first_name: "John",                       // From ownership data
  account_last_name: "Doe",                         // From ownership data
  account_last4: "1234",                            // From Stripe (connectedAccount.last4)
  bank_name: "Chase",                               // From Stripe
};

// Sent to: POST /auth/stripe/bank-account
```

### **Identity Verification:**

#### **Document Verification:**
```typescript
// When document verification completes:
const verificationData = {
  id: user.id,
  session_id: "vs_abc123",
  result_id: "vr_abc123",
  type: "document",
  status: "verified",
  first_name: "John",      // Extracted from document name
  last_name: "Doe",        // Extracted from document name
};

// Sent to: POST /auth/identity-verification
```

#### **ID Number Verification:**
```typescript
// When id_number verification completes:
const verificationData = {
  id: user.id,
  session_id: "vs_xyz789",
  result_id: "vr_xyz789",
  type: "id_number",
  status: "verified",
  first_name: "John",      // From SSN verification outputs
  last_name: "Doe",        // From SSN verification outputs
};

// Sent to: POST /auth/identity-verification
```

---

## Data Flow

### **Bank Account Connection Flow:**

```
1. User connects bank via Stripe Financial Connections
   ↓
2. Frontend retrieves account details:
   - connectedAccount.id
   - connectedAccount.last4 (NEW!)
   - connectedAccount.institution_name
   ↓
3. Frontend retrieves ownership data:
   - owner.name → split into first_name + last_name
   ↓
4. POST /auth/stripe/bank-account with:
   {
     id, customer_id, bank_name,
     account_first_name, account_last_name,
     account_last4  ← NEW FIELD
   }
   ↓
5. Backend stores bank account info
```

### **Identity Verification Flow:**

```
1. User completes Stripe verification (document or id_number)
   ↓
2. Stripe returns verification result
   ↓
3. Frontend extracts name from verification:
   - Document: Parse name from document
   - ID Number: Extract from verified_outputs.id_number
   ↓
4. POST /auth/identity-verification with:
   {
     id, session_id, result_id, type, status,
     first_name,  ← NEW FIELD
     last_name    ← NEW FIELD
   }
   ↓
5. Backend stores verification record with names
```

---

## Backend Requirements

### **Update `/auth/stripe/bank-account` Endpoint:**

```typescript
// Expected request body schema:
interface BankAccountRequest {
  id: string;
  customer_id: string;
  bank_name?: string;
  account_first_name: string;    // Required
  account_last_name: string;     // Required
  account_last4: string;         // Required (NEW)
}

// Update database schema to include:
// - account_last4 (string, required)
```

### **Update `/auth/identity-verification` Endpoint:**

```typescript
// Expected request body schema:
interface IdentityVerificationRequest {
  id: string;
  session_id: string;
  result_id: string;
  type: "document" | "id_number";
  status: string;
  first_name?: string;    // Optional (NEW)
  last_name?: string;     // Optional (NEW)
}

// Update database schema to include:
// - first_name (string, nullable)
// - last_name (string, nullable)
```

---

## Testing

### **Test Bank Account Connection:**

1. Connect a test bank account:
   - Use test bank: `000123456789` (routing: `110000000`)

2. Check console logs - should see:
   ```
   Bank account data to be sent to backend: {
     id: "fca_xxx",
     customer_id: "cus_xxx",
     account_first_name: "Test",
     account_last_name: "User",
     account_last4: "6789",  ← Should show last 4 digits
     bank_name: "Test Bank"
   }
   ```

3. Verify backend receives `account_last4`

### **Test Identity Verification:**

1. Complete document verification
2. Check Network tab → POST /auth/identity-verification
3. Verify request body includes:
   ```json
   {
     "first_name": "John",
     "last_name": "Doe"
   }
   ```

4. Complete id_number verification
5. Verify same fields are sent

---

## Migration Notes

If you have existing records in your database:

### **Bank Accounts:**
```sql
-- Add new column
ALTER TABLE bank_accounts ADD COLUMN account_last4 VARCHAR(4);

-- Update existing records (if you have historical data)
-- You may need to fetch this from Stripe API for existing accounts
```

### **Identity Verification Records:**
```sql
-- Add new columns
ALTER TABLE identity_verifications ADD COLUMN first_name VARCHAR(255);
ALTER TABLE identity_verifications ADD COLUMN last_name VARCHAR(255);

-- These can remain NULL for existing records
```

---

## Summary

### **What Changed:**

1. **Bank Account Endpoint:**
   - ✅ Now requires `account_last4` field
   - ✅ Frontend extracts `last4` from Stripe's `connectedAccount.last4`
   - ✅ Sends to backend for storage/display

2. **Identity Verification Endpoint:**
   - ✅ Now accepts optional `first_name` and `last_name` fields
   - ✅ Frontend extracts names from Stripe verification outputs
   - ✅ Works for both `document` and `id_number` verification types
   - ✅ Backend can now store verified names with verification records

### **Why These Changes:**

1. **account_last4**: Useful for displaying bank account info to users (e.g., "****1234") without exposing full account number
2. **first_name/last_name in verification**: Allows backend to track verified identity information separately from user profile, improving audit trail and compliance

### **Breaking Changes:**

- ⚠️ Backend MUST update schemas to accept new fields
- ⚠️ `account_last4` is now required for bank account connections
- ⚠️ Old bank account connections without `account_last4` may need migration

---

**All frontend code has been updated and is ready for backend integration!** ✅
