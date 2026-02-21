import { useLocation } from 'react-router-dom'

export default function PageTransition({ children }) {
  const location = useLocation()
  return (
    <div key={location.key} className="page-transition-enter">
      {children}
    </div>
  )
}
