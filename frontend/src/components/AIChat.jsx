import { useState, useEffect, useRef } from 'react';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000'
  : `${window.location.protocol}//${window.location.host}`;

const AI_TYPES = {
  nutritionist: {
    name: 'Dra. Ana - Nutricionista IA',
    icon: '🥗',
    color: '#10b981',
    description: 'Especialista em nutrição personalizada'
  },
  personal_trainer: {
    name: 'Coach Marcus - Personal Trainer IA',
    icon: '💪',
    color: '#f59e0b',
    description: 'Especialista em treino e performance'
  },
  mentor: {
    name: 'Sofia - Mentora de Vida IA',
    icon: '🧘‍♀️',
    color: '#8b5cf6',
    description: 'Mentora de hábitos e desenvolvimento pessoal'
  }
};

function AIChat({ token }) {
  const [selectedAI, setSelectedAI] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Auto scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Carregar conversas quando seleciona uma IA
  useEffect(() => {
    if (selectedAI) {
      loadConversations();
    }
  }, [selectedAI]);

  const loadConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/conversations/by_ai_type/?type=${selectedAI}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
    }
  };

  const startNewConversation = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/conversations/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ai_type: selectedAI })
      });
      const data = await response.json();
      setCurrentConversation(data);
      setMessages([]);
    } catch (err) {
      setError('Erro ao criar conversa');
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/conversations/${conversationId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCurrentConversation(data);
      setMessages(data.messages || []);
    } catch (err) {
      setError('Erro ao carregar conversa');
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentConversation) return;

    const userMsg = inputMessage;
    setInputMessage('');
    setLoading(true);
    setError('');

    // Adiciona mensagem do usuário otimisticamente
    const tempUserMsg = { role: 'user', content: userMsg, created_at: new Date() };
    setMessages([...messages, tempUserMsg]);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/conversations/${currentConversation.id}/send_message/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: userMsg })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setCurrentConversation(data);
        loadConversations(); // Atualizar lista de conversas
      } else {
        setError('Erro ao enviar mensagem');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Tela de seleção de IA
  if (!selectedAI) {
    return (
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>🤖 AI Sensei - Chat com IAs Especializadas</h1>
        <p style={{ color: '#666', marginBottom: '40px' }}>Escolha com qual especialista você quer conversar:</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {Object.entries(AI_TYPES).map(([type, ai]) => (
            <div
              key={type}
              onClick={() => setSelectedAI(type)}
              style={{
                padding: '30px',
                border: `2px solid ${ai.color}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>{ai.icon}</div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px', color: ai.color }}>{ai.name}</h3>
              <p style={{ color: '#666', fontSize: '14px' }}>{ai.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentAI = AI_TYPES[selectedAI];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', background: '#f5f5f5' }}>
      {/* Sidebar - Conversas */}
      <div style={{ width: '300px', background: 'white', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
          <button
            onClick={() => setSelectedAI(null)}
            style={{ marginBottom: '15px', padding: '8px 12px', background: '#f0f0f0', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%' }}
          >
            ← Voltar
          </button>
          <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>{currentAI.icon} {currentAI.name}</h3>
          <button
            onClick={startNewConversation}
            style={{ marginTop: '10px', padding: '10px', background: currentAI.color, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}
          >
            + Nova Conversa
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              style={{
                padding: '12px',
                marginBottom: '8px',
                background: currentConversation?.id === conv.id ? '#f0f0f0' : 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = currentConversation?.id === conv.id ? '#f0f0f0' : 'white'}
            >
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{conv.title}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>{conv.message_count} mensagens</div>
            </div>
          ))}
        </div>
      </div>

      {/* Área de Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentConversation ? (
          <>
            {/* Header */}
            <div style={{ padding: '20px', background: 'white', borderBottom: '1px solid #e0e0e0' }}>
              <h2 style={{ fontSize: '20px', margin: 0 }}>{currentConversation.title}</h2>
            </div>

            {/* Mensagens */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>{currentAI.icon}</div>
                  <p>Olá! Como posso te ajudar hoje?</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      marginBottom: '15px'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '70%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: msg.role === 'user' ? currentAI.color : 'white',
                        color: msg.role === 'user' ? 'white' : '#333',
                        border: msg.role === 'user' ? 'none' : '1px solid #e0e0e0',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
                  <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'white', border: '1px solid #e0e0e0' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ccc', animation: 'bounce 1.4s infinite ease-in-out' }}></div>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ccc', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }}></div>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ccc', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensagem */}
            <div style={{ padding: '20px', background: 'white', borderTop: '1px solid #e0e0e0' }}>
              {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{error}</div>}
              <div style={{ display: 'flex', gap: '10px' }}>
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    resize: 'none',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    minHeight: '50px',
                    maxHeight: '120px'
                  }}
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !inputMessage.trim()}
                  style={{
                    padding: '0 24px',
                    background: currentAI.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: (loading || !inputMessage.trim()) ? 0.6 : 1
                  }}
                >
                  Enviar
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>{currentAI.icon}</div>
              <p>Selecione uma conversa ou inicie uma nova</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIChat;
