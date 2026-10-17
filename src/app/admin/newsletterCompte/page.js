'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Mail, Calendar, Trophy, Users } from 'lucide-react';
import '@/styles/newsletterCompte.css';

export default function NewsletterComptePage() {
  const { data: session } = useSession();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all | won | lost | none

  useEffect(() => {
    if (!session) return;
    fetchSubscribers();
  }, [session]);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/admin/newsletter');
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des abonnés:', error);
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    const total = subscribers.length;
    const won = subscribers.filter((s) => s.rouletteWin === true).length;
    const lost = subscribers.filter((s) => s.rouletteWin === false).length;
    const none = subscribers.filter((s) => s.rouletteWin === null).length;
    return { total, won, lost, none };
  }, [subscribers]);

  const filteredSubscribers = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return subscribers.filter((s) => {
      if (filter === 'won' && s.rouletteWin !== true) return false;
      if (filter === 'lost' && s.rouletteWin !== false) return false;
      if (filter === 'none' && s.rouletteWin !== null) return false;

      if (search && !s.email?.toLowerCase().includes(search)) return false;
      return true;
    });
  }, [subscribers, searchTerm, filter]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderRouletteBadge = (rouletteWin) => {
    if (rouletteWin === true) {
      return <span className="nl-badge nl-badge-won">Gagné (Gain Bibli'o)</span>;
    }
    if (rouletteWin === false) {
      return <span className="nl-badge nl-badge-lost">Perdu</span>;
    }
    return <span className="nl-badge nl-badge-none">Non participé</span>;
  };

  return (
    <div className="nl-admin-container">
      <header className="nl-admin-header">
        <div>
          <h1 className="nl-admin-title">
            <Trophy size={32} className="nl-title-icon" />
            Newsletter & Roulette
          </h1>
          <p className="nl-admin-subtitle">
            Suivez les inscrits newsletter et les résultats de la Roue Bibli'o
          </p>
        </div>
      </header>

      <div className="nl-stats-grid">
        <div className="nl-stat-card nl-stat-total">
          <Users size={22} />
          <div>
            <span className="nl-stat-value">{counts.total}</span>
            <span className="nl-stat-label">Total inscrits</span>
          </div>
        </div>
        <div className="nl-stat-card nl-stat-won">
          <Trophy size={22} />
          <div>
            <span className="nl-stat-value">{counts.won}</span>
            <span className="nl-stat-label">Gagnants</span>
          </div>
        </div>
        <div className="nl-stat-card nl-stat-lost">
          <Mail size={22} />
          <div>
            <span className="nl-stat-value">{counts.lost}</span>
            <span className="nl-stat-label">Perdants</span>
          </div>
        </div>
        <div className="nl-stat-card nl-stat-none">
          <Users size={22} />
          <div>
            <span className="nl-stat-value">{counts.none}</span>
            <span className="nl-stat-label">Non participants</span>
          </div>
        </div>
      </div>

      <div className="nl-filters-bar">
        <div className="nl-search-wrapper">
          <Search className="nl-search-icon" size={20} />
          <input
            type="text"
            placeholder="Rechercher par email..."
            className="nl-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="nl-filter-buttons" role="group" aria-label="Filtrer par statut roulette">
          <button
            type="button"
            className={`nl-filter-btn ${filter === 'all' ? 'nl-filter-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous
          </button>
          <button
            type="button"
            className={`nl-filter-btn nl-filter-won ${filter === 'won' ? 'nl-filter-active' : ''}`}
            onClick={() => setFilter('won')}
          >
            Gagnants
          </button>
          <button
            type="button"
            className={`nl-filter-btn nl-filter-lost ${filter === 'lost' ? 'nl-filter-active' : ''}`}
            onClick={() => setFilter('lost')}
          >
            Perdants
          </button>
          <button
            type="button"
            className={`nl-filter-btn nl-filter-none ${filter === 'none' ? 'nl-filter-active' : ''}`}
            onClick={() => setFilter('none')}
          >
            Non participants
          </button>
        </div>
      </div>

      <div className="nl-table-container">
        {loading ? (
          <div className="nl-loading-state">Chargement des abonnés...</div>
        ) : (
          <table className="nl-table">
            <thead>
              <tr>
                <th>
                  <Mail size={16} className="nl-th-icon" /> Email
                </th>
                <th>
                  <Calendar size={16} className="nl-th-icon" /> Inscription
                </th>
                <th>
                  <Trophy size={16} className="nl-th-icon" /> Roulette
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <a href={`mailto:${sub.email}`} className="nl-email-link">
                        {sub.email}
                      </a>
                    </td>
                    <td>{formatDate(sub.createdAt)}</td>
                    <td>{renderRouletteBadge(sub.rouletteWin)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="nl-empty-state">
                    Aucun abonné trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
