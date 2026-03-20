# Error Handling System Documentation

## Overview

This application implements comprehensive error handling across both frontend and backend to provide:

- **User-friendly error messages** instead of cryptic technical errors
- **Automatic error logging** for debugging
- **Graceful degradation** when errors occur
- **Network error detection** and recovery
- **Request timeout handling**
- **Global error boundaries** to prevent app crashes

---

## Frontend Error Handling

### 1. Global Error Boundary

**File**: `client/src/components/error-boundary.tsx`

Catches React component errors and prevents the entire app from crashing.

```tsx
import { ErrorBoundary } from "@/components/error-boundary";

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>;
```

**Features**:

- Displays user-friendly error UI
- Shows stack trace in development mode
- Provides "Try Again" and "Reload Page" actions
- Logs errors to console

### 2. Centralized API Client

**File**: `client/src/lib/api-client.ts`

Handles all API requests with automatic error handling, timeouts, and retries.

**Usage**:

```typescript
import apiClient from "@/lib/api-client";

// GET request
const data = await apiClient.get("/api/users");

// POST request with success toast
const result = await apiClient.post(
  "/api/users",
  { name: "John" },
  {
    showSuccessToast: true,
    successMessage: "User created successfully!",
  }
);

// Disable error toast (handle manually)
const data = await apiClient.get("/api/users", {
  showErrorToast: false,
});
```

**Features**:

- Automatic timeout handling (30s default)
- Network error detection
- Automatic error toasts
- JSON parsing with error handling
- Proper HTTP status code handling

**Custom Error Types**:

- `APIError` - Server returned an error response
- `NetworkError` - Network/connection issues
- `TimeoutError` - Request took too long

### 3. Custom Hooks

**File**: `client/src/hooks/use-api.ts`

React hooks for API calls with automatic loading/error state management.

**useAPI Hook**:

```typescript
import { useAPI } from "@/hooks/use-api";

function MyComponent() {
  const { data, loading, error, execute } = useAPI();

  const handleSubmit = async () => {
    await execute(() => apiClient.post("/api/users", userData));
  };

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  return <div>{data}</div>;
}
```

**useMutation Hook**:

```typescript
import { useMutation } from "@/hooks/use-api";

const { mutate, loading, error } = useMutation(
  (userData) => apiClient.post("/api/users", userData),
  {
    onSuccess: (data) => console.log("Success!", data),
    onError: (error) => console.error("Failed:", error),
  }
);

await mutate({ name: "John" });
```

---

## Backend Error Handling

### 1. Error Handler Middleware

**File**: `server/error-handler.ts`

Centralized error handling for all Express routes.

**Custom Error Classes**:

```typescript
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "./error-handler";

// Throw custom errors
throw new ValidationError("Email is required");
throw new NotFoundError("User");
throw new UnauthorizedError("Invalid credentials");
```

**Features**:

- Automatic error logging with timestamps
- Stack traces in development mode
- Consistent error response format
- Differentiates operational vs programming errors

### 2. Validation Middleware

**File**: `server/validation-middleware.ts`

Validates request body, query params, and URL params using Zod schemas.

**Usage**:

```typescript
import { validateBody } from "./validation-middleware";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

app.post("/api/users", validateBody(createUserSchema), async (req, res) => {
  // req.body is now validated and typed
  const user = await createUser(req.body);
  res.json(user);
});
```

**Benefits**:

- Automatic validation with clear error messages
- Type safety
- Reduces boilerplate code
- Consistent error format

### 3. Async Handler

Wraps async route handlers to automatically catch errors.

```typescript
import { asyncHandler } from "./error-handler";

app.get(
  "/api/users/:id",
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id);
    if (!user) throw new NotFoundError("User");
    res.json(user);
  })
);
```

---

## Error Response Format

### Success Response

```json
{
  "data": { ... },
  "message": "Success"
}
```

### Error Response

```json
{
  "error": "User not found",
  "status": 404
}
```

### Error Response (Development)

```json
{
  "error": "User not found",
  "status": 404,
  "stack": "Error: User not found\n    at ...",
  "details": { ... }
}
```

---

## HTTP Status Codes

The application uses standard HTTP status codes:

- **200** - Success
- **201** - Created
- **204** - No Content
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (authentication required)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate resource)
- **429** - Too Many Requests (rate limiting)
- **500** - Internal Server Error
- **503** - Service Unavailable

---

## Best Practices

### Frontend

1. **Always use the API client** instead of raw `fetch()`

```typescript
// ✅ Good
const data = await apiClient.get("/api/users");

// ❌ Bad
const response = await fetch("/api/users");
const data = await response.json();
```

2. **Use error boundaries** for component trees

```tsx
<ErrorBoundary>
  <ComplexFeature />
</ErrorBoundary>
```

3. **Handle loading and error states**

```tsx
if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
return <Content data={data} />;
```

4. **Disable auto-toast for expected errors**

```typescript
try {
  await apiClient.get("/api/user", { showErrorToast: false });
} catch (error) {
  // Handle manually
  if (error instanceof APIError && error.status === 404) {
    // User not found, show custom UI
  }
}
```

### Backend

1. **Use custom error classes**

```typescript
// ✅ Good
throw new NotFoundError("User");

// ❌ Bad
res.status(404).json({ error: "Not found" });
```

2. **Validate all inputs**

```typescript
app.post("/api/users",
  validateBody(userSchema),
  async (req, res) => { ... }
);
```

3. **Use asyncHandler for async routes**

```typescript
app.get(
  "/api/users",
  asyncHandler(async (req, res) => {
    // Errors automatically caught
  })
);
```

4. **Log critical errors**

