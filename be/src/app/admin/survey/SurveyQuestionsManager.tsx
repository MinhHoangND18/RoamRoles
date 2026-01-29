'use client'
import { useState, useEffect } from 'react'
import { API_CONFIG } from '@/lib/api/config'
import { SurveySet, SurveyQuestion } from '@/types/survey_question'
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import QuestionForm from './QuestionForm'

interface Props {
  set: SurveySet
  onBack: () => void
}

export default function SurveyQuestionsManager({ set, onBack }: Props) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadQuestions()
  }, [set.id])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/api/admin/survey/sets/${set.id}/questions`
      )
      const data = await res.json()
      setQuestions(data || [])
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Delete this question? All related responses will be deleted!')) return

    await fetch(`${API_CONFIG.BASE_URL}/api/admin/survey/questions/${id}`, {
      method: 'DELETE'
    })
    loadQuestions()
  }

  const handleToggleActive = async (question: SurveyQuestion) => {
    await fetch(`${API_CONFIG.BASE_URL}/api/admin/survey/questions/${question.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        set_id: question.set_id,
        question: question.question,
        active: !question.active,
        options: question.options.map(opt => opt.text)
      })
    })
    loadQuestions()
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white border border-slate-200 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-slate-200">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Survey Sets
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{set.name}</h2>
              {set.description && (
                <p className="text-slate-600 mt-1">{set.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                <span>ID: {set.id}</span>
                <span>Slug: {set.slug}</span>
                <span className={`px-2 py-1 rounded text-xs ${set.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                  {set.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingQuestion(null)
                setShowQuestionForm(true)
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
          <h3 className="font-semibold text-slate-700">
            Questions ({questions.length})
          </h3>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-slate-400">
            <p>Loading...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">
            <p>No questions yet</p>
            <p className="text-sm mt-1">Click Add Question to add a new question</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <span className="text-slate-400 font-medium min-w-[30px]">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">
                            {question.question}
                          </p>
                          <button
                            onClick={() => handleToggleActive(question)}
                            className="p-1 hover:bg-slate-100 rounded transition-colors"
                            title={question.active ? 'Deactivate' : 'Activate'}
                          >
                            {question.active ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </div>

                        <div className="mt-2 space-y-1">
                          {question.options.map((option) => (
                            <div
                              key={option.id}
                              className="text-sm text-slate-600 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              {option.text}
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span>ID: {question.id}</span>
                          <span>{question.options.length} options</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingQuestion(question)
                        setShowQuestionForm(true)
                      }}
                      className="p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Edit Question"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Question Form Modal */}
      {showQuestionForm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <QuestionForm
              setId={set.id}
              question={editingQuestion}
              onSuccess={() => {
                setShowQuestionForm(false)
                setEditingQuestion(null)
                loadQuestions()
              }}
              onCancel={() => {
                setShowQuestionForm(false)
                setEditingQuestion(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}