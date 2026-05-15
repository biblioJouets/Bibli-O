'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import '@/styles/blogs/builder.css';

// ─── Constantes ────────────────────────────────────────────────────────────

const CAT_COLORS = {
  Éveil:    { bg: '#FFD9DC', fg: '#FF8C94' },
  Écologie: { bg: '#DAEEE6', fg: '#3DA876' },
  Conseils: { bg: '#DFF1F9', fg: '#2E96C8' },
  Hygiène:  { bg: '#FFF7D4', fg: '#C19A1B' },
};

const FILTER_STYLES = {
  Tous:     { bg: '#FFFFFF', radius: '45% 55% 60% 40% / 50% 60% 40% 50%', shadow: 'rgba(46,29,33,.15)' },
  Éveil:    { bg: '#FFD9DC', radius: '55% 45% 50% 50% / 40% 60% 40% 60%', shadow: 'rgba(255,140,148,.45)' },
  Écologie: { bg: '#DAEEE6', radius: '40% 60% 65% 35% / 55% 45% 60% 40%', shadow: 'rgba(136,212,171,.45)' },
  Conseils: { bg: '#DFF1F9', radius: '60% 40% 35% 65% / 45% 55% 45% 55%', shadow: 'rgba(110,193,228,.45)' },
  Hygiène:  { bg: '#FFF7D4', radius: '50% 50% 60% 40% / 60% 40% 50% 50%', shadow: 'rgba(255,226,100,.55)' },
};

const ACCENT_COLORS = ['#FF8C94', '#6EC1E4', '#88D4AB', '#FFE264'];

const LIST_ACCENTS = ['#FFD9DC', '#DFF1F9', '#FFF7D4', '#DAEEE6', '#FFE0F0'];

const PALETTE_ITEMS = [
  { type: 'h',  label: 'Titre',        icon: '𝐓', color: '#FFD9DC' },
  { type: 'p',  label: 'Paragraphe',   icon: '¶', color: '#DFF1F9' },
  { type: 'l',  label: 'Liste ludique',icon: '①', color: '#FFF7D4' },
  { type: 'q',  label: 'Citation',     icon: '"', color: '#DAEEE6' },
  { type: 'i',  label: 'Image',        icon: '🖼', color: '#FFE0F0' },
  { type: 'b',  label: 'Bouton CTA',   icon: '↗', color: '#FFD9DC' },
];

const DEFAULT_VALUES = {
  h: 'Nouveau titre',
  p: 'Votre texte ici...',
  q: 'Une citation inspirante...',
  l: ['Élément 1', 'Élément 2', 'Élément 3'],
  i: '',
  b: 'Voir le catalogue',
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Bloc sortable dans le canvas ─────────────────────────────────────────

function SortableBlock({ block, isSelected, onSelect, onUpdate, onDelete, onMoveUp, onMoveDown }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`canvas-block ${isSelected ? 'canvas-block--selected' : ''}`}
      onClick={(e) => { e.stopPropagation(); onSelect(block.id); }}
    >
      <div className="canvas-block__controls">
        <button
          className="canvas-block__ctrl-btn canvas-block__ctrl-btn--move"
          {...listeners}
          {...attributes}
          title="Déplacer"
          onClick={(e) => e.stopPropagation()}
        >
          ⠿
        </button>
        <button className="canvas-block__ctrl-btn canvas-block__ctrl-btn--up" onClick={(e) => { e.stopPropagation(); onMoveUp(block.id); }} title="Monter">↑</button>
        <button className="canvas-block__ctrl-btn canvas-block__ctrl-btn--dn" onClick={(e) => { e.stopPropagation(); onMoveDown(block.id); }} title="Descendre">↓</button>
        <button className="canvas-block__ctrl-btn canvas-block__ctrl-btn--del" onClick={(e) => { e.stopPropagation(); onDelete(block.id); }} title="Supprimer">✕</button>
      </div>
      <BlockPreview block={block} onUpdate={onUpdate} isSelected={isSelected} />
    </div>
  );
}

