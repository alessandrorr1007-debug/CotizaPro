import { createClient } from '@/lib/supabase/server';
import { Business, MemberRole, Profile } from '@/core/domain/types';

export interface CurrentUserSession {
  user: {
    id: string;
    email: string;
  };
  profile: Profile | null;
  business: Business | null;
  role: MemberRole | null;
}

/**
 * Obtiene el usuario autenticado, su perfil y el negocio activo en el servidor.
 */
export async function getCurrentUserSession(): Promise<CurrentUserSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // 1. Obtener perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // 2. Obtener negocio y membresía
  const { data: membership } = await supabase
    .from('business_members')
    .select(`
      role,
      businesses (*)
    `)
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  const business = (membership?.businesses as unknown as Business) || null;
  const role = (membership?.role as MemberRole) || null;

  return {
    user: {
      id: user.id,
      email: user.email || '',
    },
    profile: profile || null,
    business,
    role,
  };
}
