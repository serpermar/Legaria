-- ============================================================
-- RLS — Legaria
-- Ver docs/adr/0007-neon-better-auth-storage.md
--
-- Estas políticas son defensa en profundidad para acceso directo a la base
-- de datos (Neon Data API o cualquier cliente PostgREST). La API de Legaria
-- usa Prisma con un rol privilegiado y aplica el filtrado de tenant en
-- aplicación (ADR 0006), por lo que RLS no sustituye ese filtrado.
--
-- Neon Data API expone el JWT en `request.jwt.claims`; el claim `sub` es el
-- ID de Better Auth. `app.domain_user_id()` lo traduce al ID del usuario de
-- dominio (`public.users.auth_user_id`).
-- ============================================================

CREATE SCHEMA IF NOT EXISTS app;

-- Helpers
CREATE OR REPLACE FUNCTION app.auth_user_id() RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub';
$$;

CREATE OR REPLACE FUNCTION app.domain_user_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, app AS $$
  SELECT id FROM public.users WHERE auth_user_id = app.auth_user_id() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION app.user_org_ids() RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, app AS $$
  SELECT organization_id FROM public.organization_members
  WHERE user_id = app.domain_user_id() AND status = 'ACTIVE';
$$;

CREATE OR REPLACE FUNCTION app.user_org_role(org uuid) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, app AS $$
  SELECT role::text FROM public.organization_members
  WHERE user_id = app.domain_user_id()
    AND organization_id = org
    AND status = 'ACTIVE'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION app.user_family_group_ids() RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, app AS $$
  SELECT family_group_id FROM public.family_members
  WHERE user_id = app.domain_user_id() AND is_active = true;
$$;

CREATE OR REPLACE FUNCTION app.is_super_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, app AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = app.domain_user_id() AND platform_role = 'SUPER_ADMIN'
  );
$$;

-- ============================================================
-- POLÍTICAS POR TABLA RAÍZ
-- ============================================================

-- users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_self_select ON users FOR SELECT USING (id = app.domain_user_id());
CREATE POLICY users_self_update ON users FOR UPDATE USING (id = app.domain_user_id());
CREATE POLICY users_super_admin_all ON users FOR ALL USING (app.is_super_admin());

-- organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY organizations_member_select ON organizations
  FOR SELECT USING (id IN (SELECT app.user_org_ids()));
CREATE POLICY organizations_admin_update ON organizations
  FOR UPDATE USING (app.user_org_role(id) = 'FUNERAL_ADMIN');
CREATE POLICY organizations_super_admin_all ON organizations
  FOR ALL USING (app.is_super_admin());

-- organization_members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_members_member_select ON organization_members
  FOR SELECT USING (organization_id IN (SELECT app.user_org_ids()));
CREATE POLICY org_members_admin_all ON organization_members
  FOR ALL USING (app.user_org_role(organization_id) = 'FUNERAL_ADMIN');
CREATE POLICY org_members_super_admin_all ON organization_members
  FOR ALL USING (app.is_super_admin());

-- cases
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY cases_org_member_select ON cases
  FOR SELECT USING (organization_id IN (SELECT app.user_org_ids()));
CREATE POLICY cases_org_member_write ON cases
  FOR ALL USING (
    app.user_org_role(organization_id) IN ('FUNERAL_ADMIN', 'FUNERAL_EMPLOYEE')
  );
CREATE POLICY cases_family_select ON cases
  FOR SELECT USING (
    id IN (
      SELECT fg.case_id FROM family_groups fg
      WHERE fg.id IN (SELECT app.user_family_group_ids())
    )
  );
CREATE POLICY cases_super_admin_all ON cases
  FOR ALL USING (app.is_super_admin());

-- family_groups
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY family_groups_org_select ON family_groups
  FOR SELECT USING (organization_id IN (SELECT app.user_org_ids()));
CREATE POLICY family_groups_org_write ON family_groups
  FOR ALL USING (
    app.user_org_role(organization_id) IN ('FUNERAL_ADMIN', 'FUNERAL_EMPLOYEE')
  );
CREATE POLICY family_groups_family_all ON family_groups
  FOR ALL USING (id IN (SELECT app.user_family_group_ids()));
CREATE POLICY family_groups_super_admin_all ON family_groups
  FOR ALL USING (app.is_super_admin());

-- family_members
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY family_members_self_select ON family_members
  FOR SELECT USING (user_id = app.domain_user_id());
CREATE POLICY family_members_group_select ON family_members
  FOR SELECT USING (family_group_id IN (SELECT app.user_family_group_ids()));
CREATE POLICY family_members_admin_all ON family_members
  FOR ALL USING (
    family_group_id IN (
      SELECT fm.family_group_id FROM family_members fm
      WHERE fm.user_id = app.domain_user_id()
        AND fm.role = 'FAMILY_ADMIN'
        AND fm.is_active = true
    )
  );
CREATE POLICY family_members_org_select ON family_members
  FOR SELECT USING (
    family_group_id IN (
      SELECT fg.id FROM family_groups fg
      WHERE fg.organization_id IN (SELECT app.user_org_ids())
    )
  );
CREATE POLICY family_members_super_admin_all ON family_members
  FOR ALL USING (app.is_super_admin());

-- invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY invitations_org_select ON invitations
  FOR SELECT USING (organization_id IN (SELECT app.user_org_ids()));
CREATE POLICY invitations_org_write ON invitations
  FOR ALL USING (
    app.user_org_role(organization_id) IN ('FUNERAL_ADMIN', 'FUNERAL_EMPLOYEE')
  );
