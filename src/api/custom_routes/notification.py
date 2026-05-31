from flask import jsonify
from api.routes import api
from api.models import db, Notification, NotificationType, Reservation, ReservationStatus, EventStatus
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone, timedelta


@api.route("/notification/my", methods=["GET"])
@jwt_required()
def get_my_notifications():
    user_id = int(get_jwt_identity())

    # Generar notificaciones de eventos próximos (próximas 24h)
    now = datetime.now(timezone.utc)
    in_24h = now + timedelta(hours=24)

    reservations = db.session.execute(
        db.select(Reservation).where(
            (Reservation.user_id == user_id) &
            (Reservation.status == ReservationStatus.confirmed)
        )
    ).scalars().all()

    for res in reservations:
        event = res.event
        if not event or event.status != EventStatus.active:
            continue
        event_start = event.start_date or event.start_time
        if not event_start:
            continue
        if event_start.tzinfo is None:
            event_start = event_start.replace(tzinfo=timezone.utc)
        if now <= event_start <= in_24h:
            existing = db.session.execute(
                db.select(Notification).where(
                    (Notification.user_id == user_id) &
                    (Notification.type == NotificationType.event_upcoming) &
                    (Notification.related_event_id == event.id)
                )
            ).scalar_one_or_none()
            if not existing:
                db.session.add(Notification(
                    user_id=user_id,
                    type=NotificationType.event_upcoming,
                    message=f"Tu reserva en '{event.title}' comienza en menos de 24 horas. ¡No te lo pierdas!",
                    related_event_id=event.id
                ))

    db.session.commit()

    notifications = db.session.execute(
        db.select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    ).scalars().all()

    return jsonify({
        "success": True,
        "data": [n.serialize() for n in notifications],
        "unread_count": sum(1 for n in notifications if not n.is_read)
    }), 200


@api.route("/notification/<int:notification_id>/read", methods=["PATCH"])
@jwt_required()
def mark_notification_read(notification_id):
    user_id = int(get_jwt_identity())
    notification = db.session.get(Notification, notification_id)
    if not notification or notification.user_id != user_id:
        return jsonify({"success": False, "msg": "Notification not found"}), 404
    notification.is_read = True
    db.session.commit()
    return jsonify({"success": True}), 200


@api.route("/notification/read-all", methods=["PATCH"])
@jwt_required()
def mark_all_notifications_read():
    user_id = int(get_jwt_identity())
    notifications = db.session.execute(
        db.select(Notification).where(
            (Notification.user_id == user_id) & (Notification.is_read == False)
        )
    ).scalars().all()
    for n in notifications:
        n.is_read = True
    db.session.commit()
    return jsonify({"success": True}), 200


@api.route("/notification/<int:notification_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notification_id):
    user_id = int(get_jwt_identity())
    notification = db.session.get(Notification, notification_id)
    if not notification or notification.user_id != user_id:
        return jsonify({"success": False, "msg": "Notification not found"}), 404
    db.session.delete(notification)
    db.session.commit()
    return jsonify({"success": True}), 200


@api.route("/notification/all", methods=["DELETE"])
@jwt_required()
def delete_all_notifications():
    user_id = int(get_jwt_identity())
    notifications = db.session.execute(
        db.select(Notification).where(Notification.user_id == user_id)
    ).scalars().all()
    for n in notifications:
        db.session.delete(n)
    db.session.commit()
    return jsonify({"success": True}), 200
