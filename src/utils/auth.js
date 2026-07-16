// Usuarios hardcodeados — en producción esto iría en backend
export const USERS = [
  { id: 1, username: 'Yeray', password: 'Admin', avatar: 'Y' },
  { id: 2, username: 'Silvia', password: 'Mongola.13', avatar: 'S' },
]

export function authenticate(username, password) {
  return USERS.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  ) || null
}
