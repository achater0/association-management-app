import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('Connecting to backend...');

  useEffect(() => {
    fetch('http://localhost:8080/api/health')
      .then((res) => res.json())
      .then((data) => setMessage(data.status))
      .catch(() => setMessage('Failed to connect to backend. Make sure your server is running!'));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Association Management System</h1>
      <p>Backend Status: <strong>{message}</strong></p>
    </div>
  );
}

export default App;