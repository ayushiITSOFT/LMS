import { useState, useEffect } from "react";
import {
  BookOpen,
  Tag,
  FileText,
  Layers,
  Globe,
  DollarSign,
  Info,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Image,
  Upload,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getMediaUrl } from "../../utils/mediaUrl";

const LEVELS = [
  ["beginner", "Beginner (No prior experience required)"],
  ["intermediate", "Intermediate (Basic concepts required)"],
  ["advanced", "Advanced (In-depth & complex topics)"],
];

const CATEGORIES = [
  "Web Development",
  "Data Science & AI",
  "Mobile App Development",
  "UI/UX Design",
  "Cloud Computing & DevOps",
  "Cybersecurity",
  "Business & Entrepreneurship",
  "Digital Marketing"
];

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Hindi",
  "Mandarin",
  "Portuguese"
];

const initialValues = {
  category: "",
  title: "",
  subtitle: "",
  description: "",
  level: "beginner",
  language: "English",
  pricing: "free",
  price: "0.00",
};

function fieldError(errors, name) {
  const value = errors?.[name];
  return Array.isArray(value) ? value.join(" ") : value;
}

export function CourseForm({
  errors = {},
  initialCourse,
  onSubmit,
  submitLabel = "Save Course",
  onCancel,
}) {
  const [values, setValues] = useState({
    ...initialValues,
    ...initialCourse,
    pricing: Number(initialCourse?.price || 0) > 0 ? "paid" : "free",
    price: initialCourse?.price ?? initialValues.price,
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const initialImg = initialCourse?.thumbnail || initialCourse?.image;
  const [previewUrl, setPreviewUrl] = useState(
    initialImg ? getMediaUrl(initialImg, null) : null
  );
  const [localErrors, setLocalErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialCourse && !thumbnailFile) {
      const img = initialCourse.thumbnail || initialCourse.image;
      if (img) {
        setPreviewUrl(getMediaUrl(img, null));
      }
    }
  }, [initialCourse, thumbnailFile]);

  function updateField(event) {
    const { name, value } = event.target;
    setValues({
      ...values,
      [name]: value,
      ...(name === "pricing" && value === "free" ? { price: "0.00" } : {}),
    });
  }

  function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  function handleRemoveImage() {
    setThumbnailFile(null);
    setPreviewUrl(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {
      category: !values.category.trim() ? "Category is required." : "",
      title: !values.title.trim() ? "Title is required." : "",
      language: !values.language.trim() ? "Language is required." : "",
      price: priceError(values),
    };

    if (Object.values(nextErrors).some(Boolean)) {
      setLocalErrors(nextErrors);
      return;
    }

    setLocalErrors({});
    setSubmitting(true);

    try {
      const payload = {
        category: values.category.trim(),
        title: values.title.trim(),
        subtitle: values.subtitle.trim(),
        description: values.description.trim(),
        level: values.level,
        language: values.language.trim(),
        pricing: values.pricing,
        price: values.pricing === "free" ? "0.00" : values.price,
      };
      if (thumbnailFile) {
        payload.thumbnail = thumbnailFile;
      }
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  const mergedErrors = { ...errors, ...localErrors };

  return (
    <form onSubmit={handleSubmit} noValidate className="course-builder-form">
      {/* SECTION 1: Basic Information */}
      <div className="ui-card" style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border-color)" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--text-main)" }}>1. Basic Course Details</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Provide essential course metadata, title, and categorization.</p>
          </div>
        </div>

        <div style={{ display: "grid", gap: "1.25rem" }}>
          {/* Title */}
          <div className="form-field">
            <label className="form-label" htmlFor="title">
              Course Title <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              id="title"
              name="title"
              className="form-input"
              type="text"
              placeholder="e.g. Master Full-Stack Web Development with React & Django"
              value={values.title}
              onChange={updateField}
            />
            {fieldError(mergedErrors, "title") && (
              <span className="form-error">{fieldError(mergedErrors, "title")}</span>
            )}
            <span style={{ fontSize: "0.78rem", color: "var(--text-light)" }}>
              Make your title catchy and informative (recommended max 75 characters).
            </span>
          </div>

          {/* Subtitle */}
          <div className="form-field">
            <label className="form-label" htmlFor="subtitle">
              Short Subtitle / Tagline
            </label>
            <input
              id="subtitle"
              name="subtitle"
              className="form-input"
              type="text"
              placeholder="e.g. Build production-ready web applications from scratch"
              value={values.subtitle}
              onChange={updateField}
            />
            {fieldError(mergedErrors, "subtitle") && (
              <span className="form-error">{fieldError(mergedErrors, "subtitle")}</span>
            )}
          </div>

          {/* Category */}
          <div className="form-field">
            <label className="form-label" htmlFor="category">
              Course Category <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                id="category"
                name="category"
                className="form-input"
                type="text"
                list="category-suggestions"
                placeholder="Select or enter a category..."
                value={values.category}
                onChange={updateField}
              />
              <datalist id="category-suggestions">
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            {fieldError(mergedErrors, "category") && (
              <span className="form-error">{fieldError(mergedErrors, "category")}</span>
            )}
          </div>

          {/* Course Cover Image / Thumbnail Upload */}
          <div className="form-field">
            <label className="form-label" htmlFor="thumbnail">
              Course Cover Image / Banner
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: previewUrl ? "180px 1fr" : "1fr",
                gap: "1.25rem",
                alignItems: "center",
                padding: "1.25rem",
                background: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                border: "2px dashed var(--border-color)",
              }}
            >
              {previewUrl && (
                <div style={{ position: "relative", width: "100%", height: "110px", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                  <img
                    src={previewUrl}
                    alt="Course Thumbnail Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="btn btn-danger btn-sm"
                    style={{ position: "absolute", top: "6px", right: "6px", padding: "0.3rem", borderRadius: "50%" }}
                    title="Remove Image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <Upload size={18} style={{ color: "var(--primary)" }} />
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>
                    {previewUrl ? "Change Cover Image" : "Upload Course Cover Image"}
                  </span>
                </div>
                <input
                  id="thumbnail"
                  name="thumbnail"
                  className="form-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ fontSize: "0.85rem", cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.78rem", color: "var(--text-light)", display: "block", marginTop: "0.4rem" }}>
                  Recommended aspect ratio 16:9 (e.g. 1280x720px). Supports JPG, PNG, WEBP.
                </span>
                {fieldError(mergedErrors, "thumbnail") && (
                  <span className="form-error">{fieldError(mergedErrors, "thumbnail")}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Course Content & Specifications */}
      <div className="ui-card" style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border-color)" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", background: "var(--info-light)", color: "var(--info)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--text-main)" }}>2. Course Specifications & Overview</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Detail the course scope, targeted target audience, and language.</p>
          </div>
        </div>

        <div style={{ display: "grid", gap: "1.25rem" }}>
          {/* Description */}
          <div className="form-field">
            <label className="form-label" htmlFor="description">
              Full Course Description
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              rows={6}
              placeholder="Describe what students will learn, course structure, prerequisites, and outcome expectations..."
              value={values.description}
              onChange={updateField}
            />
            {fieldError(mergedErrors, "description") && (
              <span className="form-error">{fieldError(mergedErrors, "description")}</span>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            {/* Level */}
            <div className="form-field">
              <label className="form-label" htmlFor="level">
                Target Skill Level <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <select
                id="level"
                name="level"
                className="form-select"
                value={values.level}
                onChange={updateField}
              >
                {LEVELS.map(([val, lbl]) => (
                  <option key={val} value={val}>
                    {lbl}
                  </option>
                ))}
              </select>
              {fieldError(mergedErrors, "level") && (
                <span className="form-error">{fieldError(mergedErrors, "level")}</span>
              )}
            </div>

            {/* Language */}
            <div className="form-field">
              <label className="form-label" htmlFor="language">
                Instruction Language <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                id="language"
                name="language"
                className="form-input"
                type="text"
                list="language-suggestions"
                placeholder="Select or enter language..."
                value={values.language}
                onChange={updateField}
              />
              <datalist id="language-suggestions">
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang} />
                ))}
              </datalist>
              {fieldError(mergedErrors, "language") && (
                <span className="form-error">{fieldError(mergedErrors, "language")}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Pricing & Monetization */}
      <div className="ui-card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border-color)" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", background: "var(--success-light)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DollarSign size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--text-main)" }}>3. Pricing & Monetization</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Choose whether your course is offered free of charge or at a paid price point.</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "1.25rem" }}>
          {/* Pricing Option Cards */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              border: `2px solid ${values.pricing === "free" ? "var(--primary)" : "var(--border-color)"}`,
              background: values.pricing === "free" ? "var(--primary-light)" : "var(--bg-surface)",
              cursor: "pointer",
              transition: "all var(--transition-fast)"
            }}
          >
            <input
              type="radio"
              name="pricing"
              value="free"
              checked={values.pricing === "free"}
              onChange={updateField}
              style={{ marginTop: "0.2rem" }}
            />
            <div>
              <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--text-main)" }}>Free Course</div>
              <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>Accessible to all enrolled students for zero cost.</div>
            </div>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              border: `2px solid ${values.pricing === "paid" ? "var(--primary)" : "var(--border-color)"}`,
              background: values.pricing === "paid" ? "var(--primary-light)" : "var(--bg-surface)",
              cursor: "pointer",
              transition: "all var(--transition-fast)"
            }}
          >
            <input
              type="radio"
              name="pricing"
              value="paid"
              checked={values.pricing === "paid"}
              onChange={updateField}
              style={{ marginTop: "0.2rem" }}
            />
            <div>
              <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--text-main)" }}>Paid Course</div>
              <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>Set a one-time purchase price for lifetime access.</div>
            </div>
          </label>
        </div>

        {/* Price Input Field */}
        <div className="form-field">
          <label className="form-label" htmlFor="price">
            Course Price (INR ₹)
          </label>
          <div style={{ position: "relative", maxWidth: "280px" }}>
            <span style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", fontWeight: "700", color: "var(--text-muted)" }}>
              ₹
            </span>
            <input
              id="price"
              name="price"
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              disabled={values.pricing === "free"}
              style={{ paddingLeft: "2.2rem" }}
              placeholder="e.g. 4999.00"
              value={values.price}
              onChange={updateField}
            />
          </div>
          {fieldError(mergedErrors, "price") && (
            <span className="form-error">{fieldError(mergedErrors, "price")}</span>
          )}
        </div>
      </div>

      {/* FORM ACTION FOOTER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "1rem", padding: "1.25rem", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        ) : (
          <Link to="/instructor/courses" className="btn btn-secondary">
            Cancel
          </Link>
        )}

        <button type="submit" disabled={submitting} className="btn btn-primary btn-lg">
          {submitting ? (
            <>
              <Sparkles size={18} className="animate-spin" />
              <span>Saving Course...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              <span>{submitLabel}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function priceError(values) {
  const price = Number(values.price);

  if (Number.isNaN(price) || price < 0) {
    return "Price must be zero or greater.";
  }

  if (values.pricing === "paid" && price <= 0) {
    return "Paid courses must have a price greater than 0.";
  }

  return "";
}
