from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.routes import api
from api.models import db, User, Event, Reservation, Review, Report, EventStatus, ReservationStatus, Notification, NotificationType
from datetime import datetime, timezone
from sqlalchemy import func


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        try:
            user_id = int(get_jwt_identity())
        except Exception:
            return jsonify({"success": False, "msg": "Invalid token"}), 401
        user = db.session.get(User, user_id)
        if not user or not user.is_admin:
            return jsonify({"success": False, "msg": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper


@api.route("/admin/stats", methods=["GET"])
@admin_required
def admin_get_stats():
    total_users = db.session.execute(
        db.select(func.count(User.id)).where(User.deleted_at.is_(None))
    ).scalar()
    suspended_users = db.session.execute(
        db.select(func.count(User.id)).where(User.deleted_at.isnot(None))
    ).scalar()
    total_events = db.session.execute(db.select(func.count(Event.id))).scalar()
    total_reservations = db.session.execute(db.select(func.count(Reservation.id))).scalar()
    total_reviews = db.session.execute(db.select(func.count(Review.id))).scalar()
    open_reports = db.session.execute(
        db.select(func.count(Report.id)).where(Report.is_resolved == False)
    ).scalar()

    return jsonify({
        "success": True,
        "data": {
            "total_users": total_users,
            "suspended_users": suspended_users,
            "total_events": total_events,
            "total_reservations": total_reservations,
            "total_reviews": total_reviews,
            "open_reports": open_reports,
        }
    }), 200


@api.route("/admin/users", methods=["GET"])
@admin_required
def admin_get_users():
    users = db.session.execute(db.select(User)).scalars().all()
    result = []
    for u in users:
        report_count = db.session.execute(
            db.select(func.count(Report.id)).where(
                Report.reported_id == u.id,
                Report.is_resolved == False
            )
        ).scalar()
        result.append({
            "id": u.id,
            "email": u.email,
            "username": u.username,
            "profile_picture_url": u.profile_picture_url,
            "is_verified": u.is_verified,
            "is_admin": u.is_admin,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "is_suspended": u.deleted_at is not None,
            "open_reports": report_count,
        })
    return jsonify({"success": True, "data": result}), 200


@api.route("/admin/users/<int:user_id>/suspend", methods=["PUT"])
@admin_required
def admin_suspend_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"success": False, "msg": "User not found"}), 404
    if user.deleted_at is not None:
        return jsonify({"success": False, "msg": "User is already suspended"}), 400
    user.deleted_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify({"success": True, "msg": "User suspended"}), 200


@api.route("/admin/users/<int:user_id>/restore", methods=["PUT"])
@admin_required
def admin_restore_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"success": False, "msg": "User not found"}), 404
    if user.deleted_at is None:
        return jsonify({"success": False, "msg": "User is not suspended"}), 400
    user.deleted_at = None
    db.session.commit()
    return jsonify({"success": True, "msg": "User restored"}), 200


@api.route("/admin/events", methods=["GET"])
@admin_required
def admin_get_events():
    events = db.session.execute(db.select(Event)).scalars().all()
    result = []
    for e in events:
        data = e.serialize()
        seller = db.session.get(User, e.seller_id)
        data["seller_username"] = seller.username if seller else None
        result.append(data)
    return jsonify({"success": True, "data": result}), 200


@api.route("/admin/events/<int:event_id>/cancel", methods=["PUT"])
@admin_required
def admin_cancel_event(event_id):
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"success": False, "msg": "Event not found"}), 404
    if event.status == EventStatus.cancelled:
        return jsonify({"success": False, "msg": "Event is already cancelled"}), 400

    for res in event.reservations:
        if res.status == ReservationStatus.confirmed:
            res.status = ReservationStatus.cancelled
            db.session.add(Notification(
                user_id=res.user_id,
                type=NotificationType.event_cancelled,
                message=f"El evento '{event.title}' al que tenías una reserva ha sido cancelado por un administrador.",
                related_event_id=event.id
            ))

    event.status = EventStatus.cancelled
    db.session.commit()
    return jsonify({"success": True, "msg": "Event cancelled"}), 200


@api.route("/admin/events/<int:event_id>", methods=["DELETE"])
@admin_required
def admin_delete_event(event_id):
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"success": False, "msg": "Event not found"}), 404
    db.session.delete(event)
    db.session.commit()
    return jsonify({"success": True, "msg": "Event deleted"}), 200


@api.route("/admin/reviews", methods=["GET"])
@admin_required
def admin_get_reviews():
    reviews = db.session.execute(db.select(Review)).scalars().all()
    result = []
    for r in reviews:
        data = r.serialize()
        reviewer = db.session.get(User, r.reviewer_id)
        reviewed = db.session.get(User, r.reviewed_id)
        data["reviewer_username"] = reviewer.username if reviewer else None
        data["reviewed_username"] = reviewed.username if reviewed else None
        result.append(data)
    return jsonify({"success": True, "data": result}), 200


@api.route("/admin/reviews/<int:review_id>", methods=["DELETE"])
@admin_required
def admin_delete_review(review_id):
    review = db.session.get(Review, review_id)
    if not review:
        return jsonify({"success": False, "msg": "Review not found"}), 404
    db.session.delete(review)
    db.session.commit()
    return jsonify({"success": True, "msg": "Review deleted"}), 200


@api.route("/admin/reports", methods=["GET"])
@admin_required
def admin_get_reports():
    try:
        reports = db.session.execute(
            db.select(Report).order_by(Report.created_at.desc())
        ).scalars().all()

        result = []
        for r in reports:
            reporter = db.session.get(User, r.reporter_id)
            reported = db.session.get(User, r.reported_id)
            result.append({
                "id": r.id,
                "reason": r.reason.value,
                "message": r.message,
                "is_resolved": r.is_resolved,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "reporter": {"id": r.reporter_id, "username": reporter.username if reporter else None},
                "reported": {"id": r.reported_id, "username": reported.username if reported else None},
            })
        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        return jsonify({"success": False, "msg": str(e)}), 500


@api.route("/admin/reports/<int:report_id>/resolve", methods=["PUT"])
@admin_required
def admin_resolve_report(report_id):
    report = db.session.get(Report, report_id)
    if not report:
        return jsonify({"success": False, "msg": "Report not found"}), 404
    report.is_resolved = True
    db.session.commit()
    return jsonify({"success": True, "msg": "Report resolved"}), 200


@api.route("/admin/reports/<int:report_id>", methods=["DELETE"])
@admin_required
def admin_delete_report(report_id):
    report = db.session.get(Report, report_id)
    if not report:
        return jsonify({"success": False, "msg": "Report not found"}), 404
    db.session.delete(report)
    db.session.commit()
    return jsonify({"success": True, "msg": "Report deleted"}), 200