CREATE POLICY invitations_family_admin_write ON invitations
  FOR ALL USING (
    family_group_id IN (
      SELECT fm.family_group_id FROM family_members fm
      WHERE fm.user_id = app.domain_user_id()
        AND fm.role = 'FAMILY_ADMIN'
        AND fm.is_active = true
    )
  );
CREATE POLICY invitations_redeem_select ON invitations
  FOR SELECT USING (email = (SELECT email FROM users WHERE id = app.domain_user_id()));
CREATE POLICY invitations_super_admin_all ON invitations
  FOR ALL USING (app.is_super_admin());

-- memorials (privado + público)
ALTER TABLE memorials ENABLE ROW LEVEL SECURITY;
CREATE POLICY memorials_org_select ON memorials
  FOR SELECT USING (organization_id IN (SELECT app.user_org_ids()));
CREATE POLICY memorials_org_write ON memorials
  FOR ALL USING (
    app.user_org_role(organization_id) IN ('FUNERAL_ADMIN', 'FUNERAL_EMPLOYEE')
  );
CREATE POLICY memorials_family_all ON memorials
  FOR ALL USING (
    case_id IN (
      SELECT fg.case_id FROM family_groups fg
      WHERE fg.id IN (SELECT app.user_family_group_ids())
    )
  );
CREATE POLICY memorials_public_select ON memorials
  FOR SELECT TO anonymous
  USING (privacy = 'PUBLIC' AND status = 'PUBLISHED' AND deleted_at IS NULL);
CREATE POLICY memorials_super_admin_all ON memorials
  FOR ALL USING (app.is_super_admin());

-- memorial_media
ALTER TABLE memorial_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY media_memorial_access ON memorial_media
  FOR ALL USING (
    memorial_id IN (
      SELECT id FROM memorials
      WHERE organization_id IN (SELECT app.user_org_ids())
         OR case_id IN (
              SELECT fg.case_id FROM family_groups fg
              WHERE fg.id IN (SELECT app.user_family_group_ids())
            )
    )
  );
CREATE POLICY media_public_select ON memorial_media
  FOR SELECT TO anonymous
  USING (
    is_public = true
    AND memorial_id IN (
      SELECT id FROM memorials WHERE privacy = 'PUBLIC' AND status = 'PUBLISHED'
    )
  );
CREATE POLICY media_super_admin_all ON memorial_media
  FOR ALL USING (app.is_super_admin());

-- condolences
ALTER TABLE condolences ENABLE ROW LEVEL SECURITY;
CREATE POLICY condolences_memorial_admin ON condolences
  FOR ALL USING (
    memorial_id IN (
      SELECT id FROM memorials
      WHERE organization_id IN (SELECT app.user_org_ids())
         OR case_id IN (
              SELECT fg.case_id FROM family_groups fg
              WHERE fg.id IN (SELECT app.user_family_group_ids())
            )
    )
  );
CREATE POLICY condolences_public_insert ON condolences
  FOR INSERT TO anonymous
  WITH CHECK (
    memorial_id IN (
      SELECT id FROM memorials WHERE privacy = 'PUBLIC' AND status = 'PUBLISHED'
    )
  );
CREATE POLICY condolences_public_select ON condolences
  FOR SELECT TO anonymous
  USING (
    status = 'APPROVED'
    AND deleted_at IS NULL
    AND memorial_id IN (
      SELECT id FROM memorials WHERE privacy = 'PUBLIC' AND status = 'PUBLISHED'
    )
  );
CREATE POLICY condolences_super_admin_all ON condolences
  FOR ALL USING (app.is_super_admin());

-- memories
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY memories_memorial_admin ON memories
  FOR ALL USING (
    memorial_id IN (
      SELECT id FROM memorials
      WHERE organization_id IN (SELECT app.user_org_ids())
         OR case_id IN (
              SELECT fg.case_id FROM family_groups fg
              WHERE fg.id IN (SELECT app.user_family_group_ids())
            )
    )
  );
CREATE POLICY memories_super_admin_all ON memories
  FOR ALL USING (app.is_super_admin());

-- ai_generations
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_gen_self_select ON ai_generations
  FOR SELECT USING (user_id = app.domain_user_id());
CREATE POLICY ai_gen_org_select ON ai_generations
  FOR SELECT USING (organization_id IN (SELECT app.user_org_ids()));
CREATE POLICY ai_gen_family_write ON ai_generations
  FOR ALL USING (
    case_id IN (
      SELECT fg.case_id FROM family_groups fg
      WHERE fg.id IN (SELECT app.user_family_group_ids())
    )
  );
CREATE POLICY ai_gen_super_admin_all ON ai_generations
  FOR ALL USING (app.is_super_admin());

-- audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_org_admin_select ON audit_logs
  FOR SELECT USING (
    organization_id IS NOT NULL
    AND app.user_org_role(organization_id) = 'FUNERAL_ADMIN'
  );
CREATE POLICY audit_self_select ON audit_logs
  FOR SELECT USING (actor_id = app.domain_user_id());
CREATE POLICY audit_super_admin_all ON audit_logs
  FOR ALL USING (app.is_super_admin());

-- subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subs_org_admin_select ON subscriptions
  FOR SELECT USING (app.user_org_role(organization_id) = 'FUNERAL_ADMIN');
CREATE POLICY subs_super_admin_all ON subscriptions
  FOR ALL USING (app.is_super_admin());

-- rooms
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY rooms_org_select ON rooms
  FOR SELECT USING (organization_id IN (SELECT app.user_org_ids()));
CREATE POLICY rooms_org_write ON rooms
  FOR ALL USING (
    app.user_org_role(organization_id) IN ('FUNERAL_ADMIN', 'FUNERAL_EMPLOYEE')
  );
CREATE POLICY rooms_super_admin_all ON rooms
  FOR ALL USING (app.is_super_admin());