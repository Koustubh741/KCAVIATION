export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a1628 0%, #0f1f2e 50%, #0a1a20 100%)',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'rgba(20, 30, 45, 0.8)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        maxWidth: '600px',
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem',
          background: 'linear-gradient(90deg, #ffffff, #4ade80)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          ✈️ AeroIntel Backend API
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
          AI-Powered Aviation Intelligence Platform
        </p>
        
        <div style={{ textAlign: 'left', marginTop: '2rem' }}>
          <h3 style={{ color: '#4ade80', marginBottom: '1rem' }}>Available Endpoints:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <code style={{ color: '#4ade80' }}>GET</code> /api/health - Health check
            </li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <code style={{ color: '#fbbf24' }}>POST</code> /api/auth/login - User login
            </li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <code style={{ color: '#fbbf24' }}>POST</code> /api/auth/register - User registration
            </li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <code style={{ color: '#fbbf24' }}>POST</code> /api/transcribe - Audio transcription
            </li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <code style={{ color: '#fbbf24' }}>POST</code> /api/analyze - AI analysis
            </li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <code style={{ color: '#4ade80' }}>GET</code> /api/insights - Get insights
            </li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <code style={{ color: '#4ade80' }}>GET</code> /api/alerts - Get alerts
            </li>
            <li style={{ padding: '0.5rem 0' }}>
              <code style={{ color: '#4ade80' }}>GET</code> /api/dashboard/stats - Dashboard statistics
            </li>
          </ul>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(74,222,128,0.1)', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
            📖 See README.md for full API documentation
          </p>
        </div>
      </div>
    </div>
  );
}



