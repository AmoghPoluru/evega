import type { User } from "../payload-types";

/**
 * Check if a user is a super admin
 * In Payload, the first user is typically the super admin
 * You can extend this to check for a role field if you add one to your Users collection
 */
export function isSuperAdmin(user: User | undefined | null): boolean {
  if (!user) return false;
  
  // If you add a role field to Users collection, check it here
  // For now, we'll check if user exists (you can customize this logic)
  // Example: return user.role === 'superAdmin';
  
  // Default: return true for any authenticated user
  // You should customize this based on your needs
  return Boolean(user);
}
