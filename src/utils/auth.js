// Credenciales leídas desde variables de entorno (VITE_USER_*)
// Añade en .env:  VITE_USER1_NAME, VITE_USER1_PASS, VITE_USER2_NAME, VITE_USER2_PASS
// Fallback a los valores por defecto si las variables no están definidas.
export const USERS = [
  {
    id: 1,
    username: import.meta.env.VITE_USER1_NAME ?? 'Yeray',
    password: import.meta.env.VITE_USER1_PASS ?? 'Admin',
    avatar: 'Y',
  },
  {
    id: 2,
    username: import.meta.env.VITE_USER2_NAME ?? 'Silvia',
    password: import.meta.env.VITE_USER2_PASS ?? 'Mongola.13',
    avatar: 'S',
  },
]

/**
 * Devuelve el usuario si las credenciales son correctas, o null si no.
 * La comparación de usuario es case-insensitive; la contraseña es case-sensitive.
 */
export function authenticate(username, password) {
  if (!username || !password) return null
  return (
    USERS.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        u.password === password
    ) ?? null
  )
}
