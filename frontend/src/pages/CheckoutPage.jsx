import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { listCart } from "../features/cart/cartService.js";
import { completeFreeCheckout, createCheckout } from "../features/checkout/checkoutService.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";

function formatMoney(amount) {
  return `$${Number(amount || 0).toFixed(2)}`;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [checkout, setCheckout] = useState(null);
  const [status, setStatus] = useState("loading");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setMessage("");

    Promise.all([listCart(), createCheckout()])
      .then(([cartData, checkoutData]) => {
        if (!active) return;
        setCart(cartData);
        setCheckout(checkoutData);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message || "Unable to prepare checkout.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  const total = Number(checkout?.total_amount || 0);
  const isFree = total === 0;
  const hasItems = cart.length > 0;

  async function handleCompleteOrder() {
    setSubmitting(true);
    setMessage("");

    try {
      const data = await completeFreeCheckout();
      setSuccessResult(data);
      setTimeout(() => {
        navigate("/my-courses");
      }, 2500);
    } catch (error) {
      setMessage(error.message || "Unable to complete payment process.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return <Skeleton height="350px" />;
  }

  if (status === "error") {
    return <ErrorState message={message} onRetry={() => window.location.reload()} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="h1">Checkout</h1>
          <p className="text-subtitle">Complete your purchase to gain instant access to your courses.</p>
        </div>
        <Link className="btn btn-outline btn-sm" to="/cart">
          <ArrowLeft size={16} /> Back to Cart
        </Link>
      </div>

      {successResult ? (
        <div className="ui-card" style={{ background: "var(--success-light)", borderColor: "var(--success-border)", textAlign: "center", padding: "3rem 2rem" }}>
          <CheckCircle2 size={48} style={{ color: "var(--success)", margin: "0 auto 1rem" }} />
          <h2 className="h2" style={{ color: "#15803d", marginBottom: "0.5rem" }}>{successResult.message || "Payment Successful!"}</h2>
          <p style={{ color: "#166534", marginBottom: "1.5rem" }}>
            Order #{successResult.order_id} generated. You are now enrolled! Redirecting to your learning dashboard...
          </p>
          <Link to="/my-courses" className="btn btn-success btn-lg">
            Go to My Courses <ArrowRight size={18} />
          </Link>
        </div>
      ) : !hasItems ? (
        <EmptyState
          title="Your cart is empty"
          description="Add some courses to your cart before proceeding to checkout."
          action={<Link to="/courses" className="btn btn-primary btn-sm">Explore Courses</Link>}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem" }}>
          {/* Items Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="ui-card">
              <h3 className="h3" style={{ marginBottom: "1rem" }}>Order Items ({cart.length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {cart.map((item) => {
                  const course = item.course_details;
                  return (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>
                          {course?.category || "Course"}
                        </div>
                        <h4 style={{ fontWeight: 700, fontSize: "1rem" }}>{course?.title || `Course #${item.course}`}</h4>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>
                        {course && Number(course.price) > 0 ? `$${Number(course.price).toFixed(2)}` : "Free"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Guarantee Notice */}
            <div className="ui-card" style={{ background: "var(--bg-subtle)", display: "flex", gap: "1rem", alignItems: "center" }}>
              <ShieldCheck size={32} style={{ color: "var(--primary)", flexShrink: 0 }} />
              <div>
                <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>30-Day Money-Back Guarantee</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Gain full immediate access. SSL Encrypted & Secure Checkout.</p>
              </div>
            </div>
          </div>

          {/* Checkout Summary Card */}
          <div className="ui-card" style={{ alignSelf: "start", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h3 className="h3">Checkout Summary</h3>

            {message && (
              <div style={{ color: "var(--danger)", fontSize: "0.88rem", fontWeight: 600 }}>{message}</div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                <span>Subtotal ({cart.length} items)</span>
                <span>{formatMoney(total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                <span>Discounts / Coupon</span>
                <span style={{ color: "var(--success)" }}>$0.00</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Total Due</span>
              <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary)" }}>{formatMoney(total)}</span>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleCompleteOrder}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              <Lock size={18} />
              {submitting ? "Processing Payment..." : isFree ? "Complete Free Enrollment" : "Pay & Enroll Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
