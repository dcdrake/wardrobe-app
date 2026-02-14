import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useWardrobeStore from '../stores/useWardrobeStore'
import ClothingCard from '../components/ClothingCard'

export default function WardrobePage() {
  const items = useWardrobeStore(s => s.items)
  const loading = useWardrobeStore(s => s.loading)
  const itemCount = useWardrobeStore(s => s.items.length)
  const fetchItems = useWardrobeStore(s => s.fetchItems)
  const [filter, setFilter] = useState('')

  useEffect(() => { fetchItems() }, [fetchItems])

  const filtered = useMemo(() => {
    if (!filter) return items
    return items.filter(i => i.item_type === filter)
  }, [items, filter])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-semibold text-espresso-800">My Wardrobe</h1>
        <div className="flex gap-3">
          <Link to="/wardrobe/batch-add" className="border border-clay-500 text-clay-500 hover:bg-clay-500 hover:text-white px-4 py-2 rounded-lg text-sm tracking-wider uppercase">Batch Upload</Link>
          <Link to="/wardrobe/add" className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2 rounded-lg text-sm tracking-wider uppercase">+ Add Item</Link>
        </div>
      </div>

      <select value={filter} onChange={e => setFilter(e.target.value)} className="mb-6 px-3 py-2 bg-cream border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent">
        <option value="">All Items</option>
        <option value="tshirt">T-Shirts</option>
        <option value="shirt">Dress Shirts</option>
        <option value="jeans">Jeans</option>
        <option value="chinos">Chinos</option>
        <option value="sneakers">Sneakers</option>
      </select>

      {loading ? (
        <div className="text-center py-12 text-charcoal-300">Loading...</div>
      ) : !items.length ? (
        <div className="text-center py-12">
          <p className="text-xl text-charcoal-400 mb-4">Your wardrobe is empty</p>
          <Link to="/wardrobe/add" className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-6 py-2 rounded-lg">Add Your First Item</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(item => <ClothingCard key={item.id} item={item} />)}
        </div>
      )}

      <p className="mt-8 text-sm text-charcoal-300">{itemCount} items</p>
    </div>
  )
}
