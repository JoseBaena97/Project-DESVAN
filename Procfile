release: flask --app src/app.py db upgrade && flask --app src/app.py secure-db
web: gunicorn wsgi --chdir ./src/