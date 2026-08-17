import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";
import { CoursePublishPanel } from "../features/courses/CoursePublishPanel.jsx";
import {
  createLesson,
  createSection,
  deleteLesson,
  deleteSection,
  getCourse,
  updateLesson,
  updateSection,
  updateCoursePricing,
} from "../features/courses/courseService.js";

const emptySection = { title: "", description: "", order: "" };
const emptyLesson = {
  title: "",
  kind: "video",
  video_url: "",
  notes: "",
  preview: false,
  order: "",
  pdf: null,
};

function formatPrice(price) {
  return Number(price || 0) > 0 ? `$${Number(price).toFixed(2)}` : "Free";
}

function fieldError(errors, name) {
  const value = errors?.[name];
  return Array.isArray(value) ? value.join(" ") : value;
}

function SectionForm({ errors, initialValues = emptySection, onSubmit, submitLabel }) {
  const [values, setValues] = useState({ ...emptySection, ...initialValues });
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!values.title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        order: values.order === "" ? undefined : Number(values.order),
      });
      if (!initialValues.id) setValues(emptySection);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="builder-form" onSubmit={handleSubmit}>
      <input
        aria-label="Section title"
        name="title"
        onChange={updateField}
        placeholder="Section title"
        type="text"
        value={values.title}
      />
      <input
        aria-label="Section order"
        min="0"
        name="order"
        onChange={updateField}
        placeholder="Order"
        type="number"
        value={values.order ?? ""}
      />
      <textarea
        aria-label="Section description"
        name="description"
        onChange={updateField}
        placeholder="Description"
        rows="2"
        value={values.description}
      />
      {fieldError(errors, "title") ? (
        <span className="field-error">{fieldError(errors, "title")}</span>
      ) : null}
      <button disabled={submitting || !values.title.trim()} type="submit">
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

