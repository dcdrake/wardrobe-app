import { Link } from 'react-router-dom'
import useAuthStore from '../stores/useAuthStore'

export default function HomePage() {
  const token = useAuthStore(s => s.token)

  return (
    <div className="max-w-3xl mx-auto text-center py-24">
      <h1 className="text-5xl md:text-6xl font-serif font-semibold text-espresso-800 mb-6">Your Personal<br />Wardrobe Stylist</h1>
      <div className="flex justify-center mb-8">
        <div className="w-16 h-0.5 bg-terracotta-400"></div>
      </div>
      <p className="text-xl text-charcoal-400 mb-12 max-w-xl mx-auto leading-relaxed">Catalog your clothes, get AI-powered outfit suggestions for any occasion.</p>
      {!token ? (
        <div className="flex justify-center gap-4">
          <Link to="/signup" className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-8 py-3 rounded-lg text-lg">Get Started</Link>
          <Link to="/login" className="border border-sand-300 hover:border-espresso-600 text-espresso-800 px-8 py-3 rounded-lg text-lg">Login</Link>
        </div>
      ) : (
        <div className="flex justify-center gap-4">
          <Link to="/wardrobe" className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-8 py-3 rounded-lg text-lg">My Wardrobe</Link>
          <Link to="/outfits" className="border border-sand-300 hover:border-espresso-600 text-espresso-800 px-8 py-3 rounded-lg text-lg">Get Outfit Ideas</Link>
        </div>
      )}
    </div>
  )
}