// ─── Rendu WYSIWYG d'un bloc ──────────────────────────────────────────────

function BlockPreview({ block, onUpdate, isSelected }) {
  const handleTextChange = useCallback((e) => {
    onUpdate(block.id, { value: e.target.value });
  }, [block.id, onUpdate]);

  const handleListItemChange = useCallback((i, val) => {
    const arr = Array.isArray(block.value) ? [...block.value] : [];
    arr[i] = val;
    onUpdate(block.id, { value: arr });
  }, [block.id, block.value, onUpdate]);

  const addListItem = useCallback(() => {
    const arr = Array.isArray(block.value) ? [...block.value] : [];
    onUpdate(block.id, { value: [...arr, 'Nouvel élément'] });
  }, [block.id, block.value, onUpdate]);

  const removeListItem = useCallback((i) => {
    const arr = Array.isArray(block.value) ? [...block.value] : [];
    onUpdate(block.id, { value: arr.filter((_, idx) => idx !== i) });
  }, [block.id, block.value, onUpdate]);

  const handleImageDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpdate(block.id, { value: ev.target.result });
    reader.readAsDataURL(file);
  }, [block.id, onUpdate]);

  switch (block.type) {
    case 'h':
      return (
        <textarea
          className="canvas-editable canvas-h"
          value={block.value}
          onChange={handleTextChange}
          rows={1}
          onClick={(e) => e.stopPropagation()}
          style={{ minHeight: '2.5rem' }}
        />
      );

    case 'p':
      return (
        <textarea
          className="canvas-editable canvas-p"
          value={block.value}
          onChange={handleTextChange}
          rows={3}
          onClick={(e) => e.stopPropagation()}
        />
      );

    case 'q':
      return (
        <div className="canvas-q">
          <textarea
            className="canvas-editable"
            value={block.value}
            onChange={handleTextChange}
            rows={2}
            onClick={(e) => e.stopPropagation()}
            style={{ fontWeight: 600, fontSize: '1.05rem' }}
          />
        </div>
      );

    case 'l': {
      const items = Array.isArray(block.value) ? block.value : [];
      return (
        <ol className="canvas-l">
          {items.map((item, i) => (
            <li key={i}>
              <span className="canvas-l__num" style={{ background: LIST_ACCENTS[i % LIST_ACCENTS.length] }}>{i + 1}</span>
              <input
                className="canvas-editable"
                style={{ flex: 1, padding: '0.2rem' }}
                value={item}
                onChange={(e) => handleListItemChange(i, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {items.length > 1 && (
                <button
                  style={{ marginLeft: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: '#FF8C94', fontSize: '0.9rem' }}
                  onClick={(e) => { e.stopPropagation(); removeListItem(i); }}
                >✕</button>
              )}
            </li>
          ))}
          <li style={{ paddingLeft: '2.75rem' }}>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#88D4AB', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'inherit' }}
              onClick={(e) => { e.stopPropagation(); addListItem(); }}
            >+ Ajouter un élément</button>
          </li>
        </ol>
      );
    }

    case 'i':
      return (
        <div
          className="canvas-img-wrap"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleImageDrop}
          onClick={(e) => e.stopPropagation()}
        >
          {block.value ? (
            <img src={block.value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="canvas-img-placeholder">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              Glissez une image depuis votre bureau pour la remplacer
            </div>
          )}
        </div>
      );

    case 'b':
      return (
        <div className="canvas-b">
          <input
            className="canvas-editable canvas-b__btn"
            value={block.value}
            onChange={handleTextChange}
            style={{ textAlign: 'center', cursor: 'text', maxWidth: '18rem' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      );

    default:
      return null;
  }
}

// ─── Panneau propriétés (droite) ──────────────────────────────────────────

function PropertiesPanel({
  selectedBlock, blocks, onUpdateBlock, onDeleteBlock,
  meta, onMetaChange, accentColor, onAccentChange,
}) {
  const [newCatInput, setNewCatInput] = useState('');

  const addCat = () => {
    const v = newCatInput.trim();
    if (!v || meta.categories.includes(v)) return;
    onMetaChange('categories', [...meta.categories, v]);
    setNewCatInput('');
  };

  return (
    <div className="builder-props">
      <div className="builder-props__section">
        <p className="builder-props__label">Propriétés</p>
        {selectedBlock ? (
          <div className="builder-props__title-selected">
            {PALETTE_ITEMS.find((p) => p.type === selectedBlock.type)?.label ?? 'Bloc'} sélectionné
          </div>
        ) : (
          <div style={{ fontSize: '0.8rem', color: '#B09BA0', marginBottom: '1rem' }}>
            Cliquez sur un bloc pour l'éditer.
          </div>
        )}
      </div>

      <div className="builder-props__section">
        <p className="builder-props__label">Catégorie de l&apos;article</p>
        <div className="props-field">
          <select
            className="props-select"
            value={meta.category}
            onChange={(e) => onMetaChange('category', e.target.value)}
          >
            {['Éveil', 'Écologie', 'Conseils', 'Hygiène'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="props-tags">
          {meta.categories.map((c) => (
            <span key={c} className="props-tag">
              {c}
              <button className="props-tag__remove" onClick={() => onMetaChange('categories', meta.categories.filter((x) => x !== c))}>×</button>
            </span>
          ))}
        </div>

        <div className="props-tag-add">
          <input
            className="props-input"
            placeholder="Nouvelle catégorie..."
            value={newCatInput}
            onChange={(e) => setNewCatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCat(); } }}
          />
          <button className="props-tag-add__btn" onClick={addCat}>+</button>
        </div>
      </div>

      <div className="builder-props__section">
        <p className="builder-props__label">Couleur d&apos;accent</p>
        <div className="props-colors">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c}
              className={`props-color-swatch ${accentColor === c ? 'props-color-swatch--active' : ''}`}
              style={{ background: c }}
              onClick={() => onAccentChange(c)}
              title={c}
            />
          ))}
        </div>

        <p className="builder-props__label" style={{ marginTop: '0.75rem' }}>Largeur</p>
        <div className="props-width-toggle">
          {['Étroit', 'Standard', 'Large'].map((w) => (
            <button
              key={w}
              className={`props-width-btn ${meta.width === w ? 'props-width-btn--active' : ''}`}
              onClick={() => onMetaChange('width', w)}
            >{w}</button>
          ))}
        </div>

        <p className="builder-props__label">Espacement</p>
        <input
          type="range" min="1" max="10" step="1"
          className="props-slider"
          value={meta.spacing}
          onChange={(e) => onMetaChange('spacing', Number(e.target.value))}
        />
      </div>

      {selectedBlock && (
        <button
          className="props-delete-btn"
          onClick={() => onDeleteBlock(selectedBlock.id)}
        >
          🗑 Supprimer le bloc
        </button>
      )}

      <div className="props-seo-section">
        <p className="builder-props__label">SEO</p>
        <div className="props-field">
          <label className="props-field-label">Méta-description</label>
          <textarea
            className="props-textarea"
            placeholder="Description pour les moteurs de recherche..."
            value={meta.metaDescription}
            onChange={(e) => onMetaChange('metaDescription', e.target.value)}
            rows={3}
          />
        </div>

      </div>
    </div>
  );
}

