import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { verifyCertificate } from "../features/certificate/certificateService.js";
import { CertificateModal } from "../components/CertificateModal.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export function CertificateVerificationPage() {
  const { certificateId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certData, setCertData] = useState(null);

  useEffect(() => {
    if (!certificateId) return;
    setLoading(true);
    setError(null);

    verifyCertificate(certificateId)
      .then((res) => {
        if (res?.valid && res?.certificate) {
          setCertData(res.certificate);
        } else if (res?.id || res?.certificate_id) {
          setCertData(res);
        } else {
          setError("Certificate not found or invalid credential ID.");
        }
      })
      .catch((err) => {
        setError(err.message || "Certificate verification failed.");
      })
      .finally(() => setLoading(false));
  }, [certificateId]);

  if (loading) {
    return (
      <div style={{ maxWidth: "600px", margin: "3rem auto", padding: "1.5rem" }}>
        <Skeleton height="350px" borderRadius="var(--radius-lg)" />
      </div>
    );
  }

  if (error || !certData) {
    return (
      <div style={{ maxWidth: "520px", margin: "4rem auto", textAlign: "center", padding: "2rem" }} className="card">
        <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "var(--danger-light)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}>
          <ShieldAlert size={28} />
        </div>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.5rem" }}>
          Invalid or Expired Credential
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          The certificate ID <code>{certificateId}</code> could not be verified by the LMS Official Registry.
        </p>
        <Link to="/" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <ArrowLeft size={16} />
          <span>Return to Homepage</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem 1rem", minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <CertificateModal certificate={certData} onClose={() => window.history.back()} />
    </div>
  );
}
