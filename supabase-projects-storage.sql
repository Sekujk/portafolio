-- =====================================================
-- SQL PARA BUCKET DE IMÁGENES DE PROYECTOS
-- =====================================================
-- Este archivo explica cómo el bucket 'portfolio-images'
-- también se usa para imágenes de proyectos
-- =====================================================

-- NOTA: Si ya ejecutaste supabase-storage.sql, NO necesitas
-- ejecutar este archivo. El bucket 'portfolio-images' ya
-- maneja tanto avatares como imágenes de proyectos.

-- =====================================================
-- ESTRUCTURA DEL BUCKET
-- =====================================================
--
-- portfolio-images/
-- ├── avatars/          (fotos de perfil del usuario)
-- ├── projects/         (imágenes de proyectos) ← NUEVO
-- ├── certifications/   (imágenes de certificados)
-- └── general/          (otras imágenes)
--
-- =====================================================

-- =====================================================
-- SI AÚN NO HAS CREADO EL BUCKET
-- =====================================================

-- 1. Ve a tu proyecto en Supabase
-- 2. Click en "Storage" en el menú lateral
-- 3. Si NO existe el bucket "portfolio-images":
--    a. Click en "Create a new bucket"
--    b. Name: portfolio-images
--    c. Public bucket: ✅ (DEBE estar marcado)
--    d. File size limit: 5MB (opcional pero recomendado)
--    e. Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp, image/gif
--    f. Click en "Create bucket"

-- =====================================================
-- POLÍTICAS DE ACCESO (si es necesario)
-- =====================================================

-- Si el bucket ya existe pero hay problemas de permisos,
-- ejecuta estas políticas:

-- Permitir subida de archivos (INSERT)
DROP POLICY IF EXISTS "Permitir subida de imágenes" ON storage.objects;
CREATE POLICY "Permitir subida de imágenes"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolio-images');

-- Permitir lectura pública (SELECT)
DROP POLICY IF EXISTS "Permitir lectura pública de imágenes" ON storage.objects;
CREATE POLICY "Permitir lectura pública de imágenes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-images');

-- Permitir actualización (UPDATE)
DROP POLICY IF EXISTS "Permitir actualizar imágenes" ON storage.objects;
CREATE POLICY "Permitir actualizar imágenes"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'portfolio-images');

-- Permitir eliminación (DELETE)
DROP POLICY IF EXISTS "Permitir eliminar imágenes" ON storage.objects;
CREATE POLICY "Permitir eliminar imágenes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'portfolio-images');

-- =====================================================
-- VERIFICAR CONFIGURACIÓN
-- =====================================================

-- Verificar que el bucket existe y es público
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'portfolio-images';

-- Resultado esperado:
-- | id                | name             | public |
-- |-------------------|------------------|--------|
-- | portfolio-images  | portfolio-images | true   |

-- =====================================================
-- TAMAÑOS RECOMENDADOS PARA IMÁGENES DE PROYECTOS
-- =====================================================
--
-- - Ancho: 800px - 1200px (responsive)
-- - Alto: 600px - 800px
-- - Formato: JPG, PNG o WebP
-- - Peso: máximo 500KB (comprime antes de subir)
-- - Relación de aspecto: 16:9 o 4:3
--
-- Herramientas para optimizar:
-- - TinyPNG: https://tinypng.com
-- - Squoosh: https://squoosh.app
-- - ImageOptim (Mac): https://imageoptim.com
--
-- =====================================================

-- ✅ Configuración completada
-- 
-- Ahora puedes:
-- 1. Subir imágenes desde el Dashboard en la sección "Proyectos"
-- 2. Las imágenes se guardarán en: portfolio-images/projects/
-- 3. Se generarán URLs públicas automáticamente
-- 4. Las URLs serán del tipo:
--    https://tu-proyecto.supabase.co/storage/v1/object/public/portfolio-images/projects/imagen.jpg
