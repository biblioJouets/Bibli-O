/**
 * @jest-environment node
 */
import { PUT } from '../route'; 
import { getServerSession } from "next-auth";
import { NextResponse } from 'next/server';

// 1. On Mock (simule) l'authentification et la base de données
jest.mock("next-auth");
jest.mock("@/app/api/auth/[...nextauth]/route", () => ({ authOptions: {} }));
jest.mock("@/lib/modules/users/user.service", () => ({
  userService: {
    update: jest.fn(),
  },
}));

describe('API User IDOR Protection', () => {
  
  it('Doit bloquer (403) un utilisateur qui tente de modifier le profil d\'un autre', async () => {
    // SCÉNARIO : L'utilisateur connecté a l'ID "10", mais veut modifier l'ID "99"
    getServerSession.mockResolvedValue({
      user: { id: "10", role: "USER" } // Utilisateur Lambda
    });

    const params = { params: { id: "99" } }; // Cible différente
    const req = {
      json: async () => ({ firstName: "Hacker" })
    };

    const response = await PUT(req, params);
    const body = await response.json();

    // VÉRIFICATION
    expect(response.status).toBe(403);
    expect(body.message).toBe("Non autorisé");
  });

  it('Doit autoriser (200) un utilisateur à modifier son PROPRE profil', async () => {
    // SCÉNARIO : L'utilisateur "10" modifie "10"
    getServerSession.mockResolvedValue({
      user: { id: "10", role: "USER" }
    });

    // Mock du service pour simuler une réussite
    const { userService } = require("@/lib/modules/users/user.service");
    userService.update.mockResolvedValue({ id: 10, firstName: "Valid" });

    const params = { params: { id: "10" } };
    const req = {
      json: async () => ({ firstName: "Valid" })
    };

    const response = await PUT(req, params);
    
    expect(response.status).toBe(200);
  });
});