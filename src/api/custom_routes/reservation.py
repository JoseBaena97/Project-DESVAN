from flask import request, jsonify
from api.routes import api
from api.models import db, Reservation, User, Event, ReservationStatus

@api.route("/reservation", methods=["GET"])
def get_reservations():
    reservations = db.session.execute(db.select(Reservation)).scalars().all()
    return jsonify([reservation.serialize() for reservation in reservations]), 200

@api.route("/reservation/<int:reservation_id>", methods=["GET"])
def get_reservation(reservation_id):
    reservation = db.session.get(Reservation, reservation_id)
    if not reservation:
        return jsonify({"message": "Reservation not found"}), 404
    return jsonify(reservation.serialize()), 200

# Obtener reservas de un usuario
@api.route("/user/<int:user_id>/reservations", methods=["GET"])
def get_reservations_by_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    reservations = db.session.execute(
        db.select(Reservation).where(Reservation.user_id == user_id)
    ).scalars().all()
    return jsonify([reservation.serialize() for reservation in reservations]), 200

# Obtener reservas de un evento
@api.route("/event/<int:event_id>/reservations", methods=["GET"])
def get_reservations_by_event(event_id):
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404
    reservations = db.session.execute(
        db.select(Reservation).where(Reservation.event_id == event_id)
    ).scalars().all()
    return jsonify([reservation.serialize() for reservation in reservations]), 200

@api.route("/reservation", methods=["POST"])
def create_reservation():
    body = request.get_json()
    if not body:
        return jsonify({"message": "Request body is required"}), 400
    
    user_id = body.get("user_id")
    event_id = body.get("event_id")

    if not user_id or not event_id:
        return jsonify({"message": "user_id and event_id are required"}), 400
    
    # Verificar que el usuario existe
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    # Verificar que el evento existe
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404
    
    # Impedir reservar tu propio evento
    if event.seller_id == user_id:
        return jsonify({
            "message": "You cannot reserve your own event"
        }), 403
    
    # Verificar que no exista ya una reserva activa del usuario en ese evento
    existing_reservation = db.session.execute(
        db.select(Reservation).where(
            (Reservation.user_id == user_id) & 
            (Reservation.event_id == event_id) &
            (Reservation.status == ReservationStatus.confirmed)
        )
    ).scalar_one_or_none()
    
    if existing_reservation:
        return jsonify({"message": "User already has an active reservation for this event"}), 400

    # Verificar capacidad máxima del evento
    if event.max_capacity:
        confirmed_count = db.session.execute(
            db.select(db.func.count(Reservation.id)).where(
                (Reservation.event_id == event_id) &
                (Reservation.status == ReservationStatus.confirmed)
            )
        ).scalar()
        if confirmed_count >= event.max_capacity:
            return jsonify({"message": "Event has reached maximum capacity"}), 400

    new_reservation = Reservation(
        user_id=user_id,
        event_id=event_id,
        status=ReservationStatus.confirmed
    )
    db.session.add(new_reservation)
    db.session.commit()
    
    return jsonify({"message": "Reservation created successfully", "reservation": new_reservation.serialize()}), 201

@api.route("/reservation/<int:reservation_id>", methods=["PUT"])
def update_reservation(reservation_id):
    reservation = db.session.get(Reservation, reservation_id)
    if not reservation:
        return jsonify({"message": "Reservation not found"}), 404
        
    body = request.get_json()
    if not body:
        return jsonify({"message": "Request body is required"}), 400
        
    if "status" in body:
        try:
            reservation.status = ReservationStatus(body["status"])
        except ValueError:
            return jsonify({"message": f"Invalid status. Must be one of: {[s.value for s in ReservationStatus]}"}), 400
        
    db.session.commit()
    return jsonify({"message": "Reservation updated successfully", "reservation": reservation.serialize()}), 200

@api.route("/reservation/<int:reservation_id>", methods=["DELETE"])
def delete_reservation(reservation_id):
    reservation = db.session.get(Reservation, reservation_id)
    if not reservation:
        return jsonify({"message": "Reservation not found"}), 404
        
    db.session.delete(reservation)
    db.session.commit()
    return jsonify({"message": "Reservation deleted successfully"}), 200
