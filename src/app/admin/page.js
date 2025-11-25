// src/app/admin/page.js
'use client';

import { useSession, signOut } from "next-auth/react";

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div style={{ padding: '100px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="text-3xl font-bold text-pink-500 mb-4">
        Tableau de bord Administrateur
      </h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-lg mb-4">
          Bonjour <strong>{session?.user?.name}</strong> ! 👋
        </p>
        <p className="mb-4">
          Vous êtes connecté en tant que : <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-bold">{session?.user?.role}</span>
        </p>
        
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}