import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";
import {
  createLesson,
  createSection,
  deleteLesson,
  deleteSection,
  getCourse,
  updateLesson,
  updateSection,
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

export function CourseBuilderPage() {
  const { id } = useParams();
  const { access } = useAuth();
  const [course, setCourse] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
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
    }
  }

  async function removeSection(sectionId) {
    if (!window.confirm("Delete this section?")) return;
    await deleteSection(id, sectionId, access).then(loadCourse).catch((error) => {
      setMessage(error.message || "Unable to delete section.");
    });
  }

  async function removeLesson(sectionId, lessonId) {
    if (!window.confirm("Delete this lesson?")) return;
    await deleteLesson(id, sectionId, lessonId, access).then(loadCourse).catch((error) => {
      setMessage(error.message || "Unable to delete lesson.");
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
      </div>
      {message ? <p className="form-error">{message}</p> : null}
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
