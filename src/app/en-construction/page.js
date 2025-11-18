import '@/styles/inBuilding.css';


const InBuilding = () => {
  return (

    <div className="in-building-container">
      {/* Jouets flottants en arrière-plan */}
      <div className="floating-toys">
        <i className="fas fa-shapes toy toy-1"></i>
        <i className="fas fa-rocket toy toy-2"></i>
        <i className="fas fa-puzzle-piece toy toy-3"></i>
        <i className="fas fa-car toy toy-4"></i>
        <i className="fas fa-train toy toy-5"></i>
        <i className="fas fa-dice toy toy-6"></i>
        <i className="fas fa-cube toy toy-7"></i>
        <i className="fas fa-baseball-ball toy toy-8"></i>
      </div>

      {/* Avions qui traversent l'écran */}
      <div className="flying-planes">
        <i className="fas fa-paper-plane plane plane-1"></i>
        <i className="fas fa-paper-plane plane plane-2"></i>
        <i className="fas fa-paper-plane plane plane-3"></i>
        <i className="fas fa-paper-plane plane plane-4"></i>
      </div>

      {/* Contenu central */}
      <div className="content">
        <div className="title-container">
          <h1 className="title">Page en construction</h1>
          <i className="fas fa-hammer pickaxe"></i>
        </div>
        
        <p className="subtitle">Nous préparons quelque chose de génial pour toi ! 🎉</p>
        
        <button className="cta-button" onClick={() => window.location.href = '/'}>
          <i className="fas fa-home"></i> Retour à l'accueil
        </button>
      </div>
    </div>

  );
};

export default InBuilding;