import React from 'react';
import { render, screen } from '@testing-library/react';
import PanierPage from '../page';
import { useCart } from '@/context/CartContext';

// --- MOCKS ---
jest.mock('@/context/CartContext');
jest.mock('next/link', () => ({ children, href }) => <a href={href}>{children}</a>);

jest.mock('next/image', () => ({ src, alt, fill, ...props }) => (
  <img src={src} alt={alt} {...props} />
));

jest.mock('@/components/ButtonBlue', () => ({ text }) => <button>{text}</button>);

describe('Page Panier', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Affiche "Votre coffre à jouets est vide" si le panier est vide', () => {
    useCart.mockReturnValue({ 
      cart: { items: [] },
      updateQuantity: jest.fn(),
      removeFromCart: jest.fn()
    });

    render(<PanierPage />);
    expect(screen.getByText(/Votre coffre à jouets est vide/i)).toBeInTheDocument();
  });

  it('Affiche la liste des produits et la formule suggérée (Standard)', () => {
    const mockItems = [
      { id: 1, quantity: 1, product: { id: 10, name: "Lego Château", price: 50, reference: "L1" } },
      { id: 2, quantity: 1, product: { id: 11, name: "Poupée", price: 30, reference: "P1" } },
      { id: 3, quantity: 1, product: { id: 12, name: "Puzzle", price: 20, reference: "Z1" } },
    ];

    useCart.mockReturnValue({ 
      cart: { items: mockItems },
      updateQuantity: jest.fn(),
      removeFromCart: jest.fn()
    });

    render(<PanierPage />);

    expect(screen.getByText("Lego Château")).toBeInTheDocument();
    expect(screen.getByText("Poupée")).toBeInTheDocument();

    expect(screen.getByText("3")).toBeInTheDocument();

    expect(screen.getByText("Standard")).toBeInTheDocument();
    expect(screen.getByText(/25€/)).toBeInTheDocument(); 
  });

  it('Affiche "Sur devis" si plus de 6 articles', () => {
    const mockItems = [
      { id: 1, quantity: 7, product: { id: 10, name: "Lego", price: 50 } },
    ];

    useCart.mockReturnValue({ 
      cart: { items: mockItems },
    });

    render(<PanierPage />);

    expect(screen.getByText("Sur devis")).toBeInTheDocument();
    expect(screen.getByText(/Nous contacter/i)).toBeInTheDocument();
  });
});