import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useWardrobeStore from '../stores/useWardrobeStore'
import useOutfitStore from '../stores/useOutfitStore'
import { outfitApi } from '../api'

export default function OutfitsPage() {
  const items = useWardrobeStore(s => s.items)
  const fetchItems = useWardrobeStore(s => s.fetchItems)

  const suggestions = useOutfitStore(s => s.suggestions)
  const setSuggestions = useOutfitStore(s => s.setSuggestions)
  const appendStreamingText = useOutfitStore(s => s.appendStreamingText)
  const setStreamingText = useOutfitStore(s => s.setStreamingText)
  const savedOccasion = useOutfitStore(s => s.occasion)
  const setOccasion = useOutfitStore(s => s.setOccasion)

  const [occasion, setLocalOccasion] = useState(savedOccasion)
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')

  const hasItems = items.length > 0

  useEffect(() => { fetchItems() }, [fetchItems])

  function getItem(id) {
    return useWardrobeStore.getState().getItemById(id)
  }

  function getSuggestions() {
    if (!occasion.trim()) return
    setLoading(true)
    setStreaming(true)
    setStreamingText('')
    setSuggestions(null)
    setError('')
    setOccasion(occasion)

    outfitApi.suggestStream(occasion, {
      onToken(token) {
        appendStreamingText(token)
      },
      onDone(data) {
        setSuggestions(data)
        setStreaming(false)
        setLoading(false)
      },
      onError(err) {
        setError(err || 'Failed')
        setStreaming(false)
        setLoading(false)
      },
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif font-semibold text-espresso-800 mb-8">What Should I Wear?</h1>

      {!hasItems && (
        <div className="bg-sand-100 text-espresso-800 p-4 rounded-xl border border-sand-200/60 mb-6">
          Add some clothes first! <Link to="/wardrobe/add" className="text-terracotta-500 hover:text-terracotta-600 underline">Add items &rarr;</Link>
        </div>
      )}

      <div className="bg-cream p-6 rounded-xl border border-sand-200/60 mb-6">
        <textarea
          value={occasion}
          onChange={e => setLocalOccasion(e.target.value)}
          rows="2"
          placeholder="e.g., Job interview at a tech startup..."
          className="w-full px-3 py-2 bg-cream border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent"
          disabled={!hasItems}
        />
        <button
          onClick={getSuggestions}
          disabled={loading || !hasItems}
          className="mt-4 bg-terracotta-500 hover:bg-terracotta-600 text-white px-6 py-2.5 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Get Outfit Ideas'}
        </button>
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>

      {streaming && (
        <div className="bg-cream p-6 rounded-xl border border-sand-200/60 mb-6">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-terracotta-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-charcoal-400">Putting together some outfits...</span>
          </div>
        </div>
      )}

      {suggestions && (
        <div className="space-y-6">
          <h2 className="text-xl font-serif font-semibold text-espresso-800">Suggestions for "{suggestions.occasion}"</h2>
          {suggestions.suggestions.map((s, i) => (
            <div key={i} className="bg-cream p-6 rounded-xl border border-sand-200/60">
              <h3 className="text-xs tracking-wider uppercase text-charcoal-400 mb-4">Option {i + 1}</h3>
              <div className="flex gap-4 mb-4">
                {s.item_ids.map(id => {
                  const item = getItem(id)
                  return (
                    <div key={id} className="w-24">
                      <div className="aspect-square bg-sand-100 rounded-lg overflow-hidden">
                        {item?.image_url && <img src={item.image_url} className="w-full h-full object-cover" />}
                      </div>
                      <p className="text-xs text-center mt-1 text-charcoal-400">{item?.item_type_display}</p>
                    </div>
                  )
                })}
              </div>
              <p className="text-charcoal-500 text-sm leading-relaxed">{s.explanation}</p>
            </div>
          ))}
        </div>
      )}

      {!suggestions && !loading && hasItems && (
        <div className="bg-sand-50 p-6 rounded-xl border border-sand-200/60">
          <p className="font-serif font-medium text-espresso-800 mb-3">Try:</p>
          <ul className="text-charcoal-500 space-y-2">
            <li onClick={() => setLocalOccasion('Job interview at a tech startup')} className="cursor-pointer hover:text-terracotta-500">Job interview</li>
            <li onClick={() => setLocalOccasion('First date at a nice restaurant')} className="cursor-pointer hover:text-terracotta-500">First date</li>
            <li onClick={() => setLocalOccasion('Casual Friday at the office')} className="cursor-pointer hover:text-terracotta-500">Casual Friday</li>
          </ul>
        </div>
      )}
    </div>
  )
}
