import { useEffect, useState } from 'react'

import { getCurrentUser, login, register, updateNickname } from './api/client'
import './App.css'

function Field({ label, name, type = 'text', value, onChange, autoComplete, readOnly = false }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        readOnly={readOnly}
        required
      />
    </label>
  )
}

function LoginForm({ onLogin, onRegister }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login(form)
      onLogin(user)
    } catch (requestError) {
      setError(requestError.message)
      setForm((current) => ({ email: current.email, password: '' }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard title="다시 만나요" description="BuildLog에 로그인해 기록을 이어가세요.">
      <form onSubmit={handleSubmit} noValidate>
        <Field label="이메일" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
        <Field label="비밀번호" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="current-password" />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? '로그인 중…' : '로그인'}
        </button>
      </form>
      <p className="switch-copy">
        처음 오셨나요? <button className="text-button" type="button" onClick={onRegister}>회원가입</button>
      </p>
    </AuthCard>
  )
}

function RegisterForm({ onRegistered, onLogin }) {
  const [form, setForm] = useState({ email: '', password: '', nickname: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(form)
      onRegistered(form.email)
    } catch (requestError) {
      setError(requestError.message)
      setForm((current) => ({ ...current, password: '' }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard title="BuildLog 시작하기" description="공부와 문제 해결을 한곳에 기록해 보세요.">
      <form onSubmit={handleSubmit} noValidate>
        <Field label="이메일" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
        <Field label="비밀번호" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
        <Field label="닉네임" name="nickname" value={form.nickname} onChange={handleChange} autoComplete="nickname" />
        <p className="field-hint">비밀번호 8~64자, 닉네임 2~20자</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? '가입 중…' : '회원가입'}
        </button>
      </form>
      <p className="switch-copy">
        이미 계정이 있나요? <button className="text-button" type="button" onClick={onLogin}>로그인</button>
      </p>
    </AuthCard>
  )
}

function AuthCard({ title, description, children }) {
  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <p className="eyebrow">BUILDLOG</p>
      <h1 id="auth-title">{title}</h1>
      <p className="description">{description}</p>
      {children}
    </section>
  )
}

function Home({ user, onSettings }) {
  return (
    <section className="dashboard-card" aria-labelledby="home-title">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">MY BUILDLOG</p>
          <h1 id="home-title">안녕하세요, {user.nickname}님</h1>
        </div>
        <button className="secondary-button" type="button" onClick={onSettings}>계정 설정</button>
      </div>
      <p className="description">이제 공부 기록, 할 일, 오류 기록을 차례로 연결할 수 있습니다.</p>
      <div className="feature-grid">
        <div className="feature-card"><strong>공부 기록</strong><span>배운 내용을 남겨요</span></div>
        <div className="feature-card"><strong>할 일</strong><span>남은 작업을 확인해요</span></div>
        <div className="feature-card"><strong>오류 기록</strong><span>해결 방법을 모아둬요</span></div>
      </div>
    </section>
  )
}

function Settings({ user, onUpdated, onHome }) {
  const [nickname, setNickname] = useState(user.nickname)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setSubmitting(true)
    try {
      const updatedUser = await updateNickname(nickname)
      onUpdated(updatedUser)
      setMessage('닉네임을 변경했습니다.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="dashboard-card" aria-labelledby="settings-title">
      <button className="text-button back-button" type="button" onClick={onHome}>← 홈으로</button>
      <p className="eyebrow">ACCOUNT</p>
      <h1 id="settings-title">계정 설정</h1>
      <p className="description">공개 기록과 댓글에 표시할 닉네임을 바꿀 수 있습니다.</p>
      <form onSubmit={handleSubmit}>
        <Field label="이메일" name="email" value={user.email} onChange={() => {}} readOnly />
        <Field label="닉네임" name="nickname" value={nickname} onChange={(event) => setNickname(event.target.value)} autoComplete="nickname" />
        {message && <p className="form-success" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? '저장 중…' : '닉네임 저장'}
        </button>
      </form>
    </section>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('login')
  const [authChecked, setAuthChecked] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser)
        setView('home')
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true))
  }, [])

  if (!authChecked) {
    return <main className="app-shell"><p className="loading-copy">확인 중…</p></main>
  }

  if (!user) {
    return (
      <main className="app-shell">
        {notice && <p className="top-notice" role="status">{notice}</p>}
        {view === 'register' ? (
          <RegisterForm onRegistered={() => { setNotice('회원가입이 완료되었습니다. 로그인해 주세요.'); setView('login'); }} onLogin={() => setView('login')} />
        ) : (
          <LoginForm onLogin={(currentUser) => { setUser(currentUser); setNotice(''); setView('home'); }} onRegister={() => { setNotice(''); setView('register') }} />
        )}
      </main>
    )
  }

  return (
    <main className="app-shell">
      {view === 'settings' ? (
        <Settings user={user} onUpdated={setUser} onHome={() => setView('home')} />
      ) : (
        <Home user={user} onSettings={() => setView('settings')} />
      )}
    </main>
  )
}

export default App
