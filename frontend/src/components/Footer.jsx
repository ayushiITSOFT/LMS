import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-grid">
        <div>
          <div className="app-brand" style={{ color: "#fff", marginBottom: "1rem" }}>
            <div className="app-brand-logo">L</div>
            <span>LMS</span>
          </div>
          <p style={{ fontSize: "0.9rem", color: "#94a3b8", lineHeight: "1.6" }}>
            Production-grade Learning Management System connecting instructors and students worldwide.
          </p>
        </div>

        <div>
          <h4 className="footer-title">Navigation</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/courses">Explore Courses</Link></li>
            <li><Link to="/login">Student Sign In</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-title">Student Hub</h4>
          <ul className="footer-links">
            <li><Link to="/my-courses">My Enrolled Courses</Link></li>
            <li><Link to="/certificates">My Certificates</Link></li>
            <li><Link to="/orders">Order History</Link></li>
            <li><Link to="/wishlist">Saved Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-title">Platform & Support</h4>
          <ul className="footer-links">
            <li><Link to="/about">About Platform</Link></li>
            <li><Link to="/contact">Contact Support</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} LMS. All rights reserved. Powered by Django REST API & React 19.</p>
      </div>
    </footer>
  );
}
