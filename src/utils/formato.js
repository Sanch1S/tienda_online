export function formatoQuetzales(valor) {
  return `Q ${Number(valor).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`
}

export function formatoFecha(valor) {
  if (!valor) return '—'
  return new Date(valor).toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function formatoFechaHora(valor) {
  if (!valor) return '—'
  return new Date(valor).toLocaleString('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
