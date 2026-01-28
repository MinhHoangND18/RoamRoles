'use client'
import { useState, useEffect } from 'react'
import { API_CONFIG } from '@/lib/api/config'
import { SurveySet } from '@/types/survey_question'
import { X } from 'lucide-react'

interface Props {
  set: SurveySet | null
  onSuccess: () => void
  onCancel: () => void
}

export default function SurveySetForm({ set, onSuccess, onCancel }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (set) {
      setName(set.name)
      setDescription(set.description || '')
      setSlug(set.slug)
      setActive(set.active)
    }
  }, [set])

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!set) {
      setSlug(generateSlug(value))
    }
  }

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim()) {
      alert('Vui lòng nhập tên và slug!')
      return
    }

    setLoading(true)

    try {
      const url = set
        ? `${API_CONFIG.BASE_URL}/api/admin/survey/sets/${set.id}`
        : `${API_CONFIG.BASE_URL}/api/admin/survey/sets`

      const method = set ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          slug,
          active
        })
      })

      if (res.ok) {
        onSuccess()
      } else {
        const error = await res.text()
        alert(`Error: ${error}`)
      }
    } catch (error) {
      alert('Có lỗi xảy ra!')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          {set ? 'Edit Survey Set' : 'Create New Survey Set'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tên bộ câu hỏi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="VD: Nhu cầu tìm việc"
            className="w-full border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Mô tả
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ngắn về bộ câu hỏi này..."
            rows={3}
            className="w-full border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="nhu-cau-tim-viec"
            className="w-full border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-slate-500 mt-1">
            URL-friendly identifier (tự động tạo từ tên)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="active" className="text-sm font-medium text-slate-700">
            Active (hiển thị cho client)
          </label>
        </div>
      </div>

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
          {loading ? 'Saving...' : set ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  )
}