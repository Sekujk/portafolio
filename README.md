# Portafolio Personal

Mi portafolio web con panel de administración para gestionar el contenido dinámicamente. Lo desarrollé como proyecto del 10mo ciclo de Ingeniería de Sistemas en la USS.

## Stack que usé

- React + Vite
- Supabase (PostgreSQL)
- React Router
- Framer Motion

## ¿Cómo funciona?

Tiene una vista pública donde muestro toda mi información y proyectos, y un panel de administración protegido donde puedo editar todo el contenido sin tocar código. Los datos los guardo en Supabase usando JSONB para mayor flexibilidad.

---

Universidad Señor de Sipan - Ingeniería de Sistemas

## Tecnologías que implementé

- **React 18** - Framework principal
- **React Router DOM** - Para la navegación
- **Framer Motion** - Animaciones fluidas
- **Supabase** - Base de datos y autenticación
- **Context API** - Manejo del estado
- **Vite** - Build tool rápido

## Estructura del Proyecto

```
src/
├── components/
│   └── ProtectedRoute.jsx     # Protección de rutas privadas
├── context/
│   ├── AuthContext.jsx         # Manejo de autenticación
│   └── PortfolioContext.jsx    # Estado del portafolio
├── config/
│   └── supabase.js             # Configuración de Supabase
├── pages/
│   ├── public/
│   │   ├── PublicPortfolio.jsx # Vista pública del portafolio
│   │   └── PublicPortfolio.css
│   └── admin/
│       ├── Login.jsx           # Login de administrador
│       ├── Login.css
│       ├── Dashboard.jsx       # Panel de administración
│       └── Dashboard.css
├── App.jsx                     # Router principal
└── index.jsx                   # Entry point
```