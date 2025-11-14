/**
 * Mock database/external API service
 * In a real scenario, this would be an actual database or API call
 */
export const database = {
  /**
   * Fetches a user by ID from the database
   * @param {number} userId - The user ID to fetch
   * @returns {Promise<Object>} User data from database
   */
  getUserById: async (userId) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const users = {
      1: { id: 1, name: 'Alice', email: 'alice@example.com', active: true },
      2: { id: 2, name: 'Bob', email: 'bob@example.com', active: true },
      3: { id: 3, name: 'Charlie', email: 'charlie@example.com', active: false }
    };
    
    if (users[userId]) {
      return users[userId];
    }
    throw new Error(`User ${userId} not found`);
  },

  /**
   * Saves user data to the database
   * @param {Object} user - User data to save
   * @returns {Promise<Object>} Saved user with ID
   */
  saveUser: async (user) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!user.name || !user.email) {
      throw new Error('Invalid user data');
    }
    
    return { ...user, id: Math.random() * 1000 };
  },

  /**
   * Deletes a user from the database
   * @param {number} userId - The user ID to delete
   * @returns {Promise<boolean>} True if deletion was successful
   */
  deleteUser: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (userId < 1) {
      throw new Error('Invalid user ID');
    }
    
    return true;
  }
};
