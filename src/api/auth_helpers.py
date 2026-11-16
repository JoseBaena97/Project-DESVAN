"""
Utilidades de autorización para los endpoints que ya llevan @jwt_required().
"""
from flask_jwt_extended import get_jwt_identity
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
