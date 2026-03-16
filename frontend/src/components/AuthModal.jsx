import { useState } from 'react'
import useAuthStore from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function AuthModal({ mode, onClose, onSwitch }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const { login, register, loading } = useAuthStore()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
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
      toast.error(err.response?.data?.detail || 'Помилка')
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-bg2 border border-border2 w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <h2 className="font-condensed font-black text-2xl tracking-wider uppercase">
            {mode === 'login' ? 'Вхід' : 'Реєстрація'}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-white text-xl leading-none">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {['login','register'].map(t => (
            <button key={t}
              onClick={() => onSwitch(t)}
              className={`flex-1 py-3 font-condensed font-bold text-xs tracking-widest uppercase border-b-2 -mb-px transition-all
                ${mode === t ? 'text-cyan border-cyan' : 'text-muted border-transparent hover:text-white'}`}
            >
              {t === 'login' ? 'Увійти' : 'Реєстрація'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="label">Нікнейм</label>
            <input className="input" placeholder="your_nickname" value={form.username} onChange={set('username')} required />
          </div>
          {mode === 'register' && (
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} required />
            </div>
          )}
          <div>
            <label className="label">Пароль</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
          </div>
          <button type="submit" className="btn-cyan w-full h-11 mt-1" disabled={loading}>
            {loading ? 'Завантаження...' : mode === 'login' ? 'Увійти' : 'Створити акаунт'}
          </button>
        </form>
      </div>
    </div>
  )
}
