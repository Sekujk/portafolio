import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const PortfolioContext = createContext();

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio debe usarse dentro de PortfolioProvider');
  }
  return context;
};

// id fijo de la fila única de personal_info (ver migración relational_redesign)
const PERSONAL_INFO_ID = '00000000-0000-0000-0000-000000000001';

// Mapea entre los nombres que usa la UI (heredados del modelo JSONB anterior)
// y las columnas reales de cada tabla.
const mapPersonalFromDb = (row) => ({
  id: row.id,
  name: row.name,
  title: row.title,
  email: row.email,
  phone: row.phone,
  location: row.location,
  avatar: row.avatar_url,
  bio: row.bio,
  github: row.github_url,
  linkedin: row.linkedin_url,
});

const mapPersonalToDb = (info) => ({
  name: info.name,
  title: info.title,
  email: info.email,
  phone: info.phone,
  location: info.location,
  avatar_url: info.avatar,
  bio: info.bio,
  github_url: info.github,
  linkedin_url: info.linkedin,
});

const mapProjectFromDb = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  technologies: row.technologies || [],
  image: row.image_url,
  github: row.github_url,
  demo: row.demo_url,
  featured: row.featured,
});

const mapProjectToDb = (item) => ({
  title: item.title,
  description: item.description,
  technologies: item.technologies || [],
  image_url: item.image,
  github_url: item.github,
  demo_url: item.demo,
  featured: !!item.featured,
});

const mapCertificationFromDb = (row) => ({
  id: row.id,
  name: row.name,
  issuer: row.issuer,
  date: row.date,
  credential: row.url,
});

const mapCertificationToDb = (item) => ({
  name: item.name,
  issuer: item.issuer,
  date: item.date,
  url: item.credential,
});

// education y experience usan los mismos nombres de campo en la UI y en la
// tabla (institution/degree/period/description, company/position/period/
// description/achievements), no requieren mapeo.
const mapEducationFromDb = (row) => ({ ...row });
const mapEducationToDb = (item) => ({
  institution: item.institution,
  degree: item.degree,
  period: item.period,
  description: item.description,
});

const mapExperienceFromDb = (row) => ({ ...row, position: row.role, achievements: row.achievements || [] });
const mapExperienceToDb = (item) => ({
  company: item.company,
  role: item.position,
  location: item.location,
  period: item.period,
  description: item.description,
  achievements: item.achievements || [],
});

// Config por sección: nombre de tabla + funciones de mapeo, para las
// secciones que son listas (education, experience, projects, certifications).
const SECTION_TABLES = {
  education: { table: 'education', fromDb: mapEducationFromDb, toDb: mapEducationToDb },
  experience: { table: 'experience', fromDb: mapExperienceFromDb, toDb: mapExperienceToDb },
  projects: { table: 'projects', fromDb: mapProjectFromDb, toDb: mapProjectToDb },
  certifications: { table: 'certifications', fromDb: mapCertificationFromDb, toDb: mapCertificationToDb },
};

const groupSkillsByCategory = (rows) => {
  const grouped = {};
  (rows || []).forEach((row) => {
    if (!grouped[row.category]) grouped[row.category] = [];
    grouped[row.category].push(row.name);
  });
  return grouped;
};

