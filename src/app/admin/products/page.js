'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
    Plus, Search, Edit3, Trash2, Eye, 
    CheckCircle, XCircle, X 
} from 'lucide-react';
import '@/styles/adminProducts.css';

export default function AdminProductsPage() {
    const { data: session } = useSession();
    const router = useRouter();

    // --- ÉTATS ---
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // États Modale
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
    const [currentProduct, setCurrentProduct] = useState({});

    // Modèle vide
    const emptyProduct = {
        reference: "BJ", name: "", description: "", price: 0, stock: 1,
        brand: "", ageRange: "", category: "", tags: [], images: [],
        manualUrl: "", weight: "", length: "", width: "", height: "",
        pieceCount: "", condition: "NEW", isFeatured: false
    };

    const getFrenchCondition = (condition) => {
    switch (condition) {
        case 'NEW': return 'NEUF';
        case 'GOOD': return 'TRÈS BON';
        case 'FAIR': return 'BON';
        default: return condition; // Si inconnu, affiche la valeur brute
    }
}
    // --- CHARGEMENT ---
    useEffect(() => {
        fetchProducts();
    }, [session]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            data.sort((a, b) => a.reference.localeCompare(b.reference));
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- GESTION SÉLECTION ---
    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(products.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const toggleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // --- ACTIONS CRUD ---
    const handleOpenModal = (mode, product = emptyProduct) => {
        setModalMode(mode);
        // On clone pour ne pas modifier l'objet de la liste directement
        setCurrentProduct(mode === 'create' ? { ...emptyProduct } : { ...product });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const method = modalMode === 'create' ? 'POST' : 'PUT';
        const url = modalMode === 'create' ? '/api/products' : `/api/products/${currentProduct.id}`;

        try {
            // 1. EXTRACTION DES CHAMPS À EXCLURE
            // On retire id (il est dans l'URL), reviews (relation), createdAt/updatedAt (auto)
            const { id, reviews, createdAt, updatedAt, ...cleanData } = currentProduct;

            // 2. PRÉPARATION DU PAYLOAD
            const payload = {
                ...cleanData,
                price: parseFloat(cleanData.price) || 0,
                stock: parseInt(cleanData.stock) || 0,
                weight: parseFloat(cleanData.weight) || 0,
                length: parseFloat(cleanData.length) || 0, // Ajout dimensions
                width: parseFloat(cleanData.width) || 0,   // Ajout dimensions
                height: parseFloat(cleanData.height) || 0, // Ajout dimensions
                pieceCount: parseInt(cleanData.pieceCount) || 0,
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
            console.error("Erreur save:", error);
            alert("Erreur technique lors de la sauvegarde.");
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Supprimer ${selectedIds.length} produit(s) ?`)) return;

        for (const id of selectedIds) {
            await fetch(`/api/products/${id}`, { method: 'DELETE' });
        }
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

    // Gestion Images URL & Upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentProduct(prev => ({
                    ...prev,
                    images: [...(prev.images || []), reader.result]
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Filtre recherche
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.reference.toLowerCase().includes(searchTerm.toLowerCase())
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

            {/* Barre de recherche */}
            <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '20px' }}>
                <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input 
                    type="text" 
                    placeholder="Rechercher par nom ou référence..." 
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', paddingLeft: '45px' }}
                />
            </div>

            {/* TABLEAU */}
            <div className="table-container">
                <table className="product-table">
                    <thead>
                        <tr>
                            <th><input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === products.length && products.length > 0} /></th>
                            <th>Réf</th>
                            <th>Image</th>
                            <th>Nom</th>
                            <th>Marque</th>
                            <th>État</th>
                            <th>Stock</th>
                            <th>Dispo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="8" style={{textAlign:'center'}}>Chargement...</td></tr> : 
                        filteredProducts.map(product => (
                            <tr key={product.id}>
                                <td><input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelectOne(product.id)}/></td>
                                <td style={{fontWeight: 'bold', color: '#666'}}>{product.reference}</td>
                                <td>
                                    <div style={{width: '50px', height: '50px', position: 'relative', borderRadius: '8px', overflow: 'hidden'}}>
                                        <Image src={product.images?.[0] || '/assets/toys/jouet1.jpg'} alt={product.name} fill style={{objectFit: 'cover'}}/>
                                    </div>
                                </td>
                                <td style={{fontWeight: '600'}}>{product.name}</td>
                                <td>{product.brand}</td>
                                <td><span className="badge badge-condition">{getFrenchCondition(product.condition)}</span></td>                                <td>{product.stock}</td>
                                <td>
                                    {product.stock > 0 ? <span className="badge badge-instock">Oui</span> : <span className="badge badge-outstock">Non</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* TOOLBAR */}
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
                    <button className="toolbar-btn" onClick={() => handleAvailability(true)}><CheckCircle size={20} color="#88D4AB" /> Dispo</button>
                    <button className="toolbar-btn" onClick={() => handleAvailability(false)}><XCircle size={20} color="#FF8C94" /> Indispo</button>
                    <button className="toolbar-btn" onClick={handleDelete} style={{color: '#FF8C94'}}><Trash2 size={20} /> Supprimer</button>
                </div>
            )}

            {/* --- MODALE --- */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {modalMode === 'create' && 'Ajouter un produit'}
                                {modalMode === 'edit' && 'Modifier le produit'}
                                {modalMode === 'view' && 'Détails du produit'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={24}/></button>
                        </div>

                        <form onSubmit={handleSave}>
                            <fieldset disabled={modalMode === 'view'} style={{border:'none', padding:0}}>
                                <div className="form-grid">
                                    {/* Infos de base */}
                                    <div className="form-group">
                                        <label>Référence *</label>
                                        <input required value={currentProduct.reference} onChange={e => setCurrentProduct({...currentProduct, reference: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Nom du jouet *</label>
                                        <input required value={currentProduct.name} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Description</label>
                                        <textarea rows="3" value={currentProduct.description} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} />
                                    </div>

                                    <div className="form-group">
                                        <label>Marque</label>
                                        <input value={currentProduct.brand} onChange={e => setCurrentProduct({...currentProduct, brand: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Catégorie</label>
                                        <input value={currentProduct.category} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})} />
                                    </div>

                                    {/* Chiffres */}
                                    <div className="form-group">
                                        <label>Prix (Valeur) € *</label>
                                        <input 
                                            type="number" 
                                            step="0" 
                                            required 
                                            value={currentProduct.price} 
                                            onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})} 
                                        />                                  
                                        </div>
                                    <div className="form-group">
                                        <label>Stock *</label>
                                        <input type="number" required value={currentProduct.stock} onChange={e => setCurrentProduct({...currentProduct, stock: e.target.value})} />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Age (ex: 3-6 ans)</label>
                                        <input value={currentProduct.ageRange} onChange={e => setCurrentProduct({...currentProduct, ageRange: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>État</label>
                                        <select value={currentProduct.condition} onChange={e => setCurrentProduct({...currentProduct, condition: e.target.value})}>
                                            <option value="NEW">Neuf</option>
                                            <option value="GOOD">Très bon état</option>
                                            <option value="FAIR">Bon état</option>
                                        </select>
                                    </div>

                                    {/* Images */}
                                    <div className="form-group full-width">
                                        <label>Images</label>
                                        {modalMode !== 'view' && (
                                            <div style={{marginBottom: '10px'}}>
                                                <input type="text" placeholder="Coller une URL et Entrée..." 
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            setCurrentProduct(prev => ({...prev, images: [...(prev.images||[]), e.target.value]}))
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                                <p style={{fontSize: '0.8rem', margin: '5px 0'}}>OU Téléverser :</p>
                                                <input type="file" accept="image/*" onChange={handleImageUpload} />
                                            </div>
                                        )}
                                        <div className="image-preview-grid">
                                            {currentProduct.images?.map((img, i) => (
                                                <div key={i} style={{position:'relative'}}>
                                                    <img src={img} className="img-preview" alt="preview"/>
                                                    {modalMode !== 'view' && (
                                                        <button type="button" 
                                                            onClick={() => setCurrentProduct(prev => ({...prev, images: prev.images.filter((_, idx) => idx !== i)}))}
                                                            style={{position:'absolute', top:-5, right:-5, background:'red', color:'white', borderRadius:'50%', width:'20px', height:'20px', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>×</button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Dimensions & Technique */}
                                    <div className="form-group">
                                        <label>Poids (kg)</label>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            value={currentProduct.weight} // RETIRER LE "|| 0" ICI
                                            onChange={e => setCurrentProduct({...currentProduct, weight: e.target.value})} 
                                            placeholder="0"
                                        />                                    </div>
                                    <div className="form-group">
                                        <label>Nb Pièces</label>
                                        <input 
                                            type="number" 
                                            value={currentProduct.pieceCount}
                                            onChange={e => setCurrentProduct({...currentProduct, pieceCount: e.target.value})} 
                                            placeholder="0"
                                        />                                    </div>

                                    {/* --- AJOUT DES DIMENSIONS MANQUANTES --- */}
                                    <div className="form-group">
                                        <label>Longueur (cm)</label>
<input 
                                            type="number" 
                                            step="0.1" 
                                            value={currentProduct.length} // RETIRER LE "|| 0" ICI
                                            onChange={e => setCurrentProduct({...currentProduct, length: e.target.value})} 
                                            placeholder="0"
                                        />                                    </div>
                                    <div className="form-group">
                                        <label>Largeur (cm)</label>
<input 
                                            type="number" 
                                            step="0.1" 
                                            value={currentProduct.width} // RETIRER LE "|| 0" ICI
                                            onChange={e => setCurrentProduct({...currentProduct, width: e.target.value})} 
                                            placeholder="0"
                                        />                                    </div>
                                    <div className="form-group">
                                        <label>Hauteur (cm)</label>
<input 
                                            type="number" 
                                            step="0.1" 
                                            value={currentProduct.height} // RETIRER LE "|| 0" ICI
                                            onChange={e => setCurrentProduct({...currentProduct, height: e.target.value})} 
                                            placeholder="0"
                                        />                                    </div>
                                    
                                    <div className="form-group full-width">
                                        <label>Notice PDF</label>
                                        
                                        {/* Champ Texte (pour URL externe ou modif manuelle) */}
                                        <input 
                                            type="text" 
                                            placeholder="https://... ou téléverser ci-dessous" 
                                            value={currentProduct.manualUrl || ''} 
                                            onChange={e => setCurrentProduct({...currentProduct, manualUrl: e.target.value})} 
                                            style={{marginBottom: '10px'}}
                                        />

                                        {/* Bouton Upload */}
                                        <div style={{display:'flex', alignItems:'center', gap:'15px', background:'#f9f9f9', padding:'10px', borderRadius:'8px', border:'1px dashed #ccc'}}>
                                            <input 
                                                type="file" 
                                                accept="application/pdf"
                                                id="pdf-upload"
                                                style={{display:'none'}}
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;

                                                    // Feedback visuel (optionnel : curseur chargement)
                                                    document.body.style.cursor = 'wait';

                                                    const formData = new FormData();
                                                    formData.append('file', file);

                                                    try {
                                                        const res = await fetch('/api/upload', {
                                                            method: 'POST',
                                                            body: formData
                                                        });
                                                        const data = await res.json();
                                                        
                                                        if (data.success) {
                                                            setCurrentProduct(prev => ({...prev, manualUrl: data.url}));
                                                        } else {
                                                            alert("Erreur: " + data.message);
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert("Erreur technique upload");
                                                    } finally {
                                                        document.body.style.cursor = 'default';
                                                    }
                                                }}
                                            />
                                            
                                            <label htmlFor="pdf-upload" className="Button Blue" style={{padding: '8px 15px', fontSize:'0.85rem', cursor:'pointer', background:'#6EC1E4', border:'none', color:'white', fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px'}}>
                                                📂 Choisir un PDF local
                                            </label>
                                            
                                            {currentProduct.manualUrl?.startsWith('/uploads/') && (
                                                <span style={{color: '#88D4AB', fontWeight:'bold', fontSize: '0.9rem', display:'flex', alignItems:'center', gap:'5px'}}>
                                                    <CheckCircle size={16}/> Fichier prêt
                                                </span>
                                            )}
                                        </div>
                                        <p style={{fontSize:'0.75rem', color:'#999', marginTop:'5px'}}>Taille max recommandée : 5 Mo</p>
                                    </div>

                                </div>
                            </fieldset>

                            {modalMode !== 'view' && (
                                <div style={{marginTop: '2rem', display:'flex', gap:'1rem', justifyContent:'flex-end'}}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} style={{padding:'10px 20px', borderRadius:'30px', border:'1px solid #ddd', background:'white', cursor:'pointer'}}>Annuler</button>
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