import { useState } from "react";
import {
  HeartPulse,
  Brain,
  Stethoscope,
  Smile,
  Baby,
  Bone,
  Eye,
  HeartHandshake,
  Wind,
  Activity,
  Droplets,
  ShieldPlus,
  Ear,
  Syringe,
  Hospital,
  ScanHeart,
  Microscope,
} from "lucide-react";

import "./services.css";

function Specialists() {
  const [search, setSearch] = useState("");

  const specialists = [
    { id: 1, name: "Cardiologist", description: "Heart Specialist", icon: HeartPulse },
    { id: 2, name: "Neurologist", description: "Brain Specialist", icon: Brain },
    { id: 3, name: "Dermatologist", description: "Skin Specialist", icon: Stethoscope },
    { id: 4, name: "Dentist", description: "Dental Specialist", icon: Smile },
    { id: 5, name: "Pediatrician", description: "Child Healthcare Specialist", icon: Baby },
    { id: 6, name: "Orthopedic", description: "Bone & Joint Specialist", icon: Bone },
    { id: 7, name: "Ophthalmologist", description: "Eye Specialist", icon: Eye },
    { id: 8, name: "Psychiatrist", description: "Mental Health Specialist", icon: Brain },
    { id: 9, name: "Gynecologist", description: "Women's Health Specialist", icon: HeartHandshake },
    { id: 10, name: "Pulmonologist", description: "Lung Specialist", icon: Wind },
    { id: 11, name: "Endocrinologist", description: "Hormone Specialist", icon: Activity },
    { id: 12, name: "Nephrologist", description: "Kidney Specialist", icon: Droplets },
    { id: 13, name: "Oncologist", description: "Cancer Specialist", icon: ShieldPlus },
    { id: 14, name: "ENT Specialist", description: "Ear, Nose & Throat", icon: Ear },
    { id: 15, name: "Urologist", description: "Urinary Tract Specialist", icon: Syringe },
    { id: 16, name: "General Physician", description: "General Medical Care", icon: Hospital },
    { id: 17, name: "Radiologist", description: "Medical Imaging Specialist", icon: ScanHeart },
    { id: 18, name: "Pathologist", description: "Laboratory & Disease Specialist", icon: Microscope },
  ];

  const filteredSpecialists = specialists.filter(
    (specialist) =>
      specialist.name.toLowerCase().includes(search.toLowerCase()) ||
      specialist.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="specialists-page">
      <section className="specialists-header">
        <h1>Find a Specialist</h1>

        <p>
          Our team of experienced specialists is committed to providing
          exceptional healthcare tailored to your needs. Browse through our
          departments and find the right medical expert for you.
        </p>

        <input
          type="text"
          placeholder="🔍 Search for a specialist..."
          className="specialists-search-bar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <section className="specialists">
        {filteredSpecialists.map((specialist) => {
          const Icon = specialist.icon;

          return (
            <div className="specialist-card" key={specialist.id}>
              <Icon size={55} className="specialist-icon" />

              <h2>{specialist.name}</h2>

              <p>{specialist.description}</p>

              <button>View Doctor</button>
            </div>
          );
        })}

        {filteredSpecialists.length === 0 && (
          <p className="no-results">
            No specialist found.
          </p>
        )}
      </section>
    </div>
  );
}

export default Specialists;