export const PortfolioProvider = ({ children }) => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setIsLoading(true);
      setConnectionError(null);

      const [personalRes, educationRes, experienceRes, skillsRes, projectsRes, certificationsRes] = await Promise.all([
        supabase.from('personal_info').select('*').eq('id', PERSONAL_INFO_ID).single(),
        supabase.from('education').select('*').order('order_index'),
        supabase.from('experience').select('*').order('order_index'),
        supabase.from('skills').select('*').order('order_index'),
        supabase.from('projects').select('*').order('order_index'),
        supabase.from('certifications').select('*').order('order_index'),
      ]);

      const firstError = [personalRes, educationRes, experienceRes, skillsRes, projectsRes, certificationsRes]
        .find((res) => res.error)?.error;
      if (firstError) throw firstError;

      setPortfolioData({
        personalInfo: mapPersonalFromDb(personalRes.data),
        education: (educationRes.data || []).map(mapEducationFromDb),
        experience: (experienceRes.data || []).map(mapExperienceFromDb),
        skills: groupSkillsByCategory(skillsRes.data),
        projects: (projectsRes.data || []).map(mapProjectFromDb),
        certifications: (certificationsRes.data || []).map(mapCertificationFromDb),
      });
      console.log('Datos cargados desde Supabase');
    } catch (error) {
      console.error('ERROR DE CONEXIÓN A SUPABASE:', error);
      setConnectionError(error.message || 'No se pudo conectar a Supabase. Verifica tu configuración.');
      setPortfolioData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const reloadSection = async (section) => {
    if (section === 'personalInfo') {
      const { data, error } = await supabase.from('personal_info').select('*').eq('id', PERSONAL_INFO_ID).single();
      if (error) throw error;
      setPortfolioData((prev) => ({ ...prev, personalInfo: mapPersonalFromDb(data) }));
      return;
    }
    if (section === 'skills') {
      const { data, error } = await supabase.from('skills').select('*').order('order_index');
      if (error) throw error;
      setPortfolioData((prev) => ({ ...prev, skills: groupSkillsByCategory(data) }));
      return;
    }
    const cfg = SECTION_TABLES[section];
    if (!cfg) return;
    const { data, error } = await supabase.from(cfg.table).select('*').order('order_index');
    if (error) throw error;
    setPortfolioData((prev) => ({ ...prev, [section]: (data || []).map(cfg.fromDb) }));
  };

  // Actualiza una sección completa: personalInfo (fila única) o skills (reemplazo total).
  const updateSection = async (section, data) => {
    setIsLoading(true);
    try {
      if (section === 'personalInfo') {
        const { error } = await supabase
          .from('personal_info')
          .update(mapPersonalToDb(data))
          .eq('id', PERSONAL_INFO_ID);
        if (error) throw error;
      } else if (section === 'skills') {
        const { error: deleteError } = await supabase.from('skills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (deleteError) throw deleteError;

        const rows = [];
        let orderIndex = 0;
        Object.entries(data).forEach(([category, names]) => {
          names.forEach((name) => {
            rows.push({ category, name, order_index: orderIndex++ });
          });
        });

        if (rows.length > 0) {
          const { error: insertError } = await supabase.from('skills').insert(rows);
          if (insertError) throw insertError;
        }
      } else {
        throw new Error(`updateSection no soporta la sección "${section}"`);
      }

      await reloadSection(section);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error('ERROR AL GUARDAR EN SUPABASE:', error);
      setIsLoading(false);
      throw new Error('No se pudo guardar en Supabase: ' + error.message);
    }
  };

  // Agrega un item a una sección de tipo lista (education, experience, projects, certifications).
  const addItem = async (section, item) => {
    const cfg = SECTION_TABLES[section];
    if (!cfg) throw new Error(`addItem no soporta la sección "${section}"`);

    const currentItems = portfolioData?.[section] || [];
    const row = { ...cfg.toDb(item), order_index: currentItems.length };

    const { error } = await supabase.from(cfg.table).insert(row);
    if (error) throw error;

    await reloadSection(section);
    return { success: true };
  };

  const updateItem = async (section, itemId, updatedItem) => {
    const cfg = SECTION_TABLES[section];
    if (!cfg) throw new Error(`updateItem no soporta la sección "${section}"`);

    const { error } = await supabase.from(cfg.table).update(cfg.toDb(updatedItem)).eq('id', itemId);
    if (error) throw error;

    await reloadSection(section);
    return { success: true };
  };

  const deleteItem = async (section, itemId) => {
    const cfg = SECTION_TABLES[section];
    if (!cfg) throw new Error(`deleteItem no soporta la sección "${section}"`);

    const { error } = await supabase.from(cfg.table).delete().eq('id', itemId);
    if (error) throw error;

    await reloadSection(section);
    return { success: true };
  };

  // Marca un proyecto como destacado y desmarca cualquier otro -- centralizado
  // acá (en vez de dejarlo como una convención dispersa en el formulario de
  // cada proyecto) para que "solo puede haber un destacado" sea una garantía
  // real, no una esperanza. projectId en null quita el destacado sin elegir
  // uno nuevo.
  const setFeaturedProject = async (projectId) => {
    const { error: clearError } = await supabase
      .from('projects')
      .update({ featured: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (clearError) throw clearError;

    if (projectId) {
      const { error: setError } = await supabase
        .from('projects')
        .update({ featured: true })
        .eq('id', projectId);
      if (setError) throw setError;
    }

    await reloadSection('projects');
    return { success: true };
  };

  const value = {
    portfolioData,
    isLoading,
    connectionError,
    updateSection,
    addItem,
    updateItem,
    deleteItem,
    setFeaturedProject,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};
