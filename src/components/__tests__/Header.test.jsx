import React from 'react';
import { render, screen } from '@testing-library/react';
import HeaderBiblioJouets from '../Header';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';

// --- MOCKS ---
jest.mock('next-auth/react');
jest.mock('@/context/CartContext');

jest.mock('next/link', () => ({ children, href }) => <a href={href}>{children}</a>);
jest.mock('next/image', () => (props) => <img {...props} />);

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('N\'affiche PAS de badge si le panier est vide (0)', () => {
    useSession.mockReturnValue({ data: { user: { name: "Lucas", role: "USER" } } });
    useCart.mockReturnValue({ cartCount: 0 });

    render(<HeaderBiblioJouets />);
    
    const badge = screen.queryByText('0'); 
    expect(badge).toBeNull();
  });

  it('Affiche le badge avec le nombre "3" si le panier contient 3 articles', () => {
    useSession.mockReturnValue({ data: { user: { name: "Lucas" } } });
    useCart.mockReturnValue({ cartCount: 3 });

    render(<HeaderBiblioJouets />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('Affiche le bouton "Se connecter" si l\'utilisateur n\'est pas connecté', () => {
    useSession.mockReturnValue({ data: null });
    useCart.mockReturnValue({ cartCount: 0 });

    render(<HeaderBiblioJouets />);

    const buttons = screen.getAllByText(/Se connecter/i);
    
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons[0]).toBeInTheDocument();
  });
});