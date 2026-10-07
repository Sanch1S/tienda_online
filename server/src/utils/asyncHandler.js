// Envuelve un controlador async para que cualquier error llegue al
// middleware de errores (errorHandler) sin repetir try/catch en cada función.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

// Error con código HTTP para lanzarlo desde los controladores.
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}
