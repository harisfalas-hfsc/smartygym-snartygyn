import React from 'react';
import { Dumbbell, Target, Calculator, Sparkles, ClipboardCheck, BookOpen, Users, Trophy, Star, CheckCircle } from 'lucide-react';

export const IndividualBrochure = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 print:text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Page 1 */}
      <div className="p-8 md:p-12 max-w-[21cm] mx-auto" style={{ minHeight: '29.7cm', pageBreakAfter: 'always' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b-4 border-[#D4AF37] pb-6">
          <div className="flex items-center gap-4">
            <img 
              src="/smarty-gym-logo.png" 
              alt="SmartyGym Logo" 
              className="h-16 w-16 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-3xl font-bold text-[#D4AF37]">SmartyGym</h1>
              <p className="text-sm text-gray-600">Your Gym Re-imagined. Anywhere, Anytime.</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg">
              <span className="text-[#D4AF37] font-bold">100% Human</span>
              <span className="mx-2">|</span>
              <span>0% AI</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-white rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Transform Your Fitness Journey with Expert Guidance</h2>
          <p className="text-gray-300 mb-4">
            SmartyGym is your complete online fitness platform designed by Sports Scientist <strong className="text-[#D4AF37]">Haris Falas</strong>. 
            Every workout, every program, every detail is crafted by a real expert with 20+ years of coaching experience.
          </p>
          <div className="flex items-center gap-4 mt-6">
            <img 
              src="/lovable-uploads/5b15e21a-12fa-49ff-8a45-6d7b5fa49c55.png"
              alt="Haris Falas - Sports Scientist"
              className="h-20 w-20 rounded-full object-cover border-2 border-[#D4AF37]"
            />
            <div>
              <p className="font-bold text-[#D4AF37]">Haris Falas</p>
              <p className="text-sm text-gray-400">Sports Scientist | CSCS Certified</p>
              <p className="text-sm text-gray-400">20+ Years Coaching Experience</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <h3 className="text-xl font-bold mb-6 text-[#D4AF37] border-b-2 border-[#D4AF37] pb-2">Platform Features</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#D4AF37]">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="h-5 w-5 text-[#D4AF37]" />
              <h4 className="font-bold">Smarty Workouts</h4>
            </div>
            <p className="text-sm text-gray-600">500+ expert-designed workouts across strength, HIIT, cardio, mobility, and functional training.</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#D4AF37]">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-[#D4AF37]" />
              <h4 className="font-bold">Smarty Programs</h4>
            </div>
            <p className="text-sm text-gray-600">Structured multi-week training programs (4-12 weeks) for muscle building, fat loss, and athletic performance.</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#D4AF37]">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-5 w-5 text-[#D4AF37]" />
              <h4 className="font-bold">Smarty Tools</h4>
            </div>
            <p className="text-sm text-gray-600">Professional calculators: BMR, daily calories, one-rep max, macro tracking, and more.</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#D4AF37]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-[#D4AF37]" />
              <h4 className="font-bold">Smarty Ritual</h4>
            </div>
            <p className="text-sm text-gray-600">Daily wellness routines: morning activation, midday reset, and evening wind-down protocols.</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#D4AF37]">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardCheck className="h-5 w-5 text-[#D4AF37]" />
              <h4 className="font-bold">Smarty Check-ins</h4>
            </div>
            <p className="text-sm text-gray-600">Daily morning and evening check-ins to track sleep, readiness, hydration, and overall wellness.</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#D4AF37]">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-[#D4AF37]" />
              <h4 className="font-bold">Expert Blog</h4>
            </div>
            <p className="text-sm text-gray-600">Science-backed articles on fitness, nutrition, and wellness written by Haris Falas.</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#D4AF37]">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-[#D4AF37]" />
              <h4 className="font-bold">Community</h4>
            </div>
            <p className="text-sm text-gray-600">Leaderboards, ratings, and community engagement to stay motivated.</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#D4AF37]">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-[#D4AF37]" />
              <h4 className="font-bold">Progress Tracking</h4>
            </div>
            <p className="text-sm text-gray-600">Interactive logbook to track workouts, programs, achievements, and fitness journey.</p>
          </div>
        </div>
      </div>

      {/* Page 2 */}
      <div className="p-8 md:p-12 max-w-[21cm] mx-auto" style={{ minHeight: '29.7cm' }}>
        {/* Pricing Table */}
        <h3 className="text-xl font-bold mb-6 text-[#D4AF37] border-b-2 border-[#D4AF37] pb-2">Membership Plans</h3>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border-2 border-gray-200 rounded-xl p-6 text-center">
            <h4 className="font-bold text-lg mb-2">Free</h4>
            <p className="text-3xl font-bold mb-4">€0<span className="text-sm text-gray-500">/mo</span></p>
            <ul className="text-sm text-left space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Free workouts</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> All calculators</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Community access</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Workout logbook</li>
            </ul>
          </div>
          
          <div className="border-2 border-[#D4AF37] rounded-xl p-6 text-center bg-[#FEF9E7]">
            <div className="bg-[#D4AF37] text-white text-xs px-2 py-1 rounded mb-2 inline-block">POPULAR</div>
            <h4 className="font-bold text-lg mb-2 text-[#D4AF37]">Gold</h4>
            <p className="text-3xl font-bold mb-4">€9.99<span className="text-sm text-gray-500">/mo</span></p>
            <ul className="text-sm text-left space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#D4AF37]" /> All Free features</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#D4AF37]" /> ALL premium workouts</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#D4AF37]" /> Training programs</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#D4AF37]" /> Priority support</li>
            </ul>
          </div>
          
          <div className="border-2 border-gray-800 rounded-xl p-6 text-center bg-[#1a1a1a] text-white">
            <div className="bg-white text-gray-900 text-xs px-2 py-1 rounded mb-2 inline-block">PREMIUM</div>
            <h4 className="font-bold text-lg mb-2">Platinum</h4>
            <p className="text-3xl font-bold mb-4">€19.99<span className="text-sm text-gray-400">/mo</span></p>
            <ul className="text-sm text-left space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#D4AF37]" /> All Gold features</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#D4AF37]" /> Smarty Ritual</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#D4AF37]" /> Workout generator</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#D4AF37]" /> Exclusive content</li>
            </ul>
          </div>
        </div>

        {/* Why SmartyGym */}
        <div className="bg-[#1a1a1a] text-white rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold mb-4 text-[#D4AF37]">Why Choose SmartyGym?</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-[#D4AF37] flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold">Real Expertise</p>
                <p className="text-sm text-gray-400">Every workout designed by a certified Sports Scientist, not algorithms.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-[#D4AF37] flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold">Flexible Access</p>
                <p className="text-sm text-gray-400">Train anywhere: home, gym, office, outdoors, or while traveling.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-[#D4AF37] flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold">Science-Based</p>
                <p className="text-sm text-gray-400">Periodization, progressive overload, and proven training methods.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-[#D4AF37] flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold">All Fitness Levels</p>
                <p className="text-sm text-gray-400">Beginner to advanced with proper progressions and modifications.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Social */}
        <div className="border-t-4 border-[#D4AF37] pt-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg mb-2">Get Started Today</h3>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Website:</strong> <a href="https://smartygym.com" className="text-[#D4AF37]">smartygym.com</a>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Email:</strong> <a href="mailto:support@smartygym.com" className="text-[#D4AF37]">support@smartygym.com</a>
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold mb-2">Follow Us</p>
              <div className="flex gap-4 justify-end text-sm">
                <a href="https://instagram.com/smarty.gym" className="text-[#D4AF37]">Instagram</a>
                <a href="https://facebook.com/smartygym.official" className="text-[#D4AF37]">Facebook</a>
                <a href="https://youtube.com/@smartygym" className="text-[#D4AF37]">YouTube</a>
              </div>
            </div>
          </div>
          <div className="text-center mt-6 text-xs text-gray-500">
            © {new Date().getFullYear()} SmartyGym. All rights reserved. | Your Gym Re-imagined. Anywhere, Anytime.
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualBrochure;
