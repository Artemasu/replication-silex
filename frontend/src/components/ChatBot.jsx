import React, { useState, useRef, useEffect } from 'react'

const API_URL = '/api'

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Bonjour ! Je suis Ody. Je peux analyser vos documents répliqués sur Silex. \nQue recherchez-vous aujourd\'hui ?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const question = input.trim()
    if (!question || loading) return

    setMessages(prev => [...prev, { role: 'user', text: question }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/chat?question=${encodeURIComponent(question)}`, {
        method: 'POST'
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '❌ Erreur de connexion.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={styles.container}>
      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((m, i) => (
          <div key={i} style={{
            ...styles.bubble,
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            background: m.role === 'user' ? '#6C47FF' : '#F3F3F3',
            color: m.role === 'user' ? '#fff' : '#1A1A1A',
          }}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div style={{ ...styles.bubble, background: '#F3F3F3', color: '#9E9E9E' }}>
            🌊 Ody réfléchit…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputRow}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ex: Résume moi le projet vétérinaire.    &#10;Ex: Que peux-tu faire ?"
          style={styles.textarea}
          rows={2}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            ...styles.sendBtn,
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    background: '#fff',
    border: '1px solid #E0E0E0',
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'column',
    height: 420,
    overflow: 'hidden',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  bubble: {
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: 12,
    fontSize: 13,
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
  },
  inputRow: {
    display: 'flex',
    gap: 8,
    padding: '12px',
    borderTop: '1px solid #E0E0E0',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    resize: 'none',
    border: '1px solid #E0E0E0',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
  },
  sendBtn: {
    background: '#6C47FF',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    width: 40,
    height: 40,
    fontSize: 16,
    cursor: 'pointer',
    flexShrink: 0,
  },
}