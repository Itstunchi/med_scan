const Features = () => {
  return (
    <section id="features" className="section-padding">
      <div className="section-title">
        <h2>Features Designed for You</h2>
        <p>Everything you need to keep your medical history organized.</p>
      </div>

      <div className="card-grid">
        <div className="feature-card">
          <div className="icon">🔒</div>
          <h3>Encrypted Storage</h3>
          <p>Your records are shielded with bank-grade encryption algorithms.</p>
        </div>

        <div className="feature-card">
          <div className="icon">📁</div>
          <h3>Smart Categorization</h3>
          <p>Automatically group lab results, prescriptions, and visit summaries.</p>
        </div>

        <div className="feature-card">
          <div className="icon">📲</div>
          <h3>Instant Sharing</h3>
          <p>Share medical histories securely with your doctor via temporary access links.</p>
        </div>
      </div>
    </section>
  );
};

export default Features;