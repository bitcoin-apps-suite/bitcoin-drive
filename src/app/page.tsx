'use client'

import { useEffect, useState } from 'react'
import { Upload, Download, FileText, Trash2 } from 'lucide-react'
import { Utils } from '@bsv/sdk'
import { useWallet, publishRecord } from '@/lib/bwallet'

// B:// protocol prefix: <data> <media type> <encoding> <filename>
const B_PREFIX = '19HxigV5QyBv3tHpQVcUS4GnAXxQ8ZLxXX'
const MAX_BYTES = 5 * 1024 * 1024
const WOC = 'https://api.whatsonchain.com/v1/bsv/main'

type DriveFile = { txid: string; name: string; type: string; size: number; savedAt: string }

/** Read the pushes of the first OP_FALSE OP_RETURN output in a raw tx and return the B:// file. */
async function fetchBFile(txid: string): Promise<{ data: number[]; type: string; name: string } | null> {
  const r = await fetch(`${WOC}/tx/${txid}/hex`)
  if (!r.ok) return null
  const hex = (await r.text()).trim()
  const marker = hex.indexOf('006a')
  if (marker < 0) return null
  const b = Utils.toArray(hex.slice(marker + 4), 'hex')
  const pushes: number[][] = []
  let i = 0
  while (i < b.length && pushes.length < 5) {
    const op = b[i++]
    let n = 0
    if (op > 0 && op < 76) n = op
    else if (op === 0x4c) n = b[i++]
    else if (op === 0x4d) { n = b[i] | (b[i + 1] << 8); i += 2 }
    else if (op === 0x4e) { n = (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16)) + b[i + 3] * 2 ** 24; i += 4 }
    else break
    pushes.push(b.slice(i, i + n))
    i += n
  }
  if (pushes.length < 3 || Utils.toUTF8(pushes[0]) !== B_PREFIX) return null
  return { data: pushes[1], type: Utils.toUTF8(pushes[2]), name: pushes[4] ? Utils.toUTF8(pushes[4]) : txid }
}

export default function DrivePage() {
  const { user, connect, connecting, error } = useWallet()
  const key = `bdrive:files:${user?.identityKey ?? ''}`
  const [files, setFiles] = useState<DriveFile[]>([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [openTxid, setOpenTxid] = useState('')

  useEffect(() => {
    if (!user) { setFiles([]); return }
    try { setFiles(JSON.parse(localStorage.getItem(key) || '[]')) } catch { setFiles([]) }
  }, [user, key])

  const save = (next: DriveFile[]) => {
    setFiles(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
  }

  const upload = async (file: File | undefined) => {
    if (!file || !user) return
    if (file.size > MAX_BYTES) { setMsg('Files up to 5 MB for now.'); return }
    setBusy(true)
    setMsg('')
    try {
      const data = new Uint8Array(await file.arrayBuffer())
      const type = file.type || 'application/octet-stream'
      const r = await publishRecord([B_PREFIX, data, type, 'binary', file.name], 'Save file to Bitcoin Drive')
      if (!r.txid) throw new Error('The wallet did not return a transaction ID.')
      save([{ txid: r.txid, name: file.name, type, size: file.size, savedAt: new Date().toISOString() }, ...files])
      setMsg(`Saved ${file.name} on-chain.`)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'The wallet did not sign.')
    } finally {
      setBusy(false)
    }
  }

  const download = async (txid: string) => {
    setMsg('')
    const f = await fetchBFile(txid).catch(() => null)
    if (!f) { setMsg('Could not read a B:// file from that transaction (it may not be broadcast yet).'); return }
    const url = URL.createObjectURL(new Blob([new Uint8Array(f.data)], { type: f.type }))
    const a = document.createElement('a')
    a.href = url
    a.download = f.name
    a.click()
    URL.revokeObjectURL(url)
  }

  const card: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, marginTop: 16 }
  const btn: React.CSSProperties = { background: '#F5B800', color: '#1a1300', border: 0, borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }

  return (
    <div style={{ maxWidth: 860, margin: '32px auto', padding: '0 16px', color: '#ddd', width: '100%' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Bitcoin Drive</h1>
      <p style={{ color: '#999', marginTop: 6, lineHeight: 1.6 }}>
        Save files on Bitcoin as B:// data. Your wallet pays the network fee and shows it before you approve.
        Files saved on-chain are public and permanent, so do not upload anything private.
      </p>

      {!user ? (
        <div style={card}>
          <button style={btn} onClick={() => void connect()} disabled={connecting}>
            {connecting ? 'Connecting…' : 'Sign in with bWalletX'}
          </button>
          {error && <p style={{ color: '#f87171', marginTop: 8, fontSize: 13 }}>{error}</p>}
        </div>
      ) : (
        <div style={card}>
          <label style={{ ...btn, opacity: busy ? 0.6 : 1 }}>
            <Upload size={16} /> {busy ? 'Waiting for wallet…' : 'Upload a file'}
            <input type="file" hidden disabled={busy} onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = '' }} />
          </label>
          <span style={{ marginLeft: 12, fontSize: 12, color: '#888' }}>Up to 5 MB. Signed in as {user.name}.</span>
        </div>
      )}

      {msg && <p style={{ marginTop: 12, color: msg.startsWith('Saved') ? '#22c55e' : '#f87171' }}>{msg}</p>}

      <div style={card}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Your files</h2>
        {files.length === 0 ? (
          <p style={{ color: '#888' }}>{user ? 'No files yet. Files you save from this device are listed here.' : 'Sign in to see your files.'}</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {files.map((f) => (
              <li key={f.txid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <FileText size={16} />
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                <span style={{ fontSize: 12, color: '#888' }}>{(f.size / 1024).toFixed(1)} KB</span>
                <a href={`https://whatsonchain.com/tx/${f.txid}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#60a5fa' }}>tx</a>
                <button onClick={() => void download(f.txid)} title="Download from chain" style={{ background: 'none', border: 0, color: '#ddd', cursor: 'pointer' }}><Download size={16} /></button>
                <button onClick={() => save(files.filter((x) => x.txid !== f.txid))} title="Remove from this list (stays on-chain)" style={{ background: 'none', border: 0, color: '#888', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={card}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Open a file by transaction ID</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input value={openTxid} onChange={(e) => setOpenTxid(e.target.value.trim())} placeholder="txid" style={{ flex: 1, minWidth: 200, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 10px', color: '#fff' }} />
          <button style={btn} disabled={!/^[0-9a-f]{64}$/i.test(openTxid)} onClick={() => void download(openTxid)}><Download size={16} /> Download</button>
        </div>
      </div>
    </div>
  )
}
