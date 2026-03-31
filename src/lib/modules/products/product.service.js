import prisma from '@/lib/core/database';

export const productService = {
    // création produit
    async create(data){
        // reviews peut arriver avec la syntaxe update (deleteMany + create) — invalide pour create()
        const { reviews, ...productData } = data;
        const reviewsCreate = Array.isArray(reviews?.create) ? reviews.create : [];
        return await prisma.products.create({
            data: {
                ...productData,
                ...(reviewsCreate.length > 0 ? { reviews: { create: reviewsCreate } } : {}),
            }
        });
    },
    //récupération de tous les produits / récupération produit avec filtre optionnel 
    async getAll(filters = {}){
        const { category, ageRange, isFeatured } = filters;

        const where = {};
        if (category) where.category = category;
        if (ageRange) where.ageRange = ageRange;
        if (isFeatured === 'true') where.isFeatured = true;
        return await prisma.products.findMany({
            where, 
            orderBy: { createdAt: 'desc' },
            include: {
                reviews: true, // innclusion des avis si besoin 
            }
        });
    },

    //récupération un produit par ID 
    async getById(id){
        return await prisma.products.findUnique({
            where: { id: parseInt(id)},
            include: {
                reviews:{
                    include: { User: { select: { firstName: true }}} // récupération du prénom de l'auteur de l'avis
                }
            }
        });
    },
//MAJ du produit 
  async update(id, data) {
    return await prisma.products.update({
      where: { id: parseInt(id) },
      data: data
    });
  },

//delete du produit
  async delete(id) {
    return await prisma.products.delete({
      where: { id: parseInt(id) }
    });
  }
};
