import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FaArrowLeft, FaGithub } from 'react-icons/fa';
import { supabase } from '../../config/supabase';
import './EconomicExplainer.css';

const REPO_URL = 'https://github.com/Sekujk/explicador-economico-peru';

const EconomicExplainer = () => {
  const [indicadores, setIndicadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      const { data: dims, error: errDims } = await supabase
        .from('dim_indicador')
        .select('*');

      if (errDims) {
        setError(errDims.message);
        setLoading(false);
        return;
      }

      const { data: valores, error: errValores } = await supabase
        .from('fact_valor')
        .select('*')
        .order('fecha', { ascending: true });

      if (errValores) {
        setError(errValores.message);
        setLoading(false);
        return;
      }

      const combinados = dims.map((indicador) => {
        const propios = valores
          .filter((v) => v.indicador_id === indicador.id)
          .map((v) => ({ fecha: v.fecha, valor: Number(v.valor) }));
        const ultimo = propios[propios.length - 1];
        const anterior = propios[propios.length - 2];
        const variacionPct = anterior ? ((ultimo.valor - anterior.valor) / anterior.valor) * 100 : null;

        return { ...indicador, historico: propios, ultimo, variacionPct };
      });

      setIndicadores(combinados);
      setLoading(false);
    };

    cargarDatos();
  }, []);

  return (
    <div className="economic-explainer">
      <div className="ee-header">
        <div className="container">
          <Link to="/" className="ee-back-link">
            <FaArrowLeft /> Volver al portafolio
          </Link>
          <h1>Explicador Económico del Perú</h1>
          <p className="ee-subtitle">
            Pipeline de datos que extrae indicadores económicos reales del Perú (BCRP + precio del cobre),
            los procesa y actualiza automáticamente todos los días.
          </p>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="ee-repo-link">
            <FaGithub /> Ver el código en GitHub
          </a>
        </div>
      </div>

      <div className="container">
        {loading && <p className="ee-status">Cargando datos...</p>}
        {error && <p className="ee-status ee-error">No se pudieron cargar los datos: {error}</p>}

        {!loading && !error && (
          <div className="ee-grid">
            {indicadores.map((indicador, index) => (
              <motion.div
                key={indicador.id}
                className="ee-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <h3>{indicador.nombre}</h3>
                {indicador.ultimo && (
                  <>
                    <div className="ee-valor">
                      {indicador.ultimo.valor.toLocaleString('es-PE', { maximumFractionDigits: 4 })}
                      <span className="ee-unidad">{indicador.unidad}</span>
                    </div>
                    <div className="ee-fecha">
                      {indicador.ultimo.fecha}
                      {indicador.variacionPct !== null && (
                        <span className={indicador.variacionPct >= 0 ? 'ee-sube' : 'ee-baja'}>
                          {indicador.variacionPct >= 0 ? ' ▲ ' : ' ▼ '}
                          {Math.abs(indicador.variacionPct).toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </>
                )}
                <div className="ee-chart">
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={indicador.historico}>
                      <XAxis dataKey="fecha" hide />
                      <YAxis domain={['auto', 'auto']} hide />
                      <Tooltip
                        formatter={(value) => value.toLocaleString('es-PE', { maximumFractionDigits: 4 })}
                        labelFormatter={(fecha) => fecha}
                      />
                      <Line type="monotone" dataKey="valor" stroke="#06b6d4" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EconomicExplainer;
