export interface User {
  username: string
  password: string
  role: 'user' | 'admin'
}
