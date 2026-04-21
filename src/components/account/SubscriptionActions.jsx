'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CANCEL_REASONS = [
  { value: 'price', label: 'Le prix est trop élevé' },
  { value: 'usage', label: 'Mon enfant n\'utilise plus assez les jouets' },
  { value: 'selection', label: 'Le choix de jouets ne me convient pas' },
  { value: 'moving', label: 'Je déménage ou change de situation' },
  { value: 'pause', label: 'J\'ai besoin d\'une pause temporaire' },
  { value: 'other', label: 'Autre raison' },
];

const RETENTION_MESSAGES = {
  price: {
    title: 'Un abonnement adapté à votre budget',
    body: 'Saviez-vous que vous pouvez réduire votre formule à 1 jouet dès 20€/mois ? Contactez-nous pour trouver la formule qui vous convient.',
  },
  usage: {
    title: 'Les enfants adorent la nouveauté',
    body: 'Nos jouets évoluent chaque mois ! Faites un échange pour découvrir de nouvelles activités adaptées à l\'âge de votre enfant.',
  },
  selection: {
    title: 'Notre catalogue grandit chaque semaine',
    body: 'Nous ajoutons régulièrement de nouveaux jouets. Avez-vous essayé la fonctionnalité "Favoris" pour noter vos préférences ?',
  },
  moving: {
    title: 'La pause, une option plus flexible',
    body: 'Plutôt que de résilier, vous pouvez mettre votre abonnement en pause le temps de votre déménagement et reprendre quand vous le souhaitez.',
  },
  pause: {
    title: 'La pause vacances, c\'est fait pour ça !',
    body: 'Vous pouvez mettre votre abonnement en pause sans le résilier. Reprenez dès que vous êtes prêt, sans aucune démarche supplémentaire.',
  },
  other: {
    title: 'On aimerait mieux vous comprendre',
    body: 'Avant de partir, avez-vous essayé de nous contacter ? Notre équipe est disponible pour trouver une solution personnalisée pour vous.',
  },
};

