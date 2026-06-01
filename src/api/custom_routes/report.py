from flask import request, jsonify
from api.routes import api
from api.models import db, User, Report, ReportReason
from flask_jwt_extended import jwt_required, get_jwt_identity


@api.route("/report", methods=["POST"])
@jwt_required()
def create_report():
    reporter_id = get_jwt_identity()
    try:
        reporter_id = int(reporter_id)
    except Exception:
        pass

    body = request.get_json()
    if not body:
        return jsonify({"success": False, "msg": "Body required"}), 400

    reported_id = body.get("reported_id")
    reason_value = body.get("reason")
    message = body.get("message")

    if not reported_id or not reason_value:
        return jsonify({"success": False, "msg": "reported_id and reason are required"}), 400

    if reported_id == reporter_id:
        return jsonify({"success": False, "msg": "No puedes reportarte a ti mismo"}), 400

    reported_user = db.session.get(User, reported_id)
    if not reported_user:
        return jsonify({"success": False, "msg": "User not found"}), 404

    try:
        reason = ReportReason(reason_value)
    except ValueError:
        return jsonify({"success": False, "msg": "Invalid reason"}), 400

    report = Report(
        reporter_id=reporter_id,
        reported_id=reported_id,
        reason=reason,
        message=message,
    )
    db.session.add(report)
    db.session.commit()
    return jsonify({"success": True, "msg": "Reporte enviado correctamente"}), 201
