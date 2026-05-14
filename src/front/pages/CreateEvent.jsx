import { useState } from "react";
import { Link } from "react-router-dom";
import mascotOpen from "../assets/img/caja04.png";

const CATEGORIES = [
    { value: "", label: "Selecciona una categoría" },
    { value: "rastro", label: "Rastro" },
    { value: "feria", label: "Feria" },
    { value: "mercado", label: "Mercado" },
    { value: "vintage", label: "Vintage" },
    { value: "antiguedades", label: "Antigüedades" },
];

const EVENT_TYPES = [
    { value: "", label: "Selecciona un tipo" },
    { value: "publico", label: "Público" },
    { value: "privado", label: "Privado" },
];

export const CreateEvent = () => {
    const [form, setForm] = useState({
        name: "",
        type: "",
        description: "",
        place: "",
        city: "",
        address: "",
        postalCode: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        multiDay: false,
        category: "",
        tags: "",
    });

    const [images, setImages] = useState([]);
    const [mainImage, setMainImage] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleMainImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImage(URL.createObjectURL(file));
        }
    };

    const handleAddImages = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((f) => URL.createObjectURL(f));
        setImages((prev) => [...prev, ...newImages].slice(0, 5));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Event data:", form, mainImage, images);
    };

    return (
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

                {/* Main Layout */}
                <form className="create-event-layout" onSubmit={handleSubmit}>
                    {/* Left Column – Form Sections */}
                    <div className="create-event-left">
                        {/* Información básica */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <span className="section-icon">
                                    <i class="fa-solid fa-pen-to-square"></i>
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
                                        name="name"
                                        placeholder="Ej: Rastro de San Fernando"
                                        value={form.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        Tipo de evento <span className="required">*</span>
                                    </label>
                                    <div className="select-wrap">
                                        <select
                                            name="type"
                                            value={form.type}
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
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={5}
                                    />
                                    <span className="char-count">
                                        {form.description.length}/500
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Ubicación */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <span className="section-icon">
                                    <i class="fa-solid fa-location-dot"></i>
                                </span>
                                Ubicación
                            </h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        Lugar <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="place"
                                        placeholder="Ej: Plaza de San Fernando"
                                        value={form.place}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        Ciudad <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="Ej: Madrid"
                                        value={form.city}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Dirección exacta</label>
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Ej: Calle de Embajadores, 5"
                                        value={form.address}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Código postal</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        placeholder="Ej: 28012"
                                        value={form.postalCode}
                                        onChange={handleChange}
                                    />
                                </div>
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
                                        name="startDate"
                                        value={form.startDate}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        Fecha de fin <span className="required">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={form.endDate}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Hora de inicio</label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={form.startTime}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hora de fin</label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={form.endTime}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <label className="checkbox-inline">
                                <input
                                    type="checkbox"
                                    name="multiDay"
                                    checked={form.multiDay}
                                    onChange={handleChange}
                                />
                                <span>Evento de varios días</span>
                            </label>
                        </div>

                        {/* Categoría y etiquetas */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <span className="section-icon section-icon--pink">
                                    <i className="fa-solid fa-tag"></i>
                                </span>
                                Categoría y etiquetas
                            </h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        Categoría principal{" "}
                                        <span className="required">*</span>
                                    </label>
                                    <div className="select-wrap">
                                        <select
                                            name="category"
                                            value={form.category}
                                            onChange={handleChange}
                                        >
                                            {CATEGORIES.map((c) => (
                                                <option key={c.value} value={c.value}>
                                                    {c.label}
                                                </option>
                                            ))}
                                        </select>
                                        <i className="fa-solid fa-chevron-down select-chevron"></i>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Etiquetas</label>
                                    <input
                                        type="text"
                                        name="tags"
                                        placeholder="Añade etiquetas (máx. 5)"
                                        value={form.tags}
                                        onChange={handleChange}
                                    />
                                    <span className="input-hint">
                                        Ej: antigüedades, coleccionismo, vintage, muebles, libros...
                                    </span>
                                </div>
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
                                        <i class="fa-solid fa-comment-dots"></i>
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
                                        <i class="fa-solid fa-clipboard-check"></i>
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
                                        <i class="fa-solid fa-bullhorn"></i>
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
                            Publicar evento
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
