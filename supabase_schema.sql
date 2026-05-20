-- ============================================================
-- SCHÉMA SUPABASE — Portfolio Mahé Barbry
-- Coller dans : Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Table des œuvres
CREATE TABLE artworks (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title        TEXT NOT NULL,
  year         TEXT,
  medium       TEXT,
  dimensions   TEXT,
  status       TEXT DEFAULT 'Disponible',
  image_url    TEXT,
  description  TEXT,
  order_index  INTEGER DEFAULT 10,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Table du contenu éditorial (À propos, Contact, etc.)
CREATE TABLE site_content (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- ── SÉCURITÉ (Row Level Security) ──────────────────────────

ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Lecture publique (le site)
CREATE POLICY "lecture publique artworks"
  ON artworks FOR SELECT USING (true);

CREATE POLICY "lecture publique site_content"
  ON site_content FOR SELECT USING (true);

-- Écriture uniquement pour les utilisateurs connectés (admin)
CREATE POLICY "admin insert artworks"
  ON artworks FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin update artworks"
  ON artworks FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "admin delete artworks"
  ON artworks FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "admin upsert site_content"
  ON site_content FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin update site_content"
  ON site_content FOR UPDATE USING (auth.role() = 'authenticated');

-- ── DONNÉES INITIALES ───────────────────────────────────────
-- Importer les œuvres existantes
INSERT INTO artworks (title, year, medium, dimensions, status, image_url, description, order_index) VALUES
  ('Gloire & Paillettes', '2024', 'Acrylique et paillettes sur toile', '130 × 100 cm', 'Disponible', '/images/gloire-paillettes.jpg', 'Une figure triomphante baignée dans la gloire de la couleur — du rouge, du doré, et ces paillettes qui transforment chaque regard en lumière. Le personnage célèbre quelque chose, mais on ne sait pas quoi. Peut-être simplement d''exister.', 1),
  ('Original Vulture', '2024', 'Acrylique sur toile', '100 × 130 cm', 'Disponible', '/images/original-vulture.jpg', 'Le vautour comme figure totem — oiseau de charnier, mais aussi gardien. Sa présence est ambivalente : il annonce la fin et en même temps, il nettoie. Peint dans une palette froide, tranchante, le vautour original est celui qui reste quand les autres sont partis.', 2),
  ('La Ville Qui Crie', '2023', 'Acrylique sur toile', '130 × 90 cm', 'Collection privée', '/images/la-ville-qui-crie.jpg', 'La ville n''est pas un décor — c''est un personnage. Elle crie, elle pousse, elle déborde de ses propres contours. Les bâtiments sont des visages, les rues sont des bouches. La ville qui crie est celle qu''on entend sans jamais vraiment écouter.', 3),
  ('De la Démocratie', '2025', 'Acrylique, collage, spray sur toile', '90 × 120 cm', 'Disponible', '/images/de-la-democratie.jpg', 'Journaux collés, tags au spray, signes monétaires et graffitis qui se superposent dans un chaos construit. Les fragments de texte — « de la démocr… » — sont à moitié effacés, à moitié illisibles. Qu''est-ce qui reste visible dans le débat public ? Cette toile est une archive de la rue, dense et contradictoire — le bruit du monde distillé en image.', 4),
  ('Étoile Rouge', '2024', 'Acrylique sur carton', '40 × 60 cm', 'Disponible', '/images/etoile-rouge.jpg', 'Le personnage le plus direct — une figure frontale qui regarde, une étoile rouge plantée dans l''œil. L''œil-étoile : la marque, le logo, le signe distinctif. La bouche grande ouverte, les dents multicolores comme un clavier. On parle, on crie, on chante. Le personnage à l''étoile rouge est à la fois masque et miroir.', 5);

-- Contenu À propos
INSERT INTO site_content (key, value) VALUES (
  'about',
  '{
    "name": "Mahé Barbry",
    "bio_short": "Née à Castres. Vit et travaille à Agen.",
    "intro": "Une peinture figurative et brute, entre culture populaire et expressionnisme urbain — des personnages qui parlent fort, des couleurs qui ne s''excusent pas.",
    "quote": "Des personnages qui existent déjà — quelque part entre le cartoon, la rue et la peinture d''histoire.",
    "approach": "La peinture de Mahé Barbry convoque des figures hybrides, entre culture populaire et expressionnisme urbain. Les couleurs sont franches, les lignes sont épaisses, les sujets parlent fort. Chaque tableau est un rapport de force entre l''image et le regardeur.\n\nJe peins ce que l''on ne peut pas nommer. Ces états de présence à la limite du visible — quand la lumière hésite, quand la matière cède avant de tenir.\n\nMon travail prend racine dans l''observation du monde physique — mais ce n''est jamais une représentation fidèle. C''est une mémoire : ce que la sensation laisse après avoir traversé le corps.",
    "portrait": "/images/portrait.jpg",
    "exhibitions": ["À compléter"]
  }'
);

-- Contenu Contact
INSERT INTO site_content (key, value) VALUES (
  'contact',
  '{
    "email": "contact@mahebarbry.com",
    "instagram": "@mahe.barbry",
    "instagram_url": "https://instagram.com/mahe.barbry",
    "address": "Agen, France",
    "message": "Pour toute demande au sujet d''une œuvre, d''une exposition ou d''une collaboration, n''hésitez pas à écrire."
  }'
);

-- ── STORAGE (bucket "images") ────────────────────────────────
-- Lecture publique des images
CREATE POLICY "images lecture publique"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

-- Upload/modif uniquement pour les utilisateurs connectés (admin)
CREATE POLICY "images upload admin"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "images update admin"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "images delete admin"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'images' AND auth.role() = 'authenticated');