```typescript
try {
  await criticalOperation();
} catch (error) {
  console.error("CRITICAL:", error);
  throw new AppError("Service unavailable", 503, false);
}
```

---

## Testing Error Handling

### Frontend

Test error boundary:

```typescript
// Throw error to test boundary
throw new Error("Test error boundary");
```

Test network errors:

```typescript
// Disconnect internet and try API call
await apiClient.get("/api/users");
// Should show "You appear to be offline" message
```

Test timeout:

```typescript
// Should timeout after 30 seconds
await apiClient.get("/api/slow-endpoint", { timeout: 5000 });
```

### Backend

Test validation:

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid"}'
# Should return 400 with validation error
```

Test error logging:

```bash
# Check server logs for error details
tail -f server.log
```

---

## Troubleshooting

### Issue: Errors not showing toasts

**Solution**: Check that `useToast` is available and Toaster component is rendered

### Issue: Error boundary not catching errors

**Solution**: Error boundaries only catch errors in child components, not in:

- Event handlers
- Async code
- Server-side rendering
- Errors in the error boundary itself

### Issue: Backend errors showing generic message

**Solution**: Check if error is marked as `isOperational: false`. Non-operational errors are hidden in production.

### Issue: Timeout errors on slow connections

**Solution**: Increase timeout for specific requests:

```typescript
await apiClient.get("/api/large-data", { timeout: 60000 }); // 60s
```

---

## Examples

### Complete Example: Form Submission with Error Handling

```typescript
import { useState } from "react";
import apiClient from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

function CreateUserForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    setError(null);

    try {
      await apiClient.post("/api/users", formData, {
        showSuccessToast: true,
        successMessage: "User created successfully!"
      });

      // Success - redirect or clear form

    } catch (err: any) {
      // Error automatically shown in toast by API client
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorAlert message={error} />}
      {/* Form fields */}
      <button disabled={loading}>
        {loading ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}
```

---

## Summary

The error handling system provides:

- ✅ User-friendly error messages
- ✅ Automatic error logging
- ✅ Network error detection
- ✅ Request timeouts
- ✅ Global error boundaries
- ✅ Consistent error format
- ✅ Validation with Zod
- ✅ Loading states
- ✅ Toast notifications

This ensures a robust, production-ready application with excellent error handling and user experience.

---

# API Error Code System

## New Structured Error Handling

The API now implements a comprehensive error code system with specific codes for each error type.

## Error Response Format

All errors follow this structure:

```json
{
  "code": 1300,
  "message": "Ad view not found",
  "details": {
    "trackingToken": "abc123..."
  },
  "timestamp": "2025-10-24T20:15:30.000Z",
  "path": "/api/ad-views/abc123/complete"
}
```

## Error Code Ranges

| Range     | Category        | Description                        |
| --------- | --------------- | ---------------------------------- |
| 1000-1099 | Authentication  | Auth-related errors                |
| 1100-1199 | Validation      | Input validation errors            |
| 1200-1299 | Resources       | Resource not found/conflict errors |
| 1300-1399 | Ad Tracking     | Ad view tracking errors            |
| 1400-1499 | Fraud Detection | Fraud-related errors               |
| 1500-1599 | Rate Limiting   | Rate limit errors                  |
| 1600-1699 | Business Logic  | Business rule violations           |
| 1700-1799 | System          | Internal server errors             |

## Common Error Codes

### Authentication Errors (1000-1099)

- **1000** (401): Authentication required
- **1001** (401): Invalid credentials
- **1002** (401): Invalid user
- **1005** (403): Insufficient permissions

### Validation Errors (1100-1199)

- **1101** (400): Missing required field
- **1102** (400): Invalid input
- **1103** (400): Invalid format

### Ad Tracking Errors (1300-1399)

- **1300** (404): Ad view not found
- **1301** (400): Ad view already completed
- **1302** (400): Reward already claimed
- **1303** (400): Ad view not completed yet
- **1305** (404): Campaign not found

### Fraud Detection Errors (1400-1499)

- **1400** (403): Fraud detected
- **1402** (403): Reward claim denied due to fraud

### Business Logic Errors (1600-1699)

- **1601** (400): Campaign budget exceeded
- **1602** (400): Minimum view duration not met
- **1603** (400): Maximum rewards per campaign reached

### Rate Limiting Errors (1500-1599)

- **1500** (429): Rate limit exceeded

## Using Error Codes in Client

```typescript
try {
  const response = await fetch("/api/ad-views/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify({ userId, campaignId }),
  });

  if (!response.ok) {
    const error = await response.json();

    switch (error.code) {
      case 1000: // AUTH_REQUIRED
        redirectToLogin();
        break;
      case 1101: // MISSING_REQUIRED_FIELD
        showFieldError(error.details.field);
        break;
      case 1400: // FRAUD_DETECTED
        showFraudWarning(error.details.reason);
        break;
      case 1602: // MIN_VIEW_DURATION_NOT_MET
        showDurationRequirement(error.details.requiredDuration);
        break;
      default:
        showGenericError(error.message);
    }
  }
} catch (error) {
  console.error("Network error:", error);
}
```

## Migrated Endpoints

The following endpoints now use the new error code system:

- ✅ `POST /api/ad-views/start` - Start ad view tracking
- ✅ `POST /api/ad-views/:token/complete` - Complete ad view
- ✅ `POST /api/ad-views/:token/click` - Record ad click
- ✅ `POST /api/ad-views/:token/claim` - Claim reward
- ✅ All authentication middleware endpoints
- ✅ All rate-limited endpoints

## Testing

Run the error handling test suite:

```bash
npm run dev
node test-error-handling.js
```

This will test various error scenarios and verify that proper error codes are returned.
