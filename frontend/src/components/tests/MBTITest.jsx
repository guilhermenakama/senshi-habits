import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

const MBTITest = ({ onClose, onResult }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const questions = [
    // Extroversão (E) vs Introversão (I)
    {
      id: 'EI1',
      question: 'Em uma festa, você geralmente:',
      options: [
        { value: 'E', text: 'Circula conversando com várias pessoas diferentes' },
        { value: 'I', text: 'Fica conversando profundamente com poucas pessoas conhecidas' }
      ]
    },
    {
      id: 'EI2',
      question: 'Você se sente energizado quando:',
      options: [
        { value: 'E', text: 'Está cercado de pessoas e ação' },
        { value: 'I', text: 'Tem tempo sozinho para pensar e refletir' }
      ]
    },
    {
      id: 'EI3',
      question: 'Ao resolver problemas, você prefere:',
      options: [
        { value: 'E', text: 'Discutir em voz alta com outras pessoas' },
        { value: 'I', text: 'Pensar sozinho antes de falar' }
      ]
    },
    {
      id: 'EI4',
      question: 'Você se considera:',
      options: [
        { value: 'E', text: 'Sociável e expansivo, fazendo amigos facilmente' },
        { value: 'I', text: 'Reservado e reflexivo, com poucos amigos próximos' }
      ]
    },

    // Sensação (S) vs Intuição (N)
    {
      id: 'SN1',
      question: 'Ao aprender algo novo, você prefere:',
      options: [
        { value: 'S', text: 'Exemplos práticos e instruções passo-a-passo' },
        { value: 'N', text: 'Entender o conceito geral e descobrir por conta própria' }
      ]
    },
    {
      id: 'SN2',
      question: 'Você presta mais atenção a:',
      options: [
        { value: 'S', text: 'Fatos concretos e detalhes específicos' },
        { value: 'N', text: 'Padrões gerais e possibilidades futuras' }
      ]
    },
    {
      id: 'SN3',
      question: 'Você prefere trabalhar com:',
      options: [
        { value: 'S', text: 'Informações reais e experiências comprovadas' },
        { value: 'N', text: 'Ideias inovadoras e teorias abstratas' }
      ]
    },
    {
      id: 'SN4',
      question: 'Ao descrever algo, você tende a:',
      options: [
        { value: 'S', text: 'Ser literal e preciso nos detalhes' },
        { value: 'N', text: 'Usar metáforas e falar do quadro geral' }
      ]
    },

    // Pensamento (T) vs Sentimento (F)
    {
      id: 'TF1',
      question: 'Ao tomar decisões importantes, você considera mais:',
      options: [
        { value: 'T', text: 'Lógica, análise objetiva e consequências práticas' },
        { value: 'F', text: 'Valores pessoais e impacto nas pessoas envolvidas' }
      ]
    },
    {
      id: 'TF2',
      question: 'Você se orgulha mais de ser:',
      options: [
        { value: 'T', text: 'Justo e imparcial' },
        { value: 'F', text: 'Empático e compreensivo' }
      ]
    },
    {
      id: 'TF3',
      question: 'Em um conflito, você tende a:',
      options: [
        { value: 'T', text: 'Analisar os fatos e buscar a solução mais lógica' },
        { value: 'F', text: 'Considerar os sentimentos e buscar harmonia' }
      ]
    },
    {
      id: 'TF4',
      question: 'Você se considera mais:',
      options: [
        { value: 'T', text: 'Racional e objetivo' },
        { value: 'F', text: 'Sensível e compassivo' }
      ]
    },

    // Julgamento (J) vs Percepção (P)
    {
      id: 'JP1',
      question: 'Você prefere ter:',
      options: [
        { value: 'J', text: 'Planos definidos e seguir uma agenda' },
        { value: 'P', text: 'Flexibilidade e espontaneidade' }
      ]
    },
    {
      id: 'JP2',
      question: 'Seu espaço de trabalho geralmente é:',
      options: [
        { value: 'J', text: 'Organizado e arrumado' },
        { value: 'P', text: 'Criativo e bagunçado' }
      ]
    },
    {
      id: 'JP3',
      question: 'Ao começar um projeto, você:',
      options: [
        { value: 'J', text: 'Faz um plano detalhado antes de começar' },
        { value: 'P', text: 'Começa e vê no que dá' }
      ]
    },
    {
      id: 'JP4',
      question: 'Prazos são para você:',
      options: [
        { value: 'J', text: 'Sagrados - você entrega antes ou no prazo' },
        { value: 'P', text: 'Flexíveis - você trabalha melhor sob pressão' }
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
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    Object.values(answers).forEach(answer => {
      if (scores.hasOwnProperty(answer)) {
        scores[answer]++;
      }
    });

    const mbtiType =
      (scores.E > scores.I ? 'E' : 'I') +
      (scores.S > scores.N ? 'S' : 'N') +
      (scores.T > scores.F ? 'T' : 'F') +
      (scores.J > scores.P ? 'J' : 'P');

    setShowResult(true);
    setTimeout(() => {
      onResult(mbtiType);
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
          <p className="text-gray-600">Aplicando seu tipo MBTI ao perfil...</p>
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
            <h2 className="text-2xl font-bold text-gray-900">Teste MBTI</h2>
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
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-6 md:p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQ.question}
          </h3>

          <div className="space-y-4">
            {currentQ.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(currentQ.id, option.value)}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                  answers[currentQ.id] === option.value
                    ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg'
                    : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQ.id] === option.value
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQ.id] === option.value && (
                      <div className="w-3 h-3 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-gray-700 flex-1">{option.text}</span>
                </div>
              </button>
            ))}
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MBTITest;
