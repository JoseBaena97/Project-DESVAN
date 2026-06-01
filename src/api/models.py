import enum
from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Text, Float, Enum, DateTime, Integer, ForeignKey, DECIMAL, JSON, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List


db = SQLAlchemy()


class EventType(enum.Enum):
    publico = "publico"
    privado = "privado"


class EventStatus(enum.Enum):
    active = "active"
    finished = "finished"
    cancelled = "cancelled"


class ReservationStatus(enum.Enum):
    confirmed = "confirmed"
    cancelled = "cancelled"
    attended = "attended"


class NotificationType(enum.Enum):
    reservation_created = "reservation_created"
    review_received = "review_received"
    event_cancelled = "event_cancelled"
    event_upcoming = "event_upcoming"


class ReportReason(enum.Enum):
    spam = "spam"
    inappropriate_content = "inappropriate_content"
    harassment = "harassment"
    fraud = "fraud"
    other = "other"


class Category (db.Model):
    __tablename__ = "categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    name:  Mapped[str] = mapped_column(String(100), nullable=False)

    # relacion
    event_categories: Mapped[List["EventCategory"]] = relationship(
        back_populates="category", cascade="all, delete-orphan")
    # def serialize

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "event_categories": [eg.serialize()for eg in self.event_categories]

        }


# Tabla asociación eventos con categorías
class EventCategory(db.Model):
    __tablename__ = "event_categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    # claves foráneas
    event_id: Mapped[int] = mapped_column(
        ForeignKey("events.id"), nullable=False)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id"), nullable=False)
    # relacion
    category: Mapped["Category"] = relationship(
        back_populates="event_categories")
    # relacion con evento
    event: Mapped["Event"] = relationship(back_populates="event_categories")
    # def serialize

    def serialize(self):
        return {
            "id": self.id,
            "event_title": self.event.title,
            "category": {
                "id": self.category.id,
                "name": self.category.name
            } if self.category else None

        }


class Favorite (db.Model):
    __tablename__ = "favorites"
    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))
    # claves foráneas
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False)
    event_id: Mapped[int] = mapped_column(
        ForeignKey("events.id"), nullable=False)
    # relación
    user: Mapped["User"] = relationship(back_populates="favorites")
    # relación
    event: Mapped["Event"] = relationship(back_populates="favorites")

    def serialize(self):
        event_data = None
        if self.event:
            event_data = {
                "id": self.event_id,
                "title": self.event.title,
                "description": self.event.description,
                "image_url": self.event.image_url,
                "exact_address": self.event.exact_address,
                "event_type": self.event.event_type.value if self.event.event_type else None,
                "start_time": self.event.start_time.isoformat() if self.event.start_time else None,
                "end_time": self.event.end_time.isoformat() if self.event.end_time else None,
            }

        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user": {
                "id": self.user_id,
                "email": self.user.email,
                "profile_picture_url": self.user.profile_picture_url
            } if self.user else None,
            "event": event_data,
        }


class Event (db.Model):  # ESTA TABLA DEBE IR ARRIBA?
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    image_url: Mapped[dict] = mapped_column(JSON, nullable=True)
    status: Mapped[EventStatus] = mapped_column(
        Enum(EventStatus), default="active", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))

    event_type: Mapped[EventType] = mapped_column(
        Enum(EventType), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True))  # añadido
    end_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True))  # añadido
    max_capacity: Mapped[int] = mapped_column(Integer, nullable=True)

    # ubicación
    exact_address: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)

    # clave foránea
    seller_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False)

    # 1-M
    seller: Mapped["User"] = relationship(back_populates="events")

    # relación
    reservations: Mapped[List["Reservation"]] = relationship(
        back_populates="event", cascade="all, delete-orphan")

    # relación
    reviews: Mapped[List["Review"]] = relationship(
        back_populates="event", cascade="all, delete-orphan")

    # relación
    favorites: Mapped[List["Favorite"]] = relationship(
        back_populates="event", cascade="all, delete-orphan")

    # relación con categorías
    event_categories: Mapped[List["EventCategory"]] = relationship(
        back_populates="event", cascade="all, delete-orphan")

    # relación con tags
    event_tags: Mapped[List["EventTag"]] = relationship(
        back_populates="event", cascade="all, delete-orphan")

    # rating calculado desde las reviews en vez de columna almacenada

    @property
    def event_rating(self):
        if not self.reviews:
            return None
        return round(sum(r.rating for r in self.reviews) / len(self.reviews), 2)

    def public_serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "image_url": self.image_url,
        }

    def profile_event_serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "image_url": self.image_url,
            "exact_address": self.exact_address,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "start_date": self.start_date.isoformat() if self.start_date else None,
        }

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "event_type": self.event_type.value,
            "exact_address": self.exact_address,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "max_capacity": self.max_capacity,
            "status": self.status.value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "image_url": self.image_url,
            "event_rating": self.event_rating,
            "seller": {
                "id": self.seller_id,
                "username": self.seller.username,
                "email": self.seller.email,
                "profile_picture_url": self.seller.profile_picture_url,
                "user_rating": self.seller.user_rating,
                "full_name": f"{self.seller.profile.firstname} {self.seller.profile.lastname}" if self.seller and self.seller.profile else self.seller.username,
            } if self.seller else None,
            "favorites": [favorite.serialize()for favorite in self.favorites],
            "reservations": [reservation.serialize()for reservation in self.reservations],
            "reviews": [review.serialize()for review in self.reviews],
            "event_categories": [event_category.serialize()for event_category in self.event_categories],
            "event_tags": [event_tag.serialize()for event_tag in self.event_tags],
        }


