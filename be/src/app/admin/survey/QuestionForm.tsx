'use client'
import { useState, useEffect } from 'react'
import { API_CONFIG } from '@/lib/api/config'
import { SurveyQuestion } from '@/types/survey_question'
import { X, Plus, Trash2, GripVertical } from 'lucide-react'

interface Props {
  setId: number
  question: SurveyQuestion | null
  onSuccess: () => void
  onCancel: () => void
}

export default function QuestionForm({ setId, question, onSuccess, onCancel }: Props) {
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (question) {
      setQuestionText(question.question)
      setOptions(question.options.map(opt => opt.text))
      setActive(question.active)
    }
  }, [question])

  const addOption = () => {
    setOptions([...options, ''])
  }

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      alert('Must have at least 2 options!')
      return
    }
    setOptions(options.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async () => {
    // Validation
    if (!questionText.trim()) {
      alert('Please enter the question!')
      return
    }

    const filledOptions = options.filter(opt => opt.trim())
    if (filledOptions.length < 2) {
      alert('Must have at least 2 options!')
      return
    }

    setLoading(true)

    try {
      const url = question
        ? `${API_CONFIG.BASE_URL}/api/admin/survey/questions/${question.id}`
        : `${API_CONFIG.BASE_URL}/api/admin/survey/questions`

      const method = question ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          set_id: setId,
          question: questionText,
          active,
          options: filledOptions
        })
      })

      if (res.ok) {
        onSuccess()
      } else {
        const error = await res.text()
        alert(`Error: ${error}`)
      }
    } catch (error) {
      alert('An error occurred!')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          {question ? 'Edit Question' : 'Add New Question'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Question <span className="text-red-500">*</span>
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter your question here..."
            rows={3}
            className="w-full border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Options */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-700">
              Options <span className="text-red-500">*</span>
              <span className="text-xs text-slate-500 ml-2">
                (minimum 2 options)
              </span>
            </label>
            <button
              onClick={addOption}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          </div>

          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="text-slate-400 cursor-move">
                  <GripVertical className="w-4 h-4" />
                </div>

                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 min-w-[24px]">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Options will be saved in the current order
          </p>
        </div>

        {/* Active Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="question-active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="question-active" className="text-sm font-medium text-slate-700">
            Active (visible to clients)
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          {loading ? 'Saving...' : question ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  )
}