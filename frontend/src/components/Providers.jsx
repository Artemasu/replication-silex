import React from 'react'

const PROVIDERS = [
  {
    name: 'Amazon S3',
    detail: 'silex-documents · eu-west-3',
    icon: '☁️',
    color: '#FF9900',
    status: 'online',
  },
  {
    name: 'Google Drive',
    detail: 'Dossier Silex · OAuth2',
    icon: '📁',
    color: '#4285F4',
    status: 'online',
  },
  {
    name: 'Scaleway (simulé)',
    detail: 'cloud_scaleway_simulated/',
    icon: '🗄️',
    color: '#5DCAA5',
    status: 'simulated',
  },
  {
    name: 'Stockage local',
    detail: 'Local_storage/',
    icon: '🖥️',
    color: '#D85A30',
    status: 'online',
  },
]

const STATUS_LABEL = {
  online:    { label: 'En ligne',  bg: '#E1F5EE', color: '#0F6E56' },
  simulated: { label: 'Simulé',    bg: '#FAEEDA', color: '#854F0B' },
  offline:   { label: 'Hors ligne',bg: '#FCEBEB', color: '#A32D2D' },
}

export default function Providers() {
  return (
    <div style={styles.grid}>
      {PROVIDERS.map((p) => {
        const s = STATUS_LABEL[p.status]
        return (
          <div key={p.name} style={styles.card}>
            <div style={styles.row}>
              <div style={{ ...styles.icon, background: p.color + '22', color: p.color }}>
                {p.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.name}>{p.name}</div>
                <div style={styles.detail}>{p.detail}</div>
              </div>
              <div style={{ ...styles.badge, background: s.bg, color: s.color }}>
                {s.label}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 10,
  },
  card: {
    background: '#fff',
    border: '1px solid #E0E0E0',
    borderRadius: 10,
    padding: '12px 14px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    flexShrink: 0,
  },
  name: {
    fontWeight: 600,
    fontSize: 13,
    color: '#1A1A1A',
  },
  detail: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 2,
    fontFamily: 'DM Mono, monospace',
  },
  badge: {
    fontSize: 11,
    fontWeight: 500,
    padding: '3px 10px',
    borderRadius: 20,
    whiteSpace: 'nowrap',
  },
}
