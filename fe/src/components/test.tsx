import React, { useState } from 'react';

export default function SurveyPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleArticleClick = () => {
    setShowPopup(true);
    setCurrentQuestion(0);
    setAnswers({});
    setIsSearching(false);
    setShowResult(false);
  };

  const handleAnswer = (value) => {
    const newAnswers = {
      ...answers,
      [questions[currentQuestion].id]: value
    };
    setAnswers(newAnswers);

    // Chuyển sang câu hỏi tiếp theo sau 300ms
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Hiển thị màn hình searching
        setIsSearching(true);
        
        // Sau 2 giây chuyển sang màn hình kết quả
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

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      {/* Bài viết mẫu */}
      <div className="max-w-4xl mx-auto">

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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}