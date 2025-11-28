// src/lib/modules/products/product.controller.js
import { NextResponse } from 'next/server';
import { productService } from './product.service';

export const productController = {
  // POST: Créer
  async create(request) {
    try {
      const body = await request.json();
      
      // Validation simple A ajouter ZOD 
      if (!body.name || !body.price || !body.reference) {
        return NextResponse.json({ message: "Champs obligatoires manquants" }, { status: 400 });
      }

      const product = await productService.create(body);
      return NextResponse.json(product, { status: 201 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: "Erreur création produit" }, { status: 500 });
    }
  },

  // GET tous les produits (liste )
  async getAll(request) {
    try {
      const { searchParams } = new URL(request.url);
      const filters = {
        category: searchParams.get('category'),
        ageRange: searchParams.get('ageRange'),
        isFeatured: searchParams.get('isFeatured'),
      };

      const products = await productService.getAll(filters);
      return NextResponse.json(products);
    } catch (error) {
      return NextResponse.json({ message: "Erreur récupération produits" }, { status: 500 });
    }
  },

  // Get Par id ( un produit )
  async getById(request, { params }) {
    try {
      const { id } = params;
      const product = await productService.getById(id);
      
      if (!product) return NextResponse.json({ message: "Produit non trouvé" }, { status: 404 });
      
      return NextResponse.json(product);
    } catch (error) {
      return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
  },

  // UPDATE
  async update(request, { params }) {
    try {
      const { id } = params;
      const body = await request.json();
      const updatedProduct = await productService.update(id, body);
      return NextResponse.json(updatedProduct);
    } catch (error) {
      return NextResponse.json({ message: "Erreur mise à jour" }, { status: 500 });
    }
  },

  // DELETE
  async delete(request, { params }) {
    try {
      const { id } = params;
      await productService.delete(id);
      return NextResponse.json({ message: "Produit supprimé avec succès" });
    } catch (error) {
      return NextResponse.json({ message: "Erreur suppression" }, { status: 500 });
    }
  }
};