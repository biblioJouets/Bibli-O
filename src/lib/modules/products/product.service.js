import prisma from '@/lib/core/database';
import { slugify } from '@/lib/core/utils/slugify';

export const productService = {
    // création produit
    async create(data){
        const { reviews, ...productData } = data;

        const cleanData = { ...productData };

        // Génère automatiquement les slugs à la création
        if (!cleanData.slug && cleanData.name) {
            const brandSlug = slugify(cleanData.brand || 'autre');
            const productSlug = slugify(cleanData.name);
            cleanData.brandSlug = brandSlug;
            cleanData.slug = `${brandSlug}/${productSlug}`;
        }

        if (reviews && reviews.create) {
            cleanData.reviews = {
                create: reviews.create
            };
        }

        return await prisma.products.create({
            data: cleanData
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
                    include: { User: { select: { firstName: true }}}
                }
            }
        });
    },

    // récupération par slug complet : "{brandSlug}/{productSlug}"
    async getBySlug(fullSlug){
        return await prisma.products.findUnique({
            where: { slug: fullSlug },
            include: {
                reviews:{
                    include: { User: { select: { firstName: true }}}
                }
            }
        });
    },
    // MAJ du produit — régénère les slugs si nom ou marque changent
    async update(id, data) {
        const cleanData = { ...data };

        if (cleanData.name || cleanData.brand) {
            const current = await prisma.products.findUnique({
                where: { id: parseInt(id) },
                select: { name: true, brand: true },
            });
            const newName = cleanData.name || current.name;
            const newBrand = cleanData.brand ?? current.brand;
            cleanData.brandSlug = slugify(newBrand || 'autre');
            cleanData.slug = `${cleanData.brandSlug}/${slugify(newName)}`;
        }

        return await prisma.products.update({
            where: { id: parseInt(id) },
            data: cleanData,
        });
    },

//delete du produit
  async delete(id) {
    return await prisma.products.delete({
      where: { id: parseInt(id) }
    });
  }
};
