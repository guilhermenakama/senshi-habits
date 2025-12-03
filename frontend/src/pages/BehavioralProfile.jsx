import { useState, useEffect } from 'react';
import { Save, CheckCircle, User, Target, MessageCircle, ChevronRight, Brain, Zap, Heart } from 'lucide-react';
import MBTITest from '../components/tests/MBTITest';
import DISCTest from '../components/tests/DISCTest';
import EnneagramTest from '../components/tests/EnneagramTest';

const BehavioralProfile = ({ token }) => {
  const [profile, setProfile] = useState({
    mbti_type: '', disc_type: '', enneagram_type: '', enneagram_wing: '',
    goals: '', challenges: '', motivation_style: '', triggers: '',
    preferred_communication: 'supportive', ai_coaching_enabled: true,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Estados para os modais de teste
  const [showMBTITest, setShowMBTITest] = useState(false);
  const [showDISCTest, setShowDISCTest] = useState(false);
  const [showEnneagramTest, setShowEnneagramTest] = useState(false);

  const mbtiTypes = [
    { value: 'INTJ', label: 'Arquiteto', desc: 'Estratégico, lógico e sempre com um plano' },
    { value: 'INTP', label: 'Lógico', desc: 'Inovador, curioso e sedento por conhecimento' },
    { value: 'ENTJ', label: 'Comandante', desc: 'Ousado, imaginativo e líder nato' },
    { value: 'ENTP', label: 'Inovador', desc: 'Inteligente, curioso e debatedor' },
    { value: 'INFJ', label: 'Conselheiro', desc: 'Idealista, visionário e inspirador' },
    { value: 'INFP', label: 'Mediador', desc: 'Poético, gentil e altruísta' },
    { value: 'ENFJ', label: 'Protagonista', desc: 'Carismático, inspirador e natural mentor' },
    { value: 'ENFP', label: 'Ativista', desc: 'Entusiasta, criativo e sociável' },
    { value: 'ISTJ', label: 'Logístico', desc: 'Prático, confiável e organizado' },
    { value: 'ISFJ', label: 'Defensor', desc: 'Dedicado, protetor e caloroso' },
    { value: 'ESTJ', label: 'Executivo', desc: 'Administrador competente e tradicional' },
    { value: 'ESFJ', label: 'Cônsul', desc: 'Atencioso, sociável e popular' },
    { value: 'ISTP', label: 'Virtuoso', desc: 'Ousado, prático e mestre ferramentas' },
    { value: 'ISFP', label: 'Aventureiro', desc: 'Flexível, charmoso e artista nato' },
    { value: 'ESTP', label: 'Empreendedor', desc: 'Perspicaz, energético e perceptivo' },
    { value: 'ESFP', label: 'Animador', desc: 'Espontâneo, energético e entusiasta' },
  ];

  const discTypes = [
    { value: 'D', label: 'Dominância', desc: 'Direto, orientado a resultados', color: 'from-red-400 to-red-600' },
    { value: 'I', label: 'Influência', desc: 'Entusiasta, persuasivo', color: 'from-yellow-400 to-yellow-600' },
    { value: 'S', label: 'Estabilidade', desc: 'Paciente, consistente', color: 'from-green-400 to-green-600' },
    { value: 'C', label: 'Conformidade', desc: 'Preciso, analítico', color: 'from-blue-400 to-blue-600' },
  ];

  const enneagramTypes = [
    { value: '1', label: 'Perfeccionista' },
    { value: '2', label: 'Ajudador' },
    { value: '3', label: 'Realizador' },
    { value: '4', label: 'Individualista' },
    { value: '5', label: 'Investigador' },
    { value: '6', label: 'Leal' },
    { value: '7', label: 'Entusiasta' },
    { value: '8', label: 'Desafiador' },
    { value: '9', label: 'Pacificador' },
  ];

  const communicationStyles = [
    { value: 'direct', label: 'Direto ao ponto', icon: '🎯' },
    { value: 'supportive', label: 'Encorajador', icon: '💝' },
    { value: 'analytical', label: 'Analítico', icon: '📊' },
    { value: 'motivational', label: 'Inspirador', icon: '🚀' },
  ];

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/profile/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/profile/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        setMessage('success');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => { setProfile(prev => ({ ...prev, [field]: value })); };
  const handleNextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const handlePrevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando seu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">

      {/* Hero Header */}
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6 shadow-lg">
          <User className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
          Descoberta de Personalidade
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Configure sua identidade comportamental em 3 passos simples
        </p>
      </div>

      {/* Success Message */}
      {message === 'success' && (
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <div className="bg-green-500 text-white rounded-2xl p-5 flex items-center gap-3 shadow-lg animate-in slide-in-from-top">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold">Perfil atualizado com sucesso!</span>
          </div>
        </div>
      )}

      {/* Step Indicator Cards */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div
            onClick={() => setCurrentStep(1)}
            className={`relative p-8 rounded-3xl cursor-pointer transition-all transform hover:scale-105 ${
              currentStep === 1
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl'
                : currentStep > 1
                ? 'bg-white text-gray-900 shadow-lg border-2 border-blue-200'
                : 'bg-white text-gray-400 shadow-md'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg ${
                currentStep === 1
                  ? 'bg-white/20 text-white'
                  : currentStep > 1
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {currentStep > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
              </div>
              <h3 className="text-xl font-bold">Mapeamento</h3>
            </div>
            <p className={`text-sm ${currentStep === 1 ? 'text-white/80' : 'text-gray-500'}`}>
              Descubra seus tipos comportamentais
            </p>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => currentStep >= 2 && setCurrentStep(2)}
            className={`relative p-8 rounded-3xl transition-all transform hover:scale-105 ${
              currentStep === 2
                ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-2xl cursor-pointer'
                : currentStep > 2
                ? 'bg-white text-gray-900 shadow-lg border-2 border-purple-200 cursor-pointer'
                : 'bg-white text-gray-400 shadow-md cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg ${
                currentStep === 2
                  ? 'bg-white/20 text-white'
                  : currentStep > 2
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {currentStep > 2 ? <CheckCircle className="w-6 h-6" /> : '2'}
              </div>
              <h3 className="text-xl font-bold">Contexto</h3>
            </div>
            <p className={`text-sm ${currentStep === 2 ? 'text-white/80' : 'text-gray-500'}`}>
              Objetivos, desafios e gatilhos
            </p>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => currentStep >= 3 && setCurrentStep(3)}
            className={`relative p-8 rounded-3xl transition-all transform hover:scale-105 ${
              currentStep === 3
                ? 'bg-gradient-to-br from-pink-500 to-red-600 text-white shadow-2xl cursor-pointer'
                : 'bg-white text-gray-400 shadow-md cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg ${
                currentStep === 3 ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                3
              </div>
              <h3 className="text-xl font-bold">AI Coaching</h3>
            </div>
            <p className={`text-sm ${currentStep === 3 ? 'text-white/80' : 'text-gray-500'}`}>
              Preferências e ativação
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 pb-24">

        {/* Step 1 */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Escolha seu Tipo MBTI</h2>
              <button
                type="button"
                onClick={() => setShowMBTITest(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transition-all"
              >
                <Brain className="w-5 h-5" />
                Fazer Teste
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {mbtiTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleChange('mbti_type', type.value)}
                  className={`group p-6 rounded-2xl border-2 transition-all text-left ${
                    profile.mbti_type === type.value
                      ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <div className="font-bold text-3xl text-indigo-600 mb-2">{type.value}</div>
                  <div className="font-semibold text-sm text-gray-900 mb-1">{type.label}</div>
                  <div className="text-xs text-gray-600 leading-relaxed">{type.desc}</div>
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* DISC */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Perfil DISC</h3>
                  <button
                    type="button"
                    onClick={() => setShowDISCTest(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-full hover:shadow-lg transition-all text-sm"
                  >
                    <Zap className="w-4 h-4" />
                    Fazer Teste
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {discTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleChange('disc_type', type.value)}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        profile.disc_type === type.value
                          ? `border-transparent bg-gradient-to-br ${type.color} text-white shadow-lg scale-105`
                          : 'border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <div className={`font-bold text-4xl mb-2 ${profile.disc_type === type.value ? 'text-white' : 'text-gray-900'}`}>
                        {type.value}
                      </div>
                      <div className={`text-sm font-medium ${profile.disc_type === type.value ? 'text-white/90' : 'text-gray-700'}`}>
                        {type.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enneagram */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Eneagrama</h3>
                  <button
                    type="button"
                    onClick={() => setShowEnneagramTest(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-full hover:shadow-lg transition-all text-sm"
                  >
                    <Heart className="w-4 h-4" />
                    Fazer Teste
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {enneagramTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleChange('enneagram_type', type.value)}
                      className={`aspect-square p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                        profile.enneagram_type === type.value
                          ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg scale-105'
                          : 'border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <div className={`font-bold text-3xl ${profile.enneagram_type === type.value ? 'text-yellow-600' : 'text-gray-900'}`}>
                        {type.value}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 text-center font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={profile.enneagram_wing || ''}
                  onChange={(e) => handleChange('enneagram_wing', e.target.value)}
                  placeholder="Wing (opcional, ex: 3w2)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-xl transition-all"
              >
                Próximo Passo
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Compartilhe Seu Contexto</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">🎯 Objetivos Principais</label>
                <textarea
                  value={profile.goals || ''}
                  onChange={(e) => handleChange('goals', e.target.value)}
                  placeholder="Ex: Perder 10kg, ganhar massa muscular..."
                  rows="5"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">⚔️ Principais Desafios</label>
                <textarea
                  value={profile.challenges || ''}
                  onChange={(e) => handleChange('challenges', e.target.value)}
                  placeholder="Ex: Falta de tempo, desmotivação..."
                  rows="5"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">🔥 Estilo de Motivação</label>
                <textarea
                  value={profile.motivation_style || ''}
                  onChange={(e) => handleChange('motivation_style', e.target.value)}
                  placeholder="O que te motiva?"
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">⚠️ Gatilhos de Recaída</label>
                <textarea
                  value={profile.triggers || ''}
                  onChange={(e) => handleChange('triggers', e.target.value)}
                  placeholder="Situações que levam a comportamentos negativos..."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-8 py-4 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-all"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-xl transition-all"
              >
                Próximo Passo
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Preferências de Comunicação</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {communicationStyles.map(style => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => handleChange('preferred_communication', style.value)}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    profile.preferred_communication === style.value
                      ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-red-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="text-4xl mb-3">{style.icon}</div>
                  <div className="font-semibold text-lg text-gray-900">{style.label}</div>
                </button>
              ))}
            </div>

            <label className="flex items-start gap-4 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.ai_coaching_enabled}
                onChange={(e) => handleChange('ai_coaching_enabled', e.target.checked)}
                className="mt-1 w-6 h-6 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="font-bold text-lg text-gray-900 mb-1">✨ Ativar AI Coaching</div>
                <div className="text-sm text-gray-600">
                  Receba insights personalizados baseados no seu perfil
                </div>
              </div>
            </label>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-8 py-4 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-all"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold rounded-full hover:shadow-xl transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Salvar Perfil
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Modais de Teste */}
      {showMBTITest && (
        <MBTITest
          onClose={() => setShowMBTITest(false)}
          onResult={(mbtiType) => {
            handleChange('mbti_type', mbtiType);
            setShowMBTITest(false);
          }}
        />
      )}

      {showDISCTest && (
        <DISCTest
          onClose={() => setShowDISCTest(false)}
          onResult={(discType) => {
            handleChange('disc_type', discType);
            setShowDISCTest(false);
          }}
        />
      )}

      {showEnneagramTest && (
        <EnneagramTest
          onClose={() => setShowEnneagramTest(false)}
          onResult={(enneagramType, suggestedWing) => {
            handleChange('enneagram_type', enneagramType);
            if (suggestedWing) {
              handleChange('enneagram_wing', suggestedWing);
            }
            setShowEnneagramTest(false);
          }}
        />
      )}
    </div>
  );
};

export default BehavioralProfile;
