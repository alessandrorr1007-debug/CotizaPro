-- ============================================================================
-- COTIZAPRO - MIGRACIÓN INICIAL: ESQUEMA DE BASE DE DATOS Y RLS
-- ============================================================================

-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. TABLA: profiles (Perfil de usuario asociado a auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 2. TABLA: businesses (Empresa / Tenant comercial)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    tax_id TEXT, -- RUC, RFC, NIF, CIF, etc.
    email TEXT,
    phone TEXT,
    address TEXT,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    default_tax_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00 CHECK (default_tax_rate >= 0 AND default_tax_rate <= 100),
    logo_url TEXT,
    consecutive_quote_number INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3. TABLA: business_members (Membresía y roles por empresa)
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE public.member_role AS ENUM ('owner', 'admin', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.business_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.member_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_business_user UNIQUE (business_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_business_members_user ON public.business_members(user_id);
CREATE INDEX IF NOT EXISTS idx_business_members_business ON public.business_members(business_id);

-- Función de seguridad de alto rendimiento para RLS
CREATE OR REPLACE FUNCTION public.is_business_member(_business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.business_members
        WHERE business_id = _business_id
          AND user_id = auth.uid()
    );
$$;

-- ----------------------------------------------------------------------------
-- 4. TABLA: clients (Directorio de clientes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tax_id TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_clients_business ON public.clients(business_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(business_id, name);

-- ----------------------------------------------------------------------------
-- 5. TABLA: products (Catálogo de bienes y servicios)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT,
    description TEXT,
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    unit TEXT NOT NULL DEFAULT 'unidad',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_business ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(business_id, sku);

-- ----------------------------------------------------------------------------
-- 6. TABLA: quotes (Cabecera de cotizaciones)
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE public.quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    quote_number TEXT NOT NULL,
    status public.quote_status NOT NULL DEFAULT 'draft',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00 CHECK (tax_rate >= 0 AND tax_rate <= 100),
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    total NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    notes TEXT,
    terms TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_business_quote_number UNIQUE (business_id, quote_number)
);

CREATE INDEX IF NOT EXISTS idx_quotes_business ON public.quotes(business_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client ON public.quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(business_id, status);
CREATE INDEX IF NOT EXISTS idx_quotes_issue_date ON public.quotes(business_id, issue_date DESC);

-- ----------------------------------------------------------------------------
-- 7. TABLA: quote_items (Líneas de detalle de cotización)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    discount_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (discount_rate >= 0 AND discount_rate <= 100),
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON public.quote_items(quote_id);

-- ----------------------------------------------------------------------------
-- 8. TABLA: quote_activities (Historial y trazabilidad de eventos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quote_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_quote_activities_quote ON public.quote_activities(quote_id);

-- ----------------------------------------------------------------------------
-- 9. POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_activities ENABLE ROW LEVEL SECURITY;

-- 9.1 Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 9.2 Businesses
DROP POLICY IF EXISTS "Members can view their business" ON public.businesses;
CREATE POLICY "Members can view their business"
    ON public.businesses FOR SELECT
    USING (public.is_business_member(id));

DROP POLICY IF EXISTS "Authenticated users can create a business" ON public.businesses;
CREATE POLICY "Authenticated users can create a business"
    ON public.businesses FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Owners and admins can update their business" ON public.businesses;
CREATE POLICY "Owners and admins can update their business"
    ON public.businesses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.business_members
            WHERE business_id = businesses.id
              AND user_id = auth.uid()
              AND role IN ('owner', 'admin')
        )
    );

-- 9.3 Business Members
DROP POLICY IF EXISTS "Members can view membership within their business" ON public.business_members;
CREATE POLICY "Members can view membership within their business"
    ON public.business_members FOR SELECT
    USING (public.is_business_member(business_id));

DROP POLICY IF EXISTS "Authenticated users can create business membership" ON public.business_members;
CREATE POLICY "Authenticated users can create business membership"
    ON public.business_members FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.is_business_member(business_id));

-- Función RPC para creación atómica de negocio y asignación de owner
CREATE OR REPLACE FUNCTION public.create_business_for_user(
    p_name TEXT,
    p_currency TEXT DEFAULT 'USD',
    p_tax_rate NUMERIC DEFAULT 18.00
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_business_id UUID;
    v_user_id UUID := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;

    IF trim(p_name) = '' THEN
        RAISE EXCEPTION 'El nombre del negocio no puede estar vacío';
    END IF;

    INSERT INTO public.businesses (name, currency, default_tax_rate)
    VALUES (trim(p_name), coalesce(p_currency, 'USD'), coalesce(p_tax_rate, 18.00))
    RETURNING id INTO v_business_id;

    INSERT INTO public.business_members (business_id, user_id, role)
    VALUES (v_business_id, v_user_id, 'owner');

    RETURN v_business_id;
END;
$$;

-- 9.4 Clients
DROP POLICY IF EXISTS "Members can view clients" ON public.clients;
CREATE POLICY "Members can view clients"
    ON public.clients FOR SELECT
    USING (public.is_business_member(business_id));

DROP POLICY IF EXISTS "Members can insert clients" ON public.clients;
CREATE POLICY "Members can insert clients"
    ON public.clients FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

DROP POLICY IF EXISTS "Members can update clients" ON public.clients;
CREATE POLICY "Members can update clients"
    ON public.clients FOR UPDATE
    USING (public.is_business_member(business_id));

DROP POLICY IF EXISTS "Members can delete clients" ON public.clients;
CREATE POLICY "Members can delete clients"
    ON public.clients FOR DELETE
    USING (public.is_business_member(business_id));

-- 9.5 Products
DROP POLICY IF EXISTS "Members can view products" ON public.products;
CREATE POLICY "Members can view products"
    ON public.products FOR SELECT
    USING (public.is_business_member(business_id));

DROP POLICY IF EXISTS "Members can insert products" ON public.products;
CREATE POLICY "Members can insert products"
    ON public.products FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

DROP POLICY IF EXISTS "Members can update products" ON public.products;
CREATE POLICY "Members can update products"
    ON public.products FOR UPDATE
    USING (public.is_business_member(business_id));

DROP POLICY IF EXISTS "Members can delete products" ON public.products;
CREATE POLICY "Members can delete products"
    ON public.products FOR DELETE
    USING (public.is_business_member(business_id));

-- 9.6 Quotes
DROP POLICY IF EXISTS "Members can view quotes" ON public.quotes;
CREATE POLICY "Members can view quotes"
    ON public.quotes FOR SELECT
    USING (public.is_business_member(business_id));

DROP POLICY IF EXISTS "Members can insert quotes" ON public.quotes;
CREATE POLICY "Members can insert quotes"
    ON public.quotes FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

DROP POLICY IF EXISTS "Members can update quotes" ON public.quotes;
CREATE POLICY "Members can update quotes"
    ON public.quotes FOR UPDATE
    USING (public.is_business_member(business_id));

DROP POLICY IF EXISTS "Members can delete quotes" ON public.quotes;
CREATE POLICY "Members can delete quotes"
    ON public.quotes FOR DELETE
    USING (public.is_business_member(business_id));

-- 9.7 Quote Items
DROP POLICY IF EXISTS "Members can view quote items" ON public.quote_items;
CREATE POLICY "Members can view quote items"
    ON public.quote_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quotes
            WHERE quotes.id = quote_items.quote_id
              AND public.is_business_member(quotes.business_id)
        )
    );

DROP POLICY IF EXISTS "Members can insert quote items" ON public.quote_items;
CREATE POLICY "Members can insert quote items"
    ON public.quote_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quotes
            WHERE quotes.id = quote_items.quote_id
              AND public.is_business_member(quotes.business_id)
        )
    );