class Reservation (db.Model):
    __tablename__ = "reservations"
    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[ReservationStatus] = mapped_column(
        Enum(ReservationStatus), default=ReservationStatus.confirmed)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))
    # claves foráneas
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False)
    event_id: Mapped[int] = mapped_column(
        ForeignKey("events.id"), nullable=False)
    # 1-M
    user: Mapped["User"] = relationship(back_populates="reservations")
    # relación
    event: Mapped["Event"] = relationship(back_populates="reservations")

    def serialize(self):
        return {
            "id": self.id,
            "status": self.status.value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user": {
                "id": self.user_id,
                "email": self.user.email
            } if self.user else None,
            "event": {
                "id": self.event_id,
                "title": self.event.title,
                "image_url": self.event.image_url,
                "exact_address": self.event.exact_address,
                "event_type": self.event.event_type.value if self.event.event_type else None,
                "start_date": self.event.start_date.isoformat() if self.event.start_date else None,
                "end_date": self.event.end_date.isoformat() if self.event.end_date else None,
                "start_time": self.event.start_time.isoformat() if self.event.start_time else None,
                "end_time": self.event.end_time.isoformat() if self.event.end_time else None,
                "status": self.event.status.value if self.event.status else None,
            } if self.event else None

        }


class Review (db.Model):
    __tablename__ = "reviews"
    id: Mapped[int] = mapped_column(primary_key=True)
    rating: Mapped[float] = mapped_column(Numeric(3, 2), nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))

    # claves foráneas
    reviewer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False)
    reviewed_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False)
    event_id: Mapped[int] = mapped_column(
        ForeignKey("events.id"), nullable=False)
    # 1-M
    reviewer: Mapped["User"] = relationship(
        back_populates="my_written_reviews", foreign_keys=[reviewer_id])
    # relación
    reviewed: Mapped["User"] = relationship(
        back_populates="my_received_reviews", foreign_keys=[reviewed_id])
    # relación
    event: Mapped["Event"] = relationship(back_populates="reviews")

    def serialize(self):
        return {
            "id": self.id,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": self.created_at,
            "reviewer": {
                "id": self.reviewer_id,
                "email": self.reviewer.email,
                "username": self.reviewer.username
            } if self.reviewer else None,
            "reviewed": {
                "id": self.reviewed_id,
                "email": self.reviewed.email,
                "username": self.reviewed.username
            } if self.reviewed else None,
            "event": {
                "id": self.event_id,
                "title": self.event.title
            } if self.event else None

        }

    def serialize_for_public_profile(self):
        return {
            "id": self.id,
            "rating": float(self.rating) if self.rating is not None else None,
            "comment": self.comment,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "reviewer": {
                "username": self.reviewer.username,
                "profile_picture_url": self.reviewer.profile_picture_url,
            } if self.reviewer else None,
            "event": {
                "id": self.event_id,
                "title": self.event.title,
            } if self.event else None,
        }


