const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>MediScan</h3>
          <p>Organizing your health records, securely and effortlessly.</p>
        </div>

        <div className="footer-links">
          <h4>Navigation</h4>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How it works</a></li>
            <li><a href="#services">Services</a></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Legal</h4>
          <ul>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#hipaa">HIPAA Compliance</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-copyright">
        <p>&copy; {new Date().getFullYear()} MediScan. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;