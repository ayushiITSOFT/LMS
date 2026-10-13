import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus, Trash2, HelpCircle, CheckCircle2, Award, X, Wrench } from "lucide-react";
import { ROLES } from "../features/auth/roles.js";
import { useAuth } from "../features/auth/useAuth.js";
import {
  getQuiz,
  startQuizAttempt,
  submitQuizAnswer,
  submitQuizAttempt,
  createQuizQuestion,
  deleteQuizQuestion,
  listQuizAttempts,
} from "../features/quiz/quizService.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";

const defaultOptions = [
  { text: "", is_correct: true },
  { text: "", is_correct: false },
  { text: "", is_correct: false },
  { text: "", is_correct: false },
];

export function QuizPage() {
  const { courseId, quizId } = useParams();
  const { access, role } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Question Creation State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState("single_choice");
  const [qOptions, setQOptions] = useState(defaultOptions);
  const [qSubmitting, setQSubmitting] = useState(false);
  const [qError, setQError] = useState("");

  const canManage = role === ROLES.INSTRUCTOR || role === ROLES.ADMIN;

  useEffect(() => {
    if (!access || !courseId || !quizId) return;

    setLoading(true);
    setError(null);
    Promise.all([
      getQuiz(courseId, quizId, access),
      listQuizAttempts(courseId, quizId, access).catch(() => []),
    ])
      .then(([quizData, attemptsRes]) => {
        setQuiz(quizData);
        const attemptsList = Array.isArray(attemptsRes) ? attemptsRes : attemptsRes?.results || [];
        if (attemptsList.length > 0) {
          const inProgress = attemptsList.find((a) => a.status === "in_progress");
          if (inProgress) {
            setAttempt(inProgress);
          } else {
            const latestSubmitted = attemptsList[0];
            if (latestSubmitted && latestSubmitted.status === "submitted") {
              setResult(latestSubmitted);
            }
          }
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load quiz.");
      })
      .finally(() => setLoading(false));
  }, [access, courseId, quizId]);

  async function handleStartQuiz() {
    setLoading(true);
    setError(null);
    try {
      const newAttempt = await startQuizAttempt(courseId, quizId, access);
      setAttempt(newAttempt);
      setCurrentQuestionIdx(0);
      setSelectedAnswers({});
      setResult(null);
    } catch (err) {
      setError(err.message || "Failed to start quiz attempt.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitQuiz() {
    if (!attempt?.id) return;
    setSubmitting(true);
    setError(null);
    try {
      const finalResult = await submitQuizAttempt(courseId, quizId, attempt.id, access);
      setResult(finalResult);
      setAttempt(null);
    } catch (err) {
      setError(err.message || "Failed to submit quiz attempt.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOptionSelect(questionId, optionId, isMultiple = false) {
    let newSelected;
    if (isMultiple) {
      const currentList = Array.isArray(selectedAnswers[questionId])
        ? selectedAnswers[questionId]
        : selectedAnswers[questionId]
        ? [selectedAnswers[questionId]]
        : [];
      if (currentList.includes(optionId)) {
        newSelected = currentList.filter((id) => id !== optionId);
      } else {
        newSelected = [...currentList, optionId];
      }
    } else {
      newSelected = optionId;
    }

    setSelectedAnswers((prev) => ({ ...prev, [questionId]: newSelected }));

    if (attempt?.id) {
      try {
        await submitQuizAnswer(courseId, quizId, attempt.id, questionId, newSelected, access);
      } catch {
        // Silently save answer state locally
      }
    }
  }

  function handleQTypeChange(newType) {
    setQType(newType);
    if (newType === "true_false") {
      setQOptions([
        { text: "True", is_correct: true },
        { text: "False", is_correct: false },
      ]);
    } else if (qType === "true_false") {
      setQOptions(defaultOptions);
    }
  }

  function handleOptionChange(index, field, value) {
    setQOptions((prev) =>
      prev.map((opt, i) => {
        if (i === index) {
          return { ...opt, [field]: value };
        }
        if (field === "is_correct" && value && (qType === "single_choice" || qType === "true_false")) {
          return { ...opt, is_correct: false };
        }
        return opt;
      })
    );
  }

  function addOptionRow() {
    if (qOptions.length >= 6) return;
    setQOptions((prev) => [...prev, { text: "", is_correct: false }]);
  }

  function removeOptionRow(index) {
    if (qOptions.length <= 2) return;
    setQOptions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreateQuestionSubmit(e) {
    e.preventDefault();
    if (!qText.trim()) return;

    const validOptions = qOptions
      .map((opt) => ({ text: opt.text.trim(), is_correct: Boolean(opt.is_correct) }))
      .filter((opt) => opt.text !== "");

    if (validOptions.length < 2) {
      setQError("Please provide at least 2 non-empty options for the question.");
      return;
    }

    if (!validOptions.some((opt) => opt.is_correct)) {
      setQError("Please mark at least one option as the correct answer.");
      return;
    }

    setQSubmitting(true);
    setQError("");

    try {
      const newQuestion = await createQuizQuestion(
        courseId,
        quizId,
        {
          text: qText.trim(),
          question_type: qType,
          order: (quiz.questions?.length || 0) + 1,
          options: validOptions,
        },
        access
      );

      setQuiz((prev) => ({
        ...prev,
        questions: [...(prev.questions || []), newQuestion],
      }));

      setQText("");
      setQType("single_choice");
      setQOptions(defaultOptions);
      setIsQuestionModalOpen(false);
    } catch (err) {
      setQError(err.message || "Failed to add question to quiz.");
    } finally {
      setQSubmitting(false);
    }
  }

  async function handleDeleteQuestion(questionId) {
    if (!window.confirm("Delete this question from quiz?")) return;
    try {
      await deleteQuizQuestion(courseId, quizId, questionId, access);
      setQuiz((prev) => ({
        ...prev,
        questions: (prev.questions || []).filter((q) => q.id !== questionId),
      }));
    } catch (err) {
      setError(err.message || "Failed to delete question.");
    }
  }

  if (loading) return <Skeleton height="350px" />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!quiz) return <ErrorState message="Quiz not found." />;

  const questions = quiz.questions || [];
  const currentQ = questions[currentQuestionIdx];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800" }}>{quiz.title}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{quiz.description || "Course Assessment Quiz"}</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(true)}
                className="btn btn-primary"
              >
                <Plus size={16} />
                <span>Add Question</span>
              </button>
              <Link to={`/instructor/courses/${courseId}/builder`} className="btn btn-outline">
                <Wrench size={16} />
                <span>Course Builder</span>
              </Link>
            </>
          )}
          <Link to={`/my-courses/${courseId}`} className="btn btn-secondary">
            ← Back to Learn Page
          </Link>
        </div>
      </div>

      {/* Quiz Result Display */}
      {result ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🎯</div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem" }}>Quiz Complete!</h2>
          <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Your Score: <strong style={{ color: "var(--primary)", fontSize: "1.5rem" }}>{result.score ?? result.total_score ?? "-"}</strong>
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button type="button" onClick={handleStartQuiz} className="btn btn-primary">
              Retake Quiz
            </button>
            <Link to={`/my-courses/${courseId}`} className="btn btn-secondary">
              Back to Course
            </Link>
          </div>
        </div>
      ) : !attempt ? (
        /* Quiz Instructions & Management Panel */
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700", margin: 0 }}>Quiz Details & Overview</h2>
              {canManage && (
                <span className="badge badge-info" style={{ fontSize: "0.8rem" }}>
                  Instructor Authoring Mode
                </span>
              )}
            </div>

            <ul style={{ paddingLeft: "1.25rem", color: "var(--text-muted)", lineHeight: "1.6", margin: 0 }}>
              <li>Total Questions: <strong>{questions.length}</strong></li>
              <li>Passing Score: <strong>{quiz.passing_score || "70"}%</strong></li>
              <li>{canManage ? "Instructors can author questions, add answer choices, and test quiz attempts below." : "Answer all questions carefully before submitting your attempt."}</li>
            </ul>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {questions.length > 0 ? (
                <button type="button" onClick={handleStartQuiz} className="btn btn-primary">
                  {canManage ? "Preview & Test Quiz Attempt" : "Start Quiz Attempt"}
                </button>
              ) : (
                <p style={{ color: "var(--warning)", fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>
                  ⚠️ No questions have been added to this quiz yet. Click "+ Add New Question" below to add questions.
                </p>
              )}
            </div>
          </div>

          {/* Instructor Question List & Management */}
          {canManage && (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <HelpCircle size={18} style={{ color: "var(--primary)" }} />
                  <span>Quiz Questions ({questions.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(true)}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={14} />
                  <span>+ Add New Question</span>
                </button>
              </div>

              {questions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem 1rem", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-md)", background: "var(--slate-50)" }}>
                  <HelpCircle size={32} style={{ color: "var(--slate-400)", marginBottom: "0.5rem" }} />
                  <p style={{ fontWeight: 600, color: "var(--slate-700)", margin: 0 }}>No questions added yet</p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    Click "+ Add New Question" to create questions and configure answer choices for this quiz.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {questions.map((q, idx) => (
                    <div key={q.id || idx} style={{ padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <div>
                          <span className="badge badge-info" style={{ marginRight: "0.4rem" }}>Question {idx + 1}</span>
                          <span className="badge badge-secondary" style={{ marginRight: "0.5rem", fontSize: "0.75rem", textTransform: "none" }}>
                            {q.question_type === "multiple_choice" ? "Multiple Choice" : q.question_type === "true_false" ? "True / False" : "Single Choice"}
                          </span>
                          <strong style={{ fontSize: "1rem", color: "var(--slate-900)" }}>{q.text}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: "0.25rem 0.5rem" }}
                          title="Delete Question"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {q.options && q.options.length > 0 && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.5rem", marginTop: "0.5rem" }}>
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              style={{
                                padding: "0.4rem 0.75rem",
                                borderRadius: "var(--radius-sm)",
                                fontSize: "0.85rem",
                                border: `1px solid ${opt.is_correct ? "var(--success)" : "var(--border-color)"}`,
                                background: opt.is_correct ? "var(--success-light)" : "var(--slate-50)",
                                color: opt.is_correct ? "var(--success)" : "var(--slate-700)",
                                fontWeight: opt.is_correct ? 600 : 400,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <span>{opt.text}</span>
                              {opt.is_correct && <CheckCircle2 size={13} />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Active Question Display */
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", color: "var(--text-muted)", fontSize: "0.9rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontWeight: 600 }}>Question {currentQuestionIdx + 1} of {questions.length}</span>
              <span className="badge badge-info" style={{ fontSize: "0.775rem", padding: "0.2rem 0.65rem", textTransform: "none", fontWeight: 600 }}>
                {currentQ?.question_type === "multiple_choice"
                  ? "Multiple Choice (Select all that apply)"
                  : currentQ?.question_type === "true_false"
                  ? "True / False"
                  : "Single Choice (Select 1 answer)"}
              </span>
            </div>
            <span>Progress: {Math.round(((currentQuestionIdx + 1) / questions.length) * 100)}%</span>
          </div>

          <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "1.5rem" }}>{currentQ?.text || currentQ?.question_text}</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
            {currentQ?.options?.map((opt) => {
              const isMultiple = currentQ.question_type === "multiple_choice";
              const currentAns = selectedAnswers[currentQ.id];
              const isSelected = isMultiple
                ? Array.isArray(currentAns) && currentAns.includes(opt.id)
                : currentAns === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleOptionSelect(currentQ.id, opt.id, isMultiple)}
                  className="btn"
                  style={{
                    justifyContent: "flex-start",
                    textAlign: "left",
                    padding: "0.85rem 1rem",
                    border: `1px solid ${isSelected ? "var(--primary)" : "var(--border-color)"}`,
                    background: isSelected ? "var(--primary-light)" : "var(--bg-surface)",
                    color: isSelected ? "var(--primary)" : "var(--text-main)",
                    fontWeight: isSelected ? 700 : 500,
                  }}
                >
                  <span style={{ marginRight: "0.5rem" }}>
                    {isMultiple ? (isSelected ? "☑️" : "🔲") : (isSelected ? "🔘" : "⚪")}
                  </span>
                  {opt.text || opt.option_text}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
            <button
              type="button"
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
              className="btn btn-secondary"
            >
              Previous Question
            </button>

            {currentQuestionIdx < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                className="btn btn-primary"
              >
                Next Question
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="btn btn-danger"
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {isQuestionModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-lg">
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Award size={18} style={{ color: "var(--primary)" }} />
                <span>Add Question to Quiz</span>
              </h3>
              <button type="button" onClick={() => setIsQuestionModalOpen(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateQuestionSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {qError && (
                  <div style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", background: "var(--danger-light)", color: "var(--danger)", fontSize: "0.85rem", fontWeight: 600 }}>
                    {qError}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Question Text *</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    placeholder="e.g. What is the primary purpose of state in React?"
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Question Type</label>
                  <select
                    className="select"
                    value={qType}
                    onChange={(e) => handleQTypeChange(e.target.value)}
                  >
                    <option value="single_choice">Single Choice (One correct answer)</option>
                    <option value="multiple_choice">Multiple Choice (Multiple correct answers)</option>
                    <option value="true_false">True / False</option>
                  </select>
                </div>

                {/* Question Answer Options Config */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Answer Options (Check the correct answer)
                    </label>
                    {qOptions.length < 6 && (
                      <button
                        type="button"
                        onClick={addOptionRow}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                      >
                        + Add Choice
                      </button>
                    )}
                  </div>

                  {qOptions.map((opt, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <input
                        type="checkbox"
                        checked={opt.is_correct}
                        onChange={(e) => handleOptionChange(idx, "is_correct", e.target.checked)}
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        className="input"
                        style={{ flex: 1 }}
                        placeholder={`Option ${idx + 1} text...`}
                        value={opt.text}
                        onChange={(e) => handleOptionChange(idx, "text", e.target.value)}
                        required={idx < 2}
                      />
                      {qOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOptionRow(idx)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: "0.4rem", color: "var(--danger)" }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsQuestionModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={qSubmitting} className="btn btn-primary">
                  {qSubmitting ? "Adding..." : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
