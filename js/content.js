import { supabase } from './supabase.js'

export async function getArtworks() {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .order('order_index', { ascending: true })
  if (error) throw error
  return data.map(a => ({ ...a, id: String(a.id), image: a.image_url }))
}

export async function getAbout() {
  const { data, error } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', 'about')
    .single()
  if (error) throw error
  return data.value
}

export async function getContact() {
  const { data, error } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', 'contact')
    .single()
  if (error) throw error
  return data.value
}

export function renderGalleryGrid(artworks, container, basePath = '') {
  container.innerHTML = artworks.map(a => `
    <a href="${basePath}oeuvres/oeuvre.html?id=${a.id}" class="gallery-item">
      <div class="gallery-item__img">
        <img src="${a.image}" alt="${a.title}" loading="lazy">
      </div>
      <p class="gallery-item__title">${a.title}</p>
      <p class="gallery-item__meta">${a.year} · ${a.medium} · ${a.dimensions}</p>
    </a>
  `).join('')
}

export function renderHomeGrid(artworks, container) {
  const items = artworks.slice(0, 4)
  container.innerHTML = items.map((a, i) => `
    <a href="oeuvres/oeuvre.html?id=${a.id}" class="work-item${i === 0 ? ' work-item--featured' : ''}">
      <div class="work-item__img-wrap">
        <img src="${a.image}" alt="${a.title}" loading="lazy">
      </div>
      <div class="work-item__info">
        <span class="work-item__title">${a.title}</span>
        <span class="work-item__year">${a.year}</span>
      </div>
      <p class="work-item__sub">${a.medium} — ${a.dimensions}</p>
    </a>
  `).join('')
}

export function renderArtwork(artwork, artworks, container) {
  const idx = artworks.findIndex(a => a.id === artwork.id)
  const prev = artworks[idx - 1]
  const next = artworks[idx + 1]

  const statusClass = artwork.status === 'Disponible'
    ? 'artwork-status--available'
    : artwork.status === 'Vendu'
    ? 'artwork-status--sold'
    : ''

  container.innerHTML = `
    <div class="artwork-header">
      <p class="label">Mahé Barbry</p>
      <h1 class="artwork-title">${artwork.title}</h1>
      <span class="artwork-status ${statusClass}">${artwork.status}</span>
    </div>
    <div class="artwork-columns">
      <div>
        <p class="artwork-note">${artwork.description}</p>
      </div>
      <div class="artwork-meta">
        <div class="artwork-meta__item">
          <span class="artwork-meta__key">Année</span>
          <span class="artwork-meta__value">${artwork.year}</span>
        </div>
        <div class="artwork-meta__item">
          <span class="artwork-meta__key">Technique</span>
          <span class="artwork-meta__value">${artwork.medium}</span>
        </div>
        <div class="artwork-meta__item">
          <span class="artwork-meta__key">Dimensions</span>
          <span class="artwork-meta__value">${artwork.dimensions}</span>
        </div>
        <div class="artwork-meta__item">
          <span class="artwork-meta__key">Statut</span>
          <span class="artwork-meta__value">${artwork.status}</span>
        </div>
      </div>
    </div>
    <div class="artwork-nav">
      ${prev ? `
        <a href="oeuvre.html?id=${prev.id}" class="artwork-nav__item">
          <span class="artwork-nav__label">Précédente</span>
          <span class="artwork-nav__title">← ${prev.title}</span>
        </a>` : '<div style="min-width:160px;"></div>'}
      <div class="artwork-nav__center">
        <a href="../galerie.html">Toutes les œuvres</a>
      </div>
      ${next ? `
        <a href="oeuvre.html?id=${next.id}" class="artwork-nav__item artwork-nav__item--next">
          <span class="artwork-nav__label">Suivante</span>
          <span class="artwork-nav__title">${next.title} →</span>
        </a>` : '<div style="min-width:160px;"></div>'}
    </div>
  `
}
