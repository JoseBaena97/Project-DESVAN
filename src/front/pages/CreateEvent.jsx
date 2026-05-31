import { useState, useEffect, useRef } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import mascotOpen from "../assets/img/caja04.png";
import eventService from "../services/event.service";
import uploadService from "../services/upload.service";
import authService from "../services/auth.service";
import useGlobalReducer from "../hooks/useGlobalReducer";



const EVENT_TYPES = [
    { value: "", label: "Selecciona un tipo" },
    { value: "publico", label: "Público" },
    { value: "privado", label: "Privado" },
];

export const CreateEvent = () => {
    const { store, dispatch, showErrorAlert } = useGlobalReducer();
    const navigate = useNavigate();

    const [eventData, setEventData] = useState({
        title: "",
        description: "",
        event_type: "",
        start_time: "",
        end_time: "",
        start_date: "",
        end_date: "",

        exact_address: "",
        latitude: null,
        longitude: null,
        max_capacity: "",

        seller_id: "",
    });

    const [images, setImages] = useState([]);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [mainImageFile, setMainImageFile] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isVerified, setIsVerified] = useState(null);
    const [categories, setCategories] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const location = useLocation();
    const addressInputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const pad = (n) => String(n).padStart(2, '0');
    const _today = new Date();
    const todayString = `${_today.getFullYear()}-${pad(_today.getMonth() + 1)}-${pad(_today.getDate())}`;

    

    useEffect(() => {
        if (store.user) {
            setIsVerified(store.user?.is_verified ?? false);
        }
    }, [store.user]);

    useEffect(() => {
        eventService.getCategories().then(res => {
            if (res?.data) setCategories(res.data);
        });
        eventService.getTags().then(res => {
            if (Array.isArray(res)) setAvailableTags(res);
        });
    }, []);

    useEffect(() => {
        const setupAutocomplete = () => {
            if (!addressInputRef.current || !window.google || autocompleteRef.current) return;
            const ac = new window.google.maps.places.Autocomplete(
                addressInputRef.current,
                { types: ["geocode", "establishment"], fields: ["formatted_address", "geometry"] }
            );
            ac.addListener("place_changed", () => {
                const place = ac.getPlace();
                if (!place.geometry) return;
                setEventData(prev => ({
                    ...prev,
                    exact_address: place.formatted_address || "",
                    latitude: place.geometry.location.lat(),
                    longitude: place.geometry.location.lng(),
                }));
            });
            autocompleteRef.current = ac;
        };

        if (window.google) {
            setupAutocomplete();
            return;
        }

        const existingScript = document.getElementById("google-maps-script");
        if (existingScript) {
            existingScript.addEventListener("load", setupAutocomplete);
            return () => existingScript.removeEventListener("load", setupAutocomplete);
        }

        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.addEventListener("load", setupAutocomplete);
        document.head.appendChild(script);

        return () => { autocompleteRef.current = null; };
    }, []); 

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const eventId = params.get('eventId');
        if (eventId) {
            // cargar evento para editar
            eventService.getEvent(eventId).then((res) => {
                const evt = res && res.data ? res.data : res;
                if (evt) {
                    const formattedData = { ...evt };
                    const pad = (n) => n.toString().padStart(2, '0');
                    if (evt.start_time) {
                        const d = new Date(evt.start_time);
                        formattedData.start_date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
                        formattedData.start_time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
                    }
                    if (evt.end_time) {
                        const d = new Date(evt.end_time);
                        formattedData.end_date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
                        formattedData.end_time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
                    }
                    formattedData.category_id = evt.event_categories?.[0]?.category?.id ?? "";
                    setEventData((prev) => ({ ...prev, ...formattedData }));

                    if (evt.event_tags?.length > 0) {
                        setSelectedTagIds(evt.event_tags.map(et => et.tag?.id).filter(Boolean));
                    }
                    if (evt.image_url?.cover) {
                        setMainImage(evt.image_url.cover);
                    }
                    if (evt.image_url?.gallery) {
                        setImages(evt.image_url.gallery.slice(0, 5));
                    }
                    setIsEdit(true);
                    setEditingId(eventId);
                }
            }).catch((err) => {
                console.error('Error cargando evento para editar', err);
            });
        }
    }, [location.search]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEventData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleMainImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImage(URL.createObjectURL(file));
            setMainImageFile(file);
        }
    };

    const handleAddImages = (e) => {
        const files = Array.from(e.target.files).slice(0, 5);
        const newPreviews = files.map((f) => URL.createObjectURL(f));
        setImages((prev) => [...prev, ...newPreviews].slice(0, 5));
        setGalleryFiles((prev) => [...prev, ...files].slice(0, 5));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const missingFields = [];
        if (!eventData.title.trim()) missingFields.push("Nombre del evento");
        if (!eventData.event_type) missingFields.push("Tipo de evento");
        if (!eventData.description.trim()) missingFields.push("Descripción");
        if (eventData.event_type === "privado") {
            const cap = Number(eventData.max_capacity);

            if (!eventData.max_capacity || isNaN(cap) || cap <= 0) {
                missingFields.push("Aforo máximo válido");
            }
        }
        if (!eventData.exact_address) missingFields.push("Dirección");
        if (!eventData.start_date) missingFields.push("Fecha de inicio");
        if (!eventData.end_date) missingFields.push("Fecha de fin");
        if (!eventData.start_time) missingFields.push("Hora de inicio");
        if (!eventData.end_time) missingFields.push("Hora de fin");
        if (!eventData.category_id) missingFields.push("Categoría principal");

        if (missingFields.length > 0) {
            const msg = missingFields.length === 1
                ? `Falta el campo obligatorio: ${missingFields[0]}`
                : `Faltan los siguientes campos obligatorios: ${missingFields.join(", ")}`;
            showErrorAlert(msg);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;

        }

        try {
            const addressToUse = eventData.exact_address?.trim();


            // Convert local selected date/time to UTC string for the backend
            const startDateTime = new Date(`${eventData.start_date}T${eventData.start_time}`);
            const endDateTime = new Date(`${eventData.end_date}T${eventData.end_time}`);

            const payload = {
                ...eventData,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                exact_address: addressToUse,
                category_id: eventData.category_id ? Number(eventData.category_id) : null,
                tag_ids: selectedTagIds,
            };

            if (payload.max_capacity) {
                payload.max_capacity = Number(payload.max_capacity);
                if (isNaN(payload.max_capacity) || payload.max_capacity <= 0) {
                    delete payload.max_capacity;
                }
            } else {
                delete payload.max_capacity;
            }

            // Asegurar tipo numérico y eliminar si no aplica
            if (mainImageFile || galleryFiles.length > 0) {
                const imageUrlPayload = eventData.image_url ? { ...eventData.image_url } : {};
                if (mainImageFile) {
                    const uploadResult = await uploadService.uploadImage(mainImageFile, "events");
                    imageUrlPayload.cover = uploadResult.url;
                }
                if (galleryFiles.length > 0) {
                    imageUrlPayload.gallery = imageUrlPayload.gallery ? [...imageUrlPayload.gallery] : [];
                    for (const file of galleryFiles) {
                        const uploadResult = await uploadService.uploadImage(file, "events/gallery");
                        imageUrlPayload.gallery.push(uploadResult.url);
                    }
                    imageUrlPayload.gallery = imageUrlPayload.gallery.slice(0, 5);
                }
                payload.image_url = imageUrlPayload;
            } else if (eventData.image_url) {
                payload.image_url = eventData.image_url;
            }



            // =========================
            // MODO EDICIÓN
            // =========================
            if (isEdit && editingId) {
                const data = await eventService.updateEvent(editingId, payload);

                console.log("Evento actualizado:", data);

                navigate('/mis-eventos');
                return;
            }

            // =========================
            // CREAR EVENTO
            // =========================
            const data = await eventService.createEvent(payload);

            console.log("Evento creado:", data);

            if (data?.success && data?.data) {
                navigate(`/detalles/${data.data}`);
                return;
            }

            showErrorAlert("Evento creado, pero no se pudo navegar automáticamente.");

        } catch (err) {
            console.error(
                isEdit
                    ? "Error actualizando evento:"
                    : "Error creando evento:",
                err
            );

            // Manejar errores devueltos por el backend
            if (err.response && err.response.data) {
                const data = err.response.data;
                const backendMessage = data.msg || data.error || data.message;

                if (backendMessage) {
                    showErrorAlert(`Error del servidor: ${backendMessage}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
            }

            showErrorAlert(
                isEdit
                    ? "No se pudo actualizar el evento."
                    : "Error creando evento. Revisa la consola para más detalles."
            );
        window.scrollTo({ top: 0, behavior: 'smooth' });   
        }
    };





    return (
        <>
        <div className="create-event-page">
            <div className="create-event-container">
                {/* Header */}
                <div className="create-event-header">
                    <Link to="/explorar" className="back-link">
                        <i className="fa-solid fa-arrow-left"></i> Volver a explorar
                    </Link>
                    <h1 className="create-event-title">Crea tu evento</h1>
                    <div className="create-event-title-line"></div>
                    <p className="create-event-subtitle">
                        Comparte tu rastro, feria o mercado con la comunidad de Desván.
                    </p>
                </div>

                {/* Feedback Messages */}
                {store.error && (
                    <div className="create-event-alert">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{store.error}</span>
                    </div>
                )}

                {/* Main Layout */}
                <form className="create-event-layout" onSubmit={handleSubmit}>
                    {/* Left Column – Form Sections */}
                    <div className="create-event-left">
                        {/* Información básica */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <span className="section-icon">
                                    <i className="fa-solid fa-pen-to-square"></i>
                                </span>
                                Información básica
                            </h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        Nombre del evento <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Ej: Rastro de San Fernando"
                                        value={eventData.title}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        Tipo de evento <span className="required">*</span>
                                    </label>
                                    <div className="select-wrap">
                                        <select
                                            name="event_type"
                                            value={eventData.event_type}
                                            onChange={handleChange}
                                        >
                                            {EVENT_TYPES.map((t) => (
                                                <option key={t.value} value={t.value}>
                                                    {t.label}
                                                </option>
                                            ))}
                                        </select>
                                        <i className="fa-solid fa-chevron-down select-chevron"></i>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>
                                    Descripción <span className="required">*</span>
                                </label>
                                <div className="textarea-wrap">
                                    <textarea
                                        name="description"
                                        placeholder="Cuéntanos más sobre tu evento..."
                                        maxLength={500}
                                        value={eventData.description}
                                        onChange={handleChange}
                                        rows={5}
                                    />
                                    <span className="char-count">
                                        {eventData.description.length}/500
                                    </span>
                                </div>
                            </div>

                            {/* Aforo máximo para eventos privados */}
                            {eventData.event_type === "privado" && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            Aforo máximo <span className="required">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="max_capacity"
                                            placeholder="Ej: 50"
                                            min="1"
                                            value={eventData.max_capacity}
                                            onChange={handleChange}
                                        />
                                        <span className="input-hint">Número máximo de asistentes</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Ubicación */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <span className="section-icon">
                                    <i className="fa-solid fa-location-dot"></i>
                                </span>
                                Ubicación
                            </h3>

                            <div className="form-group">
                                <label>
                                    Dirección <span className="required">*</span>
                                </label>
                                <input
                                    ref={addressInputRef}
                                    type="text"
                                    name="exact_address"
                                    placeholder="Busca una dirección o lugar..."
                                    value={eventData.exact_address}
                                    onChange={(e) => setEventData(prev => ({
                                        ...prev,
                                        exact_address: e.target.value,
                                        latitude: null,
                                        longitude: null,
                                    }))}
                                />
                                <span className="input-hint">
                                    Escribe para buscar y selecciona una opción de la lista
                                </span>
                            </div>
                        </div>

                        {/* Fecha y horario */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <span className="section-icon">
                                    <i className="fa-regular fa-calendar"></i>
                                </span>
                                Fecha y horario
                            </h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        Fecha de inicio <span className="required">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        min={todayString}
                                        value={eventData.start_date}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        Fecha de fin <span className="required">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        min={eventData.start_date || todayString}
                                        value={eventData.end_date}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Hora de inicio <span className="required">*</span></label>
                                    <input
                                        type="time"
                                        name="start_time"
                                        value={eventData.start_time}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hora de fin <span className="required">*</span></label>
                                    <input
                                        type="time"
                                        name="end_time"
                                        value={eventData.end_time}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Categoría y etiquetas */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <span className="section-icon section-icon--pink">
                                    <i className="fa-solid fa-tag"></i>
                                </span>
                                Categoría y etiquetas
                            </h3>

                            <div className="form-group">
                                <label>
                                    Tipo de evento{" "}
                                    <span className="required">*</span>
                                </label>
                                <div className="select-wrap">
                                    <select
                                        name="category_id"
                                        value={eventData.category_id || ""}
                                        onChange={handleChange}
                                    >
                                        <option value="">Selecciona un tipo</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    <i className="fa-solid fa-chevron-down select-chevron"></i>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Qué se puede encontrar</label>
                                <div className="tags-chips-grid">
                                    {availableTags.map((tag) => {
                                        const selected = selectedTagIds.includes(tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                className={`tag-chip${selected ? " tag-chip--selected" : ""}`}
                                                onClick={() =>
                                                    setSelectedTagIds(prev =>
                                                        selected
                                                            ? prev.filter(id => id !== tag.id)
                                                            : [...prev, tag.id]
                                                    )
                                                }
                                            >
                                                {selected && <i className="fa-solid fa-check"></i>}
                                                {tag.name}
                                            </button>
                                        );
                                    })}
                                </div>
                                <span className="input-hint">Selecciona todo lo que aplique</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column – Sidebar */}
                    <div className="create-event-right">
                        {/* Image upload card */}
                        <div className="sidebar-card">
                            <h3 className="sidebar-card-title">
                                <span className="section-icon section-icon--red">
                                    <i className="fa-solid fa-image"></i>
                                </span>
                                Imagen del evento
                            </h3>

                            <label className="image-upload-zone" htmlFor="main-image-input">
                                {mainImage ? (
                                    <img
                                        src={mainImage}
                                        alt="Preview"
                                        className="image-preview-main"
                                    />
                                ) : (
                                    <>
                                        <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>
                                        <span className="upload-text">
                                            Sube una imagen principal
                                        </span>
                                        <span className="upload-hint">
                                            JPG, PNG o WEBP. Máx. 5MB
                                        </span>
                                    </>
                                )}
                                <input
                                    id="main-image-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleMainImage}
                                    hidden
                                />
                            </label>

                            {/* Thumbnail gallery */}
                            <div className="image-gallery">
                                {images.map((img, i) => (
                                    <div key={i} className="gallery-thumb">
                                        <img src={img} alt={`thumb-${i}`} />
                                    </div>
                                ))}
                            </div>

                            <label className="btn-add-images" htmlFor="gallery-image-input">
                                <i className="fa-solid fa-plus"></i> Añadir más imágenes
                                <input
                                    id="gallery-image-input"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleAddImages}
                                    hidden
                                />
                            </label>
                        </div>

                        {/* Tips card */}
                        <div className="sidebar-card tips-card">
                            <h3 className="tips-title">Consejos para un buen evento</h3>
                            <ul className="tips-list">
                                <li>
                                    <span className="tip-icon">
                                        <i className="fa-solid fa-circle-check"></i>
                                    </span>
                                    <div>
                                        <strong>Sé claro y específico</strong>
                                        <p>
                                            Incluye toda la información importante sobre tu evento.
                                        </p>
                                    </div>
                                </li>
                                <li>
                                    <span className="tip-icon">
                                        <i className="fa-solid fa-comment-dots"></i>
                                    </span>
                                    <div>
                                        <strong>Añade una buena descripción</strong>
                                        <p>
                                            Cuéntales a los asistentes qué podrán encontrar y
                                            disfrutar.
                                        </p>
                                    </div>
                                </li>
                                <li>
                                    <span className="tip-icon">
                                        <i className="fa-solid fa-clipboard-check"></i>
                                    </span>
                                    <div>
                                        <strong>Revisa los detalles</strong>
                                        <p>
                                            Asegúrate de que las fechas, horarios y ubicación sean
                                            correctos.
                                        </p>
                                    </div>
                                </li>
                                <li>
                                    <span className="tip-icon">
                                        <i className="fa-solid fa-bullhorn"></i>
                                    </span>
                                    <div>
                                        <strong>¡Promociónalo!</strong>
                                        <p>
                                            Comparte tu evento para que más personas puedan verlo.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Mascot */}
                        <div className="sidebar-mascot">
                            <img src={mascotOpen} alt="Mascota Desván" />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="create-event-submit">
                        <button type="submit" className="btn-publish">
                            {isEdit ? "Actualizar evento" : "Publicar evento"}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {isVerified === false && (
            <div className="unverified-modal-backdrop" onClick={() => navigate("/explorar")}>
                <div className="unverified-modal" onClick={(e) => e.stopPropagation()}>
                    <button
                        className="unverified-modal-close"
                        onClick={() => navigate("/explorar")}
                        aria-label="Cerrar"
                    >
                        <i className="fa-solid fa-xmark" />
                    </button>
                    <div className="unverified-modal-icon">
                        <i className="fa-solid fa-id-card" />
                    </div>
                    <h3 className="unverified-modal-title">Perfil incompleto</h3>
                    <p className="unverified-modal-text">
                        Para publicar eventos en el Desván necesitas tener tu{" "}
                        <strong>teléfono de contacto</strong> y tu <strong>dirección</strong>{" "}
                        registrados en tu perfil. Una vez completados, tu identidad quedará
                        verificada y podrás crear eventos.
                    </p>
                    <div className="unverified-modal-actions">
                        <button
                            className="unverified-modal-btn unverified-modal-btn--cancel"
                            onClick={() => navigate("/explorar")}
                        >
                            <i className="fa-solid fa-arrow-left" /> Volver
                        </button>
                        <Link to="/perfil" className="unverified-modal-btn unverified-modal-btn--profile">
                            <i className="fa-solid fa-pen-to-square" /> Completar mi perfil
                        </Link>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};
