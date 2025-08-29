import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Find Your Perfect Student Home</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Browse thousands of student accommodations near your university. Safe, affordable, and verified listings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/listings" className="btn-secondary text-lg px-8 py-3">
              Browse Listings
            </Link>
            <Link href="/listings/new" className="btn-outline bg-white text-primary-700 hover:bg-gray-100 text-lg px-8 py-3">
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Find Your Place',
                description: 'Search for student accommodations near your university.',
                icon: '🔍',
              },
              {
                title: 'Book a Viewing',
                description: 'Schedule a visit or virtual tour with the property owner.',
                icon: '📅',
              },
              {
                title: 'Move In',
                description: 'Sign your contract digitally and move into your new home!',
                icon: '🏠',
              },
            ].map((step, index) => (
              <div key={index} className="text-center p-6 rounded-lg bg-gray-50">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Listings</h2>
            <Link href="/listings" className="text-primary-600 hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="card hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">Modern Apartment Near Campus</h3>
                      <p className="text-gray-600">123 University Ave, City</p>
                    </div>
                    <span className="font-bold">$800/mo</span>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <span>2 beds · 1 bath · 750 sqft</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to find your perfect student home?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of students who found their ideal accommodation through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-secondary px-8 py-3 text-lg">
              Sign Up Free
            </Link>
            <Link href="/listings" className="btn-outline border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
