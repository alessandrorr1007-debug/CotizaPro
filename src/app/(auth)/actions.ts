'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema, businessOnboardingSchema } from '@/lib/schemas/auth.schema';

export type AuthActionResult = {
  success?: boolean;
  error?: string;
  message?: string;
};

/**
 * Server Action: Iniciar sesión con email y contraseña
 */
export async function loginAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const parseResult = loginSchema.safeParse({ email, password });
  if (!parseResult.success) {
    return {
      error: parseResult.error.issues[0]?.message || 'Datos de inicio de sesión inválidos',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parseResult.data.email,
    password: parseResult.data.password,
  });

  if (error) {
    return {
      error:
        error.message === 'Invalid login credentials'
          ? 'Correo electrónico o contraseña incorrectos'
          : error.message,
    };
  }

  redirect('/dashboard');
}

/**
 * Server Action: Registro de nuevo usuario y alta de negocio inicial
 */
export async function registerAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    businessName: formData.get('businessName'),
    currency: formData.get('currency') || 'USD',
    defaultTaxRate: formData.get('defaultTaxRate') || 18.0,
  };

  const parseResult = registerSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      error: parseResult.error.issues[0]?.message || 'Datos de registro incompletos o inválidos',
    };
  }

  const { fullName, email, password, businessName, currency, defaultTaxRate } = parseResult.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        business_name: businessName,
        currency,
        default_tax_rate: defaultTaxRate,
      },
    },
  });

  if (error) {
    return {
      error:
        error.message.includes('User already registered')
          ? 'Ya existe una cuenta con este correo electrónico'
          : error.message,
    };
  }

  // Si requiere confirmación por email (sesión nula)
  if (data.user && !data.session) {
    return {
      success: true,
      message:
        'Registro exitoso. Se ha enviado un enlace de confirmación a tu correo electrónico para activar la cuenta.',
    };
  }

  // Si la sesión se inició automáticamente, nos aseguramos de que el negocio exista
  if (data.session && data.user) {
    const { data: member } = await supabase
      .from('business_members')
      .select('id')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (!member) {
      await supabase.rpc('create_business_for_user', {
        p_name: businessName,
        p_currency: currency,
        p_tax_rate: defaultTaxRate,
      });
    }
  }

  redirect('/dashboard');
}

/**
 * Server Action: Cerrar sesión
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

/**
 * Server Action: Onboarding / Crear negocio para usuario existente sin empresa
 */
export async function onboardBusinessAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    name: formData.get('name'),
    tax_id: formData.get('tax_id'),
    currency: formData.get('currency') || 'USD',
    default_tax_rate: formData.get('default_tax_rate') || 18.0,
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
  };

  const parseResult = businessOnboardingSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      error: parseResult.error.issues[0]?.message || 'Datos del negocio inválidos',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No se encontró una sesión activa' };
  }

  const { data: businessId, error: rpcError } = await supabase.rpc('create_business_for_user', {
    p_name: parseResult.data.name,
    p_currency: parseResult.data.currency,
    p_tax_rate: parseResult.data.default_tax_rate,
  });

  if (rpcError) {
    return { error: rpcError.message };
  }

  // Si se ingresaron datos adicionales (tax_id, teléfono, etc.), actualizarlos
  if (businessId) {
    await supabase
      .from('businesses')
      .update({
        tax_id: parseResult.data.tax_id || null,
        email: parseResult.data.email || null,
        phone: parseResult.data.phone || null,
        address: parseResult.data.address || null,
      })
      .eq('id', businessId);
  }

  redirect('/dashboard');
}
