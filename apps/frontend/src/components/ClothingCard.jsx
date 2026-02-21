import { Link } from 'react-router-dom'

export default function ClothingCard({ item }) {
  return (
    <Link to={`/wardrobe/${item.id}`} className="group block bg-cream rounded-xl border border-sand-200/60 overflow-hidden hover:shadow-lg hover:shadow-sand-300/30 hover:border-sand-300">
      <div className="aspect-[3/4] bg-sand-100 overflow-hidden">
        {item.image_url && <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-espresso-800 truncate">{item.item_type_display}</h3>
        <p className="text-xs tracking-wide uppercase text-charcoal-400 mt-1">{item.colors?.slice(0, 2).join(', ')}</p>
        <p className="text-xs text-charcoal-300">{item.formality_display}</p>
      </div>
    </Link>
  )
}
