"""
Permisos de la base de datos (capa 1 de seguridad).

Deja la base de datos con el mínimo de permisos necesario:

- anon / authenticated (roles de la API pública de Supabase): sin acceso a nada.
  El Desván no usa esa API; todo pasa por Flask.
- APP_DB_ROLE (por defecto "desvan_app"): el usuario con el que se conecta Flask.
  Puede leer y escribir filas, pero no crear, modificar ni borrar tablas.
- El usuario de MIGRATIONS_DATABASE_URL (en Supabase, "postgres"): dueño de las
  tablas. Solo se usa para migraciones y para ejecutar este script.

Además activa RLS en todas las tablas, con una única política que deja pasar
al usuario de la app. Si alguna vez se vuelve a abrir la API de Supabase,
anon y authenticated seguirían sin ver ninguna fila.

Es idempotente: se ejecuta después de cada `flask db upgrade` para que las
tablas nuevas queden protegidas igual que las existentes.
"""
import os
import re

from sqlalchemy import create_engine, text

API_ROLES = ("anon", "authenticated")
POLICY_NAME = "app_full_access"
# tablas internas a las que la app no necesita acceder
INTERNAL_TABLES = {"alembic_version"}

_IDENTIFIER = re.compile(r"^[a-z_][a-z0-9_]*$")


def admin_database_url():
    """URL con permisos de dueño: la de migraciones o, si no hay, la normal."""
    url = os.getenv("MIGRATIONS_DATABASE_URL") or os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError(
            "Falta MIGRATIONS_DATABASE_URL (o DATABASE_URL) en el entorno")
    return url.replace("postgres://", "postgresql://", 1)


def _ident(name):
    """Valida un nombre de tabla o rol antes de meterlo en el SQL."""
    if not _IDENTIFIER.match(name):
        raise ValueError(f"Nombre no válido: {name!r}")
    return f'"{name}"'


def _role_exists(conn, role):
    return conn.execute(
        text("select 1 from pg_roles where rolname = :r"), {"r": role}
    ).scalar() is not None


def secure_database(app_role="desvan_app", app_password=None, log=print):
    """Aplica todos los permisos. Devuelve la lista de tablas protegidas."""
    engine = create_engine(admin_database_url())
    with engine.begin() as conn:
        tables = conn.execute(text(
            "select tablename from pg_tables "
            "where schemaname = 'public' order by tablename"
        )).scalars().all()
        app_tables = [t for t in tables if t not in INTERNAL_TABLES]

        # 1. Cerrar la API pública de Supabase
        api_roles = [r for r in API_ROLES if _role_exists(conn, r)]
        if api_roles:
            roles = ", ".join(_ident(r) for r in api_roles)
            for kind in ("TABLES", "SEQUENCES", "FUNCTIONS"):
                conn.execute(text(
                    f"REVOKE ALL ON ALL {kind} IN SCHEMA public FROM {roles}"))
                conn.execute(text(
                    f"ALTER DEFAULT PRIVILEGES IN SCHEMA public "
                    f"REVOKE ALL ON {kind} FROM {roles}"))
            conn.execute(text(f"REVOKE ALL ON SCHEMA public FROM {roles}"))
            log(f"API pública cerrada para: {', '.join(api_roles)}")
        else:
            log("No hay roles de la API de Supabase (base de datos local)")

        # 2. RLS en todas las tablas
        for table in tables:
            conn.execute(text(
                f"ALTER TABLE public.{_ident(table)} ENABLE ROW LEVEL SECURITY"))
        log(f"RLS activado en {len(tables)} tablas")

        # 3. Usuario de la app con permisos mínimos
        if not _role_exists(conn, app_role):
            if not app_password:
                log(f"AVISO: el rol {app_role} no existe y no se ha dado "
                    "APP_DB_PASSWORD; se omiten sus permisos")
                return tables
            if not re.fullmatch(r"[A-Za-z0-9]{16,}", app_password):
                raise ValueError(
                    "APP_DB_PASSWORD debe tener al menos 16 caracteres, "
                    "solo letras y números")
            conn.execute(text(
                f"CREATE ROLE {_ident(app_role)} LOGIN NOINHERIT "
                f"PASSWORD '{app_password}'"))
            log(f"Rol {app_role} creado")

        role = _ident(app_role)
        conn.execute(text(f"REVOKE CREATE ON SCHEMA public FROM {role}"))
        conn.execute(text(f"GRANT USAGE ON SCHEMA public TO {role}"))
        for table in app_tables:
            t = f"public.{_ident(table)}"
            conn.execute(text(
                f"GRANT SELECT, INSERT, UPDATE, DELETE ON {t} TO {role}"))
            conn.execute(text(f"DROP POLICY IF EXISTS {POLICY_NAME} ON {t}"))
            conn.execute(text(
                f"CREATE POLICY {POLICY_NAME} ON {t} FOR ALL TO {role} "
                f"USING (true) WITH CHECK (true)"))
        conn.execute(text(
            f"GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO {role}"))
        log(f"Permisos de {app_role} aplicados en {len(app_tables)} tablas")

    return tables
