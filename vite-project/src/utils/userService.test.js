import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getUserDetails,
  createUserWithNotification,
  updateUserStatus,
  fetchMultipleUsers
} from './userService';
import { database } from './database';

// Mock the database module
vi.mock('./database', () => ({
  database: {
    getUserById: vi.fn(),
    saveUser: vi.fn(),
    deleteUser: vi.fn()
  }
}));

describe('userService with mocking', () => {
  describe('getUserDetails', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should fetch user and add computed fields when user is active', async () => {
      const mockUser = {
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        active: true
      };

      database.getUserById.mockResolvedValue(mockUser);

      const result = await getUserDetails(1);

      expect(database.getUserById).toHaveBeenCalledWith(1);
      expect(database.getUserById).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        ...mockUser,
        isActive: true,
        displayName: 'Alice (alice@example.com)'
      });
    });

    it('should fetch user and add computed fields when user is inactive', async () => {
      const mockUser = {
        id: 3,
        name: 'Charlie',
        email: 'charlie@example.com',
        active: false
      };

      database.getUserById.mockResolvedValue(mockUser);

      const result = await getUserDetails(3);

      expect(result).toEqual({
        ...mockUser,
        isActive: false,
        displayName: 'Charlie (charlie@example.com)'
      });
    });

    it('should handle database errors', async () => {
      const error = new Error('User not found');
      database.getUserById.mockRejectedValue(error);

      await expect(getUserDetails(999)).rejects.toThrow('User not found');
      expect(database.getUserById).toHaveBeenCalledWith(999);
    });
  });

  describe('createUserWithNotification', () => {
    let mockNotificationService;

    beforeEach(() => {
      vi.clearAllMocks();

      mockNotificationService = {
        sendWelcome: vi.fn().mockResolvedValue(true)
      };
    });

    it('should create user and send notification', async () => {
      const userData = { name: 'John', email: 'john@example.com' };
      const savedUser = { id: 1, ...userData };

      database.saveUser.mockResolvedValue(savedUser);

      const result = await createUserWithNotification(userData, mockNotificationService);

      expect(database.saveUser).toHaveBeenCalledWith(userData);
      expect(database.saveUser).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.sendWelcome).toHaveBeenCalledWith(savedUser);
      expect(mockNotificationService.sendWelcome).toHaveBeenCalledTimes(1);
      expect(result).toEqual(savedUser);
    });

    it('should throw error when userData is null', async () => {
      await expect(
        createUserWithNotification(null, mockNotificationService)
      ).rejects.toThrow('Invalid user data');

      expect(database.saveUser).not.toHaveBeenCalled();
      expect(mockNotificationService.sendWelcome).not.toHaveBeenCalled();
    });

    it('should throw error when userData is undefined', async () => {
      await expect(
        createUserWithNotification(undefined, mockNotificationService)
      ).rejects.toThrow('Invalid user data');

      expect(database.saveUser).not.toHaveBeenCalled();
    });

    it('should throw error for invalid user data - missing name', async () => {
      const invalidData = { email: 'john@example.com' };

      await expect(
        createUserWithNotification(invalidData, mockNotificationService)
      ).rejects.toThrow('Invalid user data');

      expect(database.saveUser).not.toHaveBeenCalled();
      expect(mockNotificationService.sendWelcome).not.toHaveBeenCalled();
    });

    it('should throw error for invalid user data - missing email', async () => {
      const invalidData = { name: 'John' };

      await expect(
        createUserWithNotification(invalidData, mockNotificationService)
      ).rejects.toThrow('Invalid user data');

      expect(database.saveUser).not.toHaveBeenCalled();
      expect(mockNotificationService.sendWelcome).not.toHaveBeenCalled();
    });

    it('should throw error for invalid user data - missing both fields', async () => {
      const invalidData = {};

      await expect(
        createUserWithNotification(invalidData, mockNotificationService)
      ).rejects.toThrow('Invalid user data');

      expect(database.saveUser).not.toHaveBeenCalled();
    });

    it('should handle notification service failures', async () => {
      const userData = { name: 'John', email: 'john@example.com' };
      const savedUser = { id: 1, ...userData };

      database.saveUser.mockResolvedValue(savedUser);
      mockNotificationService.sendWelcome.mockRejectedValue(new Error('Notification failed'));

      await expect(
        createUserWithNotification(userData, mockNotificationService)
      ).rejects.toThrow('Notification failed');

      expect(database.saveUser).toHaveBeenCalledWith(userData);
      expect(mockNotificationService.sendWelcome).toHaveBeenCalledWith(savedUser);
    });
  });

  describe('updateUserStatus', () => {
    let mockLogger;

    beforeEach(() => {
      vi.clearAllMocks();

      mockLogger = {
        info: vi.fn(),
        error: vi.fn()
      };
    });

    it('should delete user when setting inactive', async () => {
      database.deleteUser.mockResolvedValue(true);

      const result = await updateUserStatus(1, false, mockLogger);

      expect(mockLogger.info).toHaveBeenCalledWith('Updating user 1 status to false');
      expect(mockLogger.info).toHaveBeenCalledWith('User 1 deleted');
      expect(database.deleteUser).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, active: false, deleted: true });
    });

    it('should handle delete user error', async () => {
      const error = new Error('Delete failed');
      database.deleteUser.mockRejectedValue(error);

      await expect(updateUserStatus(5, false, mockLogger)).rejects.toThrow('Delete failed');
      expect(mockLogger.info).toHaveBeenCalledWith('Updating user 5 status to false');
    });

    it('should fetch user when setting active', async () => {
      const mockUser = {
        id: 2,
        name: 'Bob',
        email: 'bob@example.com',
        active: true
      };

      database.getUserById.mockResolvedValue(mockUser);

      const result = await updateUserStatus(2, true, mockLogger);

      expect(mockLogger.info).toHaveBeenCalledWith('Updating user 2 status to true');
      expect(mockLogger.info).toHaveBeenCalledWith('User 2 status check completed');
      expect(database.deleteUser).not.toHaveBeenCalled();
      expect(database.getUserById).toHaveBeenCalledWith(2);
      expect(result).toEqual({ ...mockUser, active: true });
    });

    it('should handle fetch user error when setting active', async () => {
      const error = new Error('User fetch failed');
      database.getUserById.mockRejectedValue(error);

      await expect(updateUserStatus(2, true, mockLogger)).rejects.toThrow('User fetch failed');
      expect(mockLogger.info).toHaveBeenCalledWith('Updating user 2 status to true');
    });

    it('should handle database errors for inactive status', async () => {
      const error = new Error('Database error');
      database.deleteUser.mockRejectedValue(error);

      await expect(updateUserStatus(1, false, mockLogger)).rejects.toThrow('Database error');
      expect(mockLogger.info).toHaveBeenCalledWith('Updating user 1 status to false');
    });

    it('should verify correct log call order', async () => {
      database.deleteUser.mockResolvedValue(true);

      await updateUserStatus(3, false, mockLogger);

      const calls = mockLogger.info.mock.calls;
      expect(calls[0][0]).toBe('Updating user 3 status to false');
      expect(calls[1][0]).toBe('User 3 deleted');
    });
  });

  describe('fetchMultipleUsers', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should fetch multiple users successfully', async () => {
      const users = [
        { id: 1, name: 'Alice', email: 'alice@example.com', active: true },
        { id: 2, name: 'Bob', email: 'bob@example.com', active: true },
        { id: 3, name: 'Charlie', email: 'charlie@example.com', active: false }
      ];

      database.getUserById
        .mockResolvedValueOnce(users[0])
        .mockResolvedValueOnce(users[1])
        .mockResolvedValueOnce(users[2]);

      const result = await fetchMultipleUsers([1, 2, 3]);

      expect(database.getUserById).toHaveBeenCalledTimes(3);
      expect(database.getUserById).toHaveBeenNthCalledWith(1, 1);
      expect(database.getUserById).toHaveBeenNthCalledWith(2, 2);
      expect(database.getUserById).toHaveBeenNthCalledWith(3, 3);
      expect(result.successful).toEqual(users);
      expect(result.failed).toEqual([]);
    });

    it('should handle empty user ID array', async () => {
      const result = await fetchMultipleUsers([]);

      expect(database.getUserById).not.toHaveBeenCalled();
      expect(result.successful).toEqual([]);
      expect(result.failed).toEqual([]);
    });

    it('should handle single user fetch', async () => {
      const user = { id: 1, name: 'Alice', email: 'alice@example.com', active: true };
      database.getUserById.mockResolvedValueOnce(user);

      const result = await fetchMultipleUsers([1]);

      expect(database.getUserById).toHaveBeenCalledTimes(1);
      expect(result.successful).toEqual([user]);
      expect(result.failed).toEqual([]);
    });

    it('should handle partial failures', async () => {
      database.getUserById
        .mockResolvedValueOnce({ id: 1, name: 'Alice', email: 'alice@example.com', active: true })
        .mockRejectedValueOnce(new Error('User 2 not found'))
        .mockResolvedValueOnce({ id: 3, name: 'Charlie', email: 'charlie@example.com', active: false });

      const result = await fetchMultipleUsers([1, 2, 3]);

      expect(result.successful).toHaveLength(2);
      expect(result.successful[0].id).toBe(1);
      expect(result.successful[1].id).toBe(3);
      expect(result.failed).toEqual([2]);
    });

    it('should handle all failures', async () => {
      database.getUserById
        .mockRejectedValueOnce(new Error('User 1 not found'))
        .mockRejectedValueOnce(new Error('User 2 not found'));

      const result = await fetchMultipleUsers([1, 2]);

      expect(result.successful).toEqual([]);
      expect(result.failed).toEqual([1, 2]);
    });

    it('should preserve order of successful users', async () => {
      const users = [
        { id: 10, name: 'User 10', email: 'user10@example.com', active: true },
        { id: 20, name: 'User 20', email: 'user20@example.com', active: true },
        { id: 30, name: 'User 30', email: 'user30@example.com', active: true }
      ];

      database.getUserById
        .mockResolvedValueOnce(users[0])
        .mockResolvedValueOnce(users[1])
        .mockResolvedValueOnce(users[2]);

      const result = await fetchMultipleUsers([10, 20, 30]);

      expect(result.successful.map(u => u.id)).toEqual([10, 20, 30]);
    });

    it('should handle mixed success and failures in order', async () => {
      const successUser = { id: 1, name: 'Alice', email: 'alice@example.com', active: true };
      
      database.getUserById
        .mockResolvedValueOnce(successUser)
        .mockRejectedValueOnce(new Error('Not found'))
        .mockRejectedValueOnce(new Error('Not found'));

      const result = await fetchMultipleUsers([1, 2, 3]);

      expect(result.successful).toHaveLength(1);
      expect(result.successful[0]).toEqual(successUser);
      expect(result.failed).toEqual([2, 3]);
    });
  });

  describe('mock verification and spy techniques', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should verify mock call order', async () => {
      const mockLogger = {
        info: vi.fn(),
        error: vi.fn()
      };

      database.deleteUser.mockResolvedValue(true);

      await updateUserStatus(1, false, mockLogger);

      // Verify order of calls
      const calls = mockLogger.info.mock.calls;
      expect(calls[0][0]).toBe('Updating user 1 status to false');
      expect(calls[1][0]).toBe('User 1 deleted');
    });

    it('should track mock call arguments', async () => {
      const mockNotificationService = {
        sendWelcome: vi.fn().mockResolvedValue(true)
      };

      const userData = { name: 'Test User', email: 'test@example.com' };
      database.saveUser.mockResolvedValue({ id: 1, ...userData });

      await createUserWithNotification(userData, mockNotificationService);

      // Get the exact arguments passed to the mock
      const [callArg] = mockNotificationService.sendWelcome.mock.lastCall;
      expect(callArg).toHaveProperty('id');
      expect(callArg.name).toBe('Test User');
    });
  });
});
