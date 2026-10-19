import { useState, useEffect } from 'react'

// When backend is ready, put the login API URL here:
const LOGIN_API_URL = '' // e.g. 'https://your-api.com/api/auth/login'

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('auth_theme') || 'light'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('auth_theme', theme)
  }, [theme])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !password) {
      setError('Please enter email and password.')
      setLoading(false)
      return
    }

    try {
      if (LOGIN_API_URL) {
        const res = await fetch(LOGIN_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmed, password }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data.message || data.error || 'Login failed.')
          setLoading(false)
          return
        }
        if (data.token) localStorage.setItem('auth_token', data.token)
        if (data.user) localStorage.setItem('auth_user', JSON.stringify(data.user))
        // Change this to your user page URL when ready
        window.location.href = '/dashboard'
      } else {
        // Demo: check localStorage users (same keys as admin)
        const users = JSON.parse(localStorage.getItem('pg_users') || '{}')
        const user = users[trimmed]
        if (user && (user.password === password || user.Password === password)) {
          localStorage.setItem(
            'auth_user',
            JSON.stringify({ name: user.name, email: user.email })
          )
          setError('')
          alert('Signed in as ' + (user.name || trimmed))
        } else {
          setError('Invalid email or password.')
        }
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <>
      <button
        className="theme-toggle"
        type="button"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="login-screen">
        <div className="login-card">
          <div className="login-logo">P</div>
          <h1>Sign in</h1>
          <p className="sub">Welcome back to Portfolio Generator</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="username"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="pass-wrap">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
