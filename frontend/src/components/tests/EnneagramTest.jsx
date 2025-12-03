import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

const EnneagramTest = ({ onClose, onResult }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      id: 'q1',
      question: 'Qual destas afirmações mais te descreve?',
      options: [
        { value: '1', text: 'Tenho padrões elevados e me esforço para fazer tudo corretamente' },
        { value: '2', text: 'Gosto de ajudar os outros e me sinto bem quando sou necessário' },
        { value: '3', text: 'Sou focado em objetivos e valorizo realizações e sucesso' },
        { value: '4', text: 'Sou autêntico e profundamente conectado com minhas emoções' },
        { value: '5', text: 'Valorizo conhecimento e prefiro observar antes de agir' },
        { value: '6', text: 'Busco segurança e sou cauteloso com possíveis problemas' },
        { value: '7', text: 'Sou entusiasta, otimista e sempre busco novas experiências' },
        { value: '8', text: 'Sou forte, direto e protejo os que amo' },
        { value: '9', text: 'Valorizo paz e harmonia, evitando conflitos' }
      ]
    },
    {
      id: 'q2',
      question: 'Seu maior medo é:',
      options: [
        { value: '1', text: 'Ser corrupto, imperfeito ou moralmente errado' },
        { value: '2', text: 'Ser indesejado ou não ser amado' },
        { value: '3', text: 'Ser visto como fracassado ou sem valor' },
        { value: '4', text: 'Não ter identidade ou significado pessoal' },
        { value: '5', text: 'Ser incompetente ou não ter recursos suficientes' },
        { value: '6', text: 'Ficar sem apoio ou segurança' },
        { value: '7', text: 'Ficar preso na dor ou limitado' },
        { value: '8', text: 'Ser controlado ou ferido por outros' },
        { value: '9', text: 'Perder conexão e experimentar conflito' }
      ]
    },
    {
      id: 'q3',
      question: 'Quando enfrenta problemas, você:',
      options: [
        { value: '1', text: 'Busca a solução correta e foca em melhorar a situação' },
        { value: '2', text: 'Ajuda os outros e espera que percebam seus esforços' },
        { value: '3', text: 'Traça um plano de ação para ter sucesso' },
        { value: '4', text: 'Reflete profundamente sobre o significado do problema' },
        { value: '5', text: 'Pesquisa e analisa para entender completamente' },
        { value: '6', text: 'Busca orientação e avalia todos os riscos' },
        { value: '7', text: 'Procura alternativas positivas e soluções criativas' },
        { value: '8', text: 'Enfrenta diretamente e toma controle da situação' },
        { value: '9', text: 'Tenta manter a calma e busca compromisso' }
      ]
    },
    {
      id: 'q4',
      question: 'Você se motiva principalmente por:',
      options: [
        { value: '1', text: 'Fazer o que é certo e melhorar o mundo' },
        { value: '2', text: 'Ser apreciado e fazer diferença na vida das pessoas' },
        { value: '3', text: 'Alcançar objetivos e ser reconhecido pelo sucesso' },
        { value: '4', text: 'Expressar sua singularidade e encontrar seu propósito' },
        { value: '5', text: 'Compreender e dominar conhecimentos' },
        { value: '6', text: 'Ter segurança e pertencer a algo confiável' },
        { value: '7', text: 'Experienciar alegria e evitar sofrimento' },
        { value: '8', text: 'Ser forte e proteger sua autonomia' },
        { value: '9', text: 'Manter paz interior e harmonia' }
      ]
    },
    {
      id: 'q5',
      question: 'As pessoas te descrevem como:',
      options: [
        { value: '1', text: 'Íntegro, responsável e organizado' },
        { value: '2', text: 'Acolhedor, generoso e atencioso' },
        { value: '3', text: 'Confiante, ambicioso e carismático' },
        { value: '4', text: 'Criativo, sensível e expressivo' },
        { value: '5', text: 'Analítico, observador e independente' },
        { value: '6', text: 'Leal, responsável e cauteloso' },
        { value: '7', text: 'Entusiasta, espontâneo e otimista' },
        { value: '8', text: 'Forte, decidido e protetor' },
        { value: '9', text: 'Pacífico, receptivo e estável' }
      ]
    },
    {
      id: 'q6',
      question: 'Sob estresse, você tende a:',
      options: [
        { value: '1', text: 'Ficar mais crítico e perfeccionista' },
        { value: '2', text: 'Sentir-se não apreciado e dar mais aos outros' },
        { value: '3', text: 'Trabalhar excessivamente e buscar validação' },
        { value: '4', text: 'Isolar-se e mergulhar em emoções intensas' },
        { value: '5', text: 'Retrair-se e evitar interações' },
        { value: '6', text: 'Ficar mais ansioso e desconfiado' },
        { value: '7', text: 'Dispersar-se em múltiplas atividades' },
        { value: '8', text: 'Ficar mais dominador e confrontador' },
        { value: '9', text: 'Procrastinar e desconectar-se' }
      ]
    },
    {
      id: 'q7',
      question: 'Você valoriza mais:',
      options: [
        { value: '1', text: 'Integridade e fazer o que é correto' },
        { value: '2', text: 'Relacionamentos e ser importante para outros' },
        { value: '3', text: 'Eficiência e alcançar resultados' },
        { value: '4', text: 'Autenticidade e profundidade emocional' },
        { value: '5', text: 'Conhecimento e competência' },
        { value: '6', text: 'Segurança e lealdade' },
        { value: '7', text: 'Liberdade e variedade' },
        { value: '8', text: 'Justiça e controle' },
        { value: '9', text: 'Paz e harmonia' }
      ]
    },
    {
      id: 'q8',
      question: 'Sua fraqueza tende a ser:',
      options: [
        { value: '1', text: 'Ser muito crítico (de si e dos outros)' },
        { value: '2', text: 'Ter dificuldade em reconhecer suas próprias necessidades' },
        { value: '3', text: 'Confundir quem você é com o que você faz' },
        { value: '4', text: 'Focar muito no que está faltando' },
        { value: '5', text: 'Desconectar-se emocionalmente' },
        { value: '6', text: 'Questionar excessivamente e ter medo' },
        { value: '7', text: 'Evitar desconforto e dor' },
        { value: '8', text: 'Ser excessivamente confrontador' },
        { value: '9', text: 'Esquecer de si mesmo para manter a paz' }
      ]
    },
    {
      id: 'q9',
      question: 'No trabalho, você:',
      options: [
        { value: '1', text: 'Estabelece padrões elevados e garante qualidade' },
        { value: '2', text: 'Cria conexões e apoia os colegas' },
        { value: '3', text: 'Foca em resultados e maximiza produtividade' },
        { value: '4', text: 'Traz criatividade e perspectiva única' },
        { value: '5', text: 'Analisa problemas e encontra soluções inovadoras' },
        { value: '6', text: 'É confiável e antecipa problemas' },
        { value: '7', text: 'Traz energia e ideias empolgantes' },
        { value: '8', text: 'Lidera com confiança e toma decisões difíceis' },
        { value: '9', text: 'Mantém harmonia e facilita consenso' }
      ]
    },
    {
      id: 'q10',
      question: 'Quando relaxado e saudável, você:',
      options: [
        { value: '1', text: 'Fica mais espontâneo e aceita imperfeições' },
        { value: '2', text: 'Cuida melhor de si mesmo e estabelece limites' },
        { value: '3', text: 'Conecta-se com emoções e valores autênticos' },
        { value: '4', text: 'Torna-se mais objetivo e produtivo' },
        { value: '5', text: 'Fica mais confiante e conectado' },
        { value: '6', text: 'Torna-se mais corajoso e confiante' },
        { value: '7', text: 'Fica mais focado e profundo' },
        { value: '8', text: 'Torna-se mais aberto e vulnerável' },
        { value: '9', text: 'Fica mais assertivo e presente' }
      ]
    },
    {
      id: 'q11',
      question: 'Em relacionamentos, você:',
      options: [
        { value: '1', text: 'É responsável e espera o mesmo dos outros' },
        { value: '2', text: 'É atencioso mas pode se tornar dependente da aprovação' },
        { value: '3', text: 'É encantador mas pode focar demais em imagem' },
        { value: '4', text: 'É intenso e busca conexão profunda' },
        { value: '5', text: 'Precisa de espaço e pode parecer distante' },
        { value: '6', text: 'É leal mas pode ser ansioso e desconfiado' },
        { value: '7', text: 'É divertido mas pode evitar compromissos profundos' },
        { value: '8', text: 'É protetor mas pode ser dominador' },
        { value: '9', text: 'É estável mas pode evitar conflitos necessários' }
      ]
    },
    {
      id: 'q12',
      question: 'Sua jornada de crescimento envolve:',
      options: [
        { value: '1', text: 'Aceitar que você já é bom o suficiente' },
        { value: '2', text: 'Reconhecer e atender suas próprias necessidades' },
        { value: '3', text: 'Valorizar quem você é além de suas conquistas' },
        { value: '4', text: 'Focar no que você tem, não no que falta' },
        { value: '5', text: 'Conectar-se emocionalmente e agir' },
        { value: '6', text: 'Confiar em si mesmo e correr riscos' },
        { value: '7', text: 'Enfrentar desconforto e encontrar profundidade' },
        { value: '8', text: 'Permitir-se ser vulnerável e gentil' },
        { value: '9', text: 'Afirmar-se e expressar suas necessidades' }
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
    const scores = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 };

    Object.values(answers).forEach(answer => {
      if (scores.hasOwnProperty(answer)) {
        scores[answer]++;
      }
    });

    // Encontra o tipo dominante
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const enneagramType = sorted[0][0];

    // Sugerir wing (tipo adjacente com maior pontuação)
    const typeNum = parseInt(enneagramType);
    const leftWing = typeNum === 1 ? 9 : typeNum - 1;
    const rightWing = typeNum === 9 ? 1 : typeNum + 1;

    const wingScore = Math.max(scores[leftWing.toString()], scores[rightWing.toString()]);
    const wing = scores[leftWing.toString()] > scores[rightWing.toString()] ? leftWing : rightWing;

    const suggestedWing = wingScore > 0 ? `${enneagramType}w${wing}` : '';

    setShowResult(true);
    setTimeout(() => {
      onResult(enneagramType, suggestedWing);
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
          <p className="text-gray-600">Aplicando seu tipo Eneagrama ao perfil...</p>
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
            <h2 className="text-2xl font-bold text-gray-900">Teste Eneagrama</h2>
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
              className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-6 md:p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQ.question}
          </h3>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {currentQ.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(currentQ.id, option.value)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                  answers[currentQ.id] === option.value
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                    : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 min-w-8 rounded-full border-2 flex items-center justify-center font-bold text-sm mt-0.5 ${
                    answers[currentQ.id] === option.value
                      ? 'border-purple-500 bg-purple-500 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {option.value}
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">{option.text}</span>
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnneagramTest;
