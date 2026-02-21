import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function AddItemPage() {
  const navigate = useNavigate()
  const addItem = useWardrobeStore(s => s.addItem)
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [itemType, setItemType] = useState('')
  const [colors, setColors] = useState('')
  const [pattern, setPattern] = useState('solid')
  const [formality, setFormality] = useState('casual')
  const [material, setMaterial] = useState('')
  const [brand, setBrand] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function onFile(e) {
    const f = e.target.files[0]
    setFile(f)
    if (f) setPreview(URL.createObjectURL(f))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) { setError('Please select an image'); return }
    setLoading(true)
    const fd = new FormData()
    fd.append('image', file)
    if (itemType) fd.append('item_type', itemType)
    if (colors) fd.append('colors', JSON.stringify(colors.split(',').map(c => c.trim())))
    fd.append('pattern', pattern)
    fd.append('formality', formality)
    if (material) fd.append('material', material)
    if (brand) fd.append('brand', brand)
    try {
      await addItem(fd)
      navigate('/wardrobe')
    } catch {
      setError('Failed to add item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-serif font-semibold text-espresso-800 mb-8">Add Clothing Item</h1>
      <form onSubmit={handleSubmit} className="bg-cream p-8 rounded-xl border border-sand-200/60">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

        <div className="mb-6 border-2 border-dashed border-sand-200 hover:border-terracotta-400 rounded-xl p-4 text-center cursor-pointer transition-colors" onClick={() => inputRef.current.click()}>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          {preview ? (
            <img src={preview} className="max-h-64 mx-auto rounded-lg" />
          ) : (
            <div className="py-8">
              <p className="text-4xl mb-2">+</p>
              <p className="text-charcoal-400">Click to upload a photo</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs tracking-wider uppercase text-charcoal-400 mb-2">Type</label>
            <select value={itemType} onChange={e => setItemType(e.target.value)} className="w-full px-3 py-2 bg-cream border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent">
              <option value="">Let AI decide</option>
              {types.map(group => (
                <optgroup key={group.label} label={group.label}>
                  {group.items.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs tracking-wider uppercase text-charcoal-400 mb-2">Pattern</label>
            <select value={pattern} onChange={e => setPattern(e.target.value)} className="w-full px-3 py-2 bg-cream border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent">
              <option value="solid">Solid</option>
              <option value="striped">Striped</option>
              <option value="plaid">Plaid</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs tracking-wider uppercase text-charcoal-400 mb-2">Colors (comma separated)</label>
            <input value={colors} onChange={e => setColors(e.target.value)} className="w-full px-3 py-2 bg-cream border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent" placeholder="navy blue, white" />
          </div>
          <div>
            <label className="block text-xs tracking-wider uppercase text-charcoal-400 mb-2">Formality</label>
            <select value={formality} onChange={e => setFormality(e.target.value)} className="w-full px-3 py-2 bg-cream border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent">
              <option value="casual">Casual</option>
              <option value="smart_casual">Smart Casual</option>
              <option value="business_casual">Business Casual</option>
              <option value="formal">Formal</option>
            </select>
          </div>
          <div>
            <label className="block text-xs tracking-wider uppercase text-charcoal-400 mb-2">Material</label>
            <input value={material} onChange={e => setMaterial(e.target.value)} className="w-full px-3 py-2 bg-cream border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent" />
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button disabled={loading} className="flex-1 bg-terracotta-500 hover:bg-terracotta-600 text-white py-2.5 rounded-lg disabled:opacity-50">
            {loading ? 'Adding...' : 'Add to Wardrobe'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-sand-300 hover:border-espresso-600 rounded-lg text-espresso-800">Cancel</button>
        </div>
      </form>
    </div>
  )
}