DROP POLICY IF EXISTS "Members can update quote items" ON public.quote_items;
CREATE POLICY "Members can update quote items"
    ON public.quote_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.quotes
            WHERE quotes.id = quote_items.quote_id
              AND public.is_business_member(quotes.business_id)
        )
    );

DROP POLICY IF EXISTS "Members can delete quote items" ON public.quote_items;
CREATE POLICY "Members can delete quote items"
    ON public.quote_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.quotes
            WHERE quotes.id = quote_items.quote_id
              AND public.is_business_member(quotes.business_id)
        )
    );

-- 9.8 Quote Activities
DROP POLICY IF EXISTS "Members can view quote activities" ON public.quote_activities;
CREATE POLICY "Members can view quote activities"
    ON public.quote_activities FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quotes
            WHERE quotes.id = quote_activities.quote_id
              AND public.is_business_member(quotes.business_id)
        )
    );

DROP POLICY IF EXISTS "Members can insert quote activities" ON public.quote_activities;
CREATE POLICY "Members can insert quote activities"
    ON public.quote_activities FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quotes
            WHERE quotes.id = quote_activities.quote_id
              AND public.is_business_member(quotes.business_id)
        )
    );

-- ----------------------------------------------------------------------------
-- 10. TRIGGERS Y FUNCIONES AUTOMATIZADAS
-- ----------------------------------------------------------------------------

-- Trigger para nuevo usuario desde Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_business_id UUID;
    v_business_name TEXT;
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        coalesce(new.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);

    -- Si se incluyó un nombre de empresa en los metadatos de registro, aprovisionar negocio inicial
    v_business_name := coalesce(trim(new.raw_user_meta_data->>'business_name'), '');
    IF v_business_name <> '' THEN
        INSERT INTO public.businesses (name, currency, default_tax_rate)
        VALUES (
            v_business_name,
            coalesce(new.raw_user_meta_data->>'currency', 'USD'),
            coalesce((new.raw_user_meta_data->>'default_tax_rate')::numeric, 18.00)
        )
        RETURNING id INTO v_business_id;

        INSERT INTO public.business_members (business_id, user_id, role)
        VALUES (v_business_id, new.id, 'owner');
    END IF;

    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    new.updated_at = timezone('utc'::text, now());
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_businesses_updated_at ON public.businesses;
CREATE TRIGGER trg_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_clients_updated_at ON public.clients;
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_quotes_updated_at ON public.quotes;
CREATE TRIGGER trg_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
