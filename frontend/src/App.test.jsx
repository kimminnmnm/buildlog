import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'


describe('authentication screens', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('shows the login screen when there is no active session', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ detail: '로그인이 필요합니다.' }),
      }),
    )

    render(<App />)

    expect(await screen.findByRole('heading', { name: '다시 만나요' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument()
  })

  it('keeps the email and clears the password after a failed login', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ detail: '로그인이 필요합니다.' }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ detail: '이메일 또는 비밀번호가 올바르지 않습니다.' }) })
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    const email = await screen.findByLabelText('이메일')
    const password = screen.getByLabelText('비밀번호')
    fireEvent.change(email, { target: { value: 'person@example.com' } })
    fireEvent.change(password, { target: { value: 'wrong-password' } })
    fireEvent.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('이메일 또는 비밀번호'))
    expect(email).toHaveValue('person@example.com')
    expect(password).toHaveValue('')
  })

  it('moves to the home screen after a successful login', async () => {
    const user = {
      id: 1,
      email: 'person@example.com',
      nickname: '빌드로그',
      created_at: '2026-10-26T00:00:00Z',
      updated_at: '2026-10-26T00:00:00Z',
    }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ detail: '로그인이 필요합니다.' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => user })
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    const email = await screen.findByLabelText('이메일')
    fireEvent.change(email, { target: { value: user.email } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: '로그인' }))

    expect(await screen.findByRole('heading', { name: '안녕하세요, 빌드로그님' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '계정 설정' })).toBeInTheDocument()
  })
})
