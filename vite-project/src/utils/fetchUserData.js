/**
 * Simulates fetching user data from an API
 * @param {number} userId - The ID of the user to fetch
 * @returns {Promise<Object>} - Promise that resolves with user data or rejects with an error
 */
export async function fetchUserData(userId) {
  // Validate input
  if (typeof userId !== 'number' || userId < 1) {
    return Promise.reject(new Error('Invalid user ID'));
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Simulate different scenarios based on userId
  if (userId === 404) {
    return Promise.reject(new Error('User not found'));
  }

  if (userId === 500) {
    return Promise.reject(new Error('Server error'));
  }

  // Return mock user data for valid IDs
  return Promise.resolve({
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    isActive: true
  });
}