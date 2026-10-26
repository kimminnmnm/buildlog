import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'


describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows a connected state when the API is healthy', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'ok', service: 'BuildLog API' }),
      }),
    )

    render(<App />)

    expect(screen.getByText('확인 중')).toBeInTheDocument()
    expect(await screen.findByText('연결됨')).toBeInTheDocument()
  })

  it('shows an offline state when the API request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))

    render(<App />)

    expect(await screen.findByText('연결 안 됨')).toBeInTheDocument()
  })
})
