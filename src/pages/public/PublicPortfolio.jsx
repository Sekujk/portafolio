import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCode, FaBriefcase, FaGraduationCap, FaExclamationTriangle, FaDatabase, FaExternalLinkAlt, FaCertificate, FaRocket } from 'react-icons/fa';
import { usePortfolio } from '../../context/PortfolioContext';
import './PublicPortfolio.css';

const PublicPortfolio = () => {
  const { portfolioData, isLoading, connectionError } = usePortfolio();

  // Pantalla de carga
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <div>Cargando portafolio...</div>
        </div>
      </div>
    );
  }

  // Pantalla de error
  if (connectionError || !portfolioData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        padding: '2rem'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '3rem',
            maxWidth: '600px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
        >
          <FaExclamationTriangle style={{ fontSize: '4rem', color: '#f5576c', marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>
            Error de Conexión
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1.5rem' }}>
            {connectionError || 'No se pudo cargar el portafolio'}
          </p>
          <div style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'left',
            fontSize: '0.95rem',
            color: '#444',
            marginBottom: '1.5rem'
          }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#f5576c' }}>
              <FaDatabase style={{ marginRight: '0.5rem' }} />
              Pasos para solucionar:
            </strong>
            <ol style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Verifica tu archivo <code>.env</code> con las credenciales correctas</li>
              <li>Ejecuta el script <code>supabase-setup.sql</code> en Supabase Dashboard</li>
              <li>Asegúrate de que el proyecto de Supabase esté activo</li>
              <li>Reinicia el servidor con <code>npm run dev</code></li>
            </ol>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 Reintentar
          </button>
        </motion.div>
      </div>
    );
  }

  const { personalInfo, education, experience, skills, projects, certifications } = portfolioData;

  return (
    <div className="public-portfolio">
      {/* Hero Section - Diseño Split */}
      <section className="hero-section">
        <div className="hero-grid">
          <motion.div
            className="hero-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-badge">Disponible para proyectos</div>
            <h1 className="hero-name">{personalInfo.name}</h1>
            <p className="hero-title">{personalInfo.title}</p>
            <p className="hero-bio">{personalInfo.bio}</p>
            
            <div className="hero-actions">
              <a href={`mailto:${personalInfo.email}`} className="btn-primary">
                <FaEnvelope /> Contáctame
              </a>
              <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <FaGithub /> GitHub
              </a>
            </div>
          </motion.div>

          <motion.div
            className="hero-right"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="hero-image-wrapper">
              <img src={personalInfo.avatar} alt={personalInfo.name} className="hero-avatar" />
              <div className="hero-stats">
                <div className="stat-item">
                  <FaBriefcase />
                  <span>{experience?.length || 0}+ Experiencias</span>
                </div>
                <div className="stat-item">
                  <FaCode />
                  <span>{projects?.length || 0}+ Proyectos</span>
                </div>
                <div className="stat-item">
                  <FaGraduationCap />
                  <span>{certifications?.length || 0}+ Certificaciones</span>
                </div>
              </div>
            </div>

            <div className="hero-contact-cards">
              <a href={`mailto:${personalInfo.email}`} className="contact-card">
                <FaEnvelope />
                <span>{personalInfo.email}</span>
              </a>
              <div className="contact-card">
                <FaPhone />
                <span>{personalInfo.phone}</span>
              </div>
              <div className="contact-card">
                <FaMapMarkerAlt />
                <span>{personalInfo.location}</span>
              </div>
              {personalInfo.linkedin && (
                <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="contact-card">
                  <FaLinkedin />
                  <span>LinkedIn</span>
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid - Skills + Featured Project */}
      <section className="bento-section">
        <div className="container">
          <div className="bento-grid">
            {/* Skills Destacadas */}
            <motion.div
              className="bento-item bento-skills"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="bento-title">💻 Stack Técnico</h2>
              <div className="skills-compact">
                {skills && Object.entries(skills).map(([category, skillList]) => (
                  <div key={category} className="skill-row">
                    <span className="skill-category-label">{category}</span>
                    <div className="skill-pills">
                      {skillList.map((skill, i) => (
                        <span key={i} className="skill-pill">{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Proyecto Destacado */}
            {projects && projects.find(p => p.featured) && (
              <motion.div
                className="bento-item bento-featured-project"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                {(() => {
                  const featuredProject = projects.find(p => p.featured);
                  return (
                    <>
                      <div className="featured-label">Proyecto Destacado</div>
                      <img src={featuredProject.image} alt={featuredProject.title} className="featured-image" />
                      <div className="featured-content">
                        <h3>{featuredProject.title}</h3>
                        <p>{featuredProject.description}</p>
                        <div className="featured-tech">
                          {featuredProject.technologies.map((tech, i) => (
                            <span key={i}>{tech}</span>
                          ))}
                        </div>
                        <div className="featured-links">
                          {featuredProject.github && (
                            <a href={featuredProject.github} target="_blank" rel="noopener noreferrer">
                              <FaGithub /> Ver Código
                            </a>
                          )}
                          {featuredProject.demo && (
                            <a href={featuredProject.demo} target="_blank" rel="noopener noreferrer">
                              <FaExternalLinkAlt /> Ver Demo
                            </a>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}

            {/* Educación Compacta */}
            {education && education.length > 0 && (
              <motion.div
                className="bento-item bento-education"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="bento-title"><FaGraduationCap style={{ marginRight: '10px', verticalAlign: 'middle' }} />Educación</h2>
                {education.map((edu) => (
                  <div key={edu.id} className="edu-compact">
                    <h4>{edu.degree}</h4>
                    <p className="edu-institution">{edu.institution}</p>
                    <span className="edu-period">{edu.period}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Experiencia Rápida */}
            {experience && experience.length > 0 && (
              <motion.div
                className="bento-item bento-experience"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="bento-title"><FaBriefcase style={{ marginRight: '10px', verticalAlign: 'middle' }} />Experiencia</h2>
                <div className="exp-list">
                  {experience.map((exp) => (
                    <div key={exp.id} className="exp-compact">
                      <div className="exp-header">
                        <h4>{exp.position}</h4>
                        <span className="exp-period">{exp.period}</span>
                      </div>
                      <p className="exp-company">{exp.company}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Proyectos Grid */}
      {projects && projects.length >= 1 && (
        <section className="projects-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title-modern">{projects.some(p => p.featured) ? 'Otros Proyectos' : 'Proyectos'}</h2>
              <p className="section-subtitle">Explora más de mi trabajo</p>
            </div>
            <div className="projects-masonry">
              {projects.filter(p => !p.featured).map((project, index) => (
                <motion.div
                  key={project.id}
                  className="project-card-modern"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="project-image-wrapper">
                    <img src={project.image} alt={project.title} />
                    <div className="project-overlay">
                      <div className="overlay-links">
                        {project.github && (
                          <a href={project.github} target="_blank" rel="noopener noreferrer">
                            <FaGithub />
                          </a>
                        )}
                        {project.demo && (
                          <a href={project.demo} target="_blank" rel="noopener noreferrer">
                            <FaExternalLinkAlt />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="project-info">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="project-tech-mini">
                      {project.technologies.slice(0, 3).map((tech, i) => (
                        <span key={i}>{tech}</span>
                      ))}
                      {project.technologies.length > 3 && <span>+{project.technologies.length - 3}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certificaciones Carrusel */}
      {certifications && certifications.length > 0 && (
        <section className="certifications-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title-modern">Certificaciones & Cursos</h2>
              <p className="section-subtitle">Aprendizaje continuo</p>
            </div>
            <div className="certifications-carousel">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  className="cert-card-modern"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="cert-icon">🏆</div>
                  <h4>{cert.name}</h4>
                  <p className="cert-issuer">{cert.issuer}</p>
                  <span className="cert-date">{cert.date}</span>
                  {cert.credential && (
                    <a href={cert.credential} target="_blank" rel="noopener noreferrer" className="cert-link">
                      Ver Credencial →
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>¿Tienes un proyecto en mente?</h2>
            <p>Estoy disponible para colaborar en proyectos interesantes</p>
            <div className="cta-actions">
              <a href={`mailto:${personalInfo.email}`} className="btn-cta">
                <FaEnvelope /> Hablemos
              </a>
              {personalInfo.linkedin && (
                <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="btn-cta-outline">
                  <FaLinkedin /> Conectar
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Minimal */}
      <footer className="footer-modern">
        <div className="container">
          <div className="footer-content">
            <p>&copy; {new Date().getFullYear()} {personalInfo.name}</p>
            <div className="footer-links">
              {personalInfo.github && (
                <a href={personalInfo.github} target="_blank" rel="noopener noreferrer">
                  <FaGithub />
                </a>
              )}
              {personalInfo.linkedin && (
                <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                  <FaLinkedin />
                </a>
              )}
              <a href={`mailto:${personalInfo.email}`}>
                <FaEnvelope />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPortfolio;
