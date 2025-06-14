import { useState } from 'react'
import api from '../api/axios'

const FIELD_TYPES = ['text', 'number', 'dropdown']

export default function CreateFormPage() {
  const [title, setTitle] = useState('')
  const [fields, setFields] = useState([
    { label: '', fieldType: 'text', options: '' }
  ])
  const [loading, setLoading] = useState(false)
  const [inviteCode, setInviteCode] = useState('')

  const handleFieldChange = (index, key, value) => {
    const newFields = [...fields]
    newFields[index][key] = value
    setFields(newFields)
  }

  const addField = () => {
    setFields([...fields, { label: '', fieldType: 'text', options: '' }])
  }

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!title) return alert('Please enter a form title.')
    setInviteCode('') 

    try {
      setLoading(true)

      
      const { data: form } = await api.post('/admin/forms', {
        title,
        createdById: 'd397ad6f-c18e-4641-a41d-82fd71581254'
      })

      
      await Promise.all(fields.map(({ label, fieldType, options }, i) =>
        api.post(`admin/forms/${form.id}/fields`, {
          label,
          fieldType,
          options: fieldType === 'dropdown' ? options.split(',').map(o => o.trim()) : null,
          order: i
        })
      ))

      
      setInviteCode(form.inviteCode)
      setTitle('')
      setFields([{ label: '', fieldType: 'text', options: '' }])
    } catch (err) {
      console.error('Form creation error:', err)
      alert(err?.response?.data?.error || 'Failed to create form.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Form</h1>

      {inviteCode && (
        <div className="mb-4 p-4 border-l-4 border-green-500 bg-green-50 text-green-700 rounded">
          ✅ Form created! Your invite code is: <strong>{inviteCode}</strong>
        </div>
      )}

      <div className="mb-6">
        <label className="block font-medium">Form Title</label>
        <input
          className="w-full border rounded p-2 mt-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Employee Survey"
        />
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={index} className="border p-4 rounded bg-gray-50">
            <div className="mb-2">
              <label className="block text-sm font-medium">Field Label</label>
              <input
                className="w-full border rounded p-1 mt-1"
                value={field.label}
                onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium">Field Type</label>
              <select
                className="w-full border rounded p-1 mt-1"
                value={field.fieldType}
                onChange={(e) => handleFieldChange(index, 'fieldType', e.target.value)}
              >
                {FIELD_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {field.fieldType === 'dropdown' && (
              <div className="mb-2">
                <label className="block text-sm font-medium">Options (comma separated)</label>
                <input
                  className="w-full border rounded p-1 mt-1"
                  value={field.options}
                  onChange={(e) => handleFieldChange(index, 'options', e.target.value)}
                />
              </div>
            )}

            <button
              className="mt-2 text-sm text-red-500"
              onClick={() => removeField(index)}
              disabled={fields.length === 1}
            >
              Remove Field
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 space-x-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={addField}
        >
          Add Field
        </button>

        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Form'}
        </button>
      </div>
    </div>
  )
}
