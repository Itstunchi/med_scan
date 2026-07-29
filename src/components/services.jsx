const Services = () => {
  const servicesData = [
    {
      id: 1,
      title: "AI Medical Imaging",
      description: "Upload X-rays, MRIs, or CT scans for instant, highly accurate AI-powered preliminary analysis.",
      icon: "🔍"
    },
    {
      id: 2,
      title: "Symptom Checker",
      description: "Input your symptoms to receive instant health insights and guidance on next steps.",
      icon: "🩺"
    },
    {
      id: 3,
      title: "Doctor Consultations",
      description: "Connect seamlessly with certified medical professionals for full diagnostics and prescriptions.",
      icon: "👨‍⚕️"
    },
    {
      id: 4,
      title: "Secure Health Records",
      description: "Store and manage your scan history and medical data with end-to-end encryption.",
      icon: "🛡️"
    }
  ];

  return (
    <section className="services-section" id="services">
      <div className="services-header">
        <h2>Our Services</h2>
        <p>Advanced AI diagnostic tools designed to support healthcare providers and patients alike.</p>
      </div>

      <div className="services-grid">
        {servicesData.map((service) => (
          <div key={service.id} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <h3 className="service-title">{service.title}</h3>
            <p className="service-description">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;