-- El Dashboard real edita "logros" (achievements) por experiencia, no un
-- listado de tecnologías (eso solo aplica a projects). Renombra la columna
-- para que coincida con lo que el frontend realmente necesita.

alter table experience rename column technologies to achievements;
