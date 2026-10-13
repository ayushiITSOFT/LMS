import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Award,
  Globe,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Rocket,
  Compass,
  HeartHandshake,
  TrendingUp,
  Clock,
  Layers,
  ChevronRight,
} from "lucide-react";

export function AboutPage() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredValue, setHoveredValue] = useState(null);

  const stats = [
    {
      id: "learners",
      icon: Users,
      value: "10K+",
      label: "Active Learners",
      sublabel: "Across all disciplines",
      gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      glow: "rgba(99, 102, 241, 0.2)",
    },
    {
      id: "courses",
      icon: BookOpen,
      value: "500+",
      label: "Expert Courses",
      sublabel: "In tech, design & business",
      gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      glow: "rgba(6, 182, 212, 0.2)",
    },
    {
      id: "completion",
      icon: CheckCircle2,
      value: "98%",
      label: "Completion Rate",
      sublabel: "Industry-leading outcomes",
      gradient: "linear-gradient(135deg, #10b981, #059669)",
      glow: "rgba(16, 185, 129, 0.2)",
    },
    {
      id: "countries",
      icon: Globe,
      value: "50+",
      label: "Countries Reached",
      sublabel: "Vibrant global community",
      gradient: "linear-gradient(135deg, #f59e0b, #d946ef)",
      glow: "rgba(245, 158, 11, 0.2)",
    },
  ];

  const values = [
    {
      id: "expert",
      title: "Expert-Led Learning",
      description:
        "Every course is authored and taught by practicing engineers, designers, and industry veterans who bring battle-tested patterns directly into your curriculum.",
      icon: GraduationCap,
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      highlights: ["Real-world project portfolios", "Syllabus updated every quarter", "Direct Q&A mentoring"],
    },
    {
      id: "accessible",
      title: "Accessible Education",
      description:
        "Knowledge should never be gated. We provide affordable, self-paced, and flexible learning pathways engineered for anyone, anywhere, regardless of schedule or background.",
      icon: Compass,
      gradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
      highlights: ["Zero time zone constraints", "Lifetime access to purchased lessons", "Optimized mobile & desktop"],
    },
    {
      id: "credentials",
      title: "Verified Credentials",
      description:
        "Earn cryptographically verifiable credentials upon mastery. Each certificate features a unique verification identifier, ready to share on LinkedIn or with hiring teams.",
      icon: ShieldCheck,
      gradient: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
      highlights: ["Public verification portal", "Tamper-proof certificate IDs", "Instant 1-click LinkedIn export"],
    },
  ];

  const timelineMilestones = [
    {
      year: "2022",
      badge: "Inception",
      title: "LMS Founded",
      description:
        "LMS was born from a simple yet ambitious thesis: democratizing master-level technology and software education through interactive, web-first instruction.",
      icon: Rocket,
      color: "#6366f1",
    },
    {
      year: "2023",
      badge: "Community Growth",
      title: "First 1,000 Learners",
      description:
        "Welcomed our first 1,000 active students across 15 countries. Launched interactive quiz engines and code challenges to validate conceptual mastery.",
      icon: Users,
      color: "#06b6d4",
    },
    {
      year: "2024",
      badge: "Catalog Scale",
      title: "500+ Comprehensive Courses",
      description:
        "Scaled our curriculum library across Full-Stack Development, Machine Learning, Cloud Architecture, and Product Design, partnering with 80+ industry authors.",
      icon: BookOpen,
      color: "#8b5cf6",
    },
    {
      year: "2025",
      badge: "Global Scale",
      title: "10K+ Learners & Enterprise Readiness",
      description:
        "Surpassed 10,000 active learners across 50+ countries. Introduced cryptographically signed certificates, enterprise analytics, and live discussion hubs.",
      icon: Globe,
      color: "#10b981",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4.5rem", width: "100%" }}>
      {/* Dynamic Keyframes & Responsive Helpers */}
      <style>{`
        @keyframes aboutBlobA {
          0%, 100% { transform: scale(1) translate(0px, 0px); }
          50% { transform: scale(1.15) translate(28px, -22px); }
        }
        @keyframes aboutBlobB {
          0%, 100% { transform: scale(1) translate(0px, 0px); }
          50% { transform: scale(1.12) translate(-24px, 26px); }
        }
        @keyframes aboutBlobC {
          0%, 100% { transform: scale(1) translate(0px, 0px); }
          50% { transform: scale(1.2) translate(18px, 15px); }
        }
        @keyframes aboutFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .about-hero-badge {
          animation: aboutFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .about-hero-title {
          animation: aboutFadeUp 0.6s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .about-hero-sub {
          animation: aboutFadeUp 0.6s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .about-hero-actions {
          animation: aboutFadeUp 0.6s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* Responsive Breakpoints */
        @media (max-width: 992px) {
          .about-mission-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
          .about-values-grid {
            grid-template-columns: 1fr !important;
          }
          .about-timeline-wrapper {
            padding-left: 0.5rem !important;
          }
        }
        @media (max-width: 640px) {
          .about-hero-section {
            padding: 3.5rem 1.5rem !important;
            min-height: auto !important;
          }
          .about-stat-grid {
            grid-template-columns: 1fr !important;
          }
          .about-cta-card {
            padding: 2.5rem 1.5rem !important;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════
          HERO SECTION (Full width inside view, no scrollbars)
          Dark indigo/purple gradient (same as login left panel)
      ══════════════════════════════════════════════════ */}
      <section
        className="about-hero-section"
        style={{
          position: "relative",
          width: "100%",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden", // Guarantee NO scrollbar
          background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 45%, #4c1d95 100%)",
          padding: "5rem 3.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          boxShadow: "0 20px 45px -15px rgba(15, 23, 42, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Animated Background Blobs */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-60px",
            width: "440px",
            height: "440px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)",
            animation: "aboutBlobA 9s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            right: "-80px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(217,70,239,0.3) 0%, transparent 70%)",
            animation: "aboutBlobB 11s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "20%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)",
            animation: "aboutBlobC 13s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        {/* Grid Overlay matching login panel */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            pointerEvents: "none",
          }}
        />

        {/* Hero Content */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: "780px" }}>
          {/* Badge */}
          <div
            className="about-hero-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.55rem",
              padding: "0.4rem 1.1rem",
              borderRadius: "var(--radius-full)",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(8px)",
              color: "#c7d2fe",
              fontSize: "0.825rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              marginBottom: "1.5rem",
            }}
          >
            <Sparkles size={15} color="#e879f9" />
            <span>SHAPING THE FUTURE OF DIGITAL LEARNING</span>
          </div>

          {/* Headline */}
          <h1
            className="about-hero-title"
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-0.04em",
              color: "#ffffff",
              marginBottom: "1.25rem",
            }}
          >
            About LMS: Education{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(90deg, #a5b4fc 0%, #e879f9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Without Boundaries.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="about-hero-sub"
            style={{
              color: "rgba(255, 255, 255, 0.78)",
              fontSize: "clamp(1rem, 2vw, 1.15rem)",
              lineHeight: 1.7,
              marginBottom: "2.25rem",
              maxWidth: "680px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            We are on a global mission to equip modern learners with in-demand technical, design, and
            problem-solving capabilities through expert-authored courses, hands-on projects, and verifiable credentials.
          </p>

          {/* Call to Actions */}
          <div
            className="about-hero-actions"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/courses"
              className="btn btn-primary"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                border: "none",
                padding: "0.8rem 1.6rem",
                borderRadius: "var(--radius-md)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.95rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.5)",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <span>Explore Course Catalog</span>
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/contact"
              style={{
                padding: "0.8rem 1.6rem",
                borderRadius: "var(--radius-md)",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.95rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <span>Get in Touch</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          MISSION SECTION
          2-column grid.
          Left: large headline "Our Mission", body text.
          Right: 2x2 stat grid (10K+ Learners, 500+ Courses, 98% Completion, 50+ Countries).
      ══════════════════════════════════════════════════ */}
      <section style={{ width: "100%" }}>
        <div
          className="about-mission-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "3.5rem",
            alignItems: "center",
          }}
        >
          {/* Left Column: Mission Narrative */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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
              }}
            >
              <HeartHandshake size={18} />
              <span>Our Purpose & Vision</span>
            </div>

            <h2
              style={{
                fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                fontWeight: 800,
                lineHeight: 1.2,
                color: "var(--text-main)",
                letterSpacing: "-0.03em",
              }}
            >
              Our Mission: Democratizing Education for Every Curious Mind.
            </h2>

            <p
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.75,
                color: "var(--text-secondary)",
              }}
            >
              We founded LMS on a single uncompromising belief: high-caliber, career-defining education should never
              be constrained by financial boundaries, geographic borders, or rigid schedules.
            </p>

            <p
              style={{
                fontSize: "0.975rem",
                lineHeight: 1.7,
                color: "var(--text-muted)",
              }}
            >
              Traditional classrooms often move too slowly for fast-evolving industries like AI, Software Engineering,
              and Product Design. LMS connects ambitious learners directly with active industry practitioners who build
              real systems daily. Through structured modules, real coding tasks, and cryptographically verified certifications,
              we help students bridge the gap between classroom theory and enterprise reality.
            </p>

            {/* Feature Checkpoints */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.85rem",
                marginTop: "0.75rem",
                paddingTop: "1rem",
                borderTop: "1px solid var(--border-color)",
              }}
            >
              {[
                "100% Self-Paced Schedules",
                "Hands-on Project Portfolios",
                "Cryptographic Certificate IDs",
                "Direct Instructor Q&A Support",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "rgba(99, 102, 241, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 size={13} color="var(--primary)" />
                  </div>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: 2x2 Stat Grid */}
          <div
            className="about-stat-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.25rem",
            }}
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              const isHovered = hoveredCard === stat.id;

              return (
                <div
                  key={stat.id}
                  className="card"
                  onMouseEnter={() => setHoveredCard(stat.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: "var(--bg-surface)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid",
                    borderColor: isHovered ? "var(--primary)" : "var(--border-color)",
                    padding: "1.75rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "1rem",
                    boxShadow: isHovered
                      ? `0 14px 28px -6px ${stat.glow}`
                      : "var(--shadow-sm)",
                    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                    cursor: "default",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "var(--radius-md)",
                      background: stat.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 8px 16px -2px ${stat.glow}`,
                    }}
                  >
                    <Icon size={22} color="#ffffff" />
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "2.25rem",
                        fontWeight: 900,
                        color: "var(--text-main)",
                        letterSpacing: "-0.04em",
                        lineHeight: 1,
                        marginBottom: "0.35rem",
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "var(--text-main)",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {stat.label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.825rem",
                        color: "var(--text-muted)",
                        fontWeight: 500,
                      }}
                    >
                      {stat.sublabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TEAM / VALUES SECTION
          3-column grid of value cards.
          Each card: gradient icon background, title, description.
          Values: "Expert-Led Learning", "Accessible Education", "Verified Credentials"
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
            <Layers size={18} />
            <span>Guiding Principles</span>
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
            The Values That Drive Everything We Build
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.65 }}>
            We design our entire learning architecture around measurable competence, real-world utility, and uncompromising quality.
          </p>
        </div>

        <div
          className="about-values-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.75rem",
          }}
        >
          {values.map((val) => {
            const Icon = val.icon;
            const isHovered = hoveredValue === val.id;

            return (
              <div
                key={val.id}
                className="card"
                onMouseEnter={() => setHoveredValue(val.id)}
                onMouseLeave={() => setHoveredValue(null)}
                style={{
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid",
                  borderColor: isHovered ? "var(--primary)" : "var(--border-color)",
                  padding: "2.25rem 2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  boxShadow: isHovered ? "var(--shadow-lg)" : "var(--shadow-sm)",
                  transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Gradient Icon Badge */}
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "14px",
                    background: val.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 20px -3px rgba(99, 102, 241, 0.3)",
                  }}
                >
                  <Icon size={28} color="#ffffff" />
                </div>

                {/* Content */}
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "var(--text-main)",
                      marginBottom: "0.65rem",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {val.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.925rem",
                      color: "var(--text-muted)",
                      lineHeight: 1.65,
                      marginBottom: "1.25rem",
                    }}
                  >
                    {val.description}
                  </p>
                </div>

                {/* Highlights List */}
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: "1.2rem",
                    borderTop: "1px solid var(--border-color)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {val.highlights.map((h) => (
                    <div
                      key={h}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.825rem",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "var(--primary)",
                        }}
                      />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TIMELINE / STORY SECTION
          Vertical timeline with 4 milestones:
          - Founded 2022
          - 1K learners 2023
          - 500 courses 2024
          - 10K learners 2025
      ══════════════════════════════════════════════════ */}
      <section style={{ width: "100%" }}>
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 3.5rem auto" }}>
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
            <TrendingUp size={18} />
            <span>Our Journey</span>
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
            From Inception to Global Impact
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.65 }}>
            A look back at the key milestones that shaped LMS into the world-class learning platform it is today.
          </p>
        </div>

        {/* Timeline Container */}
        <div
          className="about-timeline-wrapper"
          style={{
            position: "relative",
            maxWidth: "840px",
            margin: "0 auto",
            padding: "1rem 0",
          }}
        >
          {/* Vertical Connecting Line with Brand Gradient */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              bottom: "40px",
              left: "28px",
              width: "3px",
              background: "linear-gradient(180deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)",
              borderRadius: "99px",
            }}
          />

          {/* Milestones */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {timelineMilestones.map((m, idx) => {
              const Icon = m.icon;

              return (
                <div
                  key={m.year}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "2rem",
                  }}
                >
                  {/* Timeline Node */}
                  <div
                    style={{
                      position: "relative",
                      zIndex: 2,
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: "var(--bg-surface)",
                      border: `3px solid ${m.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: `0 0 0 5px var(--bg-main), 0 8px 18px -4px ${m.color}66`,
                    }}
                  >
                    <Icon size={22} color={m.color} />
                  </div>

                  {/* Milestone Card */}
                  <div
                    className="card"
                    style={{
                      flex: 1,
                      background: "var(--bg-surface)",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--border-color)",
                      padding: "1.75rem 2rem",
                      boxShadow: "var(--shadow-sm)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(6px)";
                      e.currentTarget.style.boxShadow = "var(--shadow-md)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        flexWrap: "wrap",
                        marginBottom: "0.6rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 800,
                          color: m.color,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {m.year}
                      </span>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.2rem 0.65rem",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.725rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          background: `${m.color}15`,
                          color: m.color,
                        }}
                      >
                        {m.badge}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 800,
                        color: "var(--text-main)",
                        marginBottom: "0.5rem",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {m.title}
                    </h3>

                    <p
                      style={{
                        fontSize: "0.925rem",
                        lineHeight: 1.65,
                        color: "var(--text-muted)",
                        margin: 0,
                      }}
                    >
                      {m.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CALL TO ACTION BANNER
      ══════════════════════════════════════════════════ */}
      <section style={{ width: "100%" }}>
        <div
          className="about-cta-card"
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)",
            padding: "4rem 3.5rem",
            textAlign: "center",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 40px -15px rgba(15, 23, 42, 0.4)",
          }}
        >
          {/* Ambient Glow */}
          <div
            style={{
              position: "absolute",
              top: "-50%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "600px",
              height: "300px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 2, maxWidth: "680px", margin: "0 auto" }}>
            <h2
              style={{
                fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "-0.03em",
                marginBottom: "1rem",
              }}
            >
              Ready to Accelerate Your Career?
            </h2>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "1.05rem",
                lineHeight: 1.65,
                marginBottom: "2.25rem",
              }}
            >
              Join over 10,000 learners mastering industry tools, completing verified projects, and opening
              doors to exciting tech opportunities.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/register"
                className="btn btn-primary"
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  border: "none",
                  padding: "0.85rem 1.85rem",
                  borderRadius: "var(--radius-md)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.55rem",
                  boxShadow: "0 10px 25px -4px rgba(99, 102, 241, 0.5)",
                  textDecoration: "none",
                }}
              >
                <span>Get Started for Free</span>
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/contact"
                style={{
                  padding: "0.85rem 1.85rem",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "1rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.55rem",
                  textDecoration: "none",
                }}
              >
                <span>Talk to Admissions</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
