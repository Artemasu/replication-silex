import React, { useState } from 'react'

const PROVIDER_DOTS = [
  { label: 'S3',    color: '#FF9900' },
  { label: 'Drive', color: '#4285F4' },
  { label: 'R2',    color: '#F6821F' }, 
  { label: 'Local', color: '#D85A30' },
]

const API_URL = '/api'

export default function DocumentList({ documents, loading, onRefresh }) {
  const [deletingId, setDeletingId] = useState(null)
  const [deletingAll, setDeletingAll] = useState(false)
  const [confirmAll, setConfirmAll] = useState(false)

  // Supprimer un seul document
  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await fetch(`${API_URL}/documents/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (e) {
      alert('Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  // Supprimer tous les documents
  const handleDeleteAll = async () => {
    if (!confirmAll) {
      setConfirmAll(true)
      return
    }
    setDeletingAll(true)
    setConfirmAll(false)
    try {
      await fetch(`${API_URL}/documents`, { method: 'DELETE' })
      onRefresh()
    } catch (e) {
      alert('Erreur lors de la suppression')
    } finally {
      setDeletingAll(false)
    }
  }

  if (loading) {
    return <div style={styles.empty}>Chargement…</div>
  }

  if (documents.length === 0) {
    return <div style={styles.empty}>Aucun document enregistré.</div>
  }

  return (
    <div>
      {/* Bouton "Tout supprimer" en haut à droite */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button
          onClick={handleDeleteAll}
          disabled={deletingAll}
          style={{
            ...styles.deleteAllBtn,
            background: confirmAll ? '#D32F2F' : '#FFF0F0',
            color: confirmAll ? '#fff' : '#D32F2F',
          }}
        >
          {deletingAll ? 'Suppression…' : confirmAll ? '⚠️ Confirmer la suppression' : '🗑 Tout supprimer'}
        </button>
        {confirmAll && (
          <button
            onClick={() => setConfirmAll(false)}
            style={styles.cancelBtn}
          >
            Annuler
          </button>
        )}
      </div>

      <div style={styles.table}>
        {/* En-tête */}
        <div style={styles.header}>
          <span style={{ flex: 3 }}>Fichier</span>
          <span style={{ flex: 1 }}>Date</span>
          <span style={{ flex: 3 }}>Réplicas</span>
          <span style={{ flex: 1 }}>IA</span>
          <span style={{ flex: 1, textAlign: 'right' }}>Action</span>
        </div>

        {/* Lignes */}
        {documents.map((doc) => (
          <div key={doc.id} style={styles.row}>
            {/* Nom du fichier */}
            <span style={{ flex: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={styles.fileIcon}>📄</span>
              <span style={styles.fileName}>{doc.filename}</span>
            </span>

            {/* Date */}
            <span style={{ flex: 1, color: '#9E9E9E', fontSize: 12 }}>
              {doc.date ? new Date(doc.date).toLocaleDateString('fr-FR') : '—'}
            </span>

            {/* Points colorés = providers */}
            <span style={{ flex: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
              {PROVIDER_DOTS.map((p) => (
                <span key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ ...styles.dot, background: p.color }} />
                  <span style={{ fontSize: 11, color: '#9E9E9E' }}>{p.label}</span>
                </span>
              ))}
            </span>

            {/* Extraction IA */}
            <span style={{ flex: 1 }}>
              {doc.has_content ? (
                <span style={{ ...styles.tag, background: '#E1F5EE', color: '#0F6E56' }}>Extrait</span>
              ) : (
                <span style={{ ...styles.tag, background: '#F0F0F0', color: '#9E9E9E' }}>Non</span>
              )}
            </span>

            {/* Bouton supprimer */}
            <span style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={deletingId === doc.id}
                style={styles.deleteBtn}
                title="Supprimer ce document"
              >
                {deletingId === doc.id ? '…' : '🗑'}
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  table: {
    background: '#fff',
    border: '1px solid #E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    padding: '10px 16px',
    background: '#F8F8F8',
    borderBottom: '1px solid #E0E0E0',
    fontSize: 11,
    fontWeight: 600,
    color: '#9E9E9E',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #F0F0F0',
    transition: 'background 0.1s',
  },
  fileIcon: {
    fontSize: 16,
    flexShrink: 0,
  },
  fileName: {
    fontSize: 13,
    fontWeight: 500,
    color: '#1A1A1A',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 200,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
  },
  tag: {
    fontSize: 11,
    fontWeight: 500,
    padding: '3px 8px',
    borderRadius: 20,
  },
  empty: {
    background: '#fff',
    border: '1px solid #E0E0E0',
    borderRadius: 10,
    padding: '40px 20px',
    textAlign: 'center',
    color: '#9E9E9E',
    fontSize: 13,
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: '4px 8px',
    borderRadius: 6,
    color: '#D85A30',
    transition: 'background 0.1s',
  },
  deleteAllBtn: {
    border: '1px solid #D32F2F',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  cancelBtn: {
    marginLeft: 8,
    background: '#F0F0F0',
    border: 'none',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    color: '#555',
  },
}