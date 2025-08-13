'use client'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Join AlphaRise</h1>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <p className="text-center mb-6">Email capture form coming soon...</p>
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Your email"
                className="w-full p-4 bg-white/10 border border-white/20 rounded-lg"
              />
              <button className="w-full p-4 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-bold">
                Start My Transformation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}