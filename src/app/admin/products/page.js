'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { 
    Plus, Search, Edit3, Trash2, Eye, 
    CheckCircle, XCircle, X, UploadCloud, 
    FileText, ListPlus, MinusCircle, Star
} from 'lucide-react';
import '@/styles/adminProducts.css';

export default function AdminProductsPage() {
    const { data: session } = useSession();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); 
    const [currentProduct, setCurrentProduct] = useState({});
    
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingPdf, setIsUploadingPdf] = useState(false);
    const [draggedImageIndex, setDraggedImageIndex] = useState(null);

    // État temporaire pour l'ajout d'un "Plus produit"
    const [newHighlight, setNewHighlight] = useState("");
    
    // État temporaire pour l'ajout d'un "Avis Client"
    const [newReview, setNewReview] = useState({ rating: 5, authorName: "", comment: "" });

    const emptyProduct = {
        reference: "BJ", name: "", description: "", price: "", stock: 1,
        brand: "", ageRange: "", category: "", tags: [], images: [],
        highlights: [], reviews: [],
        manualUrl: "", weight: "", length: "", width: "", height: "",
        pieceCount: "", condition: "NEW", isFeatured: false, rating: 0
    };

    useEffect(() => {
        fetchProducts();
    }, [session]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            data.sort((a, b) => (a.reference || "").localeCompare(b.reference || ""));
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const existingCategories = useMemo(() => 
        [...new Set(products.map(p => p.category).filter(Boolean))].sort(), 
    [products]);

    const existingAges = useMemo(() => 
        [...new Set(products.map(p => p.ageRange).filter(Boolean))].sort(), 
    [products]);

    // --- LOGIQUE IMAGES & PDF (Conservée à l'identique) ---
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setIsUploadingImage(true);
        const newImages = [];
        try {
            await Promise.all(files.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const data = await res.json();
                if (data.success) newImages.push(data.url);
            }));
            setCurrentProduct(prev => ({...prev, images: [...(prev.images || []), ...newImages]}));
        } catch (err) {
            alert("Erreur lors de l'upload des images");
        } finally {
            setIsUploadingImage(false);
            e.target.value = null;
        }
    };

    const handleDragStart = (index) => setDraggedImageIndex(index);
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (index) => {
        if (draggedImageIndex === null || draggedImageIndex === index) return;
        const updatedImages = [...(currentProduct.images || [])];
        const itemToMove = updatedImages[draggedImageIndex];
        updatedImages.splice(draggedImageIndex, 1);
        updatedImages.splice(index, 0, itemToMove);
        setCurrentProduct({ ...currentProduct, images: updatedImages });
        setDraggedImageIndex(null);
    };
    const removeImage = (index) => {
        setCurrentProduct({ ...currentProduct, images: currentProduct.images.filter((_, i) => i !== index) });
    };

    const handlePdfUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploadingPdf(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) setCurrentProduct({ ...currentProduct, manualUrl: data.url });
        } catch (err) {
            alert("Erreur upload PDF");
        } finally {
            setIsUploadingPdf(false);
            e.target.value = null;
        }
    };

    // --- GESTION "LES +" ---
    const addHighlight = () => {
        if (!newHighlight.trim()) return;
        setCurrentProduct(prev => ({...prev, highlights: [...(prev.highlights || []), newHighlight.trim()]}));
        setNewHighlight("");
    };
    const removeHighlight = (index) => {
        setCurrentProduct({ ...currentProduct, highlights: currentProduct.highlights.filter((_, i) => i !== index) });
    };

    // --- GESTION DES AVIS CLIENTS ---
    const addReview = () => {
        // Règle de sécurité : Étoiles obligatoires (entre 1 et 5)
        if (newReview.rating < 1 || newReview.rating > 5) {
            alert("Veuillez sélectionner une note entre 1 et 5 étoiles.");
            return;
        }
        
        setCurrentProduct(prev => ({
            ...prev,
            reviews: [...(prev.reviews || []), { ...newReview }]
        }));
        
        // On réinitialise l'input
        setNewReview({ rating: 5, authorName: "", comment: "" });
    };
    
    const removeReview = (index) => {
        setCurrentProduct({ ...currentProduct, reviews: currentProduct.reviews.filter((_, i) => i !== index) });
    };

    // --- SAUVEGARDE ---
    const handleSave = async (e) => {
        e.preventDefault();
        const method = modalMode === 'create' ? 'POST' : 'PUT';
        const url = modalMode === 'create' ? '/api/products' : `/api/products/${currentProduct.id}`;

        try {
            const { id, createdAt, updatedAt, cartItems, OrderProducts, reviews, ...cleanData } = currentProduct;

            // Calcul automatique de la moyenne des étoiles pour la BDD
            const finalReviews = reviews || [];
            const averageRating = finalReviews.length > 0 
                ? finalReviews.reduce((sum, r) => sum + parseInt(r.rating), 0) / finalReviews.length 
                : 0;

            const payload = {
                ...cleanData,
                price: parseFloat(cleanData.price) || 0,
                stock: parseInt(cleanData.stock) || 0,
                weight: parseFloat(cleanData.weight) || 0,
                length: parseFloat(cleanData.length) || 0,
                width: parseFloat(cleanData.width) || 0,
                height: parseFloat(cleanData.height) || 0,
                pieceCount: parseInt(cleanData.pieceCount) || 0,
                highlights: cleanData.highlights || [],
                rating: parseFloat(averageRating.toFixed(1)), // On sauvegarde la moyenne
                
                // Magie de Prisma : création imbriquée
                reviews: {
                    deleteMany: {}, // Efface les anciens pour éviter les doublons lors de la modification
                    create: finalReviews.map(r => ({
                        rating: parseInt(r.rating),
                        comment: r.comment || null,
                        authorName: r.authorName || "Abonné(e)"
                    }))
                }
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchProducts();
                setIsModalOpen(false);
                setSelectedIds([]);
            } else {
                const errorData = await res.json();
                alert("Erreur : " + (errorData.message || "Problème serveur"));
            }
        } catch (error) {
            alert("Erreur technique lors de la sauvegarde.");
        }
    };

    // --- HELPER FUNCTIONS ---
    const toggleSelectAll = (e) => setSelectedIds(e.target.checked ? products.map(p => p.id) : []);
    const toggleSelectOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    
    const handleOpenModal = (mode, product = emptyProduct) => {
        setModalMode(mode);
        setCurrentProduct(mode === 'create' 
            ? { ...emptyProduct } 
            : { ...product, images: product.images || [], highlights: product.highlights || [], reviews: product.reviews || [] }
        );
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!confirm(`Supprimer ${selectedIds.length} produit(s) ?`)) return;
        for (const id of selectedIds) await fetch(`/api/products/${id}`, { method: 'DELETE' });
        fetchProducts();
        setSelectedIds([]);
    };

    const handleAvailability = async (isAvailable) => {
        const newStock = isAvailable ? 1 : 0;
        for (const id of selectedIds) {
             await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock: newStock })
            });
        }
        fetchProducts();
        setSelectedIds([]);
    };

    const filteredProducts = products.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Gestion Produits 🧸</h1>
                    <p>Gérez le catalogue de la bibliothèque</p>
                </div>
                <button className="Button Blue" onClick={() => handleOpenModal('create')}>
                    <Plus size={18} style={{marginRight: '8px'}}/> Ajouter un produit
                </button>
            </header>

            <div className="search-wrapper">
                <Search className="search-icon" size={20} />
                <input 
                    type="text" placeholder="Rechercher par nom ou référence..." className="search-input"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="table-container">
                <table className="product-table">
                    <thead>
                        <tr>
                            <th><input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === products.length && products.length > 0} /></th>
                            <th>Réf</th>
                            <th>Image</th>
                            <th>Nom</th>
                            <th>Marque</th>
                            <th>Stock</th>
                            <th>Avis</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id}>
                                <td><input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelectOne(product.id)}/></td>
                                <td style={{fontWeight:'bold', color:'#666'}}>{product.reference}</td>
                                <td>
                                    <div className="img-thumbnail-wrapper">
                                        {product.images?.[0] ? (
                                        <Image src={product.images[0]} alt="" fill style={{objectFit:'cover'}} unoptimized />  
                                      ) : (
                                            <span className="no-image-text">Aucune</span>
                                        )}
                                    </div>
                                </td>
                                <td style={{fontWeight:'600'}}>{product.name}</td>
                                <td>{product.brand}</td>
                                <td>{product.stock}</td>
                                <td style={{color: '#ffe264', fontWeight: 'bold'}}>
                                    ★ {product.rating || 0} <span style={{color: '#999', fontSize: '0.8rem'}}>({product.reviews?.length || 0})</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {selectedIds.length > 0 && (
                <div className="action-toolbar">
                    <span className="toolbar-info">{selectedIds.length} sélectionné(s)</span>
                    {selectedIds.length === 1 && (
                        <>
                            <button className="toolbar-btn" onClick={() => handleOpenModal('view', products.find(p => p.id === selectedIds[0]))}>
                                <Eye size={20} /> Visualiser
                            </button>
                            <button className="toolbar-btn" onClick={() => handleOpenModal('edit', products.find(p => p.id === selectedIds[0]))}>
                                <Edit3 size={20} /> Modifier
                            </button>
                        </>
                    )}
                    <button className="toolbar-btn" onClick={() => handleAvailability(true)}>
                        <CheckCircle size={20} color="#88D4AB" /> Dispo
                    </button>
                    <button className="toolbar-btn" onClick={() => handleAvailability(false)}>
                        <XCircle size={20} color="#FF8C94" /> Indispo
                    </button>
                    <button className="toolbar-btn delete" onClick={handleDelete}>
                        <Trash2 size={20} /> Supprimer
                    </button>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {modalMode === 'create' && 'Ajouter un produit'}
                                {modalMode === 'edit' && 'Modifier le produit'}
                                {modalMode === 'view' && 'Détails du produit'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="btn-icon-only"><X size={24}/></button>
                        </div>

                        <form onSubmit={handleSave}>
                            <fieldset disabled={modalMode === 'view'} style={{border:'none', padding:0}}>
                                <div className="form-grid">
                                    <div className="form-group"><label>Référence *</label><input required value={currentProduct.reference} onChange={e => setCurrentProduct({...currentProduct, reference: e.target.value})} /></div>
                                    <div className="form-group"><label>Nom du jouet *</label><input required value={currentProduct.name} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} /></div>
                                    
                                    <div className="form-group full-width"><label>Description</label><textarea rows="5" value={currentProduct.description || ''} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} /></div>

                                    <div className="form-group"><label>Marque</label><input value={currentProduct.brand} onChange={e => setCurrentProduct({...currentProduct, brand: e.target.value})} /></div>
                                    <div className="form-group">
                                        <label>Catégorie</label>
                                        <input list="categories-list" value={currentProduct.category || ''} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})} />
                                        <datalist id="categories-list">{existingCategories.map(cat => <option key={cat} value={cat} />)}</datalist>
                                    </div>

                                    <div className="form-group"><label>Prix (Valeur) € *</label><input type="number" step="0.01" required value={currentProduct.price} onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})} /></div>
                                    <div className="form-group"><label>Stock</label><input type="number" required value={currentProduct.stock} onChange={e => setCurrentProduct({...currentProduct, stock: e.target.value})} /></div>

                                    <div className="form-group">
                                        <label>Âge</label>
                                        <input list="ages-list" value={currentProduct.ageRange || ''} onChange={e => setCurrentProduct({...currentProduct, ageRange: e.target.value})} />
                                        <datalist id="ages-list">{existingAges.map(age => <option key={age} value={age} />)}</datalist>
                                    </div>
                                    <div className="form-group">
                                        <label>État</label>
                                        <select value={currentProduct.condition} onChange={e => setCurrentProduct({...currentProduct, condition: e.target.value})}>
                                            <option value="NEW">Neuf</option>
                                            <option value="GOOD">Très bon état</option>
                                            <option value="FAIR">Bon état</option>
                                        </select>
                                    </div>

                                    {/* --- GESTION IMAGES --- */}
                                    <div className="form-group full-width image-upload-section">
                                        <label>Galerie Photos</label>
                                        {modalMode !== 'view' && (
                                            <div className="image-upload-controls">
                                                <input type="text" placeholder="Coller une URL externe..." style={{flex:1}} onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value) { e.preventDefault(); setCurrentProduct(prev => ({...prev, images: [...(prev.images||[]), e.target.value]})); e.target.value = ''; } }} />
                                                <label className="btn-upload-trigger"><UploadCloud size={18}/> Upload<input type="file" multiple accept="image/*" style={{display:'none'}} onChange={handleImageUpload} disabled={isUploadingImage}/></label>
                                            </div>
                                        )}
                                        <div className="image-grid">
                                            {currentProduct.images?.map((img, i) => (
                                                <div key={i} className={`image-card ${draggedImageIndex === i ? 'dragging' : ''}`} draggable={modalMode !== 'view'} onDragStart={() => handleDragStart(i)} onDragOver={handleDragOver} onDrop={() => handleDrop(i)}>
                                                    <Image src={img} alt="preview" fill unoptimized /><span className="image-position-badge">{i + 1}</span>
                                                    {modalMode !== 'view' && <button type="button" onClick={() => removeImage(i)} className="btn-remove-image"><X size={14}/></button>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* --- "LES + DU PRODUIT" --- */}
                                    <div className="form-group full-width">
                                        <label>Les + du produit</label>
                                        {modalMode !== 'view' && (
                                            <div className="highlight-input-group">
                                                <input type="text" placeholder="Ajouter un point fort..." value={newHighlight} onChange={(e) => setNewHighlight(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())} />
                                                <button type="button" onClick={addHighlight} className="Button Blue" style={{padding:'5px 15px', margin:0}}><ListPlus size={18}/></button>
                                            </div>
                                        )}
                                        <ul className="highlight-list">
                                            {currentProduct.highlights?.map((point, i) => (
                                                <li key={i} className="highlight-item"><span style={{color:'#88D4AB'}}>•</span><span>{point}</span>
                                                    {modalMode !== 'view' && <button type="button" onClick={() => removeHighlight(i)} style={{border:'none', background:'none', color:'#FF8C94', cursor:'pointer'}}><MinusCircle size={18}/></button>}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* --- GESTION DES AVIS CLIENTS --- */}
                                    <div className="form-group full-width">
                                        <label>Avis Clients (Affichés sur la fiche produit)</label>
                                        {modalMode !== 'view' && (
                                            <div className="review-input-group">
                                                <div className="star-selector" style={{display: 'flex', gap: '2px', cursor: 'pointer'}}>
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star 
                                                            key={star} 
                                                            onClick={() => setNewReview({...newReview, rating: star})}
                                                            fill={newReview.rating >= star ? "#ffe264" : "none"} 
                                                            color={newReview.rating >= star ? "#ffe264" : "#ccc"} 
                                                            size={24}
                                                        />
                                                    ))}
                                                </div>
                                                <input 
                                                    type="text" 
                                                    placeholder="Prénom (ex: Laura)" 
                                                    value={newReview.authorName} 
                                                    onChange={e => setNewReview({...newReview, authorName: e.target.value})} 
                                                    style={{width: '150px'}}
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Texte de l'avis (optionnel)" 
                                                    value={newReview.comment} 
                                                    onChange={e => setNewReview({...newReview, comment: e.target.value})} 
                                                    style={{flex: 1}}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addReview())}
                                                />
                                                <button type="button" onClick={addReview} className="Button Blue" style={{padding:'5px 15px', margin:0}}><Plus size={18}/></button>
                                            </div>
                                        )}
                                        <ul className="highlight-list">
                                            {currentProduct.reviews?.map((rev, i) => (
                                                <li key={i} className="review-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', padding: '10px', borderRadius: '8px', marginBottom: '8px', border: '1px solid #eee'}}>
                                                    <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                                                        <span style={{color: '#ffe264', fontWeight: 'bold'}}>★ {rev.rating}/5</span>
                                                        <span style={{fontWeight: 'bold', color: '#2E1D21'}}>{rev.authorName || "Anonyme"}</span>
                                                        {rev.comment && <span style={{fontStyle: 'italic', color: '#666'}}>« {rev.comment} »</span>}
                                                    </div>
                                                    {modalMode !== 'view' && (
                                                        <button type="button" onClick={() => removeReview(i)} style={{border:'none', background:'none', color:'#FF8C94', cursor:'pointer'}}><MinusCircle size={18}/></button>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* --- TECHNIQUE & NOTICE --- */}
                                    <div className="form-group"><label>Poids (kg)</label><input type="number" step="0.1" value={currentProduct.weight} onChange={e => setCurrentProduct({...currentProduct, weight: e.target.value})} /></div>
                                    <div className="form-group"><label>Nb Pièces</label><input type="number" value={currentProduct.pieceCount} onChange={e => setCurrentProduct({...currentProduct, pieceCount: e.target.value})} /></div>
                                    <div className="form-group">
                                        <label>Dimensions (cm)</label>
                                        <div style={{display:'flex', gap:'5px'}}>
                                            <input type="number" step="0.1" placeholder="L" value={currentProduct.length} onChange={e => setCurrentProduct({...currentProduct, length: e.target.value})} style={{width:'33%'}}/>
                                            <input type="number" step="0.1" placeholder="l" value={currentProduct.width} onChange={e => setCurrentProduct({...currentProduct, width: e.target.value})} style={{width:'33%'}}/>
                                            <input type="number" step="0.1" placeholder="H" value={currentProduct.height} onChange={e => setCurrentProduct({...currentProduct, height: e.target.value})} style={{width:'33%'}}/>
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Notice PDF</label>
                                        <div style={{display:'flex', gap:'10px'}}>
                                            <input type="text" placeholder="https://..." value={currentProduct.manualUrl || ''} onChange={e => setCurrentProduct({...currentProduct, manualUrl: e.target.value})} style={{flex:1}} />
                                            {modalMode !== 'view' && (
                                                <label className="Button Blue" style={{padding:'8px 15px', margin:0, cursor:'pointer', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'5px'}}>
                                                    <FileText size={16}/><input type="file" accept="application/pdf" style={{display:'none'}} onChange={handlePdfUpload} disabled={isUploadingPdf}/>{isUploadingPdf ? '...' : 'Upload'}
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                            {modalMode !== 'view' && (
                                <div className="modal-footer">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Annuler</button>
                                    <button type="submit" className="Button Blue" style={{border:'none'}}>Enregistrer</button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}