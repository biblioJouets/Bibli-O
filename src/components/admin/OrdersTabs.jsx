"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import styles from "@/styles/adminOrders.module.css";

const STATUS_LABELS = {
  PENDING:   "En attente",
  PREPARING: "En préparation",
  SHIPPED:   "Expédié",
  ACTIVE:    "Location en cours",
  RETURNING: "Retour en cours",
  RETURNED:  "Retourné",
  COMPLETED: "Clôturé",
  CANCELLED: "Annulé",
};

const STATUS_COLORS = {
  PENDING:   { bg: "#FFE08A", text: "#7a5c00" },
  PREPARING: { bg: "#FFD6A5", text: "#7a3e00" },
  SHIPPED:   { bg: "#A8D5A2", text: "#1e5c1a" },
  ACTIVE:    { bg: "#6EC1E4", text: "#0a4a6e" },
  RETURNING: { bg: "#FF8C94", text: "#7a0010" },
  RETURNED:  { bg: "#c4a8d5", text: "#3d1a5c" },
  COMPLETED: { bg: "#e0e0e0", text: "#444" },
  CANCELLED: { bg: "#f0c0c0", text: "#7a0000" },
};

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] ?? { bg: "#eee", text: "#444" };
  return (
    <span style={{
      background: colors.bg,
      color: colors.text,
      padding: "3px 12px",
      borderRadius: "50px",
      fontSize: "0.8rem",
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function formatOrderId(order) {
  const d = new Date(order.createdAt);
  const day    = String(d.getDate()).padStart(2, "0");
  const month  = String(d.getMonth() + 1).padStart(2, "0");
  const year   = String(d.getFullYear()).slice(2);
  const hours  = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `CMD${day}${month}${year}${hours}${minutes}-${order.id}`;
}

function printOrder(order) {
  const formatId = formatOrderId(order);
  const isMondialRelay = order.mondialRelayPointId &&
    order.mondialRelayPointId !== "DOMICILE" &&
    order.mondialRelayPointId !== "null";

  const content = `
    <html>
      <head>
        <title>Fiche Préparation - ${formatId}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #333; }
          h1 { border-bottom: 2px solid #333; padding-bottom: 10px; font-size: 22px; }
          .header-info { font-size: 13px; margin-bottom: 20px; color: #555; }
          .box { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          .box h3 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 5px; font-size: 15px; }
          .product { display: flex; justify-content: space-between; border-bottom: 1px dotted #ccc; padding: 8px 0; }
          .strong { font-weight: bold; font-size: 1.05em; }
          .mr-code { font-size: 1.4em; font-weight: bold; color: #E91E63; display: block; margin-top: 5px; }
          .qty { font-weight: bold; background: #eee; padding: 2px 8px; border-radius: 4px; margin-right: 10px; }
          .footer { margin-top: 50px; border-top: 1px solid #000; padding-top: 10px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>📦 Fiche de Préparation</h1>
        <div class="header-info">
          Référence : <strong>${formatId}</strong><br/>
          Date : ${new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}<br/>
          Statut : ${STATUS_LABELS[order.status] ?? order.status}
        </div>

        <div class="box">
          <h3>👤 Client</h3>
          <p class="strong">${order.Users?.firstName ?? ""} ${order.Users?.lastName ?? ""}</p>
          <p>Email : ${order.Users?.email ?? "—"}</p>
          <p>Tél : ${order.Users?.phone ?? "Non renseigné"}</p>
        </div>

        <div class="box">
          <h3>📍 Livraison : ${isMondialRelay ? "MONDIAL RELAY" : "DOMICILE"}</h3>
          <p class="strong">${order.shippingName ?? "—"}</p>
          <p>${order.shippingAddress ?? ""}</p>
          <p>${order.shippingZip ?? ""} ${order.shippingCity ?? ""}</p>
          <p>Tél livraison : ${order.shippingPhone ?? "Non renseigné"}</p>
          ${isMondialRelay ? `<p>Code Point Relais : <span class="mr-code">${order.mondialRelayPointId}</span></p>` : ""}
        </div>

        <div class="box">
          <h3>🧸 Articles à préparer (${order.OrderProducts.length})</h3>
          ${order.OrderProducts.map(op => `
            <div class="product">
              <span><span class="qty">${op.quantity ?? 1}x</span> ${op.Products?.name ?? "Jouet"}</span>
              <span>Réf : ${op.Products?.reference ?? "N/A"}</span>
            </div>
          `).join("")}
        </div>

        ${order.trackingNumber ? `<div class="box"><h3>📮 Expédition</h3><p>N° suivi : <strong>${order.trackingNumber}</strong></p></div>` : ""}

        <div class="footer">Fiche générée le ${new Date().toLocaleString("fr-FR")} — Bibli'O Jouets</div>
      </body>
    </html>
  `;

  const w = window.open("", "", "width=800,height=700");
  w.document.write(content);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
}

// --- COMPOSANT : Upload bordereau de retour par drag & drop ---
function ReturnLabelUpload({ order, onRefresh }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(order.returnLabelUrl ?? null);
  const inputRef = useRef(null);

  async function uploadFile(file) {
    if (!file || file.type !== "application/pdf") {
      alert("Seuls les fichiers PDF sont acceptés pour le bordereau.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("orderId", String(order.id));

      const res = await fetch("/api/admin/orders/return-label", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUrl(data.returnLabelUrl);
        onRefresh();
      } else {
        alert("Erreur lors de l'upload du bordereau.");
      }
    } catch {
      alert("Erreur réseau lors de l'upload.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleInputChange(e) {
    const file = e.target.files[0];
    if (file) uploadFile(file);
  }

  return (
    <div className={styles.returnLabelZone}>
      {currentUrl ? (
        <div className={styles.returnLabelActions}>
          <a href={currentUrl} target="_blank" rel="noreferrer" className={styles.btnYellow}>
            📄 Bordereau de retour
          </a>
          <button
            className={styles.btnUploadSmall}
            onClick={() => inputRef.current?.click()}
            title="Remplacer le bordereau"
          >
            Remplacer
          </button>
        </div>
      ) : (
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <span>Upload en cours...</span>
          ) : (
            <span>📂 Glisser le bordereau PDF ici <em>ou cliquer</em></span>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={handleInputChange}
      />
    </div>
  );
}

// --- COMPOSANT : Audit physique des jouets retournés ---
const ACQUIRED_STATUSES = ["ADOPTE", "ADOPTE_REMPLACE"];

function AuditPanel({ order, onRefresh }) {
  // Seuls les jouets explicitement marqués RETOUR_DEMANDE sont dans le carton retour
  const auditableProducts = order.OrderProducts.filter(
    (op) => op.renewalIntention === 'RETOUR_DEMANDE'
  );
  const acquiredProducts = order.OrderProducts.filter(
    (op) => ACQUIRED_STATUSES.includes(op.renewalIntention)
  );
  // Jouets encore chez le client (location en cours, non échangés)
  const stillRentedProducts = order.OrderProducts.filter(
    (op) => op.renewalIntention !== 'RETOUR_DEMANDE' && !ACQUIRED_STATUSES.includes(op.renewalIntention)
  );

  const [statuses, setStatuses] = useState(
    () => Object.fromEntries(auditableProducts.map((op) => [op.ProductId, "SAIN"]))
  );
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function toggle(productId) {
    setStatuses((prev) => ({
      ...prev,
      [productId]: prev[productId] === "SAIN" ? "CASSE" : "SAIN",
    }));
  }

  async function handleSubmit() {
    const products = Object.entries(statuses).map(([productId, status]) => ({
      productId: parseInt(productId),
      status,
    }));
    const nbCasse = products.filter((p) => p.status === "CASSE").length;
    const ok = window.confirm(
      `Confirmer l'audit ?\n• ${products.length - nbCasse} jouet(s) SAIN(S) → réintégrés au stock\n• ${nbCasse} jouet(s) CASSÉ(S) → marqués DAMAGED`
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });
      if (res.ok) {
        setDone(true);
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'audit.");
      }
    } catch {
      alert("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className={styles.auditDone}>
        ✅ Audit enregistré — commande passée en <strong>RETURNED</strong>
      </div>
    );
  }

  return (
    <div className={styles.auditPanel}>
      <p className={styles.auditTitle}>🔍 Audit retour — état de chaque jouet</p>

      {/* Jouets encore chez le client — hors carton de retour */}
      {stillRentedProducts.length > 0 && (
        <div style={{
          background: "#EBF7FD",
          border: "1px solid #6EC1E4",
          borderRadius: "12px",
          padding: "10px 14px",
          marginBottom: "12px",
          fontSize: "0.85rem",
          color: "#0a4a6e",
        }}>
          <strong>📦 Toujours en location chez le client — ne seront PAS dans ce carton</strong>
          <ul style={{ margin: "6px 0 0 0", paddingLeft: "1.2rem" }}>
            {stillRentedProducts.map((op) => (
              <li key={op.ProductId}>
                {op.Products?.name ?? `Jouet #${op.ProductId}`}
                <span style={{
                  marginLeft: "8px",
                  background: "#6EC1E4",
                  color: "#fff",
                  padding: "1px 8px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}>
                  EN LOCATION
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Jouets acquis par le client — hors carton de retour */}
      {acquiredProducts.length > 0 && (
        <div style={{
          background: "#F5F0FA",
          border: "1px solid #c4a8d5",
          borderRadius: "12px",
          padding: "10px 14px",
          marginBottom: "12px",
          fontSize: "0.85rem",
          color: "#3d1a5c",
        }}>
          <strong>🧸 Jouets acquis — ne seront PAS dans le carton de retour</strong>
          <ul style={{ margin: "6px 0 0 0", paddingLeft: "1.2rem" }}>
            {acquiredProducts.map((op) => (
              <li key={op.ProductId}>
                {op.Products?.name ?? `Jouet #${op.ProductId}`}
                <span style={{
                  marginLeft: "8px",
                  background: "#c4a8d5",
                  color: "#2E1D21",
                  padding: "1px 8px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}>
                  ACQUIS / ACHAT
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Jouets à auditer — ceux qui reviennent physiquement */}
      {auditableProducts.length === 0 ? (
        <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "12px" }}>
          Aucun jouet à auditer — tous les jouets de cette commande ont été acquis.
        </p>
      ) : (
        <div className={styles.auditList}>
          {auditableProducts.map((op) => {
            const isCasse = statuses[op.ProductId] === "CASSE";
            return (
              <div key={op.ProductId} className={styles.auditItem}>
                <span className={styles.auditProductName}>
                  {op.Products?.name ?? `Jouet #${op.ProductId}`}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(op.ProductId)}
                  className={isCasse ? styles.auditBtnCasse : styles.auditBtnSain}
                >
                  {isCasse ? "💥 Cassé" : "✅ Sain"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {auditableProducts.length > 0 && (
        <button
          className={styles.btnRed}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Enregistrement..." : "Valider l'audit"}
        </button>
      )}
    </div>
  );
}

function OrderCard({ order, type, onStatusUpdate }) {
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [invoiceUrl, setInvoiceUrl] = useState(order.stripeInvoiceUrl ?? null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const isMondialRelay = order.mondialRelayPointId &&
    order.mondialRelayPointId !== "DOMICILE" &&
    order.mondialRelayPointId !== "null";

  const clientName = order.Users
    ? `${order.Users.firstName ?? ""} ${order.Users.lastName ?? ""}`.trim()
    : "Client inconnu";

  async function handleMarkShipped() {
    if (!tracking.trim()) return alert("Renseigne un numéro de suivi.");
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, status: "SHIPPED", trackingNumber: tracking }),
      });
      if (res.ok) onStatusUpdate();
    } catch {
      alert("Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkStatus(newStatus) {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, status: newStatus }),
      });
      if (res.ok) onStatusUpdate();
    } catch {
      alert("Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectChange(e) {
    const newStatus = e.target.value;
    if (newStatus === order.status) return;
    const confirm = window.confirm(`Changer le statut vers : "${STATUS_LABELS[newStatus]}" ?`);
    if (!confirm) { setSelectedStatus(order.status); return; }
    setSelectedStatus(newStatus);
    await handleMarkStatus(newStatus);
  }

  async function handleFetchInvoice() {
    if (invoiceUrl) { window.open(invoiceUrl, "_blank", "noreferrer"); return; }
    setInvoiceLoading(true);
    try {
      const res = await fetch(`/api/admin/invoice?orderId=${order.id}`);
      const data = await res.json();
      if (data.url) {
        setInvoiceUrl(data.url);
        window.open(data.url, "_blank", "noreferrer");
      } else {
        alert("Aucune facture disponible pour cette commande.");
      }
    } catch {
      alert("Erreur lors de la récupération de la facture.");
    } finally {
      setInvoiceLoading(false);
    }
  }

  return (
    <div className={styles.orderCard}>
      {/* En-tête de la carte */}
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.orderTitleRow}>
            <span className={styles.orderId}>{formatOrderId(order)}</span>
            <span className={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
              })}
            </span>
          </div>
          <div className={styles.orderMetaRow}>
            <StatusBadge status={order.status} />
            <span className={styles.orderPrice}>• {order.totalAmount} €</span>
            {(order.childAge || order.childGender || Number(order.totalAmount) === 24.90 || order.OrderProducts.some(op => op.Products?.reference === 'BOX-MYSTERE')) && (
              <span style={{
                background: '#ffe264', color: '#7a5c00',
                padding: '3px 10px', borderRadius: '50px',
                fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap',
              }}>
                📦 BOX MYSTÈRE
              </span>
            )}
          </div>
        </div>

        <div className={styles.actionsTop}>
          {/* Bouton Fiche */}
          <button className={styles.btnPrint} onClick={() => printOrder(order)}>
            🖨 Fiche
          </button>

          {/* Bouton Facture Stripe */}
          {order.stripeSubscriptionId ? (
            <button
              className={styles.btnInvoice}
              onClick={handleFetchInvoice}
              disabled={invoiceLoading}
              title={invoiceUrl ? "Voir la facture" : "Récupérer la facture depuis Stripe"}
            >
              {invoiceLoading ? "⏳" : "🧾"} Facture
            </button>
          ) : null}

          {/* Sélecteur de statut */}
          <select
            className={styles.statusSelect}
            value={selectedStatus}
            onChange={handleSelectChange}
            disabled={loading}
          >
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Corps de la carte */}
      <div className={styles.cardBody}>

        {/* Client */}
        <div className={styles.infoCol}>
          <h4 className={styles.infoColTitle}>👤 Client</h4>
          <p className={styles.highlight}>{clientName}</p>
          <p className={styles.subInfo}>{order.Users?.email ?? "—"}</p>
          <p className={styles.subInfo}>{order.Users?.phone ?? "—"}</p>
        </div>

        {/* Livraison */}
        <div className={styles.infoCol}>
          <h4 className={styles.infoColTitle}>📍 Livraison</h4>
          <div className={styles.deliveryBox}>
            <p className={styles.highlight}>{order.shippingName ?? "—"}</p>
            <p className={styles.subInfo}>{order.shippingAddress ?? ""}</p>
            <p className={styles.subInfo}>{order.shippingZip ?? ""} {order.shippingCity ?? ""}</p>
            {order.shippingPhone && <p className={styles.subInfo}>{order.shippingPhone}</p>}
            {isMondialRelay ? (
              <p className={styles.mrPoint}>Point Relais : <strong>{order.mondialRelayPointId}</strong></p>
            ) : (
              <p className={styles.domicileTag}>Domicile</p>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className={styles.infoCol}>
          <h4 className={styles.infoColTitle}>🧸 Contenu ({order.OrderProducts.length})</h4>
          {(order.childAge || order.childGender) && (
            <div style={{
              background: '#fffbef', border: '1.5px solid #f5d16e', borderRadius: '10px',
              padding: '8px 12px', marginBottom: '10px', fontSize: '0.85rem', color: '#7a5c00',
            }}>
              <strong>📦 Box Mystère — Infos enfant</strong>
              <div style={{ marginTop: '4px' }}>
                {order.childAge && <div>Âge : <strong>{order.childAge}</strong></div>}
                {order.childGender && <div>Sexe : <strong style={{ textTransform: 'capitalize' }}>{order.childGender}</strong></div>}
              </div>
            </div>
          )}
          <ul className={styles.productsList}>
            {order.OrderProducts.map((op, idx) => {
              const isAdopted   = ACQUIRED_STATUSES.includes(op.renewalIntention);
              const isProlonged = op.renewalIntention === 'PROLONGATION' || op.renewalIntention === 'PROLONGATION_TACITE';
              const endDate = op.rentalEndDate
                ? new Date(op.rentalEndDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
                : null;
              // Date projetée : nextBillingDate + 1 mois (même logique que le webhook et l'API prolong-item)
              const projectedDate = (() => {
                if (!op.nextBillingDate) return null;
                const d = new Date(op.nextBillingDate);
                d.setMonth(d.getMonth() + 1);
                return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
              })();
              const billingDate = op.nextBillingDate
                ? new Date(op.nextBillingDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
                : null;

              return (
                <li key={idx} className={`${styles.productItem} ${isAdopted ? styles.productItemAdopted : ""}`}>
                  <span className={styles.qtyBadge}>{op.quantity ?? 1}</span>
                  <span className={styles.productItemName}>
                    {op.Products?.name ?? "Jouet"}
                    {isAdopted && <span className={styles.adoptedBadge}>Adopté 💜</span>}
                    {isProlonged && <span className={styles.prolongBadge}>⏳ Prolongation demandée</span>}
                  </span>
                  {order.status === "ACTIVE" && !isAdopted && (
                    <span className={styles.productMeta}>
                      {op.Products?.price != null && (
                        <span className={styles.adoptionPrice}>
                          Adoption : {Number(op.Products.price).toFixed(2)} €
                        </span>
                      )}
                      {endDate && (
                        <span className={styles.possessionDate}>
                          En possession jusqu&apos;au {endDate}
                        </span>
                      )}
                      {isProlonged && (
                        <span className={styles.prolongInfo}>
                          Nouvelle date estimée : <strong>{projectedDate ?? "—"}</strong>
                          {billingDate && <> · après paiement du {billingDate}</>}
                        </span>
                      )}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Panneau assignation Box Mystère — visible uniquement tant que le fantôme est présent */}
      {order.OrderProducts.some(op => op.Products?.reference === 'BOX-MYSTERE') && (
        <AssignBoxPanel order={order} onRefresh={onStatusUpdate} />
      )}


      {/* Zone bordereau de retour — toujours visible */}
      <div className={styles.cardFooter}>
        <ReturnLabelUpload order={order} onRefresh={onStatusUpdate} />

        {/* Zone tracking → SHIPPED */}
        {(type === "RENTAL" || type === "EXCHANGE" || type === "REFILL") && order.status === "PREPARING" && (
          <>
            <input
              className={styles.trackingInput}
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="Numéro de suivi..."
            />
            <button className={styles.btnGreen} onClick={handleMarkShipped} disabled={loading}>
              {loading ? "..." : "✓ Marquer expédié"}
            </button>
            {type === "EXCHANGE" && (
              order.outboundLabelUrl ? (
                <a href={order.outboundLabelUrl} target="_blank" rel="noreferrer" className={styles.btnYellow}>
                  Étiquette aller PDF
                </a>
              ) : null
            )}
          </>
        )}

        {order.status === "SHIPPED" && (
          <button className={styles.btnBlue} onClick={() => handleMarkStatus("ACTIVE")} disabled={loading}>
            {loading ? "..." : "✓ Marquer reçu (ACTIVE)"}
          </button>
        )}
        {order.status === "RETURNED" && (
          <button className={styles.btnRed} onClick={() => handleMarkStatus("COMPLETED")} disabled={loading}>
            {loading ? "..." : "✓ Clôturer la commande"}
          </button>
        )}
      </div>

      {/* Audit physique — visible uniquement en RETURNING */}
      {order.status === "RETURNING" && (
        <AuditPanel order={order} onRefresh={onStatusUpdate} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PANNEAU D'ASSIGNATION BOX MYSTÈRE
// ─────────────────────────────────────────────────────────────────────────────
function AssignBoxPanel({ order, onRefresh }) {
  const [open, setOpen]               = useState(false);
  const [search, setSearch]           = useState("");
  const [products, setProducts]       = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selected, setSelected]       = useState([]); // [{id, name}]
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState(null);
  const [success, setSuccess]         = useState(false);

  async function fetchProducts(q) {
    setLoadingSearch(true);
    try {
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(q)}&inStock=true`);
      if (res.ok) {
        const data = await res.json();
        // filtre le fantôme de la liste
        setProducts((data.products || data).filter(p => p.reference !== "BOX-MYSTERE"));
      }
    } catch { /* silently fail */ }
    finally { setLoadingSearch(false); }
  }

  function handleSearchChange(e) {
    const q = e.target.value;
    setSearch(q);
    if (q.length >= 2) fetchProducts(q);
    else setProducts([]);
  }

  function toggleProduct(product) {
    setSelected(prev => {
      const already = prev.some(p => p.id === product.id);
      if (already) return prev.filter(p => p.id !== product.id);
      if (prev.length >= 4) return prev; // max 4
      return [...prev, { id: product.id, name: product.name }];
    });
  }

  async function handleSubmit() {
    if (selected.length !== 4) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/assign-box`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selected.map(p => p.id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      setSuccess(true);
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div style={{
        background: "#e8f9ef", border: "1.5px solid #88D4AB", borderRadius: "14px",
        padding: "14px 18px", marginTop: "12px", color: "#1e5c1a", fontWeight: 600,
      }}>
        ✅ Les 4 jouets ont été assignés à la commande avec succès !
      </div>
    );
  }

  return (
    <div style={{ marginTop: "12px" }}>
      {!open ? (
        <button
          onClick={() => { setOpen(true); fetchProducts(""); }}
          style={{
            background: "linear-gradient(90deg, #f5a623, #f7c948)",
            margin : "2rem 2rem",
            color: "#7a3e00", border: "none", borderRadius: "50px",
            padding: "10px 20px", fontWeight: 700, cursor: "pointer",
            fontSize: "0.9rem", boxShadow: "0 2px 8px rgba(245,166,35,0.3)",
          }}
        >
          🎁 Assigner les 4 jouets
        </button>
      ) : (
        <div style={{
          background: "#fffbef", border: "1.5px solid #f5d16e",
          borderRadius: "16px", padding: "16px 18px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <strong style={{ color: "#7a3e00", fontSize: "0.95rem" }}>
              🎁 Assigner les 4 jouets — {selected.length}/4 sélectionné{selected.length > 1 ? "s" : ""}
            </strong>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "1.2rem" }}>×</button>
          </div>

          {/* Jouets sélectionnés */}
          {selected.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
              {selected.map(p => (
                <span key={p.id} style={{
                  background: "#ffe264", color: "#7a3e00", borderRadius: "20px",
                  padding: "3px 10px", fontSize: "0.8rem", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: "6px",
                }}>
                  {p.name}
                  <button onClick={() => toggleProduct(p)} style={{ background: "none", border: "none", cursor: "pointer", color: "#c17f00", fontWeight: 700, padding: 0 }}>×</button>
                </span>
              ))}
            </div>
          )}

          {/* Recherche */}
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Rechercher un jouet (min. 2 caractères)..."
            style={{
              width: "100%", padding: "8px 12px", borderRadius: "10px",
              border: "1.5px solid #e0d0a0", fontSize: "0.9rem",
              marginBottom: "8px", boxSizing: "border-box",
            }}
          />

          {/* Liste résultats */}
          {loadingSearch && <p style={{ fontSize: "0.82rem", color: "#aaa" }}>Recherche...</p>}
          {!loadingSearch && products.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 10px", maxHeight: "200px", overflowY: "auto", borderRadius: "10px", border: "1px solid #e0d0a0" }}>
              {products.map(p => {
                const isChosen = selected.some(s => s.id === p.id);
                const maxed = selected.length >= 4 && !isChosen;
                return (
                  <li
                    key={p.id}
                    onClick={() => !maxed && toggleProduct(p)}
                    style={{
                      padding: "8px 12px", cursor: maxed ? "not-allowed" : "pointer",
                      background: isChosen ? "#fff3cd" : "white",
                      borderBottom: "1px solid #f5e9c0",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      opacity: maxed ? 0.45 : 1,
                      fontSize: "0.86rem",
                    }}
                  >
                    <span>{p.name}</span>
                    <span style={{ color: "#9a7a30", fontSize: "0.78rem" }}>Stock : {p.stock}</span>
                  </li>
                );
              })}
            </ul>
          )}
          {!loadingSearch && search.length >= 2 && products.length === 0 && (
            <p style={{ fontSize: "0.82rem", color: "#aaa", marginBottom: "8px" }}>Aucun résultat.</p>
          )}

          {error && <p style={{ color: "#c0392b", fontSize: "0.84rem", marginBottom: "8px" }}>{error}</p>}

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleSubmit}
              disabled={selected.length !== 4 || submitting}
              style={{
                background: selected.length === 4 ? "#88D4AB" : "#ccc",
                color: "white", border: "none", borderRadius: "50px",
                padding: "9px 20px", fontWeight: 700, cursor: selected.length === 4 ? "pointer" : "not-allowed",
                fontSize: "0.88rem", transition: "background 0.2s",
              }}
            >
              {submitting ? "Assignation..." : `✅ Valider la sélection (${selected.length}/4)`}
            </button>
            <button
              onClick={() => { setOpen(false); setSelected([]); setSearch(""); setProducts([]); setError(null); }}
              style={{ background: "none", border: "1px solid #ccc", borderRadius: "50px", padding: "9px 16px", cursor: "pointer", fontSize: "0.88rem", color: "#888" }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersList({ orders, type, onRefresh }) {
  if (orders.length === 0) {
    return <p className={styles.emptyState}>Aucune commande dans cette catégorie.</p>;
  }
  return (
    <div className={styles.ordersGrid}>
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          type={type}
          onStatusUpdate={onRefresh}
        />
      ))}
    </div>
  );
}

export default function OrdersTabs({
  rentalOrders,
  exchangeOrders,
  returningOrders,
  adoptionOrders,
  refillOrders = [],
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeParam = searchParams.get("type");
  const statusParam = searchParams.get("status");

  const getInitialTab = () => {
    if (typeParam === "EXCHANGE") return "EXCHANGE";
    if (typeParam === "ADOPTION") return "ADOPTION";
    if (typeParam === "REFILL")   return "REFILL";
    if (statusParam === "RETURNING") return "RETURNING";
    return "RENTAL";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [typeParam, statusParam]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams();
    if (tab === "EXCHANGE")  params.set("type", "EXCHANGE");
    else if (tab === "ADOPTION")  params.set("type", "ADOPTION");
    else if (tab === "REFILL")    params.set("type", "REFILL");
    else if (tab === "RETURNING") params.set("status", "RETURNING");
    else params.set("type", "RENTAL");
    router.replace(`/admin/orders?${params.toString()}`, { scroll: false });
  };

  const handleRefresh = () => router.refresh();

  const tabs = [
    { key: "RENTAL",    label: "📦 Location",      count: rentalOrders.length },
    { key: "EXCHANGE",  label: "🔄 Boîte Navette", count: exchangeOrders.length },
    { key: "RETURNING", label: "↩️ Retours",        count: returningOrders.length },
    { key: "ADOPTION",  label: "💜 Adoptions",      count: adoptionOrders.length },
    { key: "REFILL",    label: "🎁 Réassorts",      count: refillOrders.length },
  ];

  return (
    <div className={styles.ordersPage}>
      <div className={styles.ordersHeader}>
        <h1 className={styles.ordersTitle}>Logistique & Commandes</h1>
      </div>

      {activeTab === "ADOPTION" && (
        <div className={styles.adoptionNotice}>
          💜 Aucune action logistique requise pour les adoptions.
          Ces commandes sont des achats définitifs one-shot — elles contribuent au CA hors-abonnement.
        </div>
      )}
      {activeTab === "REFILL" && (
        <div className={styles.adoptionNotice} style={{ background: "#DAEEE6", borderColor: "#88D4AB", color: "#2E1D21" }}>
          🎁 Réassorts gratuits — un jouet adopté est remplacé par un nouveau. Préparer et expédier comme une Boîte Navette.
        </div>
      )}

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
            <span className={styles.tabCount}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === "RENTAL" && (
          <OrdersList orders={rentalOrders} type="RENTAL" onRefresh={handleRefresh} />
        )}
        {activeTab === "EXCHANGE" && (
          <OrdersList orders={exchangeOrders} type="EXCHANGE" onRefresh={handleRefresh} />
        )}
        {activeTab === "RETURNING" && (
          <OrdersList orders={returningOrders} type="RETURNING" onRefresh={handleRefresh} />
        )}
        {activeTab === "ADOPTION" && (
          <OrdersList orders={adoptionOrders} type="ADOPTION" onRefresh={handleRefresh} />
        )}
        {activeTab === "REFILL" && (
          <OrdersList orders={refillOrders} type="REFILL" onRefresh={handleRefresh} />
        )}
      </div>
    </div>
  );
}
