import { useCallback, useEffect, useState } from 'react'

// Ejecuta una función asíncrona (normalmente una petición a la API) y expone
// { data, loading, error, recargar }. Cancela la petición anterior si cambian
// las dependencias o si el componente se desmonta.
//
//   const { data, loading, error } = useAsync((signal) => productosApi.listar({}, signal), [])
export function useAsync(funcion, dependencias) {
  const [estado, setEstado] = useState({ data: null, loading: true, error: null })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const controlador = new AbortController()
    setEstado((prev) => ({ ...prev, loading: true, error: null }))

    funcion(controlador.signal)
      .then((data) => setEstado({ data, loading: false, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return
        setEstado({ data: null, loading: false, error })
      })

    return () => controlador.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, version])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])

  return { ...estado, recargar }
}

// Devuelve el valor "retrasado" (útil para no pedir al servidor en cada tecla).
export function useDebounce(valor, milisegundos = 400) {
  const [retrasado, setRetrasado] = useState(valor)

  useEffect(() => {
    const temporizador = setTimeout(() => setRetrasado(valor), milisegundos)
    return () => clearTimeout(temporizador)
  }, [valor, milisegundos])

  return retrasado
}
