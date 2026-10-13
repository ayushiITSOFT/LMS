import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Eye,
  Share2,
  Cookie,
  UserCheck,
  Mail,
  ChevronRight,
  ArrowUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Server,
  Globe,
  Database,
  Smartphone,
  Info
} from "lucide-react";

export function PrivacyPage() {
  const [activeSection, setActiveSection] = useState("information-we-collect");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive breakpoint detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 880);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll listener for sticky active state and back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      const sectionIds = [
        "information-we-collect",
        "how-we-use-information",
        "data-sharing-disclosure",
        "cookies-tracking",
        "data-security",
        "your-rights",
        "contact-us"
      ];

      const scrollPosition = window.scrollY + 160;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(id);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const sections = [
    { id: "information-we-collect", num: "01", title: "Information We Collect", icon: Eye },
    { id: "how-we-use-information", num: "02", title: "How We Use Your Information", icon: Database },
    { id: "data-sharing-disclosure", num: "03", title: "Data Sharing & Disclosure", icon: Share2 },
    { id: "cookies-tracking", num: "04", title: "Cookies & Tracking", icon: Cookie },
    { id: "data-security", num: "05", title: "Data Security", icon: Lock },
    { id: "your-rights", num: "06", title: "Your Rights", icon: UserCheck },
    { id: "contact-us", num: "07", title: "Contact Us", icon: Mail }
  ];

  return (
    <div
      style={{
        backgroundColor: "var(--bg-main)",
        minHeight: "100vh",
        color: "var(--text-main)",
        fontFamily: "var(--font-sans, 'Inter', sans-serif)"
      }}
    >
      {/* Hero Banner (Compact Indigo Gradient) */}
      <section
        style={{
          background: "linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #6366f1 100%)",
          color: "#ffffff",
          padding: "3.5rem 1.5rem 3rem",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)"
        }}
      >
        {/* Subtle Decorative Background Glow */}
        <div
          style={{
            position: "absolute",
            top: "-40%",
            right: "-10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%)",
            pointerEvents: "none"
          }}
        />

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            position: "relative",
            zIndex: 1
          }}
        >
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              color: "rgba(255, 255, 255, 0.8)",
              marginBottom: "1rem"
            }}
          >
            <Link
              to="/"
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                textDecoration: "none",
                fontWeight: 500,
                transition: "color 0.15s ease"
              }}
              onMouseEnter={(e) => (e.target.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(255, 255, 255, 0.9)")}
            >
              Home
            </Link>
            <ChevronRight size={14} style={{ opacity: 0.6 }} />
            <span style={{ color: "#ffffff", fontWeight: 600 }}>Privacy Policy</span>
          </nav>

          {/* Badge & Heading */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(8px)", padding: "0.35rem 0.85rem", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.02em", marginBottom: "1rem" }}>
            <ShieldCheck size={16} />
            <span>Privacy & Data Protection</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: "0.75rem",
              color: "#ffffff"
            }}
          >
            Privacy Policy
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              flexWrap: "wrap",
              fontSize: "0.925rem",
              color: "rgba(255, 255, 255, 0.85)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Clock size={16} />
              <span>Last updated: October 2025</span>
            </div>
            <span style={{ opacity: 0.4 }}>•</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckCircle2 size={16} />
              <span>GDPR & CCPA Compliant</span>
            </div>
            <span style={{ opacity: 0.4 }}>•</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Lock size={16} />
              <span>AES-256 Bit Encryption</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area with 2-Column Desktop Layout */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2.5rem 1.5rem 5rem"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "240px 1fr",
            gap: "2.5rem",
            alignItems: "start"
          }}
        >
          {/* Sticky Table of Contents Sidebar */}
          <aside
            style={{
              position: isMobile ? "static" : "sticky",
              top: "90px",
              alignSelf: "start",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem"
            }}
          >
            <nav
              aria-label="Table of contents"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem",
                boxShadow: "var(--shadow-sm)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: "0.75rem",
                  marginBottom: "0.75rem",
                  borderBottom: "1px solid var(--border-color)"
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--text-muted)"
                  }}
                >
                  Table of Contents
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--primary)",
                    backgroundColor: "var(--primary-light)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "var(--radius-full)"
                  }}
                >
                  7 Sections
                </span>
              </div>

              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem"
                }}
              >
                {sections.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(item.id)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.65rem",
                          padding: "0.55rem 0.65rem",
                          borderRadius: "var(--radius-md)",
                          fontSize: "0.85rem",
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? "var(--primary)" : "var(--text-secondary)",
                          backgroundColor: isActive ? "var(--primary-light)" : "transparent",
                          border: "none",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          outline: "none"
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = "var(--bg-subtle)";
                            e.currentTarget.style.color = "var(--text-main)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "var(--text-secondary)";
                          }
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: isActive ? "var(--primary)" : "var(--text-muted)",
                            minWidth: "1.25rem"
                          }}
                        >
                          {item.num}
                        </span>
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {item.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Support / Quick Help Box */}
            <div
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)" }}>
                <Info size={18} />
                <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Have Questions?</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                Our Data Protection Officer is ready to help you with privacy questions or export requests.
              </p>
              <a
                href="mailto:privacy@lmsplatform.com"
                className="btn btn-secondary"
                style={{
                  fontSize: "0.8rem",
                  padding: "0.5rem 0.75rem",
                  justifyContent: "center",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginTop: "0.25rem"
                }}
              >
                <Mail size={14} />
                <span>privacy@lmsplatform.com</span>
              </a>
              <div
                style={{
                  paddingTop: "0.5rem",
                  borderTop: "1px solid var(--border-color)",
                  fontSize: "0.8rem"
                }}
              >
                <Link
                  to="/terms"
                  style={{
                    color: "var(--primary)",
                    textDecoration: "none",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}
                >
                  <FileText size={14} />
                  <span>View Terms of Service &rarr;</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Legal Content Column */}
          <main
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "2.5rem 2.25rem",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            {/* Introductory Policy Preamble */}
            <div
              style={{
                backgroundColor: "var(--bg-subtle)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "1.5rem",
                marginBottom: "2.5rem"
              }}
            >
              <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--primary-light)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      margin: "0 0 0.4rem",
                      color: "var(--text-main)"
                    }}
                  >
                    Our Commitment to Your Privacy
                  </h2>
                  <p
                    style={{
                      fontSize: "0.925rem",
                      color: "var(--text-secondary)",
                      margin: 0,
                      lineHeight: 1.65
                    }}
                  >
                    This Privacy Policy details how LMS ("we," "our," or "the Platform") collects, utilizes, safeguards, and discloses personal information collected when you access our web application, explore course catalogs, submit assignments, take quizzes, and earn certified credentials. We believe education should be transparent, accessible, and privacy-first.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: Information We Collect */}
            <section id="information-we-collect" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    backgroundColor: "var(--primary-light)",
                    padding: "0.25rem 0.65rem",
                    borderRadius: "var(--radius-sm)"
                  }}
                >
                  Section 01
                </span>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    margin: 0,
                    color: "var(--text-main)"
                  }}
                >
                  Information We Collect
                </h2>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                We collect personal information in several ways to deliver high-quality educational experiences, maintain authenticated student sessions, and facilitate continuous learning. The types of data gathered depend upon how you interact with our platform:
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                  gap: "1rem",
                  marginBottom: "1.5rem"
                }}
              >
                <div
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    padding: "1.25rem",
                    backgroundColor: "var(--bg-main)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--primary)" }}>
                    <UserCheck size={18} />
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                      Account & Profile Data
                    </h3>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                    Full name, email address, secure salted password hashes, profile avatar, biography, social links, and role credentials (Student, Instructor, or Administrator).
                  </p>
                </div>

                <div
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    padding: "1.25rem",
                    backgroundColor: "var(--bg-main)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--primary)" }}>
                    <FileText size={18} />
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                      Academic & Learning Records
                    </h3>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                    Course enrollments, lecture playback completion ratios, quiz scores, assignment file submissions, code test runs, discussion board interactions, and verified certificates.
                  </p>
                </div>

                <div
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    padding: "1.25rem",
                    backgroundColor: "var(--bg-main)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--primary)" }}>
                    <Lock size={18} />
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                      Billing & Transaction Data
                    </h3>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                    Order history, invoice records, tax country, and tokenized payment identifiers. <em>Note: Raw payment card numbers are processed directly via PCI-DSS compliant providers and are never stored on our servers.</em>
                  </p>
                </div>

                <div
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    padding: "1.25rem",
                    backgroundColor: "var(--bg-main)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--primary)" }}>
                    <Smartphone size={18} />
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                      Technical & Device Data
                    </h3>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                    IP addresses, browser client identifiers, operating system versions, referral URLs, access timestamps, API response logs, and client-side performance telemetry.
                  </p>
                </div>
              </div>
            </section>

            <div style={{ borderBottom: "1px solid var(--border-color)", marginBottom: "3rem" }} />

            {/* Section 2: How We Use Your Information */}
            <section id="how-we-use-information" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    backgroundColor: "var(--primary-light)",
                    padding: "0.25rem 0.65rem",
                    borderRadius: "var(--radius-sm)"
                  }}
                >
                  Section 02
                </span>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    margin: 0,
                    color: "var(--text-main)"
                  }}
                >
                  How We Use Your Information
                </h2>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                We use the data we collect solely for legitimate educational, operational, and security purposes. Specifically, we rely on your data to:
              </p>

              <ul
                style={{
                  margin: "0 0 1.5rem",
                  paddingLeft: "1.25rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.8,
                  fontSize: "0.925rem"
                }}
              >
                <li>
                  <strong style={{ color: "var(--text-main)" }}>Facilitate Learning & Course Delivery:</strong> Provide access to course curricula, stream lecture videos, execute coding assignments, and score interactive quizzes.
                </li>
                <li>
                  <strong style={{ color: "var(--text-main)" }}>Issue Verifiable Certificates:</strong> Generate tamper-proof completion certificates containing unique verification UUIDs accessible publicly via verification routes.
                </li>
                <li>
                  <strong style={{ color: "var(--text-main)" }}>Personalize Educational Progress:</strong> Track chapter completions, remember playback timestamps, and suggest relevant modules tailored to your career objectives.
                </li>
                <li>
                  <strong style={{ color: "var(--text-main)" }}>Process Transactions & Enrollments:</strong> Confirm course purchases, generate tax invoices, process refunds, and maintain student enrollment ledgers.
                </li>
                <li>
                  <strong style={{ color: "var(--text-main)" }}>Platform Analytics & Reliability:</strong> Analyze system latency, troubleshoot bugs, benchmark video player performance, and safeguard against DDoS or brute-force attacks.
                </li>
                <li>
                  <strong style={{ color: "var(--text-main)" }}>Critical Communications:</strong> Send vital transactional emails such as password resets, course announcements, grade postings, and security alerts.
                </li>
              </ul>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  backgroundColor: "var(--primary-light)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem 1.25rem",
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)"
                }}
              >
                <CheckCircle2 size={20} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span>
                  <strong>Strict Non-Sale Guarantee:</strong> We never sell, lease, or monetize your personal information or academic submissions to third-party marketing brokers.
                </span>
              </div>
            </section>

            <div style={{ borderBottom: "1px solid var(--border-color)", marginBottom: "3rem" }} />

            {/* Section 3: Data Sharing & Disclosure */}
            <section id="data-sharing-disclosure" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    backgroundColor: "var(--primary-light)",
                    padding: "0.25rem 0.65rem",
                    borderRadius: "var(--radius-sm)"
                  }}
                >
                  Section 03
                </span>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    margin: 0,
                    color: "var(--text-main)"
                  }}
                >
                  Data Sharing & Disclosure
                </h2>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                We treat your data with high confidentiality. Information is only disclosed in defined situations:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                <div
                  style={{
                    padding: "1rem 1.25rem",
                    backgroundColor: "var(--bg-main)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)"
                  }}
                >
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.35rem", color: "var(--text-main)" }}>
                    1. Course Instructors & Teaching Assistants
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                    Instructors of courses you enroll in can access your display name, course progress, quiz results, and assignment submissions to grade assignments and provide academic guidance.
                  </p>
                </div>

                <div
                  style={{
                    padding: "1rem 1.25rem",
                    backgroundColor: "var(--bg-main)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)"
                  }}
                >
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.35rem", color: "var(--text-main)" }}>
                    2. Infrastructure & Service Providers
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                    We partner with trusted cloud hosting providers (e.g., AWS), video delivery networks, email delivery relays, and payment processors who process data on our behalf under strict Data Processing Agreements (DPAs).
                  </p>
                </div>

                <div
                  style={{
                    padding: "1rem 1.25rem",
                    backgroundColor: "var(--bg-main)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)"
                  }}
                >
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.35rem", color: "var(--text-main)" }}>
                    3. Legal & Regulatory Compliance
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                    We may disclose data if required by enforceable subpoena, legal process, or governmental request, or to protect the safety, rights, and property of our users and the platform.
                  </p>
                </div>
              </div>
            </section>

            <div style={{ borderBottom: "1px solid var(--border-color)", marginBottom: "3rem" }} />

            {/* Section 4: Cookies & Tracking */}
            <section id="cookies-tracking" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    backgroundColor: "var(--primary-light)",
                    padding: "0.25rem 0.65rem",
                    borderRadius: "var(--radius-sm)"
                  }}
                >
                  Section 04
                </span>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    margin: 0,
                    color: "var(--text-main)"
                  }}
                >
                  Cookies & Tracking
                </h2>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                We use browser cookies, session storage, and local storage to keep you logged in, save your interface preferences, and optimize system speed.
              </p>

              <div
                style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  marginBottom: "1.5rem"
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr",
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--bg-subtle)",
                    borderBottom: "1px solid var(--border-color)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-muted)"
                  }}
                >
                  <span>Cookie Type</span>
                  <span>Purpose & Retention</span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "140px 1fr",
                    padding: "0.9rem 1rem",
                    borderBottom: "1px solid var(--border-color)",
                    fontSize: "0.875rem",
                    gap: isMobile ? "0.35rem" : "1rem",
                    alignItems: "center"
                  }}
                >
                  <strong style={{ color: "var(--text-main)" }}>Strictly Essential</strong>
                  <span style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    Maintains user authentication tokens (JWT), CSRF security protection, and prevents session hijacking. Cannot be disabled.
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "140px 1fr",
                    padding: "0.9rem 1rem",
                    borderBottom: "1px solid var(--border-color)",
                    fontSize: "0.875rem",
                    gap: isMobile ? "0.35rem" : "1rem",
                    alignItems: "center"
                  }}
                >
                  <strong style={{ color: "var(--text-main)" }}>Preferences</strong>
                  <span style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    Preserves user theme selection (light or dark mode), video playback speed rates, audio volume, and sidebar collapse states.
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "140px 1fr",
                    padding: "0.9rem 1rem",
                    fontSize: "0.875rem",
                    gap: isMobile ? "0.35rem" : "1rem",
                    alignItems: "center"
                  }}
                >
                  <strong style={{ color: "var(--text-main)" }}>Performance</strong>
                  <span style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    Measures aggregated page render times and API errors to ensure maximum platform responsiveness.
                  </span>
                </div>
              </div>

              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                You can configure your browser to refuse all or some cookies. However, disabling essential cookies will prevent authentication and course streaming from functioning correctly.
              </p>
            </section>

            <div style={{ borderBottom: "1px solid var(--border-color)", marginBottom: "3rem" }} />

            {/* Section 5: Data Security */}
            <section id="data-security" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    backgroundColor: "var(--primary-light)",
                    padding: "0.25rem 0.65rem",
                    borderRadius: "var(--radius-sm)"
                  }}
                >
                  Section 05
                </span>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    margin: 0,
                    color: "var(--text-main)"
                  }}
                >
                  Data Security
                </h2>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                We implement enterprise-grade technical and organizational safeguards designed to protect your personal data against unauthorized access, loss, or alteration:
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                  gap: "1rem",
                  marginBottom: "1.5rem"
                }}
              >
                <div
                  style={{
                    padding: "1.25rem",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-main)",
                    border: "1px solid var(--border-color)"
                  }}
                >
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.4rem", color: "var(--text-main)" }}>
                    End-to-End Encryption
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                    All data in transit is encrypted using TLS 1.3 cryptographic protocols. Sensitive customer records in our databases are protected with AES-256 encryption at rest.
                  </p>
                </div>

                <div
                  style={{
                    padding: "1.25rem",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-main)",
                    border: "1px solid var(--border-color)"
                  }}
                >
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.4rem", color: "var(--text-main)" }}>
                    Granular Access Controls
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                    Role-Based Access Control (RBAC) ensures employees only access data strictly required to resolve customer inquiries, governed by Multi-Factor Authentication.
                  </p>
                </div>

                <div
                  style={{
                    padding: "1.25rem",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-main)",
                    border: "1px solid var(--border-color)"
                  }}
                >
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.4rem", color: "var(--text-main)" }}>
                    Automated Redundant Backups
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                    Student progress, course completion logs, and submissions are backed up daily across geodistributed data centers to guarantee disaster recovery resilience.
                  </p>
                </div>

                <div
                  style={{
                    padding: "1.25rem",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-main)",
                    border: "1px solid var(--border-color)"
                  }}
                >
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.4rem", color: "var(--text-main)" }}>
                    Vulnerability Assessments
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                    Our engineering team conducts recurring vulnerability scans and penetration assessments to identify and patch potential software security loopholes.
                  </p>
                </div>
              </div>
            </section>

            <div style={{ borderBottom: "1px solid var(--border-color)", marginBottom: "3rem" }} />

            {/* Section 6: Your Rights */}
            <section id="your-rights" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    backgroundColor: "var(--primary-light)",
                    padding: "0.25rem 0.65rem",
                    borderRadius: "var(--radius-sm)"
                  }}
                >
                  Section 06
                </span>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    margin: 0,
                    color: "var(--text-main)"
                  }}
                >
                  Your Rights
                </h2>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                Under international data protection regulations (including GDPR, CCPA/CPRA, and UK GDPR), you hold distinct statutory rights regarding your personal information:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <CheckCircle2 size={18} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "0.2rem" }} />
                  <div>
                    <strong style={{ color: "var(--text-main)", fontSize: "0.925rem" }}>Right to Access & Portability:</strong>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", display: "block" }}>
                      You have the right to request a machine-readable copy of your profile data, course completion transcripts, and certificate records.
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <CheckCircle2 size={18} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "0.2rem" }} />
                  <div>
                    <strong style={{ color: "var(--text-main)", fontSize: "0.925rem" }}>Right to Rectification:</strong>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", display: "block" }}>
                      You can update inaccurate or outdated profile information at any moment via your account Settings and Profile portal.
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <CheckCircle2 size={18} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "0.2rem" }} />
                  <div>
                    <strong style={{ color: "var(--text-main)", fontSize: "0.925rem" }}>Right to Erasure ("Right to be Forgotten"):</strong>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", display: "block" }}>
                      You can request complete deletion of your account and related learning history, subject only to statutory tax record retention laws.
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <CheckCircle2 size={18} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "0.2rem" }} />
                  <div>
                    <strong style={{ color: "var(--text-main)", fontSize: "0.925rem" }}>Right to Opt-Out of Communications:</strong>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", display: "block" }}>
                      You can unsubscribe from non-essential promotional emails at any time using the unsubscribe link found at the footer of each newsletter.
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <div style={{ borderBottom: "1px solid var(--border-color)", marginBottom: "3rem" }} />

            {/* Section 7: Contact Us */}
            <section id="contact-us" style={{ scrollMarginTop: "100px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    backgroundColor: "var(--primary-light)",
                    padding: "0.25rem 0.65rem",
                    borderRadius: "var(--radius-sm)"
                  }}
                >
                  Section 07
                </span>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    margin: 0,
                    color: "var(--text-main)"
                  }}
                >
                  Contact Us
                </h2>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                If you have questions, complaints, or wish to exercise your data subject rights, please reach out directly to our Data Protection Office:
              </p>

              <div
                style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.5rem",
                  backgroundColor: "var(--bg-main)",
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  gap: "1.5rem"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Mail size={18} style={{ color: "var(--primary)" }} />
                    <strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>
                      Data Protection Officer (DPO)
                    </strong>
                  </div>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    Email:{" "}
                    <a
                      href="mailto:privacy@lmsplatform.com"
                      style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
                    >
                      privacy@lmsplatform.com
                    </a>
                  </span>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    Support Portal:{" "}
                    <a
                      href="mailto:support@lmsplatform.com"
                      style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
                    >
                      support@lmsplatform.com
                    </a>
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    Response commitment: We resolve verified privacy requests within thirty (30) business days.
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: "0.5rem",
                    borderLeft: isMobile ? "none" : "1px solid var(--border-color)",
                    paddingLeft: isMobile ? 0 : "1.5rem",
                    paddingTop: isMobile ? "1rem" : 0,
                    borderTop: isMobile ? "1px solid var(--border-color)" : "none"
                  }}
                >
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Corporate Headquarters
                  </span>
                  <address
                    style={{
                      fontStyle: "normal",
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5
                    }}
                  >
                    LMS Global Learning, Inc.<br />
                    100 Innovation Way, Suite 400<br />
                    San Francisco, CA 94107
                  </address>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            width: "44px",
            height: "44px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--primary)",
            color: "#ffffff",
            border: "none",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            zIndex: 99
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "var(--shadow-glow)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-lg)";
          }}
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