// ─── Vue liste des articles ───────────────────────────────────────────────

function ArticleListView({ articles, onNew, onEdit, onDelete }) {
  const [filter, setFilter] = useState('Tous');

  const list = filter === 'Tous' ? articles : articles.filter((a) => a.category === filter);

  return (
    <div className="admin-blog-page">
      <div className="admin-blog-page__header">
        <div>
          <h1 className="admin-blog-page__title">Gestion des articles</h1>
          <p className="admin-blog-page__subtitle">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="admin-blog-new-btn" onClick={onNew}>+ Nouvel article</button>
      </div>

      <div className="admin-blog-filters">
        <div className="admin-blog-filters__row">
          {['Tous', 'Éveil', 'Écologie', 'Conseils', 'Hygiène'].map((c) => {
            const s = FILTER_STYLES[c];
            const isActive = c === filter;
            return (
              <button
                key={c}
                className="admin-filter-btn"
                onClick={() => setFilter(c)}
                style={{
                  background: s.bg,
                  borderRadius: s.radius,
                  boxShadow: isActive
                    ? `0 6px 22px ${s.shadow}, inset 0 0 0 3px #2E1D21`
                    : `0 4px 14px ${s.shadow}`,
                  transform: isActive ? 'translateY(-2px)' : 'none',
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#8C7B7F' }}>
          Aucun article dans cette catégorie.
        </div>
      ) : (
        <div className="admin-blog-grid">
          {list.map((a) => {
            const cat = CAT_COLORS[a.category] ?? { bg: '#F0E8E0', fg: '#8C7B7F' };
            return (
              <div key={a.id} className="admin-blog-card">
                <div className="admin-blog-card__img-wrap">
                  <div className="admin-blog-card__img-inner">
                    {a.thumbnail ? (
                      <Image src={a.thumbnail} alt={a.title} fill sizes="400px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ background: '#F4EFE9', width: '100%', height: '100%' }} />
                    )}
                  </div>
                  <span className="admin-blog-card__cat" style={{ background: cat.bg, color: cat.fg }}>
                    {a.category}
                  </span>
                  <span className={`admin-blog-card__status ${a.isPublished ? 'admin-blog-card__status--published' : 'admin-blog-card__status--draft'}`}>
                    {a.isPublished ? '● Publié' : '● Brouillon'}
                  </span>
                </div>
                <div className="admin-blog-card__body">
                  <h3 className="admin-blog-card__title">{a.title}</h3>
                  {a.excerpt && <p className="admin-blog-card__excerpt">{a.excerpt}</p>}
                  <div className="admin-blog-card__footer">
                    <span className="admin-blog-card__meta">
                      {a.author} · {a.readTime ?? ''}
                    </span>
                    <div className="admin-blog-card__actions">
                      <Link
                        href={`/blogs/${a.slug}`}
                        target="_blank"
                        className="admin-blog-card__action-btn admin-blog-card__action-btn--view"
                        title="Voir"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </Link>
                      <button
                        className="admin-blog-card__action-btn admin-blog-card__action-btn--edit"
                        title="Modifier"
                        onClick={() => onEdit(a)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        className="admin-blog-card__action-btn admin-blog-card__action-btn--delete"
                        title="Supprimer"
                        onClick={() => onDelete(a.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Builder principal ────────────────────────────────────────────────────

function BlogBuilder({ initialArticle, onBack, onSaved }) {
  const isEdit = !!initialArticle;

  const [title, setTitle] = useState(initialArticle?.title ?? 'Nouvel article');
  const [blocks, setBlocks] = useState(
    Array.isArray(initialArticle?.content) ? initialArticle.content : []
  );
  const [selectedId, setSelectedId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
  const [meta, setMeta] = useState({
    category: initialArticle?.category ?? 'Éveil',
    categories: initialArticle?.category ? [initialArticle.category] : ['Éveil'],
    metaDescription: initialArticle?.excerpt ?? '',
    slug: initialArticle?.slug ?? '',
    author: initialArticle?.author ?? "L'équipe Bibli'o",
    readTime: initialArticle?.readTime ?? '5 min',
    thumbnail: initialArticle?.thumbnail ?? '',
    width: 'Standard',
    spacing: 5,
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleMetaChange = useCallback((key, value) => {
    setMeta((m) => ({ ...m, [key]: value }));
    setIsDirty(true);
  }, []);

  const addBlock = useCallback((type) => {
    const newBlock = { id: uid(), type, value: DEFAULT_VALUES[type] };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedId(newBlock.id);
    setIsDirty(true);
  }, []);

  const updateBlock = useCallback((id, patch) => {
    setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, ...patch } : b));
    setIsDirty(true);
  }, []);

  const deleteBlock = useCallback((id) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedId((sel) => sel === id ? null : sel);
    setIsDirty(true);
  }, []);

  const moveBlock = useCallback((id, dir) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (dir === 'up' && idx > 0) return arrayMove(prev, idx, idx - 1);
      if (dir === 'dn' && idx < prev.length - 1) return arrayMove(prev, idx, idx + 1);
      return prev;
    });
    setIsDirty(true);
  }, []);

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveId(null);
    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const from = prev.findIndex((b) => b.id === active.id);
        const to = prev.findIndex((b) => b.id === over.id);
        return arrayMove(prev, from, to);
      });
      setIsDirty(true);
    }
  }, []);

  const handlePublish = useCallback(async (publish = true) => {
    setIsSaving(true);
    const payload = {
      id: initialArticle?.id,
      title,
      slug: meta.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category: meta.category,
      excerpt: meta.metaDescription,
      author: meta.author,
      readTime: meta.readTime,
      thumbnail: meta.thumbnail,
      content: blocks,
      isPublished: publish,
    };
    // TODO: persist — replace console.log with fetch('/api/admin/blogs', { method: isEdit ? 'PUT' : 'POST', body: JSON.stringify(payload) })
    console.log('[BlogBuilder] payload:', payload);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/blogs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur serveur');
      setSavedAt(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      setIsDirty(false);
      if (onSaved) onSaved(data);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde : ' + err.message);
    } finally {
      setIsSaving(false);
    }
  }, [title, meta, blocks, isEdit, initialArticle, onSaved]);

  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;
  const cat = CAT_COLORS[meta.category] ?? { bg: '#FFD9DC', fg: '#FF8C94' };

  return (
    <div className="builder-page">
      {/* Top bar */}
      <div className="builder-topbar">
        <button className="builder-topbar__back" onClick={onBack} title="Retour">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

        <div className="builder-topbar__title-wrap">
          <input
            className="canvas-editable builder-topbar__title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
            style={{ fontSize: '1rem', fontWeight: 700 }}
          />
          <div className="builder-topbar__status">
            <span className={`builder-topbar__status-dot ${savedAt && !isDirty ? 'builder-topbar__status-dot--saved' : ''}`} />
            {isSaving ? 'Enregistrement...' : savedAt && !isDirty
              ? `Enregistré à ${savedAt}`
              : 'Brouillon · non enregistré'}
          </div>
        </div>

        <div className="builder-topbar__actions">
          <button className="builder-btn-preview" onClick={() => window.open(`/blogs/${meta.slug || 'apercu'}`, '_blank')}>
            Aperçu
          </button>
          <button
            className="builder-btn-publish"
            onClick={() => handlePublish(true)}
            disabled={isSaving}
          >
            {isSaving ? '...' : '✓ Mettre en ligne'}
          </button>
        </div>
      </div>

      {/* Corps */}
      <div className="builder-body">
        {/* Palette gauche */}
        <div className="builder-palette">
          <p className="builder-palette__label">Composants</p>
          {PALETTE_ITEMS.map((item) => (
            <button
              key={item.type}
              className="palette-item"
              onClick={() => addBlock(item.type)}
              title={`Ajouter ${item.label}`}
              style={{ cursor: 'pointer', border: 'none', textAlign: 'left', width: '100%' }}
            >
              <span className="palette-item__icon" style={{ background: item.color }}>
                {item.icon}
              </span>
              <span className="palette-item__name">{item.label}</span>
              <span className="palette-item__drag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                  <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                  <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                </svg>
              </span>
            </button>
          ))}

          <div className="builder-palette__tip">
            <strong>💡 Astuce</strong>
            Cliquez sur un composant pour l&apos;ajouter à l&apos;article.
          </div>
        </div>

        {/* Canvas central */}
        <div className="builder-canvas-wrap" onClick={() => setSelectedId(null)}>
          <div className="builder-canvas">
            {/* Indicateur catégorie */}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span className="builder-canvas__hero-badge" style={{ background: cat.bg, color: cat.fg }}>
                {meta.category.toUpperCase()}
              </span>
            </div>

            {/* Blocs */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={({ active }) => setActiveId(active.id)}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    isSelected={selectedId === block.id}
                    onSelect={setSelectedId}
                    onUpdate={updateBlock}
                    onDelete={deleteBlock}
                    onMoveUp={(id) => moveBlock(id, 'up')}
                    onMoveDown={(id) => moveBlock(id, 'dn')}
                  />
                ))}
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <div style={{ opacity: 0.8, background: '#fff', borderRadius: 14, padding: '0.5rem 1rem', boxShadow: '0 8px 24px rgba(46,29,33,.15)' }}>
                    Déplacement en cours...
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {blocks.length === 0 && (
              <div className="canvas-drop-zone">
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✍️</div>
                  <div>Cliquez sur un composant à gauche pour commencer à écrire</div>
                </div>
              </div>
            )}
          </div>

          {/* Champs meta sous le canvas */}
          <div style={{ background: '#fff', borderRadius: 20, padding: '1.5rem', width: '100%', maxWidth: '42rem', boxShadow: '0 4px 20px rgba(46,29,33,.06)' }}>
            <p className="builder-props__label" style={{ margin: '0 0 0.75rem' }}>Métadonnées de l&apos;article</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="props-field">
                <label className="props-field-label">Slug URL</label>
                <input className="props-input" placeholder="mon-article-slug" value={meta.slug} onChange={(e) => handleMetaChange('slug', e.target.value)} />
              </div>
              <div className="props-field">
                <label className="props-field-label">Auteur</label>
                <input className="props-input" value={meta.author} onChange={(e) => handleMetaChange('author', e.target.value)} />
              </div>
              <div className="props-field">
                <label className="props-field-label">Temps de lecture</label>
                <input className="props-input" placeholder="5 min" value={meta.readTime} onChange={(e) => handleMetaChange('readTime', e.target.value)} />
              </div>
              <div className="props-field">
                <label className="props-field-label">URL image à la une</label>
                <input className="props-input" placeholder="/assets/..." value={meta.thumbnail} onChange={(e) => handleMetaChange('thumbnail', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Panneau propriétés droite */}
        <PropertiesPanel
          selectedBlock={selectedBlock}
          blocks={blocks}
          onUpdateBlock={updateBlock}
          onDeleteBlock={deleteBlock}
          meta={meta}
          onMetaChange={handleMetaChange}
          accentColor={accentColor}
          onAccentChange={setAccentColor}
        />
      </div>
    </div>
  );
}

// ─── Page racine ──────────────────────────────────────────────────────────

export default function AdminBlogsPage() {
  const [view, setView] = useState('list'); // 'list' | 'builder'
  const [editingArticle, setEditingArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chargement initial
  useEffect(() => {
    fetch('/api/admin/blogs')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setArticles(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleNew = () => {
    setEditingArticle(null);
    setView('builder');
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setView('builder');
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      await fetch('/api/admin/blogs', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleSaved = (saved) => {
    setArticles((prev) => {
      const exists = prev.find((a) => a.id === saved.id);
      return exists ? prev.map((a) => a.id === saved.id ? saved : a) : [saved, ...prev];
    });
  };

  if (view === 'builder') {
    return (
      <BlogBuilder
        initialArticle={editingArticle}
        onBack={() => setView('list')}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <ArticleListView
      articles={articles}
      onNew={handleNew}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
