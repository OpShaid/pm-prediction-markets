import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home')
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-white"
      style={{ zoom: 0.7 }}
    >
      <div className="flex flex-col items-center gap-6">
        <img
          src="https://github.githubassets.com/images/mona-loading-dark.gif"
          alt="Loading..."
          className="w-32 h-32"
        />

        <div className="text-center">
          <h2 className="text-2xl font-bold text-black">Loading PredictMarkets</h2>
          <p className="text-gray-600 text-sm mt-2">Preparing your experience...</p>
        </div>
      </div>
    </div>
  )
}
