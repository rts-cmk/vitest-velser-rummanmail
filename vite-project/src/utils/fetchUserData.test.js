import { describe, it, expect } from 'vitest';
import { fetchUserData } from './fetchUserData';

describe('fetchUserData', () => {
  describe('successful cases', () => {
    it('should return user data for valid ID', async () => {
      const result = await fetchUserData(1);
      
      expect(result).toEqual({
        id: 1,
        name: 'User 1',
        email: 'user1@example.com',
        isActive: true
      });
    });

    it('should return different data for different valid IDs', async () => {
      const [user2, user3] = await Promise.all([
        fetchUserData(2),
        fetchUserData(3)
      ]);

      expect(user2.id).toBe(2);
      expect(user2.name).toBe('User 2');
      expect(user3.id).toBe(3);
      expect(user3.name).toBe('User 3');
    });
  });

  describe('error cases', () => {
    it('should reject with "User not found" for ID 404', async () => {
      await expect(fetchUserData(404)).rejects.toThrow('User not found');
    });

    it('should reject with "Server error" for ID 500', async () => {
      await expect(fetchUserData(500)).rejects.toThrow('Server error');
    });

    it('should reject for invalid user IDs', async () => {
      // Test various invalid inputs
      const invalidInputs = [0, -1, null, undefined];
      
      for (const invalidId of invalidInputs) {
        await expect(fetchUserData(invalidId)).rejects.toThrow('Invalid user ID');
      }
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple concurrent requests', async () => {
      const userIds = [1, 2, 3, 4, 5];
      
      const results = await Promise.all(
        userIds.map(id => fetchUserData(id))
      );

      results.forEach((user, index) => {
        expect(user.id).toBe(userIds[index]);
        expect(user.name).toBe(`User ${userIds[index]}`);
        expect(user.email).toBe(`user${userIds[index]}@example.com`);
        expect(user.isActive).toBe(true);
      });
    });

    it('should handle mix of successful and failed requests', async () => {
      const userIds = [1, 404, 2, 500, 3];
      
      const results = await Promise.allSettled(
        userIds.map(id => fetchUserData(id))
      );

      // Check successful requests
      expect(results[0].status).toBe('fulfilled');
      expect(results[2].status).toBe('fulfilled');
      expect(results[4].status).toBe('fulfilled');

      // Check failed requests
      expect(results[1].status).toBe('rejected');
      expect(results[1].reason.message).toBe('User not found');
      expect(results[3].status).toBe('rejected');
      expect(results[3].reason.message).toBe('Server error');
    });
  });
});