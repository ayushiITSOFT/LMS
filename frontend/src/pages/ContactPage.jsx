import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Headphones,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export function ContactPage() {
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // FAQ Accordion State (open question index, null if all closed)
  const [openFaq, setOpenFaq] = useState(0);

  // Hover states for interactive styling
  const [focusedField, setFocusedField] = useState(null);
  const [hoveredInfoCard, setHoveredInfoCard] = useState(null);

  const contactInfo = [
    {
      id: "email",
      icon: Mail,
      label: "Email Support",
      value: "support@lms-platform.com",
      actionText: "Send an Email",
      href: "mailto:support@lms-platform.com",
      color: "#6366f1",
      bgColor: "rgba(99, 102, 241, 0.1)",
    },
    {
      id: "phone",
      icon: Phone,
      label: "Phone Hotline",
      value: "+1 (800) 555-0199",
      actionText: "Call Toll-Free",
      href: "tel:+18005550199",
      color: "#06b6d4",
      bgColor: "rgba(6, 182, 212, 0.1)",
    },
    {
      id: "address",
      icon: MapPin,
      label: "Office Address",
      value: "100 Innovation Way, Suite 400",
      subValue: "San Francisco, CA 94105, United States",
      color: "#8b5cf6",
      bgColor: "rgba(139, 92, 246, 0.1)",
    },
    {
      id: "hours",
      icon: Clock,
      label: "Support Hours",
      value: "Mon - Fri: 8:00 AM - 8:00 PM EST",
      subValue: "24/7 automated ticket triage for urgent matters",
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.1)",
    },
  ];

  const faqList = [
    {
      question: "How do I enroll in a course and get started?",
      answer:
        "Enrolling is seamless: visit our Course Catalog, choose any course of interest, and click 'Enroll Now'. Once you complete the straightforward checkout, the course is immediately available in your student dashboard with lifetime access to all lectures, downloadable code, and assignments.",
      category: "Enrollment",
    },
    {
      question: "Are the certificates verified and shareable on LinkedIn?",
      answer:
        "Yes, 100%. Every certificate issued after passing all course quizzes and assignment milestones features a unique cryptographic verification ID and QR code. You can verify certificates anytime on our public verification portal (/verify) or directly export them to your LinkedIn profile.",
      category: "Certificates",
    },
    {
      question: "What payment methods and currencies do you support?",
      answer:
        "We accept all major credit and debit cards (Visa, MasterCard, American Express), PayPal, and secure digital wallets. For enterprise teams or group enrollments, we also offer invoice-based billing and bank wire transfers in USD, EUR, and GBP.",
      category: "Billing",
    },
    {
      question: "What is your refund policy if a course isn't what I expected?",
      answer:
        "We offer a 14-day hassle-free money-back guarantee. If you are not satisfied with a course and have completed less than 25% of the coursework without claiming a completion certificate, simply reach out to billing@lms-platform.com for a full refund.",
      category: "Refunds",
    },
    {
      question: "How do course Q&A and instructor support work?",
      answer:
        "Each course has a dedicated discussion forum where you can ask lesson-specific questions. Our verified instructors and teaching assistants review queries daily and typically provide detailed responses within 24 business hours.",
      category: "Course Help",
    },
  ];

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  function validate() {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message text is required.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long.";
    }
    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    // Simulate API submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  }

  function handleReset() {
    setFormData({
      name: "",
      email: "",
      subject: "General Inquiry",
      message: "",
    });
    setErrors({});
    setSubmitted(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4.5rem", width: "100%" }}>
      {/* Dynamic Keyframes & Responsive Media Queries */}
      <style>{`
        @keyframes contactFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes contactBlobA {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.12) translate(20px, -15px); }
        }
        @keyframes contactBlobB {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.1) translate(-18px, 20px); }
        }
        @keyframes statusBlink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .contact-input:focus {
          outline: none !important;
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18) !important;
        }

        @media (max-width: 992px) {
          .contact-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
        @media (max-width: 640px) {
          .contact-hero-banner {
            padding: 3rem 1.5rem !important;
          }
          .contact-form-card {
            padding: 1.75rem 1.25rem !important;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════
          HERO BANNER (Smaller banner with gradient background)
      ══════════════════════════════════════════════════ */}
      <section
        className="contact-hero-banner"
        style={{
          position: "relative",
          width: "100%",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
          padding: "4rem 3.5rem",
          textAlign: "center",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 20px 45px -15px rgba(15, 23, 42, 0.4)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Animated Radial Ambient Glows */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "15%",
            width: "380px",
            height: "380px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)",
            animation: "contactBlobA 8s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "15%",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(217, 70, 239, 0.25) 0%, transparent 70%)",
            animation: "contactBlobB 10s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: "680px" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.35rem 1rem",
              borderRadius: "var(--radius-full)",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#c7d2fe",
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              marginBottom: "1.25rem",
            }}
          >
            <Headphones size={15} color="#a5b4fc" />
            <span>WE ARE HERE TO HELP YOU SUCCEED</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.2rem, 4vw, 3.25rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              marginBottom: "1rem",
            }}
          >
            Get in{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(90deg, #a5b4fc, #e879f9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Touch.
            </span>
          </h1>

          <p
            style={{
              color: "rgba(255, 255, 255, 0.78)",
              fontSize: "clamp(0.95rem, 1.8vw, 1.1rem)",
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Have questions regarding courses, technical assistance, team licenses, or platform features?
            Our dedicated support specialists typically respond within two hours.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TWO-COLUMN MAIN SECTION
          Left: Contact Info Cards
          Right: Contact Form (matching Login Page styling)
      ══════════════════════════════════════════════════ */}
      <section style={{ width: "100%" }}>
        <div
          className="contact-layout-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.35fr",
            gap: "3rem",
            alignItems: "start",
          }}
        >
          {/* ── LEFT COLUMN: Contact Information Cards ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.35rem",
                }}
              >
                Reach Out Directly
              </div>
              <h2
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: "var(--text-main)",
                  letterSpacing: "-0.03em",
                }}
              >
                Contact Channels
              </h2>
              <p
                style={{
                  fontSize: "0.925rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                  marginTop: "0.35rem",
                }}
              >
                Choose the channel that best suits your inquiry. For immediate urgent platform outages, our automated
                monitoring desk is on call 24/7.
              </p>
            </div>

            {/* Info Cards Grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {contactInfo.map((info) => {
                const Icon = info.icon;
                const isHovered = hoveredInfoCard === info.id;

                return (
                  <div
                    key={info.id}
                    className="card"
                    onMouseEnter={() => setHoveredInfoCard(info.id)}
                    onMouseLeave={() => setHoveredInfoCard(null)}
                    style={{
                      background: "var(--bg-surface)",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid",
                      borderColor: isHovered ? "var(--primary)" : "var(--border-color)",
                      padding: "1.35rem 1.5rem",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1.1rem",
                      boxShadow: isHovered ? "var(--shadow-md)" : "var(--shadow-sm)",
                      transform: isHovered ? "translateX(4px)" : "translateX(0)",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {/* Icon container */}
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "12px",
                        background: info.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={22} color={info.color} />
                    </div>

                    {/* Card Text Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.785rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "var(--text-muted)",
                          marginBottom: "0.2rem",
                        }}
                      >
                        {info.label}
                      </div>

                      {info.href ? (
                        <a
                          href={info.href}
                          style={{
                            fontSize: "1.05rem",
                            fontWeight: 700,
                            color: "var(--text-main)",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            wordBreak: "break-all",
                          }}
                        >
                          <span>{info.value}</span>
                          <ExternalLink size={13} color="var(--primary)" />
                        </a>
                      ) : (
                        <div
                          style={{
                            fontSize: "1.05rem",
                            fontWeight: 700,
                            color: "var(--text-main)",
                          }}
                        >
                          {info.value}
                        </div>
                      )}

                      {info.subValue && (
                        <div
                          style={{
                            fontSize: "0.825rem",
                            color: "var(--text-muted)",
                            marginTop: "0.25rem",
                            lineHeight: 1.45,
                          }}
                        >
                          {info.subValue}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Support Indicator Card */}
            <div
              style={{
                borderRadius: "var(--radius-md)",
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 10px #10b981",
                  animation: "statusBlink 2s ease-in-out infinite",
                  flexShrink: 0,
                }}
              />
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                <strong style={{ color: "#059669" }}>All Support Systems Operational:</strong> Average ticket first
                response within <strong>1 hour 45 minutes</strong>.
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Contact Form Card ── */}
          <div
            className="card contact-form-card"
            style={{
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-color)",
              padding: "2.5rem 2.25rem",
              boxShadow: "var(--shadow-md)",
              position: "relative",
            }}
          >
            {submitted ? (
              /* Success Confirmation Card */
              <div
                style={{
                  textAlign: "center",
                  padding: "2.5rem 1rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1.25rem",
                  animation: "contactFadeUp 0.4s ease both",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.12)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px -4px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <CheckCircle2 size={34} color="#10b981" />
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 800,
                      color: "var(--text-main)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Message Sent Successfully!
                  </h3>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: "var(--text-muted)",
                      lineHeight: 1.6,
                      maxWidth: "460px",
                    }}
                  >
                    Thank you, <strong>{formData.name}</strong>. We received your note regarding{" "}
                    <strong>{formData.subject}</strong>. A support ticket has been registered and a confirmation has been
                    dispatched to <strong>{formData.email}</strong>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-outline"
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "10px",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: "0.5rem",
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              /* Main Interactive Form */
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ marginBottom: "1.75rem" }}>
                  <h3
                    style={{
                      fontSize: "1.45rem",
                      fontWeight: 800,
                      color: "var(--text-main)",
                      marginBottom: "0.35rem",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Send Us a Message
                  </h3>
                  <p style={{ fontSize: "0.885rem", color: "var(--text-muted)", margin: 0 }}>
                    Fill out the fields below and we will route your inquiry to the right specialist.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="contact-name"
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        marginBottom: "0.45rem",
                      }}
                    >
                      Your Full Name <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="e.g. Jane Doe"
                      className="contact-input"
                      style={{
                        width: "100%",
                        height: "44px",
                        padding: "0 1rem",
                        fontSize: "0.925rem",
                        borderRadius: "10px",
                        border: "1px solid",
                        borderColor: errors.name
                          ? "#ef4444"
                          : focusedField === "name"
                          ? "#6366f1"
                          : "var(--border-color)",
                        background: "var(--bg-main)",
                        color: "var(--text-main)",
                        transition: "all 0.2s ease",
                        boxSizing: "border-box",
                      }}
                    />
                    {errors.name && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          color: "#ef4444",
                          fontSize: "0.785rem",
                          marginTop: "0.35rem",
                          fontWeight: 500,
                        }}
                      >
                        <AlertCircle size={14} />
                        <span>{errors.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="contact-email"
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        marginBottom: "0.45rem",
                      }}
                    >
                      Email Address <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="e.g. jane@example.com"
                      className="contact-input"
                      style={{
                        width: "100%",
                        height: "44px",
                        padding: "0 1rem",
                        fontSize: "0.925rem",
                        borderRadius: "10px",
                        border: "1px solid",
                        borderColor: errors.email
                          ? "#ef4444"
                          : focusedField === "email"
                          ? "#6366f1"
                          : "var(--border-color)",
                        background: "var(--bg-main)",
                        color: "var(--text-main)",
                        transition: "all 0.2s ease",
                        boxSizing: "border-box",
                      }}
                    />
                    {errors.email && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          color: "#ef4444",
                          fontSize: "0.785rem",
                          marginTop: "0.35rem",
                          fontWeight: 500,
                        }}
                      >
                        <AlertCircle size={14} />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Subject Dropdown Field */}
                  <div>
                    <label
                      htmlFor="contact-subject"
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        marginBottom: "0.45rem",
                      }}
                    >
                      Subject / Topic
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("subject")}
                      onBlur={() => setFocusedField(null)}
                      className="contact-input"
                      style={{
                        width: "100%",
                        height: "44px",
                        padding: "0 1rem",
                        fontSize: "0.925rem",
                        borderRadius: "10px",
                        border: "1px solid",
                        borderColor:
                          focusedField === "subject" ? "#6366f1" : "var(--border-color)",
                        background: "var(--bg-main)",
                        color: "var(--text-main)",
                        transition: "all 0.2s ease",
                        boxSizing: "border-box",
                        cursor: "pointer",
                      }}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Course Question">Course Question</option>
                      <option value="Billing">Billing</option>
                    </select>
                  </div>

                  {/* Message Field */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        marginBottom: "0.45rem",
                      }}
                    >
                      Your Message <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Please detail your question, feedback, or issue..."
                      className="contact-input"
                      style={{
                        width: "100%",
                        padding: "0.85rem 1rem",
                        fontSize: "0.925rem",
                        lineHeight: 1.6,
                        borderRadius: "10px",
                        border: "1px solid",
                        borderColor: errors.message
                          ? "#ef4444"
                          : focusedField === "message"
                          ? "#6366f1"
                          : "var(--border-color)",
                        background: "var(--bg-main)",
                        color: "var(--text-main)",
                        transition: "all 0.2s ease",
                        resize: "vertical",
                        minHeight: "120px",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                      }}
                    />
                    {errors.message && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          color: "#ef4444",
                          fontSize: "0.785rem",
                          marginTop: "0.35rem",
                          fontWeight: 500,
                        }}
                      >
                        <AlertCircle size={14} />
                        <span>{errors.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      height: "46px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                      color: "#ffffff",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      border: "none",
                      cursor: submitting ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.55rem",
                      boxShadow: "0 10px 22px -4px rgba(99, 102, 241, 0.45)",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      opacity: submitting ? 0.75 : 1,
                      marginTop: "0.5rem",
                    }}
                  >
                    {submitting ? (
                      <>
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            border: "2px solid rgba(255,255,255,0.4)",
                            borderTopColor: "#fff",
                            animation: "spin 0.8s linear infinite",
                          }}
                        />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FAQ ACCORDION SECTION
          4-5 common questions with expand/collapse toggle using useState
      ══════════════════════════════════════════════════ */}
      <section style={{ width: "100%" }}>
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 3rem auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              color: "var(--primary)",
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "0.6rem",
            }}
          >
            <HelpCircle size={18} />
            <span>Frequently Asked Questions</span>
          </div>

          <h2
            style={{
              fontSize: "clamp(2rem, 3.2vw, 2.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text-main)",
              marginBottom: "0.85rem",
            }}
          >
            Got Questions? We Have Answers.
          </h2>

          <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.65 }}>
            Here are solutions to the most frequently asked inquiries from our prospective and enrolled students.
          </p>
        </div>

        {/* Accordion List */}
        <div
          style={{
            maxWidth: "840px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem",
          }}
        >
          {faqList.map((faq, index) => {
            const isOpen = openFaq === index;

            return (
              <div
                key={faq.question}
                className="card"
                style={{
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid",
                  borderColor: isOpen ? "var(--primary)" : "var(--border-color)",
                  padding: 0,
                  overflow: "hidden",
                  boxShadow: isOpen ? "var(--shadow-md)" : "var(--shadow-xs)",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Accordion Header / Toggle */}
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1.35rem 1.65rem",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.55rem",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.725rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        background: isOpen ? "var(--primary-light)" : "var(--bg-subtle)",
                        color: isOpen ? "var(--primary)" : "var(--text-muted)",
                      }}
                    >
                      {faq.category}
                    </span>
                    <span
                      style={{
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: isOpen ? "var(--primary)" : "var(--text-main)",
                        lineHeight: 1.4,
                      }}
                    >
                      {faq.question}
                    </span>
                  </div>

                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: isOpen ? "var(--primary-light)" : "var(--bg-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s ease, background 0.2s ease",
                    }}
                  >
                    <ChevronDown size={18} color={isOpen ? "var(--primary)" : "var(--text-muted)"} />
                  </div>
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div
                    style={{
                      padding: "0 1.65rem 1.5rem 1.65rem",
                      animation: "contactFadeUp 0.25s ease both",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.95rem",
                        lineHeight: 1.7,
                        color: "var(--text-secondary)",
                        margin: 0,
                        paddingTop: "0.5rem",
                        borderTop: "1px solid var(--border-color)",
                      }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
