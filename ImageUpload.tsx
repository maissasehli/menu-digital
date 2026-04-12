'use client'

import { useState, useRef } from 'react'

export default function ImageUpload({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    onChange(data.url)
    setUploading(false)
  }

  return (
    <div className="upload-wrap">
      {value ? (
        <div className="img-preview">
          <img src={value} alt="preview" className="preview-img" />
          <button onClick={() => onChange('')} className="remove-btn">✕</button>
        </div>
      ) : (
        <button className={`upload-btn ${uploading ? 'uploading' : ''}`} onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? (
            <><span className="spin" /> Envoi en cours…</>
          ) : (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> Ajouter une photo</>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </button>
      )}
      <style jsx>{`
        .upload-wrap {}
        .upload-btn { display: flex; align-items: center; gap: 8px; width: 100%; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.12); border-radius: 13px; padding: 14px 18px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.4); cursor: pointer; font-family: inherit; transition: all 0.2s; justify-content: center; }
        .upload-btn:hover:not(:disabled) { border-color: rgba(255,107,53,0.35); color: #FF8C42; background: rgba(255,107,53,0.04); }
        .upload-btn.uploading { opacity: 0.6; cursor: not-allowed; }
        .spin { display: inline-block; width: 13px; height: 13px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; animation: spin 0.7s linear infinite; }
        .img-preview { position: relative; border-radius: 12px; overflow: hidden; }
        .preview-img { width: 100%; height: 140px; object-fit: cover; display: block; }
        .remove-btn { position: absolute; top: 8px; right: 8px; width: 26px; height: 26px; border-radius: 50%; background: rgba(0,0,0,0.6); border: none; color: #fff; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}