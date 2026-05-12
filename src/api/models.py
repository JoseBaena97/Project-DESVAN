import enum
import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Text, Float, Enum, Datetime
from sqlalchemy.orm import Mapped, mapped_column


db = SQLAlchemy()

class UserRole(enum.Enum):
    user = "user"
    admin = "admin"


class EventStatus(enum.Enum):
    draft = "draft"
    active = "active"
    finished = "finished"
    cancelled = "cancelled"


class ReservationStatus(enum.Enum):
    confirmed = "confirmed"
    cancelled = "cancelled"
    attended = "attended"

class User(db.Model):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    username: Mapped[str] = mapped_column(String(80), nullable=False)
    bio: Mapped[str] = mapped_column(Text, nullable=True)
    profile_picture_url: Mapped[str] = mapped_column(String(255), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    role: Mapped[enum] = mapped_column(Enum(UserRole), default=UserRole.user)
    created_at: Mapped[datetime] = mapped_column(Datetime, default= datetime.utcnow) 
    deleted_at: Mapped[datetime] = mapped_column(Datetime, default= datetime.utcnow)
    user_rating: Mapped[float] = mapped_column(Float, nullable=True)


    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "bio": self.bio,
            "profile_picture_url": self.profile_picture_url,
            "is_verified": self.is_verified,
            "role": self.role,
            "user_rating": self.user_rating
            # do not serialize the password, its a security breach
        }