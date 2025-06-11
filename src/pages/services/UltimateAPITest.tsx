import React, { useState } from 'react';

const UltimateAPITest: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    console.log(message);
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAPI = async () => {
    setResults([]);
    addResult('🚀 Starting ultimate API test...');
    
    // Test 1: Direct backend
    try {
      addResult('📡 Test 1: Direct backend (localhost:8000)');
      const response1 = await fetch('http://localhost:8000/api/v1/service_categories');
      addResult(`✅ Direct backend: ${response1.status} ${response1.ok ? 'OK' : 'FAIL'}`);
      
      if (response1.ok) {
        const data1 = await response1.json();
        addResult(`📊 Direct backend data: ${data1.data?.length || 0} categories`);
      }
    } catch (error) {
      addResult(`❌ Direct backend error: ${error}`);
    }

    // Test 2: Proxy through frontend
    try {
      addResult('🔄 Test 2: Proxy through frontend (localhost:3008)');
      const response2 = await fetch('/api/v1/service_categories');
      addResult(`✅ Proxy: ${response2.status} ${response2.ok ? 'OK' : 'FAIL'}`);
      
      if (response2.ok) {
        const data2 = await response2.json();
        addResult(`📊 Proxy data: ${data2.data?.length || 0} categories`);
        addResult(`🔍 First category: ${data2.data?.[0]?.name || 'N/A'}`);
        
        // This is the critical test - can we set this data to state?
        addResult(`🧪 Testing React state update...`);
        
        // Simulate what our component should do
        const categories = data2.data || [];
        addResult(`✅ State simulation: ${categories.length} categories would be set`);
        
        categories.forEach((cat: any, index: number) => {
          addResult(`  ${index + 1}. ${cat.name} (ID: ${cat.id}, Active: ${cat.is_active})`);
        });
        
      } else {
        addResult(`❌ Proxy failed: ${response2.statusText}`);
      }
    } catch (error) {
      addResult(`❌ Proxy error: ${error}`);
    }

    // Test 3: Headers check
    try {
      addResult('🔍 Test 3: Headers and response details');
      const response3 = await fetch('/api/v1/service_categories');
      
      const contentType = response3.headers.get('content-type');
      addResult(`📋 Content-Type: ${contentType}`);
      
      const responseText = await response3.text();
      addResult(`📝 Response length: ${responseText.length} characters`);
      addResult(`🔤 Response starts with: ${responseText.substring(0, 100)}...`);
      
      // Try to parse JSON
      try {
        const parsed = JSON.parse(responseText);
        addResult(`✅ JSON parsing: SUCCESS`);
        addResult(`🏗️ Response structure: data=${!!parsed.data}, pagination=${!!parsed.pagination}`);
      } catch (parseError) {
        addResult(`❌ JSON parsing failed: ${parseError}`);
      }
      
    } catch (error) {
      addResult(`❌ Headers test error: ${error}`);
    }

    addResult('🏁 Ultimate API test completed!');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔬 Ultimate API Test</h1>
      
      <button 
        onClick={testAPI}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🧪 Run Ultimate Test
      </button>
      
      <div style={{ 
        marginTop: '20px', 
        backgroundColor: '#000', 
        color: '#0f0', 
        padding: '15px', 
        borderRadius: '4px',
        maxHeight: '500px',
        overflowY: 'auto',
        fontFamily: 'Courier New, monospace',
        fontSize: '12px'
      }}>
        {results.length === 0 ? (
          <div>Click "Run Ultimate Test" to start...</div>
        ) : (
          results.map((result, index) => (
            <div key={index}>{result}</div>
          ))
        )}
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <h3>This test will verify:</h3>
        <ul>
          <li>✅ Backend API direct access</li>
          <li>✅ Frontend proxy functionality</li>
          <li>✅ JSON parsing</li>
          <li>✅ React state simulation</li>
          <li>✅ Response headers and format</li>
        </ul>
      </div>
    </div>
  );
};

export default UltimateAPITest;
