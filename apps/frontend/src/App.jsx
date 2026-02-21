import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import useAuthStore from './stores/useAuthStore'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import PageTransition from './components/PageTransition'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import WardrobePage from './pages/WardrobePage'
import AddItemPage from './pages/AddItemPage'
import BatchUploadPage from './pages/BatchUploadPage'
import ItemDetailPage from './pages/ItemDetailPage'
import OutfitsPage from './pages/OutfitsPage'

function NavBar() {
  const token = useAuthStore(s => s.token)
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-cream border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="font-serif text-2xl text-espresso-600 hover:text-espresso-700">The Wardrobe</Link>
        {token ? (
          <div className="flex items-center gap-6">
            <Link to="/wardrobe" className="text-sm tracking-wider uppercase text-charcoal-400 hover:text-espresso-800">My Wardrobe</Link>
            <Link to="/outfits" className="text-sm tracking-wider uppercase text-charcoal-400 hover:text-espresso-800">Get Outfits</Link>
            <button onClick={handleLogout} className="text-sm tracking-wider uppercase text-charcoal-300 hover:text-espresso-800">Logout</button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm tracking-wider uppercase text-charcoal-400 hover:text-espresso-800">Login</Link>
            <Link to="/signup" className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-5 py-2 rounded-lg text-sm tracking-wider uppercase">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <NavBar />
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <PageTransition>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route path="/wardrobe" element={<WardrobePage />} />
                <Route path="/wardrobe/add" element={<AddItemPage />} />
                <Route path="/wardrobe/batch-add" element={<BatchUploadPage />} />
                <Route path="/wardrobe/:id" element={<ItemDetailPage />} />
                <Route path="/outfits" element={<OutfitsPage />} />
              </Route>
            </Routes>
          </PageTransition>
        </main>
      </div>
    </BrowserRouter>
  )
}
