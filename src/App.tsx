import { useState, useEffect } from 'react'
import { Heart, RefreshCw, X } from 'lucide-react'
import './App.css'

interface Quote {
  _id: string;
  content: string;
  author: string;
}

function App() {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [likedQuotes, setLikedQuotes] = useState<Quote[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Yo college student! We gotta load those saved quotes from localStorage on mount.
  // Otherwise our precious likes disappear like my motivation to study for finals.
  useEffect(() => {
    const saved = localStorage.getItem('likedQuotes')
    if (saved) {
      setLikedQuotes(JSON.parse(saved))
    }
    fetchNewQuote()
  }, [])

  // Persist likes whenever they change
  useEffect(() => {
    localStorage.setItem('likedQuotes', JSON.stringify(likedQuotes))
  }, [likedQuotes])

  const fetchNewQuote = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://api.quotable.io/random')
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      setQuote(data)
    } catch (error) {
      console.error("Oops! Couldn't fetch the quote. The universe is busy.", error)
      setQuote({
        _id: 'error',
        content: "Even the darkest night will end and the sun will rise. (Because the API failed to load).",
        author: "Unknown Developer"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLike = () => {
    if (!quote) return
    const isLiked = likedQuotes.some(q => q._id === quote._id)
    if (isLiked) {
      // Unlike it (break its heart)
      setLikedQuotes(likedQuotes.filter(q => q._id !== quote._id))
    } else {
      // Like it
      setLikedQuotes([...likedQuotes, quote])
    }
  }

  const isCurrentQuoteLiked = quote ? likedQuotes.some(q => q._id === quote._id) : false

  return (
    <div className="app-container">
      <header className="top-bar">
        <h1 className="title">The Oracle</h1>
        <button className="liked-count" onClick={() => setShowHistory(!showHistory)}>
          <Heart size={16} fill="var(--color-primary-dim)" color="var(--color-primary-dim)" />
          <span>{likedQuotes.length} Loved</span>
        </button>
      </header>

      {showHistory && (
        <div className="history-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-functional)', color: 'var(--color-on-surface)' }}>Hall of Fame</h3>
            <button 
              onClick={() => setShowHistory(false)}
              style={{ background: 'none', border: 'none', color: 'var(--color-on-surface)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
          {likedQuotes.length === 0 ? (
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>No liked quotes yet. Go find some inspiration!</p>
          ) : (
            likedQuotes.map(q => (
              <div key={q._id} className="history-item">
                <p className="history-quote">"{q.content}"</p>
                <p className="history-author">— {q.author}</p>
              </div>
            ))
          )}
        </div>
      )}

      <main className="main-content">
        <div className="quote-card">
          {loading ? (
            <div className="quote-loading">Channeling inspiration...</div>
          ) : (
            <>
              <p className="quote-text">"{quote?.content}"</p>
              <p className="quote-author">— {quote?.author}</p>
            </>
          )}

          <div className="actions">
            <button 
              className="btn btn-primary" 
              onClick={fetchNewQuote}
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'spinning' : ''} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              New Prophecy
            </button>
            <button 
              className={`btn btn-secondary ${isCurrentQuoteLiked ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={loading}
            >
              <Heart size={18} fill={isCurrentQuoteLiked ? 'currentColor' : 'none'} />
              {isCurrentQuoteLiked ? 'Loved' : 'Like'}
            </button>
          </div>
        </div>
      </main>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default App
