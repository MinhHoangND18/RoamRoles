'use client'
import { useState } from 'react'
import { API_CONFIG } from '@/lib/api/config'

export default function SurveyForm({ onSuccess }: { onSuccess: () => void }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<string[]>([''])

  const submit = async () => {
    await fetch(`${API_CONFIG.BASE_URL}/api/admin/survey/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        active: true,
        options: options.map((text, i) => ({ text, order: i + 1 }))
      })
    })
    onSuccess()
  }

  return (
    <div>
      <input
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Question"
        className="border p-2 w-full mb-2"
      />

      {options.map((opt, i) => (
        <input
          key={i}
          value={opt}
          onChange={e => {
            const clone = [...options]
            clone[i] = e.target.value
            setOptions(clone)
          }}
          className="border p-2 w-full mb-2"
          placeholder={`Option ${i + 1}`}
        />
      ))}

      <button onClick={() => setOptions([...options, ''])}>+ Option</button>

      <button onClick={submit} className="bg-blue-500 text-white px-4 py-2 mt-2">
        Save
      </button>
    </div>
  )
}
