"""
Punto de entrada de la API de El Desván: configuración, base de datos,
extensiones y registro de endpoints.
"""
import os
from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate
from api.utils import APIException
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from api.extensions import mail
from flask_jwt_extended import JWTManager
from datetime import timedelta

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)
app.url_map.strict_slashes = False

# configuración de la base de datos
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
jwt_secret = os.getenv("JWT_SECRET_KEY")
if not jwt_secret:
    if ENV == "production":
        raise RuntimeError("Falta la variable de entorno JWT_SECRET_KEY")
    jwt_secret = "clave-solo-para-desarrollo"
app.config["JWT_SECRET_KEY"] = jwt_secret
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", 587))
app.config["MAIL_USE_TLS"] = os.getenv(
    "MAIL_USE_TLS", "true").lower() in ("true", "1", "yes")
app.config["MAIL_USE_SSL"] = os.getenv(
    "MAIL_USE_SSL", "false").lower() in ("true", "1", "yes")
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
app.config["MAIL_DEFAULT_SENDER"] = os.getenv(
    "MAIL_DEFAULT_SENDER", "no-reply@el-desvan.com")
app.config["MAIL_SUPPRESS_SEND"] = os.getenv(
    "FLASK_MAIL_SUPPRESS_SEND", "false").lower() in ("true", "1", "yes")
MIGRATIONS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.realpath(__file__))),
    "migrations"
)
MIGRATE = Migrate(app, db, compare_type=True, directory=MIGRATIONS_DIR)
db.init_app(app)
mail.init_app(app)
jwt = JWTManager(app)
# panel de administración (Flask-Admin)
setup_admin(app)

# comandos CLI (flask insert-test-data)
setup_commands(app)

# todos los endpoints de la API cuelgan de /api
app.register_blueprint(api, url_prefix='/api')

# los errores de la API se devuelven como JSON


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# sirve el frontend compilado; sin build (desarrollo) responde con el estado de la API


@app.route('/')
def index():
    if not os.path.isfile(os.path.join(static_file_dir, 'index.html')):
        return jsonify({"service": "El Desván API", "status": "ok"}), 200
    return send_from_directory(static_file_dir, 'index.html')

# cualquier otra ruta se intenta servir como archivo estático del frontend


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # evita que el navegador cachee el frontend
    return response


# solo se ejecuta al lanzar `python src/app.py` directamente
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
