# Punto de entrada WSGI para producción (gunicorn wsgi --chdir ./src/).
# Aplica las migraciones pendientes al arrancar salvo RUN_DB_UPGRADE_ON_START=0.

import os
from flask_migrate import upgrade
from app import app as application


if os.getenv("RUN_DB_UPGRADE_ON_START", "1") == "1":
    with application.app_context():
        upgrade()

if __name__ == "__main__":
    application.run()