'use client';
import React, { useState, useEffect } from 'react';
import { SurveyQuestion, SubmitSurveyRequest } from '@/types/survey-api';

export default function SurveyPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/survey/questions`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setQuestions(data);
            setShowPopup(true);
          }
        }
      } catch (error) {
        console.error("Survey fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [API_URL]);

  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showPopup]);

  // Handle answer selection
  const handleAnswer = async (value: string) => {
    const questionId = questions[currentQuestion].id;
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    setTimeout(async () => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setIsSearching(true);
        try {
          const submitData: SubmitSurveyRequest = {
            session_id: `session_${Date.now()}`,
            answers: Object.entries(newAnswers).reduce((acc, [key, val]) => {
              acc[key] = val;
              return acc;
            }, {} as Record<string, string>)
          };
          await fetch(`${API_URL}/api/survey/responses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submitData)
          });
        } catch (e) {
          console.error(e);
        }

        // After 2 seconds, show result screen
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

  const progressPercentage = questions.length > 0
    ? ((currentQuestion + 1) / questions.length) * 100
    : 0;

  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Popup Full Screen */}
      {showPopup && questions.length > 0 && (
        <div className="fixed inset-0 z-[99999] bg-white flex flex-col">
          {/* Progress bar */}
          <div className="h-2 bg-gray-200">
            <div
              className="h-full bg-teal-700 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
              {isSearching ? (
                /* Màn hình searching */
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal-700 border-t-transparent mb-6"></div>
                  <h2 className="text-2xl text-teal-600 font-medium">
                    Searching for jobs near you...
                  </h2>
                </div>
              ) : showResult ? (
                /* Màn hình kết quả */
                <div className="text-center">
                  <h2 className="text-3xl font-semibold text-gray-800 mb-8">
                    We found vacancies for you
                  </h2>
                  <button
                    className="w-full max-w-lg mx-auto block py-4 bg-teal-700 text-white rounded-xl font-semibold text-lg hover:bg-teal-800 transition-colors mb-4"
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
                <div className="text-center">
                  <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-12">
                    {questions[currentQuestion].question}
                  </h2>

                  <div className="space-y-4 max-w-lg mx-auto">
                    {questions[currentQuestion].options?.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer(option.text)}
                        className="w-full py-4 px-6 bg-teal-700 text-white rounded-xl font-medium text-lg hover:bg-teal-800 transition-colors"
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}