// ────────────────────────────────────────────────────────────────
// Modale Pause
// ────────────────────────────────────────────────────────────────
function PauseModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handlePause = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/stripe/pause-subscription', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise en pause.');
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2E1D21]/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[25px] shadow-xl max-w-md w-full p-6 flex flex-col gap-4">
        <div className="text-center">
          <span className="text-4xl">☀️</span>
          <h3 className="text-xl font-bold text-[#2E1D21] mt-2">Option Vacances</h3>
          <p className="text-sm text-[#2E1D21]/70 mt-2 leading-relaxed">
            Mettez votre abonnement en pause pendant vos vacances ou une période d&apos;absence.
            <strong className="text-[#2E1D21]"> Aucune facture ne sera émise</strong> pendant la pause.
          </p>
          <p className="text-sm text-[#2E1D21]/50 mt-2">
            Les jouets restent chez vous. Vous reprendrez votre abonnement normal dès votre retour.
          </p>
        </div>

        <div className="rounded-[16px] p-4 text-sm" style={{ background: '#FFF7E6', border: '1px solid #FFE08A' }}>
          <p className="font-semibold text-[#7a5c00] mb-1">📋 Comment ça fonctionne ?</p>
          <ul className="text-[#7a5c00] space-y-1 text-xs list-disc list-inside">
            <li>La pause prend effet immédiatement</li>
            <li>Aucun prélèvement pendant la pause</li>
            <li>Contactez-nous pour reprendre quand vous le souhaitez</li>
          </ul>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex flex-col gap-2 mt-1">
          <button
            type="button"
            onClick={handlePause}
            disabled={loading}
            className="w-full px-5 py-3 rounded-full font-semibold text-sm text-white transition-colors shadow-sm disabled:opacity-50"
            style={{ background: '#FFE08A', color: '#7a5c00' }}
          >
            {loading ? 'Mise en pause...' : '☀️ Confirmer la mise en pause'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#a0888c] underline underline-offset-2 text-center mt-1"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Modale Résiliation (3 étapes)
// ────────────────────────────────────────────────────────────────
function CancelModal({ cancelAtDate, onClose, onSuccess }) {
  const [step,   setStep]   = useState(1); // 1 = raison, 2 = rétention, 3 = confirmation
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const retention = RETENTION_MESSAGES[reason] ?? null;

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/stripe/cancel-subscription', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la résiliation.');
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2E1D21]/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[25px] shadow-xl max-w-md w-full p-6 flex flex-col gap-4">

        {/* Indicateur d'étape */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="h-1.5 rounded-full transition-all"
              style={{
                width: s === step ? '32px' : '12px',
                background: s === step ? '#FF8C94' : '#f3f4f6',
              }} />
          ))}
        </div>

        {/* Étape 1 : Raison */}
        {step === 1 && (
          <>
            <div className="text-center">
              <span className="text-4xl">💬</span>
              <h3 className="text-xl font-bold text-[#2E1D21] mt-2">Pourquoi souhaitez-vous partir ?</h3>
              <p className="text-sm text-[#2E1D21]/60 mt-1">
                Votre retour nous aide à nous améliorer.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {CANCEL_REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className="w-full px-4 py-3 rounded-[16px] text-sm text-left font-medium transition-colors"
                  style={{
                    background: reason === r.value ? '#FFD9DC' : '#f9f9f9',
                    border: reason === r.value ? '1.5px solid #FF8C94' : '1.5px solid #eee',
                    color: '#2E1D21',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 mt-1">
              <button
                type="button"
                onClick={() => { if (reason) setStep(2); }}
                disabled={!reason}
                className="w-full px-5 py-3 rounded-full font-semibold text-sm text-white transition-colors disabled:opacity-40"
                style={{ background: '#FF8C94' }}
              >
                Continuer →
              </button>
              <button type="button" onClick={onClose}
                className="text-xs text-[#a0888c] underline underline-offset-2 text-center">
                Annuler
              </button>
            </div>
          </>
        )}

        {/* Étape 2 : Message de rétention */}
        {step === 2 && retention && (
          <>
            <div className="text-center">
              <span className="text-4xl">🧸</span>
              <h3 className="text-xl font-bold text-[#2E1D21] mt-2">{retention.title}</h3>
              <p className="text-sm text-[#2E1D21]/70 mt-2 leading-relaxed">{retention.body}</p>
            </div>

            {reason === 'pause' && (
              <div className="rounded-[16px] p-4 text-sm text-center"
                style={{ background: '#FFF7E6', border: '1px solid #FFE08A' }}>
                <p className="font-semibold text-[#7a5c00]">
                  ☀️ Plutôt que de résilier, essayez la pause !
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 mt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-full px-5 py-3 rounded-full font-semibold text-sm transition-colors"
                style={{ background: '#DAEEE6', color: '#2E1D21' }}
              >
                Finalement, je reste 🧸
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs text-[#a0888c] underline underline-offset-2 text-center mt-1"
              >
                Je confirme ma résiliation
              </button>
            </div>
          </>
        )}

        {/* Étape 3 : Confirmation finale */}
        {step === 3 && (
          <>
            <div className="text-center">
              <span className="text-4xl">⚠️</span>
              <h3 className="text-xl font-bold text-[#2E1D21] mt-2">Résiliation définitive</h3>
              {cancelAtDate && (
                <div className="mt-3 rounded-[16px] p-3 text-sm"
                  style={{ background: '#FFF7E6', border: '1px solid #FFE08A' }}>
                  <p className="font-semibold text-[#7a5c00]">
                    Votre accès reste actif jusqu&apos;au <strong>{cancelAtDate}</strong>.
                  </p>
                  <p className="text-xs text-[#7a5c00]/80 mt-1">
                    Vous conservez vos jouets jusqu&apos;à cette date, sans aucun prélèvement supplémentaire.
                  </p>
                </div>
              )}
              <p className="text-sm text-[#2E1D21]/60 mt-3 leading-relaxed">
                Après la résiliation, vous devrez retourner vos jouets. Cette action est <strong>irréversible</strong>.
              </p>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex flex-col gap-2 mt-1">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="w-full px-5 py-3 rounded-full font-bold text-sm text-white transition-colors disabled:opacity-50"
                style={{ background: '#e05252' }}
              >
                {loading ? 'Résiliation en cours...' : 'Confirmer la résiliation définitive'}
              </button>
              <button type="button" onClick={onClose}
                className="text-xs text-[#a0888c] underline underline-offset-2 text-center">
                Annuler — je garde mon abonnement
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Composant principal exporté
// ────────────────────────────────────────────────────────────────
export default function SubscriptionActions({ cancelAtDate, isPaused, isCancelScheduled }) {
  const router = useRouter();
  const [modal, setModal]   = useState(null); // null | 'pause' | 'cancel'
  const [success, setSuccess] = useState(null);

  const handleSuccess = (type) => {
    setModal(null);
    setSuccess(type);
    // Rafraîchir les données serveur
    setTimeout(() => router.refresh(), 1000);
  };

  if (isCancelScheduled || isPaused) return null; // Déjà dans un état terminal, pas d'actions

  return (
    <>
      {modal === 'pause' && (
        <PauseModal
          onClose={() => setModal(null)}
          onSuccess={() => handleSuccess('pause')}
        />
      )}
      {modal === 'cancel' && (
        <CancelModal
          cancelAtDate={cancelAtDate}
          onClose={() => setModal(null)}
          onSuccess={() => handleSuccess('cancel')}
        />
      )}

      {success === 'pause' && (
        <div className="p-4 rounded-[16px] text-sm font-medium mb-4"
          style={{ background: '#FFF7E6', border: '1px solid #FFE08A', color: '#7a5c00' }}>
          ☀️ Votre abonnement a bien été mis en pause. Revenez quand vous le souhaitez !
        </div>
      )}
      {success === 'cancel' && (
        <div className="p-4 rounded-[16px] text-sm font-medium mb-4"
          style={{ background: '#FFD9DC', border: '1px solid #FF8C94', color: '#7a0010' }}>
          Votre résiliation a été enregistrée. Votre accès reste actif jusqu&apos;à la fin de votre cycle de facturation.
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-6 pt-6" style={{ borderTop: '1px solid #f3f4f6' }}>
        <button
          type="button"
          onClick={() => setModal('pause')}
          className="px-5 py-2.5 rounded-full font-semibold text-sm transition-colors"
          style={{ background: '#FFF7E6', border: '1px solid #FFE08A', color: '#7a5c00' }}
        >
          ☀️ Mettre en pause
        </button>
        <button
          type="button"
          onClick={() => setModal('cancel')}
          className="px-5 py-2.5 rounded-full font-semibold text-sm transition-colors"
          style={{ background: '#fff', border: '1px solid #e05252', color: '#e05252' }}
        >
          Résilier mon abonnement
        </button>
      </div>
    </>
  );
}
