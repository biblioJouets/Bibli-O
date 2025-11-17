export const errorHandler = (err, req, res, next) => {
  console.error("Erreur :", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erreur interne du serveur",
  });
};
