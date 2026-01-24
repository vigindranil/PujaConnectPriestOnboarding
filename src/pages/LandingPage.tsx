import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, MapPin, Calendar, Users, Sparkles, Star } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-amber-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-red-200/20 to-orange-300/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-orange-100/50 shadow-lg shadow-orange-100/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Flame className="w-7 sm:w-9 h-7 sm:h-9 text-orange-600 drop-shadow-sm" />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-400 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 bg-clip-text text-transparent">PujaConnect</h1>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="group relative bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold text-sm sm:text-base shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50 hover:-translate-y-0.5"
          >
            <span className="relative z-10">Login</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-orange-200/50">
              <Star className="w-4 h-4 text-amber-500" />
              <span>Trusted by 10,000+ devotees</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Connect with Temple{' '}
              <span className="bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 bg-clip-text text-transparent relative">
                Priests
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-orange-400/30 to-amber-400/30 rounded-full"></div>
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
              Experience authentic spiritual connections with verified temple priests. Book traditional pujas and ceremonies with complete peace of mind.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/login')}
                className="group relative bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:via-red-600 hover:to-red-700 transition-all duration-300 font-semibold text-lg shadow-2xl shadow-orange-200/50 hover:shadow-orange-300/60 hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button className="group relative border-2 border-slate-300 hover:border-orange-300 text-slate-700 hover:text-orange-700 px-8 py-4 rounded-xl transition-all duration-300 font-semibold text-lg bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg">
                <span className="flex items-center gap-2">
                  Learn More
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full group-hover:animate-bounce"></div>
                </span>
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="relative">
              {/* Main Card */}
              <div className="bg-gradient-to-br from-orange-400 via-red-500 to-amber-500 rounded-3xl p-8 shadow-2xl shadow-orange-200/50 transform rotate-3 hover:rotate-1 transition-transform duration-500">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white text-center">
                  <Flame className="w-16 h-16 mx-auto mb-4 drop-shadow-lg animate-pulse" />
                  <p className="text-xl font-semibold mb-2">Sacred Moments</p>
                  <p className="text-white/80 text-sm">Experience divine blessings</p>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-orange-100 animate-float">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Available 24/7
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-4 shadow-xl border border-amber-200 animate-float-delayed">
                <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
                  <Star className="w-4 h-4 text-amber-500" />
                  4.9 Rating
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-white/60 backdrop-blur-sm py-16 sm:py-20 border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                PujaConnect?
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Experience the perfect blend of tradition and technology for all your spiritual needs
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-200/50 hover:border-orange-200 transition-all duration-300 hover:shadow-xl hover:shadow-orange-100/50 hover:-translate-y-2">
              <div className="relative mb-4 mx-auto w-fit">
                <div className="bg-gradient-to-br from-orange-100 to-amber-100 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-8 h-8 text-orange-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-900">Find Nearby Temples</h3>
              <p className="text-slate-600">Discover verified temples and experienced priests in your locality</p>
            </div>
            
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-200/50 hover:border-orange-200 transition-all duration-300 hover:shadow-xl hover:shadow-orange-100/50 hover:-translate-y-2">
              <div className="relative mb-4 mx-auto w-fit">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-900">Easy Booking</h3>
              <p className="text-slate-600">Schedule pujas seamlessly at your preferred time and location</p>
            </div>
            
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-200/50 hover:border-orange-200 transition-all duration-300 hover:shadow-xl hover:shadow-orange-100/50 hover:-translate-y-2">
              <div className="relative mb-4 mx-auto w-fit">
                <div className="bg-gradient-to-br from-emerald-100 to-green-100 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-900">Verified Priests</h3>
              <p className="text-slate-600">Connect with authenticated and highly-rated spiritual guides</p>
            </div>
            
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-200/50 hover:border-orange-200 transition-all duration-300 hover:shadow-xl hover:shadow-orange-100/50 hover:-translate-y-2">
              <div className="relative mb-4 mx-auto w-fit">
                <div className="bg-gradient-to-br from-red-100 to-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Flame className="w-8 h-8 text-red-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-red-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-900">Sacred Rituals</h3>
              <p className="text-slate-600">Experience authentic traditional ceremonies with divine blessings</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-orange-600 via-red-600 to-amber-600 py-16 sm:py-20 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Join the spiritual community</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Book Your First Puja?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Join thousands of devotees connecting with authentic priests and experiencing divine blessings through our platform
          </p>
          <button
            onClick={() => navigate('/login')}
            className="group relative bg-white text-orange-600 px-10 py-4 rounded-xl hover:bg-slate-50 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-white/30 hover:-translate-y-1"
          >
            <span className="flex items-center gap-2">
              Start Your Spiritual Journey
              <Flame className="w-5 h-5 group-hover:animate-bounce" />
            </span>
          </button>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">10K+</div>
              <div className="text-white/80 text-sm">Happy Devotees</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">500+</div>
              <div className="text-white/80 text-sm">Verified Priests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">50K+</div>
              <div className="text-white/80 text-sm">Pujas Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">4.9</div>
              <div className="text-white/80 text-sm">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">PujaConnect</span>
          </div>
          <p className="text-center text-slate-400">&copy; 2026 PujaConnect. Bringing divine connections to the digital age.</p>
        </div>
      </footer>
    </div>
  );
};
