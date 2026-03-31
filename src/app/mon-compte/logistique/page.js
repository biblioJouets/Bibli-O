import { Truck, Package, Calendar, ArrowLeftRight } from 'lucide-react';

export const metadata = { title: 'Logistique & Retours — Bibliojouets' };

export default function LogistiquePage() {
  return (
    <div>
      <h2 className="section-title">Logistique & Retours</h2>
      <p style={{ color: '#888', marginBottom: '32px' }}>
        Gérez vos envois, retours et étiquettes de transport.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Valider un retour */}
        <div className="bg-white rounded-[25px] shadow-sm p-6" style={{ border: '1px solid #eee' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full w-10 h-10" style={{ background: '#DFF1F9' }}>
              <ArrowLeftRight size={20} style={{ color: '#6EC1E4' }} aria-hidden="true" />
            </div>
            <h3 className="font-bold text-base" style={{ color: '#2E1D21' }}>Valider un retour</h3>
          </div>
          <p className="text-sm mb-4" style={{ color: '#888' }}>
            Déclarez le renvoi d&apos;un jouet et téléchargez votre étiquette de retour.
          </p>
          <div
            className="rounded-[15px] p-4 text-sm text-center font-medium"
            style={{ background: '#FFF7EB', color: '#d97706' }}
          >
            Aucun retour en attente pour le moment.
          </div>
        </div>

        {/* Étiquette de transport */}
        <div className="bg-white rounded-[25px] shadow-sm p-6" style={{ border: '1px solid #eee' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full w-10 h-10" style={{ background: '#DAEEE6' }}>
              <Package size={20} style={{ color: '#3b8c6e' }} aria-hidden="true" />
            </div>
            <h3 className="font-bold text-base" style={{ color: '#2E1D21' }}>Mes étiquettes</h3>
          </div>
          <p className="text-sm mb-4" style={{ color: '#888' }}>
            Point Relais ou domicile — retrouvez toutes vos étiquettes d&apos;expédition.
          </p>
          <div
            className="rounded-[15px] p-4 text-sm text-center font-medium"
            style={{ background: '#f3f4f6', color: '#888' }}
          >
            Aucune étiquette disponible.
          </div>
        </div>

        {/* Calendrier livraisons */}
        <div className="bg-white rounded-[25px] shadow-sm p-6" style={{ border: '1px solid #eee' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full w-10 h-10" style={{ background: '#FFF7EB' }}>
              <Calendar size={20} style={{ color: '#d97706' }} aria-hidden="true" />
            </div>
            <h3 className="font-bold text-base" style={{ color: '#2E1D21' }}>Livraisons prévisionnelles</h3>
          </div>
          <p className="text-sm mb-4" style={{ color: '#888' }}>
            Visualisez les dates de livraison et de retour estimées.
          </p>
          <div
            className="rounded-[15px] p-4 text-sm text-center font-medium"
            style={{ background: '#f3f4f6', color: '#888' }}
          >
            Calendrier en cours de développement.
          </div>
        </div>

        {/* Suivi en temps réel */}
        <div className="bg-white rounded-[25px] shadow-sm p-6" style={{ border: '1px solid #eee' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full w-10 h-10" style={{ background: '#DFF1F9' }}>
              <Truck size={20} style={{ color: '#6EC1E4' }} aria-hidden="true" />
            </div>
            <h3 className="font-bold text-base" style={{ color: '#2E1D21' }}>Suivi en temps réel</h3>
          </div>
          <p className="text-sm mb-4" style={{ color: '#888' }}>
            Suivez votre colis depuis l&apos;expédition jusqu&apos;à la livraison.
          </p>
          <div
            className="rounded-[15px] p-4 text-sm text-center font-medium"
            style={{ background: '#f3f4f6', color: '#888' }}
          >
            Aucun colis en cours de livraison.
          </div>
        </div>

      </div>
    </div>
  );
}
