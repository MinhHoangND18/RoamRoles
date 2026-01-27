'use client'
import { useEffect, useState } from 'react'
import { 
    Plus, 
    Edit2, 
    Trash2, 
    Loader2, 
    CheckCircle2, 
    XCircle,
    Save,
    X
} from 'lucide-react'

import toast from 'react-hot-toast'
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_BASE_URL = `${BASE_URL}/api/admin/survey/questions`;

type Option = {
    id?: number
    text: string
    order: number
}

type Question = {
    id: number
    question: string
    active: boolean
    order: number
    options: Option[]
}

type QuestionFormData = {
    question: string
    active: boolean
    options: { text: string; order: number }[]
}

export default function SurveyAdminPage() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    
    // Form State
    const [formData, setFormData] = useState<QuestionFormData>({
        question: '',
        active: true,
        options: [{ text: '', order: 1 }]
    })

    const fetchQuestions = async () => {
        try {
            const res = await fetch(API_BASE_URL)
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            data.sort((a: Question, b: Question) => a.order - b.order)
            setQuestions(data)
        } catch (error) {
            toast.error('Failed to load questions')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchQuestions()
    }, [])

    const handleOpenModal = (question?: Question) => {
        if (question) {
            setEditingId(question.id)
            setFormData({
                question: question.question,
                active: question.active,
                options: question.options.map(o => ({ text: o.text, order: o.order }))
            })
        } else {
            setEditingId(null)
            setFormData({
                question: '',
                active: true,
                options: [{ text: '', order: 1 }, { text: '', order: 2 }]
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.question.trim()) {
            toast.error('Question text is required')
            return
        }
        if (formData.options.some(o => !o.text.trim())) {
            toast.error('All options must have text')
            return
        }

        try {
            const url = editingId 
                ? `${API_BASE_URL}/${editingId}`
                : API_BASE_URL
            
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    options: formData.options.map((o, i) => ({ ...o, order: i + 1 }))
                })
            })

            if (!res.ok) throw new Error('Failed to save')
            
            toast.success(editingId ? 'Question updated' : 'Question created')
            setIsModalOpen(false)
            fetchQuestions()
        } catch (error) {
            toast.error('Error saving question')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this question?')) return

        try {
            const res = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error('Failed to delete')
            
            toast.success('Question deleted')
            setQuestions(questions.filter(q => q.id !== id))
        } catch (error) {
            toast.error('Error deleting question')
        }
    }

    const handleToggleActive = async (question: Question) => {
        try {
            const res = await fetch(`${API_BASE_URL}/${question.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...question,
                    active: !question.active
                })
            })
            if (!res.ok) throw new Error('Failed to update')
            
            setQuestions(questions.map(q => 
                q.id === question.id ? { ...q, active: !q.active } : q
            ))
            toast.success(`Question ${!question.active ? 'activated' : 'deactivated'}`)
        } catch (error) {
            toast.error('Error updating status')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Survey Management</h1>
                        <p className="text-slate-500 mt-1">Manage questions and options for the user survey</p>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Question
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {questions.map((q) => (
                            <div key={q.id} className={`bg-white rounded-xl border shadow-sm transition-all ${!q.active ? 'opacity-75 bg-slate-50' : 'border-slate-200'}`}>
                                <div className="p-6">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                                                    Order: {q.order}
                                                </span>
                                                {q.active ? (
                                                    <span className="flex items-center gap-1 text-green-600 text-xs font-bold uppercase tracking-wider">
                                                        <CheckCircle2 className="w-3 h-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                                        <XCircle className="w-3 h-3" /> Inactive
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-800 mb-4">{q.question}</h3>
                                            
                                            <div className="space-y-2">
                                                {q.options.map((opt) => (
                                                    <div key={opt.id} className="flex items-center gap-3 text-slate-600 bg-slate-50 px-3 py-2 rounded border border-slate-100">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                        <span className="text-sm font-medium">{opt.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button 
                                                onClick={() => handleOpenModal(q)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleToggleActive(q)}
                                                className={`p-2 rounded transition-colors ${q.active ? 'text-slate-400 hover:text-orange-600 hover:bg-orange-50' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`}
                                                title={q.active ? "Deactivate" : "Activate"}
                                            >
                                                {q.active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(q.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {questions.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                                <p className="text-slate-500">No questions found. Create one to get started.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <form onSubmit={handleSubmit}>
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                    <h2 className="text-xl font-bold text-slate-800">
                                        {editingId ? 'Edit Question' : 'New Question'}
                                    </h2>
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Question Text
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.question}
                                            onChange={e => setFormData({...formData, question: e.target.value})}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="e.g. What is your primary goal?"
                                            autoFocus
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-bold text-slate-700">
                                                Options
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    options: [...formData.options, { text: '', order: formData.options.length + 1 }]
                                                })}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> Add Option
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.options.map((opt, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <div className="flex items-center justify-center w-8 h-10 bg-slate-100 rounded text-slate-500 text-xs font-bold">
                                                        {idx + 1}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={opt.text}
                                                        onChange={e => {
                                                            const newOptions = [...formData.options]
                                                            newOptions[idx].text = e.target.value
                                                            setFormData({...formData, options: newOptions})
                                                        }}
                                                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                                        placeholder={`Option ${idx + 1}`}
                                                    />
                                                    {formData.options.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newOptions = formData.options.filter((_, i) => i !== idx)
                                                                setFormData({...formData, options: newOptions})
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="active-check"
                                            checked={formData.active}
                                            onChange={e => setFormData({...formData, active: e.target.checked})}
                                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                        />
                                        <label htmlFor="active-check" className="text-sm font-medium text-slate-700">
                                            Active (visible to users)
                                        </label>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Question
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
