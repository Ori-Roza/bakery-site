/**
 * Supabase Client Factory
 * Manages Supabase client lifecycle and initialization
 */

export type SupabaseClient = any; // Will be typed when Supabase is imported

interface SupabaseConfig {
  url?: string;
  anonKey?: string;
}

/**
 * Get injected Supabase client (for testing)
 */
export const getInjectedSupabaseClient = (): SupabaseClient | null => {
  if (typeof window === "undefined") return null;
  if ((window as any).__SUPABASE_CLIENT__) return (window as any).__SUPABASE_CLIENT__;
  if ((window as any).__SUPABASE_FACTORY__) {
    const config: SupabaseConfig =
      typeof window !== "undefined" && (window as any).__SUPABASE__
        ? (window as any).__SUPABASE__
        : {};
    return (window as any).__SUPABASE_FACTORY__(config);
  }
  return null;
};

/**
 * Create Supabase client
 * First checks for injected client (tests), then creates from config
 */
export const createSupabaseClient = async (): Promise<SupabaseClient | null> => {
  const injected = getInjectedSupabaseClient();
  if (injected) return injected;

  const config: SupabaseConfig =
    typeof window !== "undefined" && (window as any).__SUPABASE__
      ? (window as any).__SUPABASE__
      : {};

  if (!config.url || !config.anonKey) {
    return null;
  }

  // CDN import without type declarations
  const { createClient } = await 
    // @ts-expect-error - Module import from CDN URL has no type declarations
    import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");

  return createClient(config.url, config.anonKey);
};

/**
 * Singleton client instance
 */
let clientInstance: SupabaseClient | null = null;

/**
 * Get or create Supabase client singleton
 */
export const getSupabaseClient = async (): Promise<SupabaseClient | null> => {
  if (!clientInstance) {
    clientInstance = await createSupabaseClient();
  }
  return clientInstance;
};

/**
 * Reset client instance (for testing)
 */
export const resetSupabaseClient = (): void => {
  clientInstance = null;
};
