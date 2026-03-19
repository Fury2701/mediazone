import { useState } from 'react'
import useAuthStore from '../hooks/useAuth'
import toast from 'react-hot-toast'

function getErrorMsg(err) {
  const detail = err.response?.data?.detail
  if (!detail) return 'Помилка сервера'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail[0]?.msg || 'Помилка валідації'
  return 'Невідома помилка'
}

export default function AuthModal({ mode, onClose, onSwitch }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const { login, register, loading } = useAuthStore()

  const set = k => e => {
    setError('')
    setForm(f => ({ ...f, [k]: e.target.value }))
  }

  const submit = async e => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'login') {
        await login(form.username, form.password)
        toast.success(`Вітаємо, ${form.username}!`)
      } else {
        await register(form.username, form.email, form.password)
        toast.success('Акаунт створено!')
      }
      onClose()
    } catch (err) {
      setError(getErrorMsg(err))
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-bg2 border border-border2 w-full sm:max-w-sm sm:rounded-sm">
        <div className="flex items-center justify-between px-5 md:px-6 pt-5 pb-4 border-b border-border">
          <h2 className="font-display text-2xl tracking-wider uppercase">
            {mode === 'login' ? 'Вхід' : 'Реєстрація'}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-white text-xl leading-none p-1">✕</button>
        </div>

        <div className="flex border-b border-border">
          {['login','register'].map(t => (
            <button key={t}
              onClick={() => { onSwitch(t); setError('') }}
              className={`flex-1 py-3 font-condensed font-bold text-xs tracking-widest uppercase border-b-2 -mb-px transition-all
                ${mode === t ? 'text-cyan border-cyan' : 'text-muted border-transparent hover:text-white'}`}
            >
              {t === 'login' ? 'Увійти' : 'Реєстрація'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="p-5 md:p-6 flex flex-col gap-4">
          <div>
            <label className="label">Нікнейм</label>
            <input className="input" placeholder="your_nickname" autoComplete="username"
              value={form.username} onChange={set('username')} required />
          </div>
          {mode === 'register' && (
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="your@email.com" autoComplete="email"
                value={form.email} onChange={set('email')} required />
            </div>
          )}
          <div>
            <label className="label">
              Пароль {mode === 'register' && <span className="text-muted2 normal-case font-normal">(мін. 8 символів)</span>}
            </label>
            <input className="input" type="password" placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={form.password} onChange={set('password')} required
              minLength={mode === 'register' ? 8 : undefined} />
          </div>

          {error && (
            <div className="bg-red/10 border border-red/30 px-3 py-2 font-mono text-xs text-red">{error}</div>
          )}

          <button type="submit" className="btn-cyan w-full !h-12 mt-1" disabled={loading}>
            {loading ? 'Завантаження...' : mode === 'login' ? 'Увійти' : 'Створити акаунт'}
          </button>
        </form>
      </div>
    </div>
  )
}
