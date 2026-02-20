import type { User, Role } from "../payload-types";

/**
 * Check if a user is an app admin
 * App admins have appRole with slug "app-admin"
 */
export function isAppAdmin(user: User | undefined | null): boolean {
  if (!user) return false;
  
  // Check appRole
  if (user.appRole) {
    const appRole = user.appRole as Role | string;
    if (typeof appRole === "object" && appRole !== null) {
      return appRole.slug === "app-admin";
    }
  }
  
  // Fallback: Check legacy roles field for backward compatibility
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.includes("super-admin");
  }
  
  return false;
}

/**
 * Check if a user is a super admin (alias for isAppAdmin for backward compatibility)
 */
export function isSuperAdmin(user: User | undefined | null): boolean {
  return isAppAdmin(user);
}

/**
 * Check if a user has a vendor
 */
export function hasVendor(user: User | undefined | null): boolean {
  if (!user) return false;
  return Boolean(user.vendor);
}

/**
 * Check if a user belongs to a specific vendor
 */
export function belongsToVendor(user: User | undefined | null, vendorId: string): boolean {
  if (!user || !vendorId) return false;
  
  const vendor = user.vendor;
  if (!vendor) return false;
  
  if (typeof vendor === "string") {
    return vendor === vendorId;
  }
  
  return vendor.id === vendorId;
}

/**
 * Get user's vendor ID
 */
export function getVendorId(user: User | undefined | null): string | null {
  if (!user || !user.vendor) return null;
  
  if (typeof user.vendor === "string") {
    return user.vendor;
  }
  
  return user.vendor.id || null;
}

/**
 * Check if user has a specific vendor role
 */
export function hasVendorRole(user: User | undefined | null, roleSlug: string): boolean {
  if (!user || !user.vendorRole) return false;
  
  const vendorRole = user.vendorRole as Role | string;
  if (typeof vendorRole === "object" && vendorRole !== null) {
    return vendorRole.slug === roleSlug;
  }
  
  return false;
}

/**
 * Check if user has a specific app role
 */
export function hasAppRole(user: User | undefined | null, roleSlug: string): boolean {
  if (!user || !user.appRole) return false;
  
  const appRole = user.appRole as Role | string;
  if (typeof appRole === "object" && appRole !== null) {
    return appRole.slug === roleSlug;
  }
  
  return false;
}

/**
 * Check if a user is a vendor (has vendor relationship)
 */
export function isVendor(user: User | undefined | null): boolean {
  return hasVendor(user);
}

/**
 * Check if a user is the owner of a specific vendor
 * Useful for verifying vendor ownership in multi-vendor scenarios
 */
export function isVendorOwner(user: User | undefined | null, vendorId: string | null | undefined): boolean {
  if (!user || !vendorId) return false;
  return belongsToVendor(user, vendorId);
}

/**
 * Check if user has an approved and active vendor
 */
export function isApprovedVendor(user: User | undefined | null): boolean {
  if (!user || !user.vendor) return false;
  
  // If vendor is populated as object, check status and isActive
  if (typeof user.vendor === "object" && user.vendor !== null) {
    return user.vendor.status === "approved" && user.vendor.isActive === true;
  }
  
  // If vendor is just an ID string, we can't check status here
  // This would require fetching the vendor, so return false for safety
  // The caller should fetch vendor with depth if they need to check status
  return false;
}
