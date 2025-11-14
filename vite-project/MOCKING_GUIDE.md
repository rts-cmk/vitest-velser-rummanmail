# Mocking Guide for Vitest

## Overview

This guide demonstrates how to use mocking in Vitest to test functions that depend on external services, APIs, or databases.

## Key Concepts

### 1. **Module Mocking with `vi.mock()`**

```javascript
vi.mock("./database", () => ({
  database: {
    getUserById: vi.fn(),
    saveUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));
```

- Replaces an entire module with mock implementations
- Must be called at the top level of the test file
- Useful for replacing external dependencies like APIs or databases

### 2. **Function Mocking with `vi.fn()`**

```javascript
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
};
```

- Creates a mock function that can track calls and return values
- Perfect for mocking callback functions or service objects

### 3. **Setting Return Values**

#### Resolve Values (for async functions)

```javascript
database.getUserById.mockResolvedValue(mockUser);
// or
database.getUserById.mockResolvedValueOnce(user1);
database.getUserById.mockResolvedValueOnce(user2);
```

#### Reject Values (for error handling)

```javascript
database.getUserById.mockRejectedValue(new Error("Not found"));
```

#### Direct Return Values

```javascript
mockLogger.info.mockReturnValue(true);
```

### 4. **Clearing Mocks Between Tests**

```javascript
beforeEach(() => {
  vi.clearAllMocks();
});
```

- Resets all mock call counts and implementations
- Ensures tests don't interfere with each other

### 5. **Verifying Mock Calls**

#### Call Count

```javascript
expect(database.getUserById).toHaveBeenCalledTimes(1);
expect(database.getUserById).toHaveBeenCalled();
expect(database.getUserById).not.toHaveBeenCalled();
```

#### Call Arguments

```javascript
expect(database.saveUser).toHaveBeenCalledWith(userData);
expect(database.getUserById).toHaveBeenNthCalledWith(2, 2); // 2nd call
expect(mockLogger.info).toHaveBeenCalledWith("Some message");
```

#### Accessing Call Information

```javascript
const [callArg] = mockNotificationService.sendWelcome.mock.lastCall;
const allCalls = mockLogger.info.mock.calls; // Array of all calls
```

## Benefits of Mocking

✅ **Isolation**: Test logic without external dependencies
✅ **Speed**: No real database queries or API calls
✅ **Control**: Easily simulate success and failure scenarios
✅ **Repeatability**: Consistent test behavior
✅ **No Side Effects**: Don't create real data in tests

## Real-World Example

Without mocking:

```javascript
// ❌ This hits real database - slow and dangerous
it("should fetch user", async () => {
  const user = await getUserDetails(1);
  expect(user.name).toBe("Alice");
});
```

With mocking:

```javascript
// ✅ This uses mock - fast and isolated
it("should fetch user", async () => {
  database.getUserById.mockResolvedValue({
    id: 1,
    name: "Alice",
    email: "alice@example.com",
  });

  const user = await getUserDetails(1);
  expect(user.name).toBe("Alice");
});
```

## Common Patterns

### Pattern 1: Mocking Sequential Calls

```javascript
vi.fn()
  .mockResolvedValueOnce(value1)
  .mockResolvedValueOnce(value2)
  .mockRejectedValueOnce(error);
```

### Pattern 2: Verifying Integration Between Services

```javascript
// Verify order and data flow
expect(database.saveUser).toHaveBeenCalledWith(userData);
expect(notificationService.send).toHaveBeenCalledWith(savedUser);
```

### Pattern 3: Testing Error Handling

```javascript
database.getUserById.mockRejectedValue(new Error("Not found"));
await expect(getUserDetails(999)).rejects.toThrow("Not found");
```

## Files in This Exercise

- `database.js` - Simulated external database service
- `userService.js` - Functions that depend on database
- `userService.test.js` - Complete test suite with mocking examples
