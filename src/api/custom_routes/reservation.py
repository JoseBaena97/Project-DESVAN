from flask import request, jsonify
from api.routes import api
from api.models import db, Reservation, User, Event, EventStatus, ReservationStatus, Notification, NotificationType
from api.auth_helpers import login_required, admin_required, current_user, is_owner_or_admin


def _can_see_reservation(user, reservation):
    """La ve quien la hizo, el organizador del evento o un admin."""
    return (user.is_admin
            or reservation.user_id == user.id
            or (reservation.event and reservation.event.seller_id == user.id))


# Todas las reservas: solo admin
@api.route("/reservation", methods=["GET"])
@admin_required
def get_reservations():
    reservations = db.session.execute(db.select(Reservation)).scalars().all()
    return jsonify([reservation.serialize() for reservation in reservations]), 200


@api.route("/reservation/<int:reservation_id>", methods=["GET"])
@login_required
def get_reservation(reservation_id):
    reservation = db.session.get(Reservation, reservation_id)
    if not reservation or not _can_see_reservation(current_user(), reservation):
        return jsonify({"message": "Reservation not found"}), 404
    return jsonify(reservation.serialize()), 200


# Reservas de un usuario: solo el propio usuario o un admin
@api.route("/user/<int:user_id>/reservations", methods=["GET"])
@login_required
def get_reservations_by_user(user_id):
    if not is_owner_or_admin(current_user(), user_id):
        return jsonify({"message": "Forbidden"}), 403
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    reservations = db.session.execute(
        db.select(Reservation).where(Reservation.user_id == user_id)
    ).scalars().all()
    return jsonify([reservation.serialize() for reservation in reservations]), 200


# Reservas de un evento: solo el organizador o un admin
@api.route("/event/<int:event_id>/reservations", methods=["GET"])
@login_required
def get_reservations_by_event(event_id):
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404
    if not is_owner_or_admin(current_user(), event.seller_id):
        return jsonify({"message": "Forbidden"}), 403
    reservations = db.session.execute(
        db.select(Reservation).where(Reservation.event_id == event_id)
    ).scalars().all()
    return jsonify([reservation.serialize() for reservation in reservations]), 200


# Reservar: siempre a nombre del usuario del token (el user_id del body se ignora)
@api.route("/reservation", methods=["POST"])
@login_required
def create_reservation():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"message": "Request body is required"}), 400

    user = current_user()
    event_id = body.get("event_id")
    if not event_id:
        return jsonify({"message": "event_id is required"}), 400

    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404

    if event.status != EventStatus.active:
        return jsonify({"message": "This event is not accepting reservations"}), 400

    # Impedir reservar tu propio evento
    if event.seller_id == user.id:
        return jsonify({
            "message": "You cannot reserve your own event"
        }), 403

    # Verificar que no exista ya una reserva activa del usuario en ese evento
    existing_reservation = db.session.execute(
        db.select(Reservation).where(
            (Reservation.user_id == user.id) &
            (Reservation.event_id == event.id) &
            (Reservation.status == ReservationStatus.confirmed)
        )
    ).scalars().first()

    if existing_reservation:
        return jsonify({"message": "User already has an active reservation for this event"}), 400

    # Verificar capacidad máxima del evento
    if event.max_capacity:
        confirmed_count = db.session.execute(
            db.select(db.func.count(Reservation.id)).where(
                (Reservation.event_id == event.id) &
                (Reservation.status == ReservationStatus.confirmed)
            )
        ).scalar()
        if confirmed_count >= event.max_capacity:
            return jsonify({"message": "Event has reached maximum capacity"}), 400

    new_reservation = Reservation(
        user_id=user.id,
        event_id=event.id,
        status=ReservationStatus.confirmed
    )
    db.session.add(new_reservation)

    db.session.add(Notification(
        user_id=event.seller_id,
        type=NotificationType.reservation_created,
        message=f"{user.username} ha reservado una plaza en tu evento '{event.title}'.",
        related_event_id=event.id
    ))

    db.session.commit()

    return jsonify({"message": "Reservation created successfully", "reservation": new_reservation.serialize()}), 201


# Cambiar el estado de una reserva.
# - Quien la hizo: solo puede cancelarla.
# - Un admin: cualquier estado.
@api.route("/reservation/<int:reservation_id>", methods=["PUT"])
@login_required
def update_reservation(reservation_id):
    user = current_user()
    reservation = db.session.get(Reservation, reservation_id)
    if not reservation or not _can_see_reservation(user, reservation):
        return jsonify({"message": "Reservation not found"}), 404
    if not is_owner_or_admin(user, reservation.user_id):
        return jsonify({"message": "Forbidden"}), 403

    body = request.get_json(silent=True)
    if not body:
        return jsonify({"message": "Request body is required"}), 400

    if "status" in body:
        try:
            new_status = ReservationStatus(body["status"])
        except ValueError:
            return jsonify({"message": f"Invalid status. Must be one of: {[s.value for s in ReservationStatus]}"}), 400
        if not user.is_admin and new_status != ReservationStatus.cancelled:
            return jsonify({"message": "You can only cancel your reservation"}), 403
        reservation.status = new_status

    db.session.commit()
    return jsonify({"message": "Reservation updated successfully", "reservation": reservation.serialize()}), 200


# Borrar una reserva: quien la hizo o un admin
@api.route("/reservation/<int:reservation_id>", methods=["DELETE"])
@login_required
def delete_reservation(reservation_id):
    user = current_user()
    reservation = db.session.get(Reservation, reservation_id)
    if not reservation or not _can_see_reservation(user, reservation):
        return jsonify({"message": "Reservation not found"}), 404
    if not is_owner_or_admin(user, reservation.user_id):
        return jsonify({"message": "Forbidden"}), 403

    db.session.delete(reservation)
    db.session.commit()
    return jsonify({"message": "Reservation deleted successfully"}), 200
