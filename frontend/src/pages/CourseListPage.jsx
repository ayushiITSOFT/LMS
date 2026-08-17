import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ROLES } from "../features/auth/roles.js";
import { useAuth } from "../features/auth/useAuth.js";
import { listPublishedCourses } from "../features/courses/courseService.js";

function pageItems(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

export function CourseListPage() {
  const { role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const page = searchParams.get("page") || "1";

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setMessage("");

    listPublishedCourses({ page })
      .then((data) => {
        if (!active) return;
        setCourses(pageItems(data));
        setPagination(Array.isArray(data) ? null : data);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message || "Unable to load courses.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [page]);

  function goToPage(nextPage) {
    setSearchParams({ page: String(nextPage) });
  }

  const canCreate = role === ROLES.ADMIN || role === ROLES.INSTRUCTOR;

  return (
    <section className="content-page">
      <div className="page-heading">
        <div>
          <h1>Courses</h1>
          <p>Published courses available from the backend discovery API.</p>
        </div>
        {canCreate ? (
          <Link className="button-link" to="/courses/new">
            Create course
          </Link>
        ) : null}
      </div>
      {status === "loading" ? <p className="page-message">Loading courses...</p> : null}
      {status === "error" ? <p className="form-error">{message}</p> : null}
      {status === "ready" && courses.length === 0 ? (
        <p className="page-message">No published courses found.</p>
      ) : null}
      {courses.length ? (
        <div className="item-list">
          {courses.map((course) => (
            <article className="item-row" key={course.id}>
              <div>
                <h2>{course.title}</h2>
                <p>{course.subtitle || course.description || "No description provided."}</p>
                <small>
                  {course.category} · {course.level} · {course.language} ·{" "}
                  {Number(course.price || 0) > 0
                    ? `$${Number(course.price).toFixed(2)}`
                    : "Free"}
                </small>
              </div>
              <Link to={`/courses/${course.id}`}>View</Link>
            </article>
          ))}
        </div>
      ) : null}
      {pagination?.count > courses.length ? (
        <div className="pagination">
          <button disabled={!pagination.previous} onClick={() => goToPage(Number(page) - 1)}>
            Previous
          </button>
          <span>Page {page}</span>
          <button disabled={!pagination.next} onClick={() => goToPage(Number(page) + 1)}>
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}
