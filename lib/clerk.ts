import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * Získá aktuálního přihlášeného uživatele v API route
 * @returns User objekt nebo null pokud uživatel není přihlášen
 */
export async function getCurrentUser() {
  try {
    const user = await currentUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Získá ID aktuálního přihlášeného uživatele
 * @returns User ID nebo null pokud uživatel není přihlášen
 */
export async function getCurrentUserId() {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * Ověří, zda je uživatel přihlášen
 * @returns true pokud je uživatel přihlášen, jinak false
 */
export async function isAuthenticated() {
  try {
    const { userId } = await auth();
    return !!userId;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Získá auth objekt pro přístup k session informacím
 * @returns Auth objekt s userId a sessionId
 */
export async function getAuth() {
  try {
    return await auth();
  } catch (error) {
    console.error('Error getting auth:', error);
    return { userId: null, sessionId: null };
  }
}
