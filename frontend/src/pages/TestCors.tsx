import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

export const TestCors: React.FC = () => {
  const [result, setResult] = useState<string>('Testing CORS...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testCors = async () => {
      try {
        // Test a simple GET request to the API
        const response = await fetch(`${api.baseUrl}/api/v1/health`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setResult(JSON.stringify(data, null, 2));
        setError(null);
      } catch (err) {
        console.error('CORS Test Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    testCors();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>CORS Test</h2>
      <h3>API Base URL: {api.baseUrl}</h3>
      
      <div style={{ 
        margin: '20px 0', 
        padding: '15px', 
        backgroundColor: error ? '#ffebee' : '#e8f5e9',
        borderRadius: '4px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {error ? (
          <div>
            <h3 style={{ color: '#c62828' }}>❌ CORS Test Failed</h3>
            <p>{error}</p>
            <p>Check the browser's developer console for more details.</p>
          </div>
        ) : (
          <div>
            <h3 style={{ color: '#2e7d32' }}>✅ CORS Test Successful!</h3>
            <pre>{result}</pre>
          </div>
        )}
      </div>
      
      <h3>Test Details</h3>
      <p>This test makes a GET request to <code>{api.baseUrl}/api/v1/health</code>.</p>
      <p>If successful, it means CORS is properly configured.</p>
      
      <h3>Common CORS Issues</h3>
      <ul>
        <li>Make sure the backend server is running</li>
        <li>Check that the API URL is correct</li>
        <li>Verify that the backend CORS middleware is properly configured</li>
        <li>Check the browser's developer console for CORS errors</li>
      </ul>
    </div>
  );
};

export default TestCors;
