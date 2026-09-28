import os
import inspect
from flask_admin import Admin
from . import models
from .models import db
from flask_admin.contrib.sqla import ModelView
from flask_admin.theme import Bootstrap4Theme


def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    admin = Admin(app, name='El Desván Admin', theme=Bootstrap4Theme(swatch='cerulean'))

    # registra automáticamente todos los modelos en el panel
    for name, obj in inspect.getmembers(models):
        # solo las clases que son modelos de SQLAlchemy
        if inspect.isclass(obj) and issubclass(obj, db.Model):
            admin.add_view(ModelView(obj, db.session))