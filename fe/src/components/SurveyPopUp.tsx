import React, { useState, useEffect } from 'react';

interface Question {
  id: string;
  question: string;
  options: string[];
}

export default function SurveyPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/survey/questions`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setQuestions(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch survey questions", error);
        setQuestions([
          {
            id: 'unemployed',
            question: 'Are you unemployed?',
            options: ['Yes', 'No']
          },
          {
            id: 'household',
            question: 'How many people live with you?',
            options: ['I live alone', 'One person', 'Two people or more']
          },
          {
            id: 'salary',
            question: 'How much would you like to earn per month?',
            options: ['R5,000', 'R6,000', 'R7,000']
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleArticleClick = () => {
    setShowPopup(true);
    setCurrentQuestion(0);
    setAnswers({});
    setIsSearching(false);
    setShowResult(false);
  };

  const handleAnswer = (value: string) => {
    const newAnswers = {
      ...answers,
      [questions[currentQuestion].id]: value
    };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setIsSearching(true);
        setTimeout(() => {
          setIsSearching(false);
          setShowResult(true);
          console.log('Câu trả lời đã thu thập:', newAnswers);
        }, 2000);
      }
    }, 300);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const progressPercentage = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      {/* Bài viết mẫu */}
      <div className="max-w-4xl mx-auto">
        <div 
          onClick={handleArticleClick}
          className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Click to Start Survey
          </h1>
          <p className="text-gray-600 mb-4">
            We would like to know more about you. Click here to answer a few quick questions.
          </p>
          <div className="text-teal-700 font-semibold text-lg">
            👆 Click here to begin
          </div>
        </div>

        {/* Hiển thị kết quả */}
        {Object.keys(answers).length > 0 && !showPopup && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Collected Data:
            </h3>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto border border-gray-200">
              {JSON.stringify(answers, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Progress bar */}
            <div className="h-2 bg-gray-200">
              <div 
                className="h-full bg-teal-700 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="p-10">
              {isSearching ? (
                /* Màn hình searching */
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal-700 border-t-transparent mb-6"></div>
                  <h2 className="text-2xl text-teal-600 font-medium">
                    Searching for jobs near you...
                  </h2>
                </div>
              ) : showResult ? (
                /* Màn hình kết quả */
                <div className="text-center py-12">
                  <h2 className="text-3xl font-semibold text-gray-800 mb-8">
                    We found vacancies for you
                  </h2>
                  <button
                    className="w-full py-4 bg-teal-700 text-white rounded-xl font-semibold text-lg hover:bg-teal-800 transition-colors mb-4"
                  >
                    Find vacancies
                  </button>
                  <button
                    onClick={closePopup}
                    className="text-gray-500 text-sm hover:text-gray-700"
                  >
                    View ad to continue
                  </button>
                </div>
              ) : (
                /* Câu hỏi */
                questions.length > 0 ? (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
                    {questions[currentQuestion].question}
                  </h2>

                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleAnswer(option)}
                        className="w-full py-4 px-6 bg-teal-700 text-white rounded-xl font-medium text-lg hover:bg-teal-800 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
                ) : (
                  <div className="text-center text-gray-500">
                    {loading ? 'Loading questions...' : 'No questions available.'}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}