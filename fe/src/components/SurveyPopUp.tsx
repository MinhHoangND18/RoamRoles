'use client';
import React, { useState, useEffect } from 'react';
import { SurveyQuestion, SubmitSurveyRequest } from '@/types/survey-api';

interface SurveyPopupProps {
  surveySetId: number;
  postId: number;
}

export default function SurveyPopup({ surveySetId, postId }: SurveyPopupProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    setShowPopup(false);
    setCurrentQuestion(0);
    setAnswers({});
    setIsSearching(false);
    setShowResult(false);
    setQuestions([]);
    setLoading(true);

    // Check if user already submitted this survey
    const storageKey = `survey_submitted_${surveySetId}_${postId}`;
    const hasSubmitted = localStorage.getItem(storageKey);
    
    if (hasSubmitted) {
      setLoading(false);
      return;
    }

    const fetchQuestions = async () => {
      try {
        // Gọi API lấy questions theo survey_set_id
        const response = await fetch(`${API_URL}/api/survey/sets/${surveySetId}/questions`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setQuestions(data);
            setTimeout(() => {
              setShowPopup(true);
            }, 0);
          }
        }
      } catch (error) {
        console.error("Survey fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [API_URL, surveySetId, postId]); 

  const getSessionId = () => {
    let sessionId = localStorage.getItem('survey_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('survey_session_id', sessionId);
    }
    return sessionId;
  };

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
          const sessionId = getSessionId();
          const submitData: SubmitSurveyRequest = {
            session_id: sessionId,
            answers: Object.entries(newAnswers).reduce((acc, [key, val]) => {
              acc[key] = val;
              return acc;
            }, {} as Record<string, string>)
          };

          // Add set_id to submission
          await fetch(`${API_URL}/api/survey/responses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              set_id: surveySetId,
              ...submitData
            })
          });

          // Mark as submitted
          const storageKey = `survey_submitted_${surveySetId}_${postId}`;
          localStorage.setItem(storageKey, 'true');
        } catch (e) {
          console.error(e);
        }

        setTimeout(() => {
          setIsSearching(false);
          setShowResult(true);
        }, 2000);
      }
    }, 300);
  };

  if (!showPopup || questions.length === 0 || loading) return null;

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgb(255, 255, 255)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      {/* Modal Card */}
      <div className="card shadow-lg border-0" style={{ maxWidth: '500px', width: '100%', borderRadius: '24px', overflow: 'hidden' }}>

        <div className="progress" style={{ height: '8px', borderRadius: 0 }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${progressPercentage}%`, backgroundColor: '#0d7a70' }}
          ></div>
        </div>

        <div className="card-body p-4 p-md-5 text-center">
          {isSearching ? (
            <div className="py-5 text-center">
              <div className="d-flex justify-content-center gap-2 mb-4">
                <div className="spinner-grow" style={{ width: '0.9rem', height: '0.9rem', color: '#0d7a70', animationDuration: '0.75s' }} role="status"></div>
                <div className="spinner-grow" style={{ width: '0.9rem', height: '0.9rem', color: '#0d7a70', animationDelay: '0.1s', animationDuration: '0.75s' }} role="status"></div>
                <div className="spinner-grow" style={{ width: '0.9rem', height: '0.9rem', color: '#0d7a70', animationDelay: '0.2s', animationDuration: '0.75s' }} role="status"></div>
                <div className="spinner-grow" style={{ width: '0.9rem', height: '0.9rem', color: '#0d7a70', animationDelay: '0.3s', animationDuration: '0.75s' }} role="status"></div>
                <div className="spinner-grow" style={{ width: '0.9rem', height: '0.9rem', color: '#0d7a70', animationDelay: '0.4s', animationDuration: '0.75s' }} role="status"></div>
                <div className="spinner-grow" style={{ width: '0.9rem', height: '0.9rem', color: '#0d7a70', animationDelay: '0.5s', animationDuration: '0.75s' }} role="status"></div>
                <div className="spinner-grow" style={{ width: '0.9rem', height: '0.9rem', color: '#0d7a70', animationDelay: '0.6s', animationDuration: '0.75s' }} role="status"></div>
              </div>

              <style>{`
                @keyframes pulse-fade {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.4; }
                }
                .searching-text {
                  animation: pulse-fade 1.5s ease-in-out infinite;
                }
              `}</style>

              <h4 className="fw-bold searching-text" style={{ color: '#0d7a70', letterSpacing: '0.5px' }}>
                Searching for jobs near you...
              </h4>
            </div>
          ) : showResult ? (
            <div>
              <h3 className="fw-bold mb-4">We found vacancies for you</h3>
              <button className="btn btn-lg w-100 mb-3" style={{ backgroundColor: '#0d7a70', color: 'white', borderRadius: '12px', padding: '15px' }}>
                Find vacancies
              </button>
              <button onClick={() => setShowPopup(false)} className="btn btn-link text-muted text-decoration-none small">
                View ad to continue
              </button>
            </div>
          ) : (
            <div>
              <h3 className="fw-bold mb-5" style={{ fontSize: '1.75rem' }}>
                {questions[currentQuestion].question}
              </h3>

              <div className="d-grid gap-3">
                {questions[currentQuestion].options?.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.text)}
                    className="btn btn-lg py-3 fw-semibold"
                    style={{
                      backgroundColor: '#0d7a70',
                      color: 'white',
                      borderRadius: '15px',
                      border: 'none'
                    }}
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
  );
}