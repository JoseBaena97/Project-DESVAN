"""
Borrado definitivo de cuenta (requisito de Google Play).

- DELETE /users/me      → app móvil y web con sesión (JWT + contraseña)
- POST   /account/delete → página pública /eliminar-cuenta (email + contraseña),
                           funciona aunque la cuenta esté desactivada

Se borran los datos personales y el contenido del usuario. La fila de `users`
se conserva anonimizada porque los reportes de moderación la referencian.
"""
import secrets
from datetime import datetime, timezone
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from api.routes import api
from api.models import (db, User, Notification, NotificationType,
                        EventStatus, ReservationStatus)
from api.custom_routes.review import _recalculate_user_rating

ERASED_EMAIL_DOMAIN = "deleted.invalid"


def is_erased(user):
    return user.email.endswith("@" + ERASED_EMAIL_DOMAIN)


def _is_upcoming(event, now):
    when = event.end_date or event.start_date
    if when is None:
        return True
    if when.tzinfo is None:
        when = when.replace(tzinfo=timezone.utc)
    return when >= now


def erase_user_account(user):
    """Borra el contenido del usuario y anonimiza su fila. No hace commit."""
    now = datetime.now(timezone.utc)

    # 1. Eventos propios: avisar a quien tenía reserva en eventos futuros
    #    y desvincular notificaciones de otros usuarios antes de borrarlos.
    for event in list(user.events):
        if event.status == EventStatus.active and _is_upcoming(event, now):
            for res in event.reservations:
                if res.status == ReservationStatus.confirmed and res.user_id != user.id:
                    db.session.add(Notification(
                        user_id=res.user_id,
                        type=NotificationType.event_cancelled,
                        message=f"El evento '{event.title}' al que tenías una reserva "
                                "ha sido cancelado porque el organizador ha eliminado su cuenta.",
                    ))
        db.session.execute(
            db.update(Notification)
            .where(Notification.related_event_id == event.id)
            .values(related_event_id=None)
        )
        db.session.delete(event)

    # 2. Valoraciones escritas y recibidas
    reviewed_users = {r.reviewed for r in user.my_written_reviews
                      if r.reviewed and r.reviewed.id != user.id}
    for review in list(user.my_written_reviews) + list(user.my_received_reviews):
        db.session.delete(review)

    # 3. Reservas, favoritos, notificaciones y perfil
    for item in list(user.reservations) + list(user.favorites) + list(user.notifications):
        db.session.delete(item)
    if user.profile:
        db.session.delete(user.profile)

    db.session.flush()

    # La media de los vendedores valorados cambia al borrar sus reseñas
    for reviewed in reviewed_users:
        db.session.expire(reviewed, ["my_received_reviews"])
        _recalculate_user_rating(reviewed)

    # 4. Anonimizar la fila del usuario
    user.email = f"deleted-{user.id}@{ERASED_EMAIL_DOMAIN}"
    user.username = f"usuario-eliminado-{user.id}"
    user.password = generate_password_hash(secrets.token_urlsafe(32))
    user.bio = None
    user.profile_picture_url = None
    user.is_verified = False
    user.is_admin = False
    user.user_rating = None
    user.reset_token = None
    user.reset_token_expires = None
    user.deleted_at = now


@api.route("/users/me", methods=["DELETE"])
@jwt_required()
def delete_my_account():
    user = db.session.get(User, get_jwt_identity())
    if not user or is_erased(user):
        return jsonify({"msg": "User not found"}), 404

    body = request.get_json(silent=True) or {}
    password = body.get("password")
    if not password:
        return jsonify({"msg": "Debes confirmar tu contraseña"}), 400
    if not check_password_hash(user.password, password):
        return jsonify({"msg": "Contraseña incorrecta"}), 401

    erase_user_account(user)
    db.session.commit()
    return jsonify({"msg": "Cuenta eliminada definitivamente"}), 200


@api.route("/account/delete", methods=["POST"])
def delete_account_with_credentials():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip()
    password = body.get("password")
    if not email or not password:
        return jsonify({"msg": "Email y contraseña son obligatorios"}), 400

    user = db.session.execute(
        db.select(User).where(User.email == email)
    ).scalar_one_or_none()
    # mismo mensaje si no existe o la contraseña falla: no revelar qué emails hay
    if not user or not check_password_hash(user.password, password):
        return jsonify({"msg": "Email o contraseña incorrectos"}), 401

    erase_user_account(user)
    db.session.commit()
    return jsonify({"msg": "Cuenta eliminada definitivamente"}), 200
