import os
import cloudinary
import cloudinary.uploader
from flask import request, jsonify, current_app
from api.routes import api
from api.auth_helpers import login_required

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


# carpetas de Cloudinary en las que se puede subir
ALLOWED_FOLDERS = {"events", "events/gallery", "profiles"}


@api.route("/upload", methods=["POST"])
@login_required
def upload_image():
    if "file" not in request.files:
        return jsonify({"success": False, "msg": "No file provided"}), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"success": False, "msg": "No file selected"}), 400

    folder = request.form.get("folder")
    if folder and folder not in ALLOWED_FOLDERS:
        return jsonify({"success": False, "msg": "Invalid folder"}), 400
    try:
        upload_result = cloudinary.uploader.upload(
            file,
            folder=folder if folder else None,
            resource_type="image",
            overwrite=False,
            unique_filename=True,
        )

        return jsonify({
            "success": True,
            "data": {
                "url": upload_result.get("secure_url"),
                "public_id": upload_result.get("public_id"),
            },
        }), 200
    except Exception:
        current_app.logger.exception("Error al subir la imagen a Cloudinary")
        return jsonify({"success": False, "msg": "No se ha podido subir la imagen"}), 500
