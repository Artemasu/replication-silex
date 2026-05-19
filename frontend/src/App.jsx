import React, { useState, useEffect } from 'react'
import Providers from './components/Providers.jsx'
import UploadZone from './components/UploadZone.jsx'
import DocumentList from './components/DocumentList.jsx'
import ChatBot from './components/ChatBot.jsx'

const API = '/api'

export default function App() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState(false)

  async function fetchDocuments() {
    try {
      const res = await fetch(`${API}/documents`)
      const data = await res.json()
      setDocuments(data)
      setApiOnline(true)
    } catch (e) {
      setApiOnline(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🗿</div>
          <div>
            <div style={styles.logoName}>Silex</div>
            <div style={styles.logoSub}>Plateforme de réplication documentaire</div>
          </div>
        </div>
        <div style={{
          ...styles.badge,
          background: apiOnline ? '#E1F5EE' : '#FCEBEB',
          color: apiOnline ? '#0F6E56' : '#A32D2D'
        }}>
          {apiOnline ? '● API en ligne' : '● API hors ligne'}
        </div>
      </header>

      {/* Métriques rapides */}
      <div style={styles.metrics}>
        <Metric label="Documents" value={documents.length} color="var(--purple)" />
        <Metric label="Providers" value="4" color="var(--green)" />
        <Metric label="Copies par fichier" value="4×" color="var(--orange)" />
        <Metric label="Avec extraction IA" value={documents.filter(d => d.has_content).length} color="#D85A30" />
      </div>

      {/* Statut des providers */}
      <Section title="Providers de stockage">
        <Providers />
      </Section>

      {/* Upload */}
      <Section title="Uploader un document">
        <UploadZone apiUrl={API} onUploadDone={fetchDocuments} />
      </Section>

      <Section title="Ody 🌊">
        <p style={{ marginTop: -8, marginBottom: 12, fontSize: 13, color: '#9E9E9E' }}>
          L'assistant intelligent de Silex
        </p>
        <ChatBot />
      </Section>

      {/* Liste des documents */}
      <Section title={`Documents enregistrés (${documents.length})`} onRefresh={fetchDocuments}>
        <DocumentList documents={documents} loading={loading} onRefresh={fetchDocuments} />
      </Section>
    </div>
  )
}

function Metric({ label, value, color }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricLabel}>{label}</div>
      <div style={{ ...styles.metricValue, color }}>{value}</div>
    </div>
  )
}

function Section({ title, children, onRefresh }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        {onRefresh && (
          <button style={styles.refreshBtn} onClick={onRefresh}>
            ↻ Actualiser
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

const styles = {
  page: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '24px 20px 60px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottom: '1px solid var(--gray-200)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 40,
    height: 40,
    background: 'var(--purple)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  },
  logoName: {
    fontSize: 20,
    fontWeight: 600,
    color: 'var(--gray-900)',
  },
  logoSub: {
    fontSize: 12,
    color: 'var(--gray-400)',
  },
  badge: {
    fontSize: 13,
    fontWeight: 500,
    padding: '5px 14px',
    borderRadius: 20,
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    marginBottom: 28,
  },
  metricCard: {
    background: 'var(--white)',
    border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius)',
    padding: '14px 16px',
  },
  metricLabel: {
    fontSize: 12,
    color: 'var(--gray-400)',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: 600,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--gray-900)',
  },
  refreshBtn: {
    background: 'none',
    border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius-sm)',
    padding: '4px 12px',
    fontSize: 13,
    color: 'var(--gray-600)',
  },
}
