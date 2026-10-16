'use client';

/**
 * Drop-in for the old next-auth hooks: the session is now the BRC-100 wallet identity.
 * user.name = $paymail handle (or short identity key), user.email = paymail if any.
 */
import { useWallet, disconnectWallet, connectWallet } from './bwallet';

export function useSession() {
  const { user } = useWallet();
  return {
    data: user ? { user: { name: user.name, email: user.paymail ?? user.name, image: undefined as string | undefined, identityKey: user.identityKey } } : null,
    status: user ? ('authenticated' as const) : ('unauthenticated' as const),
  };
}

export const signOut = () => disconnectWallet();
export const signIn = () => connectWallet();
