import React from 'react'

const PROVIDER_DOTS = [
  { label: 'S3',        color: '#FF9900' },
  { label: 'Drive',     color: '#4285F4' },
  { label: 'Scaleway',  color: '#5DCAA5' },
  { label: 'Local',     color: '#D85A30' },
]

export default function DocumentList({ documents, loading }) {
  if (loading) {
    return <div style={styles.empty}>Chargement…</div>
  }

  if (documents.length === 0) {
    return <div style={styles.empty}>Aucun document enregistré.</div>
  }

  return (
    <div style={styles.table}>
      {/* En-tête */}
      <div style={styles.header}>
        <span style={{ flex: 3 }}>Fichier</span>
        <span style={{ flex: 1 }}>Date</span>
        <span style={{ flex: 3 }}>Réplicas</span>
        <span style={{ flex: 1 }}>IA</span>
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
        </div>
      ))}
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
}
