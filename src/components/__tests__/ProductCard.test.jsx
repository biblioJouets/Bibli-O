import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../productCard';
import { useCart } from '@/context/CartContext';

// --- MOCKS ---
jest.mock('@/context/CartContext', () => ({
  useCart: jest.fn(),
}));

jest.mock('next/image', () => (props) => <img {...props} />);
jest.mock('next/link', () => ({ children, href }) => <a href={href}>{children}</a>);

describe('ProductCard Component', () => {
  const mockAddToCart = jest.fn();

  beforeEach(() => {
    useCart.mockReturnValue({ addToCart: mockAddToCart });
    jest.clearAllMocks();
  });

  // Donnée de base pour un produit
  const baseProduct = {
    id: 1,
    name: "Petit Ours",
    brand: "BibliO",
    stock: 5,
    price: 10,
    images: [],
    createdAt: new Date().toISOString(), 
  };

  it('Affiche le badge "NOUVEAU" si le produit est récent', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText('NOUVEAU')).toBeInTheDocument();
  });

  it('N\'affiche PAS le badge "NOUVEAU" si le produit est vieux', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 30); 

    render(<ProductCard product={{ ...baseProduct, createdAt: oldDate.toISOString() }} />);
    
    expect(screen.queryByText('NOUVEAU')).toBeNull();
  });

  it('Affiche "DÉJÀ LOUÉ" et désactive le bouton si stock = 0', () => {
    render(<ProductCard product={{ ...baseProduct, stock: 0 }} />);

    expect(screen.getByText(/DÉJÀ LOUÉ/i)).toBeInTheDocument();
    
    const button = screen.getByRole('button', { name: /Indisponible/i });
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(mockAddToCart).not.toHaveBeenCalled();
  });

  it('Appelle addToCart quand on clique sur "Ajouter au panier" (Stock > 0)', () => {
    render(<ProductCard product={baseProduct} />);

    const button = screen.getByRole('button', { name: /Ajouter au panier/i });
    fireEvent.click(button);

    expect(mockAddToCart).toHaveBeenCalledWith(1, 1);
  });
});