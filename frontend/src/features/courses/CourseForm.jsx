import { useState } from "react";

const LEVELS = [
  ["beginner", "Beginner"],
  ["intermediate", "Intermediate"],
  ["advanced", "Advanced"],
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
  submitLabel = "Save course",
}) {
  const [values, setValues] = useState({
    ...initialValues,
    ...initialCourse,
    pricing: Number(initialCourse?.price || 0) > 0 ? "paid" : "free",
    price: initialCourse?.price ?? initialValues.price,
  });
  const [localErrors, setLocalErrors] = useState({});
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
      await onSubmit({
        category: values.category.trim(),
        title: values.title.trim(),
        subtitle: values.subtitle.trim(),
        description: values.description.trim(),
        level: values.level,
        language: values.language.trim(),
        pricing: values.pricing,
        price: values.pricing === "free" ? "0.00" : values.price,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const mergedErrors = { ...errors, ...localErrors };

  return (
    <form className="auth-form course-form" onSubmit={handleSubmit} noValidate>
      <label>
        Title
        <input name="title" onChange={updateField} type="text" value={values.title} />
        {fieldError(mergedErrors, "title") ? (
          <span className="field-error">{fieldError(mergedErrors, "title")}</span>
        ) : null}
      </label>
      <label>
        Category
        <input
          name="category"
          onChange={updateField}
          type="text"
          value={values.category}
        />
        {fieldError(mergedErrors, "category") ? (
          <span className="field-error">{fieldError(mergedErrors, "category")}</span>
        ) : null}
      </label>
      <label>
        Subtitle
        <input
          name="subtitle"
          onChange={updateField}
          type="text"
          value={values.subtitle}
        />
        {fieldError(mergedErrors, "subtitle") ? (
          <span className="field-error">{fieldError(mergedErrors, "subtitle")}</span>
        ) : null}
      </label>
      <label>
        Description
        <textarea
          name="description"
          onChange={updateField}
          rows="5"
          value={values.description}
        />
        {fieldError(mergedErrors, "description") ? (
          <span className="field-error">{fieldError(mergedErrors, "description")}</span>
        ) : null}
      </label>
      <label>
        Level
        <select name="level" onChange={updateField} value={values.level}>
          {LEVELS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {fieldError(mergedErrors, "level") ? (
          <span className="field-error">{fieldError(mergedErrors, "level")}</span>
        ) : null}
      </label>
      <label>
        Language
        <input
          name="language"
          onChange={updateField}
          type="text"
          value={values.language}
        />
        {fieldError(mergedErrors, "language") ? (
          <span className="field-error">{fieldError(mergedErrors, "language")}</span>
        ) : null}
      </label>
      <label>
        Pricing
        <select name="pricing" onChange={updateField} value={values.pricing}>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
        {fieldError(mergedErrors, "pricing") ? (
          <span className="field-error">{fieldError(mergedErrors, "pricing")}</span>
        ) : null}
      </label>
      <label>
        Price
        <input
          disabled={values.pricing === "free"}
          min="0"
          name="price"
          onChange={updateField}
          step="0.01"
          type="number"
          value={values.price}
        />
        {fieldError(mergedErrors, "price") ? (
          <span className="field-error">{fieldError(mergedErrors, "price")}</span>
        ) : null}
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
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
