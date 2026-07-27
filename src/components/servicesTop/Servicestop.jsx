import React from 'react';
import './servicesTop.css'; // This connects our styles!

// 1. This is our reusable Service Card component
function ServiceCard({ title, description, icon }) {
  return (
    <div className="service-card">
      <div className="card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="card-btn">View more</button>
    </div>
  );
}

// 2. This is the main page that holds all the cards
export default function ServiceTop() {
  // Here is the data for our four cards
  const appServices = [
    { title: "Start a Conversation", description: "Chat securely with a healthcare professional.", icon: "💬" },
    { title: "Book an Appointment", description: "Schedule a virtual or in-person visit.", icon: "📅" },
    { title: "View Test Results", description: "Access your recent lab work and doctor notes.", icon: "📄" },
    { title: "Find a Specialist", description: "Browse our directory to find the right doctor for you.", icon: "🩺" }
  ];

  return (
    <div className="services-container">
      <h2>Our Healthcare Services</h2>
      
      {/* This maps over our data and creates a card for each one */}
      <div className="cards-grid">
        {appServices.map((service, index) => (
          <ServiceCard 
            key={index} 
            title={service.title} 
            description={service.description} 
            icon={service.icon} 
          />
        ))}
      </div>
    </div>
  );
}