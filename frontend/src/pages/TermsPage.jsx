import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Scale,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  BookOpen,
  UserCheck,
  Lock,
  ChevronRight,
  ArrowUp,
  Mail,
  Slash,
  AlertCircle,
  HelpCircle,
  Gavel,
  ShieldAlert
} from "lucide-react";

export function TermsPage() {
  const [activeSection, setActiveSection] = useState("acceptance-of-terms");
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

  // Track scroll position for sticky sidebar active states and floating top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      const sectionIds = [
        "acceptance-of-terms",
        "use-of-the-platform",
        "user-accounts",
        "course-enrollment-payments",
        "intellectual-property",
        "prohibited-conduct",
        "termination",
        "limitation-of-liability",
        "governing-law",
        "contact-information"
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
    { id: "acceptance-of-terms", num: "01", title: "Acceptance of Terms", icon: Scale },
    { id: "use-of-the-platform", num: "02", title: "Use of the Platform", icon: BookOpen },
    { id: "user-accounts", num: "03", title: "User Accounts", icon: UserCheck },
    { id: "course-enrollment-payments", num: "04", title: "Course Enrollment & Payments", icon: CreditCard },
    { id: "intellectual-property", num: "05", title: "Intellectual Property", icon: ShieldCheck },
    { id: "prohibited-conduct", num: "06", title: "Prohibited Conduct", icon: ShieldAlert },
    { id: "termination", num: "07", title: "Termination", icon: Slash },
    { id: "limitation-of-liability", num: "08", title: "Limitation of Liability", icon: AlertTriangle },
    { id: "governing-law", num: "09", title: "Governing Law", icon: Gavel },
    { id: "contact-information", num: "10", title: "Contact Information", icon: Mail }
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
      {/* Hero Banner (Compact Indigo/Purple Gradient) */}
      <section
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #7c3aed 100%)",
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
            top: "-30%",
            right: "-10%",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, rgba(255, 255, 255, 0) 70%)",
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
            <span style={{ color: "#ffffff", fontWeight: 600 }}>Terms of Service</span>
          </nav>

          {/* Badge & Heading */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(8px)", padding: "0.35rem 0.85rem", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.02em", marginBottom: "1rem" }}>
            <FileText size={16} />
            <span>Platform Agreement</span>
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
            Terms of Service
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
              <span>Effective: October 2025</span>
            </div>
            <span style={{ opacity: 0.4 }}>•</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckCircle2 size={16} />
              <span>Binding Legal Agreement</span>
            </div>
            <span style={{ opacity: 0.4 }}>•</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Scale size={16} />
              <span>Version 2.4</span>
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
                  10 Sections
                </span>
              </div>

              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem"
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
                          gap: "0.6rem",
                          padding: "0.5rem 0.6rem",
                          borderRadius: "var(--radius-md)",
                          fontSize: "0.825rem",
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

            {/* Quick Helper Card */}
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
                <Scale size={18} />
                <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Legal Advisory</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                Questions concerning course licensing, refunds, or institutional contracts? Contact legal counsel.
              </p>
              <a
                href="mailto:legal@lmsplatform.com"
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
                <span>legal@lmsplatform.com</span>
              </a>
              <div
                style={{
                  paddingTop: "0.5rem",
                  borderTop: "1px solid var(--border-color)",
                  fontSize: "0.8rem"
                }}
              >
                <Link
                  to="/privacy"
                  style={{
                    color: "var(--primary)",
                    textDecoration: "none",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>Review Privacy Policy &rarr;</span>
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
            {/* Legal Notice Banner */}
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
                    backgroundColor: "rgba(99, 102, 241, 0.12)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <Scale size={20} />
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
                    Important Legal Agreement
                  </h2>
                  <p
                    style={{
                      fontSize: "0.925rem",
                      color: "var(--text-secondary)",
                      margin: 0,
                      lineHeight: 1.65
                    }}
                  >
                    These Terms of Service constitute a legally binding agreement between you ("User," "Student," or "Instructor") and LMS ("we," "us," or "the Platform"). By accessing the website, registering an account, purchasing courses, or submitting course material, you agree to comply with and be bound by all provisions stated below.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: Acceptance of Terms */}
            <section id="acceptance-of-terms" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
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
                  Acceptance of Terms
                </h2>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>
                By creating an account, browsing catalog offerings, or enrolling in any free or paid courses, you affirm that:
              </p>

              <ul
                style={{
                  margin: "0 0 1.25rem",
                  paddingLeft: "1.25rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.8,
                  fontSize: "0.925rem"
                }}
              >
                <li>You are at least 13 years of age (or the minimum legal age to provide digital consent in your jurisdiction). If you are under the age of majority in your region, you may only access the platform with direct consent and supervision from a parent or legal guardian.</li>
                <li>You possess the legal capacity and authority to enter into these binding terms.</li>
                <li>You agree to comply with all applicable local, national, and international laws, treaties, and educational regulations.</li>
              </ul>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                If you do not agree to any part of these terms, you must immediately terminate use of the platform and delete your account.
              </p>
            </section>

            <div style={{ borderBottom: "1px solid var(--border-color)", marginBottom: "3rem" }} />

            {/* Section 2: Use of the Platform */}
            <section id="use-of-the-platform" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
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
                  Use of the Platform
                </h2>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                LMS grants you a limited, personal, non-exclusive, non-transferable, and revocable license to access and view course content for non-commercial, personal educational purposes.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                  gap: "1rem",
                  marginBottom: "1.25rem"
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
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.35rem", color: "var(--text-main)" }}>
                    Platform Uptime & Upgrades
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                    While we strive for 99.9% service uptime, uninterrupted access cannot be guaranteed. Scheduled maintenance windows, hardware migrations, and software updates may temporarily disrupt service.
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
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.35rem", color: "var(--text-main)" }}>
                    Curriculum Updates
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                    Instructors reserve the right to revise syllabus content, update recorded lectures, replace outdated quiz banks, and retire superseded curriculum without prior written notice.
                  </p>
                </div>
              </div>
            </section>

            <div style={{ borderBottom: "1px solid var(--border-color)", marginBottom: "3rem" }} />

            {/* Section 3: User Accounts */}
            <section id="user-accounts" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
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
                  User Accounts
                </h2>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                To access course libraries, track curriculum progression, and obtain certificates, you must register for an account. You agree to provide accurate, current, and complete registration credentials.
              </p>

              <div
                style={{
                  backgroundColor: "var(--bg-main)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  marginBottom: "1rem"
                }}
              >
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.5rem", color: "var(--text-main)" }}>
                  Account Security & Non-Sharing Policy
                </h3>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.25rem",
                    color: "var(--text-muted)",
                    fontSize: "0.875rem",
                    lineHeight: 1.7
                  }}
                >
                  <li><strong>Single-User License:</strong> Accounts are strictly non-transferable. You may not share your login credentials, API keys, or session tokens with any other individual or entity.</li>
                  <li><strong>Credential Safeguards:</strong> You are responsible for preserving the confidentiality of your password and for all activities that occur under your authenticated account.</li>
                  <li><strong>Immediate Notification:</strong> If you suspect any breach of security or unauthorized access to your account, you must contact our security team immediately at <em>security@lmsplatform.com</em>.</li>
                </ul>
              </div>
            </section>

            <div style={{ borderBottom: "1px solid var(--border-color)", marginBottom: "3rem" }} />

            {/* Section 4: Course Enrollment & Payments */}
            <section id="course-enrollment-payments" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
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
                  Course Enrollment & Payments
                </h2>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                All course prices, promotions, and subscription tiers are listed on the platform in designated currencies and are subject to change prior to order completion.
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
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.35rem", color: "var(--text-main)" }}>
                    Lifetime Access Scope
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                    Purchasing an individual on-demand course generally grants lifetime access to that course's digital materials for as long as the platform operates and the course remains published by the instructor.
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
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.35rem", color: "var(--text-main)" }}>
                    30-Day Money-Back Guarantee
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                    If you are unsatisfied with an eligible course, you may request a refund within 30 days of purchase, provided you have watched less than 25% of the video content and have not claimed a completion certificate.
                  </p>
                </div>
              </div>

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
                <CreditCard size={20} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span>
                  <strong>Payment Processors:</strong> We utilize certified payment processors (e.g., Stripe, PayPal). By initiating checkout, you authorize our processors to bill your designated payment method for all listed charges, applicable taxes, and currency exchange fees.
                </span>
              </div>
            </section>

            <div style={{ borderBottom: "1px solid var(--border-color)", marginBottom: "3rem" }} />

            {/* Section 5: Intellectual Property */}
            <section id="intellectual-property" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
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
                  Intellectual Property
                </h2>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                All course lectures, presentation slides, project starter repositories, interactive quizzes, software source code, graphics, branding, and audiovisual streams are the proprietary intellectual property of LMS and its verified course authors, protected under global copyright, trademark, and trade secret laws.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <CheckCircle2 size={18} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "0.2rem" }} />
                  <div>
                    <strong style={{ color: "var(--text-main)", fontSize: "0.925rem" }}>Personal Educational Use Only:</strong>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", display: "block" }}>
                      You may view streaming media solely on your authorized web browser. You may not broadcast, publicly display, mirror, duplicate, or syndicate any course material.
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <CheckCircle2 size={18} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "0.2rem" }} />
                  <div>
                    <strong style={{ color: "var(--text-main)", fontSize: "0.925rem" }}>Student-Submitted Content:</strong>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", display: "block" }}>
                      You retain intellectual property ownership of the homework, code files, and projects you author. However, you grant LMS a non-exclusive license to host, evaluate, and test your submissions for assessment and grading.
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <CheckCircle2 size={18} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "0.2rem" }} />
                  <div>
                    <strong style={{ color: "var(--text-main)", fontSize: "0.925rem" }}>DMCA & Takedown Notices:</strong>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", display: "block" }}>
                      We respect copyright holders. If you believe your copyrighted work has been infringed, please forward a formal DMCA notification to <em>copyright@lmsplatform.com</em>.
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <div style={{ borderBottom: "1px solid var(--border-color)", marginBottom: "3rem" }} />

            {/* Section 6: Prohibited Conduct */}
            <section id="prohibited-conduct" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
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
                  Prohibited Conduct
                </h2>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                To preserve academic rigor, student trust, and system stability, you expressly agree never to engage in any of the following prohibited behaviors:
              </p>

              <div
                style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  backgroundColor: "var(--bg-main)",
                  marginBottom: "1.5rem"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <ShieldAlert size={18} style={{ color: "var(--danger, #ef4444)", flexShrink: 0, marginTop: "0.2rem" }} />
                    <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      <strong style={{ color: "var(--text-main)" }}>Piracy & Unauthorized Redistribution:</strong> Capturing, downloading DRM-protected video streams, screen recording, or uploading course content to external torrent or cloud repositories.
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <ShieldAlert size={18} style={{ color: "var(--danger, #ef4444)", flexShrink: 0, marginTop: "0.2rem" }} />
                    <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      <strong style={{ color: "var(--text-main)" }}>Academic Dishonesty:</strong> Submitting plagiarized solutions, sharing quiz answer keys, impersonating another student on graded assignments, or falsifying certificate verifications.
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <ShieldAlert size={18} style={{ color: "var(--danger, #ef4444)", flexShrink: 0, marginTop: "0.2rem" }} />
                    <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      <strong style={{ color: "var(--text-main)" }}>System Tampering & Reverse Engineering:</strong> Scraping platform catalogs via bots, bypassing authentication controls, attempting SQL injection, or running Denial of Service exploits.
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <ShieldAlert size={18} style={{ color: "var(--danger, #ef4444)", flexShrink: 0, marginTop: "0.2rem" }} />
                    <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      <strong style={{ color: "var(--text-main)" }}>Harassment & Abuse:</strong> Posting defamatory remarks, hate speech, spamming discussion channels, or harassing instructors or fellow peers.
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <div style={{ borderBottom: "1px solid var(--border-color)", marginBottom: "3rem" }} />

            {/* Section 7: Termination */}
            <section id="termination" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
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
                  Termination
                </h2>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>
                You may terminate your account at any time by navigating to Account Settings and requesting account closure.
              </p>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>
                LMS reserves the right to suspend or permanently deactivate your account, revoke access to courses, and cancel pending certificate verifications immediately without refund if you breach any term herein or engage in fraudulent activity.
              </p>

              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                Provisions regarding intellectual property ownership, limitation of liability, indemnification, and governing dispute resolution survive the termination of these terms.
              </p>
            </section>

            <div style={{ borderBottom: "1px solid var(--border-color)", marginBottom: "3rem" }} />

            {/* Section 8: Limitation of Liability */}
            <section id="limitation-of-liability" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
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
                  Section 08
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
                  Limitation of Liability
                </h2>
              </div>

              <div
                style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  backgroundColor: "var(--bg-main)",
                  marginBottom: "1.25rem"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--warning, #f59e0b)" }}>
                  <AlertTriangle size={18} />
                  <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>"As-Is" Platform Warranty Disclaimer</strong>
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.65 }}>
                  The platform, courses, quizzes, and associated learning materials are provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied, including fitness for a particular purpose or non-infringement. We do not warrant that course completion guarantees employment or specific compensation.
                </p>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                To the maximum extent permissible by law, LMS and its affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages arising out of your inability to access course material. In all events, our total cumulative liability shall not exceed the greater of one hundred United States dollars ($100 USD) or the aggregate fees paid by you to LMS in the preceding 12 months.
              </p>
            </section>

            <div style={{ borderBottom: "1px solid var(--border-color)", marginBottom: "3rem" }} />

            {/* Section 9: Governing Law */}
            <section id="governing-law" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
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
                  Section 09
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
                  Governing Law & Dispute Resolution
                </h2>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>
                These Terms shall be interpreted and governed in accordance with the laws of the State of California, United States, without regard to conflict of law principles.
              </p>

              <div
                style={{
                  padding: "1.25rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-main)",
                  border: "1px solid var(--border-color)",
                  marginBottom: "1rem"
                }}
              >
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.35rem", color: "var(--text-main)" }}>
                  Informal Resolution & Binding Individual Arbitration
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.65 }}>
                  Prior to filing any formal legal action, you agree to engage in informal dispute negotiation with LMS for a period of thirty (30) days by submitting notice to <em>legal@lmsplatform.com</em>. Unresolved disputes shall be resolved through binding individual arbitration, and you waive any right to participate in a class-action lawsuit.
                </p>
              </div>
            </section>

            <div style={{ borderBottom: "1px solid var(--border-color)", marginBottom: "3rem" }} />

            {/* Section 10: Contact Information */}
            <section id="contact-information" style={{ scrollMarginTop: "100px" }}>
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
                  Section 10
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
                  Contact Information
                </h2>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                If you have inquiries regarding these Terms of Service or requires legal clarifications, please contact our Legal Affairs Department:
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
                    <Scale size={18} style={{ color: "var(--primary)" }} />
                    <strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>
                      Legal Affairs & Compliance
                    </strong>
                  </div>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    Email:{" "}
                    <a
                      href="mailto:legal@lmsplatform.com"
                      style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
                    >
                      legal@lmsplatform.com
                    </a>
                  </span>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    Support Center:{" "}
                    <a
                      href="mailto:support@lmsplatform.com"
                      style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
                    >
                      support@lmsplatform.com
                    </a>
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    Official correspondence hours: Monday – Friday, 9:00 AM – 5:00 PM PST.
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
                    Registered Address
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