class User(db.Model):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    username: Mapped[str] = mapped_column(
        String(80), nullable=False, unique=True)
    bio: Mapped[str] = mapped_column(Text, nullable=True)
    profile_picture_url: Mapped[str] = mapped_column(
        String(255), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))
    deleted_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    user_rating: Mapped[float] = mapped_column(Float, nullable=True)

    reset_token: Mapped[str] = mapped_column(String(255), nullable=True)

    reset_token_expires: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True
    )

    # 1-1
    profile: Mapped["Profile"] = relationship(
        back_populates="user", cascade="all, delete-orphan")
    # 1-M
    events: Mapped[List["Event"]] = relationship(
        back_populates="seller", cascade="all, delete-orphan")
    # 1-M
    reservations: Mapped[List["Reservation"]] = relationship(
        back_populates="user", cascade="all, delete-orphan")
    # 1-M
    my_written_reviews: Mapped[List["Review"]] = relationship(
        back_populates="reviewer", foreign_keys="Review.reviewer_id", cascade="all, delete-orphan")
    # 1-M
    my_received_reviews: Mapped[List["Review"]] = relationship(
        back_populates="reviewed", foreign_keys="Review.reviewed_id", cascade="all, delete-orphan")
    # Relación
    favorites: Mapped[List["Favorite"]] = relationship(
        back_populates="user", cascade="all, delete-orphan")
    # 1-M
    notifications: Mapped[List["Notification"]] = relationship(
        back_populates="user", cascade="all, delete-orphan")

    @property
    def full_name(self):
        if self.profile:
            return f"{self.profile.firstname} {self.profile.lastname}".strip()
        return self.username

    def public_profile_serialize(self):
        active_events = sorted(
            [
                event
                for event in (self.events or [])
                if event.status == EventStatus.active
            ],
            key=lambda e: e.start_time or e.created_at,
            reverse=True,
        )
        received_reviews = sorted(
            self.my_received_reviews or [],
            key=lambda r: r.created_at,
            reverse=True,
        )
        return {
            "id": self.id,
            "username": self.username,
            "full_name": self.full_name,
            "bio": self.bio,
            "profile_picture_url": self.profile_picture_url,
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user_rating": self.user_rating,
            "reviews_count": len(received_reviews),
            "events_count": len(active_events),
            "events": [event.profile_event_serialize() for event in active_events],
            "received_reviews": [
                review.serialize_for_public_profile() for review in received_reviews
            ],
        }

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "bio": self.bio,
            "profile_picture_url": self.profile_picture_url,
            "is_verified": self.is_verified,
            "is_admin": self.is_admin,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "deleted_at": self.deleted_at.isoformat() if self.deleted_at else None,
            "user_rating": self.user_rating,
            "profile": self.profile.serialize() if self.profile else None,
            "events": [event.serialize() for event in self.events] if self.events else None,
            "reservations": [reservation.serialize() for reservation in self.reservations] if self.reservations else None,
            "my_written_reviews": [my_written_reviews.serialize() for my_written_reviews in self.my_written_reviews] if self.my_written_reviews else None,
            "my_received_reviews": [my_received_reviews.serialize() for my_received_reviews in self.my_received_reviews] if self.my_received_reviews else None,
            "favorites": [favorite.serialize() for favorite in self.favorites]
            # do not serialize the password, its a security breach
        }


class Profile (db.Model):
    __tablename__ = "profile"
    id: Mapped[int] = mapped_column(primary_key=True)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    firstname: Mapped[str] = mapped_column(String(100), nullable=False)
    lastname: Mapped[str] = mapped_column(String(100), nullable=False)

    # clave foránea
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, unique=True)

    # 1-1
    user: Mapped["User"] = relationship(back_populates="profile")

    @property
    def events_created_count(self):
        if not self.user or not self.user.events:
            return 0
        return len(self.user.events)

    def serialize(self):
        return {
            "id": self.id,
            "address": self.address,
            "phone": self.phone,
            "firstname": self.firstname,
            "lastname": self.lastname,
            "events_created_count": self.events_created_count,
            "user": {
                "email": self.user.email
            } if self.user else None

        }


# Tabla de etiquetas
class Tag(db.Model):
    __tablename__ = "tags"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)

    # relación
    event_tags: Mapped[List["EventTag"]] = relationship(
        back_populates="tag", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "event_tags": [et.serialize() for et in self.event_tags]
        }


# Tabla asociación eventos con etiquetas
class EventTag(db.Model):
    __tablename__ = "event_tags"
    id: Mapped[int] = mapped_column(primary_key=True)
    # claves foráneas
    event_id: Mapped[int] = mapped_column(
        ForeignKey("events.id"), nullable=False)
    tag_id: Mapped[int] = mapped_column(ForeignKey("tags.id"), nullable=False)

    # relaciones
    event: Mapped["Event"] = relationship(back_populates="event_tags")
    tag: Mapped["Tag"] = relationship(back_populates="event_tags")

    def serialize(self):
        return {
            "id": self.id,
            "tag": {
                "id": self.tag_id,
                "name": self.tag.name
            } if self.tag else None,
            "event": {
                "id": self.event_id,
                "title": self.event.title
            }
        }


class Report(db.Model):
    __tablename__ = "reports"
    id: Mapped[int] = mapped_column(primary_key=True)
    reason: Mapped[ReportReason] = mapped_column(Enum(ReportReason), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=True)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))

    reporter_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    reported_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "reason": self.reason.value,
            "message": self.message,
            "is_resolved": self.is_resolved,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "reporter_id": self.reporter_id,
            "reported_id": self.reported_id,
        }


class Notification(db.Model):
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    type: Mapped[NotificationType] = mapped_column(Enum(NotificationType), nullable=False)
    message: Mapped[str] = mapped_column(String(500), nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    related_event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship(back_populates="notifications")

    def serialize(self):
        return {
            "id": self.id,
            "type": self.type.value,
            "message": self.message,
            "is_read": self.is_read,
            "related_event_id": self.related_event_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
