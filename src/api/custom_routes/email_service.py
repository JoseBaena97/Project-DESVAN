import os
from flask_mail import Message
from api.extensions import mail


def send_reset_email(email, token):
    frontend_url = os.getenv(
        "FRONTEND_URL",)
    reset_link = f"{frontend_url}reset-password?token={token}"

    html = f"""
        <h2>Recuperación de contraseña</h2>
        <p>Haz clic en el botón para restablecer tu contraseña.</p>
        <p>El enlace expira en <strong>1 hora</strong>.</p>
        <a href="{reset_link}" style="background:#4a4a4a;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">
            Restablecer contraseña
        </a>
        <p style="margin-top:24px;color:#999;font-size:12px;">Si no solicitaste esto, ignora este email.</p>
    """

    msg = Message(
        subject="Recupera tu contraseña — El Desván",
        recipients=[email],
        html=html,
        sender=os.getenv("MAIL_DEFAULT_SENDER") or os.getenv("MAIL_USERNAME")
    )
    mail.send(msg)
