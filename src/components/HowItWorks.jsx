const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section-padding alt-bg">
      <div className="section-title">
        <h2>How It Works</h2>
        <p>3 simple steps to total control over your health records.</p>
      </div>

      <div className="steps-grid">
        <div className="step-card">
          <span className="step-number">01</span>
          <h3>Upload Documents</h3>
          <p>Drag and drop photos or PDFs of lab tests and prescriptions.</p>
        </div>

        <div className="step-card">
          <span className="step-number">02</span>
          <h3>AI Organization</h3>
          <p>MediScan categorizes and extracts key data automatically.</p>
        </div>

        <div className="step-card">
          <span className="step-number">03</span>
          <h3>Access Anywhere</h3>
          <p>View your complete health timeline whenever you need it.</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;