function LessonForm({ errors, initialValues = emptyLesson, onSubmit, submitLabel }) {
  const [values, setValues] = useState({ ...emptyLesson, ...initialValues, pdf: null });
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { checked, files, name, type, value } = event.target;
    setValues({
      ...values,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!values.title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: values.title.trim(),
        kind: values.kind,
        video_url: values.video_url.trim(),
        notes: values.notes.trim(),
        preview: values.preview,
        order: values.order === "" ? undefined : Number(values.order),
        pdf: values.pdf,
      });
      if (!initialValues.id) setValues(emptyLesson);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="builder-form" onSubmit={handleSubmit}>
      <input
        aria-label="Lesson title"
        name="title"
        onChange={updateField}
        placeholder="Lesson title"
        type="text"
        value={values.title}
      />
      <select aria-label="Lesson kind" name="kind" onChange={updateField} value={values.kind}>
        <option value="video">Video</option>
        <option value="pdf">PDF</option>
        <option value="notes">Notes</option>
      </select>
      <input
        aria-label="Lesson order"
        min="0"
        name="order"
        onChange={updateField}
        placeholder="Order"
        type="number"
        value={values.order ?? ""}
      />
      <input
        aria-label="Video URL"
        name="video_url"
        onChange={updateField}
        placeholder="Video URL"
        type="url"
        value={values.video_url || ""}
      />
      <textarea
        aria-label="Notes"
        name="notes"
        onChange={updateField}
        placeholder="Notes"
        rows="3"
        value={values.notes || ""}
      />
      <input accept="application/pdf" aria-label="PDF" name="pdf" onChange={updateField} type="file" />
      <label className="inline-field">
        <input
          checked={Boolean(values.preview)}
          name="preview"
          onChange={updateField}
          type="checkbox"
        />
        Preview
      </label>
      {fieldError(errors, "title") ? (
        <span className="field-error">{fieldError(errors, "title")}</span>
      ) : null}
      <button disabled={submitting || !values.title.trim()} type="submit">
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

function PricingForm({ course, errors, onSubmit }) {
  const [values, setValues] = useState({
    pricing: Number(course.price || 0) > 0 ? "paid" : "free",
    price: course.price || "0.00",
  });
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setValues({
      ...values,
      [name]: value,
      ...(name === "pricing" && value === "free" ? { price: "0.00" } : {}),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const price = Number(values.price);

    if (Number.isNaN(price) || price < 0) {
      setLocalError("Price must be zero or greater.");
      return;
    }

    if (values.pricing === "paid" && price <= 0) {
      setLocalError("Paid courses must have a price greater than 0.");
      return;
    }

    setLocalError("");
    setSubmitting(true);
    try {
      await onSubmit({
        pricing: values.pricing,
        price: values.pricing === "free" ? "0.00" : values.price,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="builder-form pricing-form" onSubmit={handleSubmit}>
      <select aria-label="Pricing" name="pricing" onChange={updateField} value={values.pricing}>
        <option value="free">Free</option>
        <option value="paid">Paid</option>
      </select>
      <input
        aria-label="Price"
        disabled={values.pricing === "free"}
        min="0"
        name="price"
        onChange={updateField}
        step="0.01"
        type="number"
        value={values.price}
      />
      {fieldError({ ...errors, price: localError || errors.price }, "price") ? (
        <span className="field-error">
          {fieldError({ ...errors, price: localError || errors.price }, "price")}
        </span>
      ) : null}
      <button disabled={submitting} type="submit">
        {submitting ? "Saving..." : "Save pricing"}
      </button>
    </form>
  );
}

export function CourseBuilderPage() {
  const { id } = useParams();
  const { access } = useAuth();
  const [course, setCourse] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [status, setStatus] = useState("loading");

  const loadCourse = useCallback(async () => {
    setStatus("loading");
    setMessage("");
    try {
      const data = await getCourse(id, access);
      setCourse(data);
      setStatus("ready");
    } catch (error) {
      setMessage(error.message || "Unable to load course builder.");
      setMessageType("error");
      setStatus("error");
    }
  }, [access, id]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  async function submitSection(values) {
    setErrors({});
    try {
      if (editingSection) {
        await updateSection(id, editingSection.id, values, access);
        setEditingSection(null);
      } else {
        await createSection(id, values, access);
      }
      await loadCourse();
    } catch (error) {
      setErrors(error.data || {});
      setMessage(error.message || "Unable to save section.");
      setMessageType("error");
    }
  }

  async function submitPricing(values) {
    setErrors({});
    setMessage("");
    try {
      await updateCoursePricing(id, values, access);
      await loadCourse();
      setMessage("Pricing saved.");
      setMessageType("success");
    } catch (error) {
      setErrors(error.data || {});
      setMessage(error.message || "Unable to save pricing.");
      setMessageType("error");
    }
  }

  async function submitLesson(sectionId, values) {
    setErrors({});
    try {
      if (editingLesson) {
        await updateLesson(id, sectionId, editingLesson.id, values, access);
        setEditingLesson(null);
      } else {
        await createLesson(id, sectionId, values, access);
      }
      await loadCourse();
    } catch (error) {
      setErrors(error.data || {});
      setMessage(error.message || "Unable to save lesson.");
      setMessageType("error");
    }
  }

  async function removeSection(sectionId) {
    if (!window.confirm("Delete this section?")) return;
    await deleteSection(id, sectionId, access).then(loadCourse).catch((error) => {
      setMessage(error.message || "Unable to delete section.");
      setMessageType("error");
    });
  }

  async function removeLesson(sectionId, lessonId) {
    if (!window.confirm("Delete this lesson?")) return;
    await deleteLesson(id, sectionId, lessonId, access).then(loadCourse).catch((error) => {
      setMessage(error.message || "Unable to delete lesson.");
      setMessageType("error");
    });
  }

  if (status === "loading") return <p className="page-message">Loading builder...</p>;
  if (status === "error") return <p className="form-error">{message}</p>;

  return (
    <section className="content-page">
      <div className="page-heading">
        <div>
          <h1>Course builder</h1>
          <p>{course.title}</p>
        </div>
        <Link className="button-link" to={`/courses/${id}`}>
          Course detail
        </Link>
        <Link className="button-link" to={`/courses/${id}/preview`}>
          Preview
        </Link>
      </div>
      {message ? <p className={messageType === "success" ? "form-success" : "form-error"}>{message}</p> : null}
      <CoursePublishPanel course={course} onPublished={setCourse} token={access} />
      <section className="builder-panel">
        <h2>Pricing</h2>
        <p className="page-message">Current price: {formatPrice(course.price)}</p>
        <PricingForm course={course} errors={errors} onSubmit={submitPricing} />
      </section>
      <section className="builder-panel">
        <h2>{editingSection ? "Edit section" : "Add section"}</h2>
        <SectionForm
          errors={errors}
          initialValues={editingSection || emptySection}
          onSubmit={submitSection}
          submitLabel={editingSection ? "Update section" : "Add section"}
        />
      </section>
      {course.sections?.length ? (
        <div className="builder-sections">
          {course.sections.map((section) => (
            <article className="builder-panel" key={section.id}>
              <div className="item-row">
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.description || "No section description."}</p>
                  <small>Order {section.order}</small>
                </div>
                <div className="actions">
                  <button type="button" onClick={() => setEditingSection(section)}>
                    Edit
                  </button>
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => removeSection(section.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <LessonForm
                errors={errors}
                initialValues={
                  editingLesson?.section === section.id ? editingLesson : emptyLesson
                }
                onSubmit={(values) => submitLesson(section.id, values)}
                submitLabel={editingLesson?.section === section.id ? "Update lesson" : "Add lesson"}
              />
              {section.lessons?.length ? (
                <div className="lesson-list">
                  {section.lessons.map((lesson) => (
                    <div className="lesson-row" key={lesson.id}>
                      <div>
                        <strong>{lesson.title}</strong>
                        <small>
                          {lesson.kind} · order {lesson.order}
                          {lesson.preview ? " · preview" : ""}
                        </small>
                      </div>
                      <div className="actions">
                        <button type="button" onClick={() => setEditingLesson(lesson)}>
                          Edit
                        </button>
                        <button
                          className="danger-button"
                          type="button"
                          onClick={() => removeLesson(section.id, lesson.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="page-message">No lessons in this section yet.</p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="page-message">No sections yet.</p>
      )}
    </section>
  );
}
