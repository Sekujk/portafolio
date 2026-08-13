import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCode, FaBriefcase, FaGraduationCap, FaExclamationTriangle, FaDatabase, FaExternalLinkAlt, FaRocket } from 'react-icons/fa';
import { usePortfolio } from '../../context/PortfolioContext';
import './PublicPortfolio.css';

// Cuenta de 0 al valor real cuando el componente aparece en pantalla
const AnimatedCounter = ({ value, delay = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!value) {
      setCount(0);
      return;
    }
    const duration = 900;
    let raf;
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * value));
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay * 1000);
    return () => {
      clearTimeout(timeout);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value, delay]);

  return count;
};

const PublicPortfolio = () => {
  const { portfolioData, isLoading, connectionError } = usePortfolio();
  const [avatarError, setAvatarError] = useState(false);
  const [featuredImageError, setFeaturedImageError] = useState(false);
  const [brokenProjectImages, setBrokenProjectImages] = useState({});

  if (!isLoading && (connectionError || !portfolioData)) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#0f172a',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
        padding: '2rem'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '3rem',
            maxWidth: '560px',
            textAlign: 'center',
            border: '2px solid rgba(6, 182, 212, 0.25)',
            boxShadow: '0 30px 60px -12px rgba(6, 182, 212, 0.2)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <FaExclamationTriangle style={{ fontSize: '1.75rem', color: '#0891b2' }} />
          </motion.div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: '#0f172a' }}>
            No pudimos conectar
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#64748b', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            {connectionError || 'No se pudo cargar el portafolio'}
          </p>
          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.15)',
            padding: '1.5rem',
            borderRadius: '16px',
            textAlign: 'left',
            fontSize: '0.9rem',
            color: '#334155',
            marginBottom: '1.75rem'
          }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#0891b2', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <FaDatabase />
              Pasos para solucionar
            </strong>
            <ol style={{ marginLeft: '1.25rem', lineHeight: '1.9' }}>
              <li>Verifica tu archivo <code>.env</code> con las credenciales correctas</li>
              <li>Confirma que las migraciones estén aplicadas (<code>supabase db push</code>)</li>
              <li>Asegúrate de que el proyecto de Supabase esté activo</li>
              <li>Reinicia el servidor con <code>npm run dev</code></li>
            </ol>
          </div>
          <motion.button
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(6, 182, 212, 0.5)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              color: 'white',
              border: 'none',
              padding: '0.9rem 2rem',
              borderRadius: '12px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 700,
              boxShadow: '0 4px 20px rgba(6, 182, 212, 0.35)',
            }}
          >
            Reintentar
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (isLoading || !portfolioData) {
    return null;
  }

  const { personalInfo, education, experience, skills, projects, certifications } = portfolioData;

  return (
    <div className="public-portfolio">
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
              {personalInfo.avatar && !avatarError ? (
                <img
                  src={personalInfo.avatar}
                  alt={personalInfo.name}
                  className="hero-avatar"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="hero-avatar hero-avatar-placeholder">
                  {personalInfo.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className="hero-stats">
                <motion.div
                  className="stat-item"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <FaBriefcase />
                  <span><AnimatedCounter value={experience?.length || 0} delay={0.5} />+ Experiencias</span>
                </motion.div>
                <motion.div
                  className="stat-item"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <FaCode />
                  <span><AnimatedCounter value={projects?.length || 0} delay={0.6} />+ Proyectos</span>
                </motion.div>
                <motion.div
                  className="stat-item"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  <FaGraduationCap />
                  <span><AnimatedCounter value={certifications?.length || 0} delay={0.7} />+ Certificaciones</span>
                </motion.div>
              </div>
            </div>

            <div className="hero-contact-cards">
              <motion.a
                href={`mailto:${personalInfo.email}`}
                className="contact-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <FaEnvelope />
                <span>{personalInfo.email}</span>
              </motion.a>
              <motion.div
                className="contact-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.88 }}
              >
                <FaPhone />
                <span>{personalInfo.phone}</span>
              </motion.div>
              <motion.div
                className="contact-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.96 }}
              >
                <FaMapMarkerAlt />
                <span>{personalInfo.location}</span>
              </motion.div>
              {personalInfo.linkedin && (
                <motion.a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.04 }}
                >
                  <FaLinkedin />
                  <span>LinkedIn</span>
                </motion.a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid - Skills + Featured Project */}
      <section className="bento-section">
        <div className="container">
          <div className="bento-grid">
            <motion.div
              className="bento-item bento-skills"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="bento-title">💻 Stack Técnico</h2>
              <div className="skills-compact">
                {skills && Object.entries(skills).map(([category, skillList], rowIndex) => (
                  <motion.div
                    key={category}
                    className="skill-row"
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: rowIndex * 0.1 }}
                  >
                    <span className="skill-category-label">{category}</span>
                    <div className="skill-pills">
                      {skillList.map((skill, i) => (
                        <motion.span
                          key={i}
                          className="skill-pill"
                          initial={{ opacity: 0, scale: 0.85 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.25, delay: rowIndex * 0.1 + i * 0.05 }}
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

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
                      {featuredProject.image && !featuredImageError ? (
                        <img
                          src={featuredProject.image}
                          alt={featuredProject.title}
                          className="featured-image"
                          onError={() => setFeaturedImageError(true)}
                        />
                      ) : (
                        <div className="featured-placeholder">
                          <FaRocket className="featured-placeholder-icon" />
                        </div>
                      )}
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

            {((education && education.length > 0) || (experience && experience.length > 0)) && (
              <motion.div
                className="bento-item bento-edu-exp"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="edu-exp-grid">
                  {education && education.length > 0 && (
                    <div className="edu-column">
                      <h2 className="bento-title"><FaGraduationCap style={{ marginRight: '10px', verticalAlign: 'middle' }} />Educación</h2>
                      <div className="edu-scroll-container">
                        {education.map((edu, i) => (
                          <motion.div
                            key={edu.id}
                            className="edu-compact"
                            initial={{ opacity: 0, x: -16 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35, delay: i * 0.08 }}
                          >
                            <h4>{edu.degree}</h4>
                            <p className="edu-institution">{edu.institution}</p>
                            <span className="edu-period">{edu.period}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {experience && experience.length > 0 && (
                    <div className="exp-column">
                      <h2 className="bento-title"><FaBriefcase style={{ marginRight: '10px', verticalAlign: 'middle' }} />Experiencia</h2>
                      <div className="exp-scroll-container">
                        {experience.map((exp, i) => (
                          <motion.div
                            key={exp.id}
                            className="exp-compact"
                            initial={{ opacity: 0, x: 16 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35, delay: i * 0.08 }}
                          >
                            <div className="exp-header">
                              <h4>{exp.position}</h4>
                              <span className="exp-period">{exp.period}</span>
                            </div>
                            <p className="exp-company">{exp.company}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {(() => {
        const proyectosRestantes = (projects || []).filter((p) => !p.featured);
        if (proyectosRestantes.length === 0) return null;
        return (
      <section className="projects-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title-modern">{projects.some(p => p.featured) ? 'Otros Proyectos' : 'Proyectos'}</h2>
              <p className="section-subtitle">Explora más de mi trabajo</p>
            </div>
            <div className="projects-masonry">
              {proyectosRestantes.map((project, index) => {
                const hasWorkingImage = project.image && !brokenProjectImages[project.id];
                return (
                <motion.div
                  key={project.id}
                  className={`project-card-modern ${!hasWorkingImage ? 'no-image' : ''}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {hasWorkingImage ? (
                    <div className="project-image-wrapper">
                      <img
                        src={project.image}
                        alt={project.title}
                        onError={() => setBrokenProjectImages((prev) => ({ ...prev, [project.id]: true }))}
                      />
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
                  ) : (
                    <div className="project-placeholder">
                      <FaCode className="placeholder-icon" />
                    </div>
                  )}
                  <div className="project-info">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="project-tech-mini">
                      {project.technologies.slice(0, 3).map((tech, i) => (
                        <span key={i}>{tech}</span>
                      ))}
                      {project.technologies.length > 3 && <span>+{project.technologies.length - 3}</span>}
                    </div>
                    {!hasWorkingImage && (project.github || project.demo) && (
                      <div className="project-links-no-image">
                        {project.github && (
                          <a href={project.github} target="_blank" rel="noopener noreferrer">
                            <FaGithub /> Código
                          </a>
                        )}
                        {project.demo && (
                          <a href={project.demo} target="_blank" rel="noopener noreferrer">
                            <FaExternalLinkAlt /> Demo
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
                );
              })}
            </div>
          </div>
        </section>
        );
      })()}

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
