import { database } from './database';

/**
 * Validates user data has required fields
 * @private
 * @param {Object} userData - User data to validate
 * @throws {Error} If userData is missing required fields
 * @returns {boolean} True if valid
 */
function validateUserDataRequired(userData) {
  if (!userData || !userData.name || !userData.email) {
    throw new Error('Invalid user data');
  }
  return true;
}

/**
 * Transforms user data with computed fields
 * @private
 * @param {Object} user - Raw user data from database
 * @returns {Object} User with computed fields
 */
function transformUserWithComputedFields(user) {
  return {
    ...user,
    isActive: user.active,
    displayName: `${user.name} (${user.email})`
  };
}

/**
 * Gets user details including additional computed data
 * Uses external database dependency
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} User details with computed fields
 */
export async function getUserDetails(userId) {
  const user = await database.getUserById(userId);
  return transformUserWithComputedFields(user);
}

/**
 * Creates a new user and sends a welcome notification
 * Uses external database dependency
 * @param {Object} userData - User data { name, email }
 * @param {Function} notificationService - Service to send notifications
 * @returns {Promise<Object>} Created user data
 */
export async function createUserWithNotification(userData, notificationService) {
  // Validate input
  validateUserDataRequired(userData);

  // Save user to database
  const savedUser = await database.saveUser(userData);

  // Send welcome notification
  await notificationService.sendWelcome(savedUser);

  return savedUser;
}

/**
 * Handles deactivating a user
 * @private
 * @param {number} userId - User ID to deactivate
 * @param {Object} logger - Logger service
 * @returns {Promise<Object>} Deactivation result
 */
async function deactivateUser(userId, logger) {
  await database.deleteUser(userId);
  logger.info(`User ${userId} deleted`);
  return { id: userId, active: false, deleted: true };
}

/**
 * Handles activating a user
 * @private
 * @param {number} userId - User ID to activate
 * @param {Object} logger - Logger service
 * @returns {Promise<Object>} User data with active status
 */
async function activateUser(userId, logger) {
  const user = await database.getUserById(userId);
  logger.info(`User ${userId} status check completed`);
  return { ...user, active: true };
}

/**
 * Updates user status and logs the action
 * Uses external database dependency and logger
 * @param {number} userId - The user ID
 * @param {boolean} active - New active status
 * @param {Object} logger - Logger service
 * @returns {Promise<Object>} Updated user data
 */
export async function updateUserStatus(userId, active, logger) {
  // Log the operation start
  logger.info(`Updating user ${userId} status to ${active}`);

  // Handle status change based on active flag
  if (!active) {
    return deactivateUser(userId, logger);
  }

  return activateUser(userId, logger);
}

/**
 * Processes fetch results and separates successful and failed attempts
 * @private
 * @param {Array<PromiseSettledResult>} results - Results from Promise.allSettled
 * @param {number[]} userIds - Original user IDs requested
 * @returns {Object} Object with successful users and failed IDs
 */
function processFetchResults(results, userIds) {
  const successful = results
    .map((result) => result.status === 'fulfilled' ? result.value : null)
    .filter(Boolean);

  const failed = userIds.filter((id, index) => 
    results[index].status === 'rejected'
  );

  return { successful, failed };
}

/**
 * Batch operation: fetch multiple users
 * Uses external database dependency
 * @param {number[]} userIds - Array of user IDs
 * @returns {Promise<Object>} Object with successful and failed user fetches
 */
export async function fetchMultipleUsers(userIds) {
  const results = await Promise.allSettled(
    userIds.map(id => database.getUserById(id))
  );

  return processFetchResults(results, userIds);
}
