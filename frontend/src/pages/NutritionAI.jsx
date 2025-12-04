import React, { useState } from 'react';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000'
  : `${window.location.protocol}//${window.location.host}`;

const NutritionAI = ({ token }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch(`${API_URL}/api/vision/analyze/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) setResult(data);
      else alert('Erro: ' + JSON.stringify(data));
    } catch (err) {
      alert('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>🍎 Nutrição Inteligente</h2>
      <p>Envie uma foto do seu prato para calcular calorias e macros.</p>
      
      <div style={{ border: '2px dashed #ccc', padding: '20px', borderRadius: '10px', margin: '20px 0' }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && <img src={preview} alt="Prato" style={{ width: '100%', marginTop: '10px', borderRadius: '8px' }} />}
      </div>

      <button onClick={handleAnalyze} disabled={loading || !selectedFile} style={{ padding: '15px', width: '100%', background: '#ff5722', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        {loading ? "Calculando Calorias..." : "Analisar Prato"}
      </button>

      {result && (
        <div style={{ marginTop: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '10px', textAlign: 'left' }}>
          <h3>🍽️ Resultado:</h3>
          <p style={{whiteSpace: 'pre-wrap'}}>{result.description}</p>
        </div>
      )}
    </div>
  );
};
export default NutritionAI;