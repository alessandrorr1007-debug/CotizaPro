'use client';

import React, { useActionState } from 'react';
import { Business, Profile, MemberRole } from '@/core/domain/types';
import {
  updateBusinessSettingsAction,
  updateProfileSettingsAction,
  SettingsActionResult,
} from '@/app/(dashboard)/settings/actions';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Hash,
  Coins,
  Receipt,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

interface SettingsViewProps {
  business: Business;
  profile: Profile | null;
  role: MemberRole | null;
}

const initialResult: SettingsActionResult = {};

export function SettingsView({ business, profile, role }: SettingsViewProps) {
  const [businessState, businessFormAction, isBusinessPending] = useActionState(
    updateBusinessSettingsAction,
    initialResult
  );

  const [profileState, profileFormAction, isProfilePending] = useActionState(
    updateProfileSettingsAction,
    initialResult
  );

  const isOwnerOrAdmin = role === 'owner' || role === 'admin';

  return (
    <div className="space-y-8 pb-12">
      {/* Encabezado Principal */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Ajustes de Negocio y Cuenta
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Administra la información comercial de tu empresa, moneda, impuestos y perfil.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda / Principal (2 columnas): Formulario de Negocio */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-indigo-500" />
                    Datos Comerciales y Facturación
                  </CardTitle>
                  <CardDescription>
                    Esta información se reflejará en el encabezado de tus cotizaciones y exportaciones a PDF.
                  </CardDescription>
                </div>
                {role && (
                  <Badge variant={role === 'owner' ? 'success' : 'neutral'}>
                    {role === 'owner' ? 'Propietario' : role === 'admin' ? 'Administrador' : 'Miembro'}
                  </Badge>
                )}
              </div>
            </CardHeader>

            {/* Mensajes de Feedback */}
            {businessState?.success && businessState?.message && (
              <div className="mb-6 flex items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{businessState.message}</span>
              </div>
            )}

            {businessState?.error && (
              <div className="mb-6 flex items-center gap-3 rounded-lg bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{businessState.error}</span>
              </div>
            )}

            <form action={businessFormAction} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" required>
                    Nombre de la Empresa o Razón Social
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={business.name}
                    required
                    disabled={!isOwnerOrAdmin}
                    placeholder="Ej: Servicios Profesionales S.A.C."
                  />
                </div>

                <div>
                  <Label htmlFor="tax_id">
                    Identificación Fiscal (RUC / RFC / NIF)
                  </Label>
                  <Input
                    id="tax_id"
                    name="tax_id"
                    defaultValue={business.tax_id || ''}
                    disabled={!isOwnerOrAdmin}
                    placeholder="Ej: 20123456789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency" required>
                    Moneda Principal
                  </Label>
                  <div className="relative">
                    <select
                      id="currency"
                      name="currency"
                      defaultValue={business.currency || 'USD'}
                      disabled={!isOwnerOrAdmin}
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <option value="USD">USD ($) — Dólar Estadounidense</option>
                      <option value="PEN">PEN (S/) — Sol Peruano</option>
                      <option value="EUR">EUR (€) — Euro</option>
                      <option value="MXN">MXN ($) — Peso Mexicano</option>
                      <option value="COP">COP ($) — Peso Colombiano</option>
                      <option value="CLP">CLP ($) — Peso Chileno</option>
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Moneda por defecto aplicada en nuevas cotizaciones.
                  </p>
                </div>

                <div>
                  <Label htmlFor="default_tax_rate" required>
                    Tasa de Impuesto / IGV / IVA (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="default_tax_rate"
                      name="default_tax_rate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      defaultValue={business.default_tax_rate ?? 18.0}
                      disabled={!isOwnerOrAdmin}
                      placeholder="18.00"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Porcentaje calculado automáticamente al emitir propuestas.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      Email Comercial de Contacto
                    </span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={business.email || ''}
                    disabled={!isOwnerOrAdmin}
                    placeholder="ventas@miempresa.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      Teléfono de Contacto
                    </span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={business.phone || ''}
                    disabled={!isOwnerOrAdmin}
                    placeholder="+51 987 654 321"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Dirección Comercial
                  </span>
                </Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={business.address || ''}
                  disabled={!isOwnerOrAdmin}
                  placeholder="Av. Los Negocios 123, Oficina 401, Lima"
                />
              </div>

              {isOwnerOrAdmin ? (
                <div className="pt-2 flex justify-end">
                  <Button type="submit" isLoading={isBusinessPending}>
                    {isBusinessPending ? 'Guardando ajustes...' : 'Guardar Cambios del Negocio'}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Solo los administradores o el propietario pueden editar estos datos.
                </p>
              )}
            </form>
          </Card>
        </div>

        {/* Columna Derecha: Perfil & Resumen del Tenant */}
        <div className="space-y-6">
          {/* Perfil de Usuario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-500" />
                Tu Perfil
              </CardTitle>
              <CardDescription>Información de tu cuenta de acceso</CardDescription>
            </CardHeader>

            {profileState?.success && profileState?.message && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{profileState.message}</span>
              </div>
            )}

            {profileState?.error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{profileState.error}</span>
              </div>
            )}

            <form action={profileFormAction} className="space-y-4">
              <div>
                <Label htmlFor="fullName" required>
                  Nombre Completo
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={profile?.full_name || ''}
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div>
                <Label htmlFor="profileEmail">Correo Electrónico</Label>
                <Input
                  id="profileEmail"
                  value={profile?.email || ''}
                  disabled
                  className="bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Gestionado de forma segura con Supabase Auth.
                </p>
              </div>

              <div className="pt-1 flex justify-end">
                <Button type="submit" variant="secondary" size="sm" isLoading={isProfilePending}>
                  {isProfilePending ? 'Guardando...' : 'Actualizar Perfil'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Información del Sistema y Cotizaciones */}
          <Card className="bg-slate-50/50 dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Estado del Negocio
              </CardTitle>
            </CardHeader>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />
                  Próximo Correlativo:
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  COT-{String(business.consecutive_quote_number).padStart(4, '0')}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5" />
                  Moneda Activa:
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {business.currency}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Seguridad:</span>
                <Badge variant="success">RLS PostgreSQL Activo</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
