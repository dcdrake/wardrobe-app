import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useWardrobeStore from '../stores/useWardrobeStore'

const types = [
  { label: 'Tops', items: ['tshirt', 'shirt', 'polo', 'sweater', 'hoodie', 'tank_top', 'blouse', 'crop_top'] },
  { label: 'Outerwear', items: ['jacket', 'blazer', 'coat', 'vest', 'cardigan'] },
  { label: 'Bottoms', items: ['jeans', 'chinos', 'trousers', 'shorts', 'skirt', 'leggings'] },
  { label: 'Full Body', items: ['dress', 'jumpsuit', 'romper', 'suit'] },
  { label: 'Footwear', items: ['sneakers', 'boots', 'dress_shoes', 'loafers', 'sandals', 'heels', 'flats'] },
  { label: 'Accessories', items: ['belt', 'watch', 'tie', 'bow_tie', 'hat', 'scarf', 'sunglasses', 'necklace', 'bracelet', 'earrings', 'ring', 'bag', 'backpack', 'pocket_square', 'cufflinks', 'gloves'] },
  { label: 'Other', items: ['other'] },
]

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fetchItems = useWardrobeStore(s => s.fetchItems)
  const updateItem = useWardrobeStore(s => s.updateItem)
  const deleteItem = useWardrobeStore(s => s.deleteItem)

  const [item, setItem] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    fetchItems().then(() => {
      const found = useWardrobeStore.getState().getItemById(id)
      if (!found) navigate('/wardrobe')
      else setItem(found)
    })
  }, [id, fetchItems, navigate])

  function startEdit() {
    setForm({ ...item, colors: item.colors?.join(', ') || '' })
    setEditing(true)
  }

  async function save(e) {
    e.preventDefault()
    const data = { ...form, colors: form.colors.split(',').map(c => c.trim()) }
    const updated = await updateItem(item.id, data)
    setItem(updated)
    setEditing(false)
  }

  async function del() {
    if (!confirm('Delete this item?')) return
    await deleteItem(item.id)
    navigate('/wardrobe')
  }

  if (!item) return null

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/wardrobe')} className="text-charcoal-400 hover:text-espresso-800 mb-6 inline-block">&larr; Back</button>
      <div className="bg-cream rounded-xl border border-sand-200/60 overflow-hidden md:flex">
        <div className="md:w-1/2 bg-sand-100">
          {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" />}
        </div>
        <div className="md:w-1/2 p-8">
          {!editing ? (
            <div>
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-serif font-semibold text-espresso-800">{item.item_type_display}</h1>
                <div className="flex gap-3">
                  <button onClick={startEdit} className="text-sm text-terracotta-500 hover:text-terracotta-600">Edit</button>
                  <button onClick={del} className="text-sm text-red-500 hover:text-red-600">Delete</button>
                </div>
              </div>
              <dl className="space-y-0">
                <div className="py-3 border-b border-sand-200/60">
                  <dt className="text-xs tracking-wider uppercase text-charcoal-400 mb-1">Colors</dt>
                  <dd className="text-espresso-900">{item.colors?.join(', ')}</dd>
                </div>
                <div className="py-3 border-b border-sand-200/60">
                  <dt className="text-xs tracking-wider uppercase text-charcoal-400 mb-1">Pattern</dt>
                  <dd className="text-espresso-900">{item.pattern_display}</dd>
                </div>
                <div className="py-3 border-b border-sand-200/60">
                  <dt className="text-xs tracking-wider uppercase text-charcoal-400 mb-1">Formality</dt>
                  <dd className="text-espresso-900">{item.formality_display}</dd>
                </div>
                {item.material && (
                  <div className="py-3 border-b border-sand-200/60">
                    <dt className="text-xs tracking-wider uppercase text-charcoal-400 mb-1">Material</dt>
                    <dd className="text-espresso-900">{item.material}</dd>
                  </div>
                )}
                {item.brand && (
                  <div className="py-3">
                    <dt className="text-xs tracking-wider uppercase text-charcoal-400 mb-1">Brand</dt>
                    <dd className="text-espresso-900">{item.brand}</dd>
                  </div>
                )}
              </dl>
            </div>
          ) : (
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-xs tracking-wider uppercase text-charcoal-400 mb-2">Type</label>
                <select value={form.item_type} onChange={e => setForm({ ...form, item_type: e.target.value })} className="w-full px-3 py-2 bg-cream border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent">
                  {types.map(group => (
                    <optgroup key={group.label} label={group.label}>
                      {group.items.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs tracking-wider uppercase text-charcoal-400 mb-2">Colors</label>
                <input value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} className="w-full px-3 py-2 bg-cream border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent" />
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-terracotta-500 hover:bg-terracotta-600 text-white py-2.5 rounded-lg">Save</button>
                <button type="button" onClick={() => setEditing(false)} className="px-4 py-2.5 border border-sand-300 hover:border-espresso-600 rounded-lg text-espresso-800">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
