import { useEffect, useState } from 'react'

import { getHealth } from './api/health'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState('확인 중')

  useEffect(() => {
    let isMounted = true

    getHealth()
      .then((data) => {
        if (isMounted) {
          setApiStatus(data.status === 'ok' ? '연결됨' : '확인 필요')
        }
      })
      .catch(() => {
        if (isMounted) {
          setApiStatus('연결 안 됨')
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const isConnected = apiStatus === '연결됨'

  return (
    <main className="app-shell">
      <section className="status-card" aria-labelledby="page-title">
        <p className="eyebrow">BUILDLOG</p>
        <h1 id="page-title">공부와 문제 해결의 기록</h1>
        <p className="description">
          React 화면과 FastAPI 서버를 연결할 준비가 끝났습니다.
        </p>

        <div className="connection" aria-live="polite">
          <span
            className={`status-dot ${isConnected ? 'status-dot--online' : ''}`}
            aria-hidden="true"
          />
          <span>API 상태</span>
          <strong>{apiStatus}</strong>
        </div>
      </section>
    </main>
  )
}

export default App
