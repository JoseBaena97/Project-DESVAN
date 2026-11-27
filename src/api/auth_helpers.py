"""
Utilidades de autorización.

- @login_required: exige token válido y una cuenta activa (no suspendida ni
  desactivada). El usuario queda disponible con current_user().
- @admin_required: igual, y además exige is_admin.
- is_owner_or_admin: para comprobar acceso a datos de un usuario concreto.
"""
from functools import wraps
from flask import g, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from api.models import db, User


def get_current_user():
    """Usuario del token. None si no existe o su cuenta está desactivada."""
    try:
        user_id = int(get_jwt_identity())
    except (TypeError, ValueError):
        return None
    user = db.session.get(User, user_id)
    if not user or user.deleted_at:
        return None
    return user


def is_owner_or_admin(requester, user_id):
    """True si quien pide es el dueño de los datos (user_id) o un admin."""
    return requester is not None and (requester.id == user_id or requester.is_admin)


def current_user():
    """Usuario de la petición actual. Solo dentro de @login_required / @admin_required."""
    return g.current_user


def login_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"success": False, "msg": "Unauthorized"}), 401
        g.current_user = user
        return fn(*args, **kwargs)
    return wrapper


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"success": False, "msg": "Unauthorized"}), 401
        if not user.is_admin:
            return jsonify({"success": False, "msg": "Admin access required"}), 403
        g.current_user = user
        return fn(*args, **kwargs)
    return wrapper
