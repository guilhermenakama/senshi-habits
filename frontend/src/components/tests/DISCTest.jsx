import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

const DISCTest = ({ onClose, onResult }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      id: 'q1',
      question: 'Em uma situação de conflito, você:',
      options: [
        { value: 'D', text: 'Enfrenta diretamente e busca resolver rapidamente' },
        { value: 'I', text: 'Tenta persuadir e buscar apoio de outros' },
        { value: 'S', text: 'Prefere manter a harmonia e evitar confronto' },
        { value: 'C', text: 'Analisa os fatos antes de tomar posição' }
      ]
    },
    {
      id: 'q2',
      question: 'Seu estilo de trabalho é:',
      options: [
        { value: 'D', text: 'Rápido, focado em resultados e decisivo' },
        { value: 'I', text: 'Colaborativo, entusiasta e dinâmico' },
        { value: 'S', text: 'Constante, leal e metódico' },
        { value: 'C', text: 'Preciso, detalhista e sistemático' }
      ]
    },
    {
      id: 'q3',
      question: 'Ao liderar uma equipe, você:',
      options: [
        { value: 'D', text: 'Toma decisões firmes e espera resultados' },
        { value: 'I', text: 'Motiva e inspira com entusiasmo' },
        { value: 'S', text: 'Apoia e mantém a equipe unida' },
        { value: 'C', text: 'Garante qualidade e precisão' }
      ]
    },
    {
      id: 'q4',
      question: 'Você se sente mais confortável quando:',
      options: [
        { value: 'D', text: 'Está no controle e alcançando metas' },
        { value: 'I', text: 'Está interagindo com pessoas e sendo reconhecido' },
        { value: 'S', text: 'Tem rotina estável e previsível' },
        { value: 'C', text: 'Tem tempo para analisar e fazer bem feito' }
      ]
    },
    {
      id: 'q5',
      question: 'Seu maior medo é:',
      options: [
        { value: 'D', text: 'Perder o controle ou ser visto como fraco' },
        { value: 'I', text: 'Ser rejeitado ou ignorado' },
        { value: 'S', text: 'Mudanças bruscas ou conflitos' },
        { value: 'C', text: 'Cometer erros ou ser criticado' }
      ]
    },
    {
      id: 'q6',
      question: 'Ao tomar decisões, você prioriza:',
      options: [
        { value: 'D', text: 'Velocidade e eficácia' },
        { value: 'I', text: 'Consenso e impacto nas pessoas' },
        { value: 'S', text: 'Segurança e estabilidade' },
        { value: 'C', text: 'Precisão e qualidade' }
      ]
    },
    {
      id: 'q7',
      question: 'As pessoas te descrevem como:',
      options: [
        { value: 'D', text: 'Direto, corajoso e determinado' },
        { value: 'I', text: 'Amigável, otimista e expressivo' },
        { value: 'S', text: 'Paciente, confiável e calmo' },
        { value: 'C', text: 'Cuidadoso, preciso e reservado' }
      ]
    },
    {
      id: 'q8',
      question: 'Seu ritmo de trabalho é:',
      options: [
        { value: 'D', text: 'Intenso e acelerado' },
        { value: 'I', text: 'Variado e social' },
        { value: 'S', text: 'Constante e estável' },
        { value: 'C', text: 'Cuidadoso e ponderado' }
      ]
    },
    {
      id: 'q9',
      question: 'Você valoriza mais:',
      options: [
        { value: 'D', text: 'Competência e resultados' },
        { value: 'I', text: 'Relacionamentos e reconhecimento' },
        { value: 'S', text: 'Lealdade e cooperação' },
        { value: 'C', text: 'Qualidade e precisão' }
      ]
    },
    {
      id: 'q10',
      question: 'Sob pressão, você:',
      options: [
        { value: 'D', text: 'Fica mais assertivo e direto' },
        { value: 'I', text: 'Busca apoio e tenta manter o ânimo' },
        { value: 'S', text: 'Fica ansioso e busca estabilidade' },
        { value: 'C', text: 'Se retrai e analisa mais' }
      ]
    },
    {
      id: 'q11',
      question: 'Você prefere ambientes:',
      options: [
        { value: 'D', text: 'Desafiadores com oportunidades de crescimento' },
        { value: 'I', text: 'Dinâmicos com interação social' },
        { value: 'S', text: 'Previsíveis e harmoniosos' },
        { value: 'C', text: 'Organizados com padrões claros' }
      ]
    },
    {
      id: 'q12',
      question: 'Ao comunicar, você é:',
      options: [
        { value: 'D', text: 'Direto e objetivo' },
        { value: 'I', text: 'Expressivo e animado' },
        { value: 'S', text: 'Calmo e atencioso' },
        { value: 'C', text: 'Preciso e detalhado' }
      ]
    }
  ];

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = () => {
    const scores = { D: 0, I: 0, S: 0, C: 0 };

    Object.values(answers).forEach(answer => {
      if (scores.hasOwnProperty(answer)) {
        scores[answer]++;
      }
    });

    // Encontra o tipo dominante
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const dominant = sorted[0][0];
    const secondary = sorted[1][0];

    // Se o segundo tipo tem pelo menos 30% dos pontos do primeiro, é uma combinação
    let discType = dominant;
    if (sorted[1][1] >= sorted[0][1] * 0.6) {
      discType = dominant + secondary;
    }

    setShowResult(true);
    setTimeout(() => {
      onResult(discType);
      onClose();
    }, 3000);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const isAnswered = answers[currentQ.id] !== undefined;

  if (showResult) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-12 max-w-md text-center animate-in zoom-in">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Teste Concluído!</h3>
          <p className="text-gray-600">Aplicando seu perfil DISC...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Teste DISC</h2>
            <p className="text-sm text-gray-500 mt-1">
              Questão {currentQuestion + 1} de {questions.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-6 md:p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQ.question}
          </h3>

          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const colors = {
                D: 'from-red-50 to-red-100 border-red-500',
                I: 'from-yellow-50 to-yellow-100 border-yellow-500',
                S: 'from-green-50 to-green-100 border-green-500',
                C: 'from-blue-50 to-blue-100 border-blue-500'
              };

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(currentQ.id, option.value)}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                    answers[currentQ.id] === option.value
                      ? `bg-gradient-to-br ${colors[option.value]} shadow-lg`
                      : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQ.id] === option.value
                        ? `border-${option.value === 'D' ? 'red' : option.value === 'I' ? 'yellow' : option.value === 'S' ? 'green' : 'blue'}-600 bg-${option.value === 'D' ? 'red' : option.value === 'I' ? 'yellow' : option.value === 'S' ? 'green' : 'blue'}-600`
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQ.id] === option.value && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-700">{option.text}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>

          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-full hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DISCTest;
