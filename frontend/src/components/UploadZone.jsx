import React, { useState, useRef } from 'react'

export default function UploadZone({ apiUrl, onUploadDone }) {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)   // { ok: bool, message: string }
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  async function uploadFile(file) {
    if (!file) return
    setUploading(true)
    setResult(null)

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch(`${apiUrl}/upload`, { method: 'POST', body: form })
      const data = await res.json()

      if (res.ok) {
        setResult({ ok: true, message: `✅ "${file.name}" répliqué avec succès !` })
        onUploadDone()
      } else {
        setResult({ ok: false, message: `❌ Erreur : ${data.detail}` })
      }
    } catch (e) {
      setResult({ ok: false, message: '❌ Impossible de contacter l\'API.' })
    } finally {
      setUploading(false)
    }
  }

  function onFileChange(e) {
    uploadFile(e.target.files[0])
    e.target.value = ''
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    uploadFile(e.dataTransfer.files[0])
  }

  return (
    <div>
      <div
        style={{
          ...styles.zone,
          borderColor: dragging ? '#7F77DD' : '#D0D0D0',
          background: dragging ? '#EEEDFE' : '#FAFAFA',
        }}
        onClick={() => !uploading && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          style={{ display: 'none' }}
          accept=".pdf,.png,.jpg,.jpeg,.docx"
          onChange={onFileChange}
        />

        {uploading ? (
          <>
            <div style={styles.icon}>⏳</div>
            <div style={styles.title}>Réplication en cours…</div>
            <div style={styles.sub}>Le fichier est envoyé vers tous les providers</div>
          </>
        ) : (
          <>
            <div style={styles.icon}>📤</div>
            <div style={styles.title}>Déposer un fichier ici</div>
            <div style={styles.sub}>ou cliquer pour choisir · PDF, image, Word</div>
            <button
              style={styles.btn}
              onClick={(e) => { e.stopPropagation(); inputRef.current.click() }}
            >
              Choisir un fichier
            </button>
          </>
        )}
      </div>

      {result && (
        <div style={{
          ...styles.feedback,
          background: result.ok ? '#E1F5EE' : '#FCEBEB',
          color: result.ok ? '#0F6E56' : '#A32D2D',
        }}>
          {result.message}
        </div>
      )}
    </div>
  )
}

const styles = {
  zone: {
    border: '2px dashed',
    borderRadius: 12,
    padding: '36px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  icon: {
    fontSize: 36,
    marginBottom: 10,
  },
  title: {
    fontWeight: 600,
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 6,
  },
  sub: {
    fontSize: 13,
    color: '#9E9E9E',
    marginBottom: 16,
  },
  btn: {
    background: '#7F77DD',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 20px',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'DM Sans, sans-serif',
  },
  feedback: {
    marginTop: 12,
    padding: '10px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
  },
}
