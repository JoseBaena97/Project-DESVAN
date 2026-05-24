import os
import resend

resend.api_key = os.getenv("RESEND_API_KEY")


def send_reset_email(email, token):

    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:3000"
    )

    reset_link = (
        f"{frontend_url}/reset-password?token={token}"
    )

    params = {
        "from": "onboarding@resend.dev",
        "to": [email],
        "subject": "Recupera tu contraseña — El Desván",

        "html": f"""
            <h2>Recuperación de contraseña</h2>

            <p>
                Haz clic en el botón para restablecer tu contraseña.
            </p>

            <p>
                El enlace expira en <strong>1 hora</strong>.
            </p>

            <a
                href="{reset_link}"
                style="
                    background:#4a4a4a;
                    color:white;
                    padding:12px 24px;
                    text-decoration:none;
                    border-radius:4px;
                    display:inline-block;
                "
            >
                Restablecer contraseña
            </a>

            <p style="margin-top:24px;color:#999;font-size:12px;">
                Si no solicitaste esto, ignora este email.
            </p>
        """
    }

    resend.Emails.send(params)