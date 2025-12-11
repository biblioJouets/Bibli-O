// src/app/admin/page.js
'use client';

import { useSession, signOut } from "next-auth/react";
import Link from 'next/link';
import { Package, Users, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div style={{ padding: '120px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem'}}>
          <div>
            <h1 className="text-3xl font-bold text-pink-500 mb-2">
                Tableau de bord Administrateur
            </h1>
            <p className="text-gray-600">Bienvenue, {session?.user?.name} 👋</p>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition font-bold"
          >
            Se déconnecter
          </button>
      </header>
      
      {/* Grille de navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        
        {/* CARTE PRODUITS */}
        <Link href="/admin/products" className="block">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col items-center text-center h-full cursor-pointer hover:-translate-y-1 transform duration-200">
                <div style={{background: '#DAEEE6', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem'}}>
                    <Package size={40} color="#88D4AB" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Gestion Produits</h3>
                <p className="text-gray-500">Ajouter, modifier ou supprimer des jouets du catalogue.</p>
            </div>
        </Link>

        {/* CARTE UTILISATEURS (Futur) */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center h-full opacity-60">
            <div style={{background: '#FFF7EB', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem'}}>
                <Users size={40} color="#FFD88C" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Utilisateurs</h3>
            <p className="text-gray-500">Bientôt disponible : Gestion des comptes clients.</p>
        </div>

        {/* CARTE PARAMÈTRES (Futur) */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center h-full opacity-60">
            <div style={{background: '#F0F0F0', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem'}}>
                <Settings size={40} color="#999" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Paramètres</h3>
            <p className="text-gray-500">Configuration générale du site.</p>
        </div>

      </div>
    </div>
  );
}