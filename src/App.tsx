/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent, createContext, useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { auth, db, seedData, handleFirestoreError, googleProvider } from "./firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  signOut,
  User as FirebaseUser 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  updateDoc,
  orderBy
} from "firebase/firestore";
import { 
  Zap, 
  Plus,
  Globe, 
  Handshake, 
  BarChart3, 
  Lock, 
  ShieldCheck, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  Search, 
  Menu, 
  X, 
  ArrowRight,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  User,
  Landmark,
  Gem,
  Factory,
  Eye,
  Target,
  BookOpen,
  Download,
  Activity,
  Cpu,
  Database,
  RefreshCw,
  Layers,
  Settings,
  Leaf,
  Trees,
  Sun,
  Wind,
  Users
} from "lucide-react";

// --- Types ---
type Page = 
  | "home" 
  | "features" 
  | "how-it-works" 
  | "pricing" 
  | "buyer" 
  | "producer" 
  | "buyer-dashboard"
  | "producer-dashboard"
  | "contracts"
  | "login"
  | "signup"
  | "intelligence" 
  | "security" 
  | "about" 
  | "company"
  | "investor"
  | "whitepaper"
  | "contact";

// --- Components ---

const MarketTicker = () => {
  const { formatPrice, currency, corridor } = useGlobalPreferences();

  const benchmarks = [
    { label: "Brent Crude", basePrice: 85, change: "+1.2%" },
    { label: "Henry Hub Gas", basePrice: 3.4, change: "-0.8%" },
    { label: "EU Carbon Offset", basePrice: 92, change: "+0.5%" },
    { label: "Global Solar Index", basePrice: 43, change: "-2.1%" },
    { label: "WTI Crude", basePrice: 80, change: "+0.9%" },
    { label: "UK Gas Futures", basePrice: 16, change: "+1.5%" },
  ];

  return (
    <div className="bg-orange-500/10 border-b border-orange-500/20 py-2 overflow-hidden whitespace-nowrap relative z-[60] flex items-center justify-between">
      <div className="flex animate-marquee overflow-hidden">
        {[...benchmarks, ...benchmarks].map((item, i) => (
          <div key={i} className="inline-flex items-center mx-8">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">{item.label}</span>
            <span className="text-xs font-bold text-white mr-2">{formatPrice(item.basePrice)}</span>
            <span className={`text-[10px] font-bold ${item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
              {item.change}
            </span>
          </div>
        ))}
      </div>
      <div className="hidden md:flex items-center gap-2 px-4 border-l border-white/10 shrink-0 bg-black py-0.5 text-[10px] font-mono text-orange-500 font-bold uppercase tracking-widest">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
        <span>Corridor: {corridor}</span>
      </div>
    </div>
  );
};

const Navbar = ({ currentPage, setPage }: { currentPage: Page, setPage: (p: Page) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const { currency, setCurrency, language, setLanguage, corridor, setCorridor } = useGlobalPreferences();

  const navItems: { label: string; id: Page }[] = [
    { label: "Features", id: "features" },
    { label: "Pricing", id: "pricing" },
    { label: "Buyers", id: "buyer" },
    { label: "Producers", id: "producer" },
    { label: "Contracts", id: "contracts" },
    { label: "Intelligence", id: "intelligence" },
    { label: "Whitepaper", id: "whitepaper" },
    { label: "Company", id: "company" },
    { label: "Investor Relations", id: "investor" },
    { label: "Security", id: "security" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center cursor-pointer" onClick={() => setPage("home")}>
            <Zap className="h-8 w-8 text-orange-500 mr-2" />
            <span className="text-2xl font-bold tracking-tighter text-white">GEAX<span className="text-orange-500">™</span></span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`text-sm font-medium transition-colors hover:text-orange-500 ${
                  currentPage === item.id ? "text-orange-500" : "text-gray-400"
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="h-4 w-px bg-white/10 mx-1" />
            
            {/* Global Preferences Selector */}
            <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-mono text-gray-400">
              <div className="relative flex items-center gap-1 cursor-pointer hover:text-orange-500 transition-colors uppercase tracking-wider font-bold">
                <Globe className="h-3 w-3 text-orange-500 shrink-0" />
                <span>{corridor}</span>
                <select 
                  value={corridor}
                  onChange={(e) => setCorridor(e.target.value as any)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                >
                  <option value="SADC">SADC (Southern Africa)</option>
                  <option value="EUROPE">ENTSO-E (Europe)</option>
                  <option value="AMERICAS">Americas Corridor</option>
                  <option value="APAC">ASEAN (Asia-Pacific)</option>
                  <option value="MENA">GCC (Middle East)</option>
                </select>
              </div>

              <div className="h-2.5 w-px bg-white/10" />

              <div className="relative flex items-center gap-0.5 cursor-pointer hover:text-orange-500 transition-colors uppercase font-bold">
                <span>{currency}</span>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="ZAR">ZAR (R)</option>
                  <option value="SGD">SGD (S$)</option>
                </select>
              </div>

              <div className="h-2.5 w-px bg-white/10" />

              <div className="relative flex items-center gap-0.5 cursor-pointer hover:text-orange-500 transition-colors uppercase font-bold">
                <span>{language}</span>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                >
                  <option value="EN">EN (English)</option>
                  <option value="FR">FR (Français)</option>
                  <option value="ES">ES (Español)</option>
                  <option value="PT">PT (Português)</option>
                  <option value="ZH">ZH (简体中文)</option>
                </select>
              </div>
            </div>

            <div className="h-4 w-px bg-white/10 mx-1" />
            {user ? (
              <>
                <button 
                  onClick={() => setPage(profile?.role === "producer" ? "producer-dashboard" : "buyer-dashboard")}
                  className={`text-sm font-medium transition-colors hover:text-white flex items-center gap-2 ${
                    ["buyer-dashboard", "producer-dashboard"].includes(currentPage) ? "text-white" : "text-gray-400"
                  }`}
                >
                  <User className="h-4 w-4 text-orange-500" />
                  Dashboard
                </button>
                <button 
                  onClick={logout}
                  className="bg-white/5 hover:bg-white/10 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all border border-white/10"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setPage("login")}
                  className={`text-sm font-medium transition-colors hover:text-white flex items-center gap-2 ${
                    currentPage === "login" ? "text-white" : "text-gray-400"
                  }`}
                >
                  <User className="h-4 w-4" />
                  Login
                </button>
                <button 
                  onClick={() => setPage("signup")}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setPage(item.id); setIsOpen(false); }}
                  className="block w-full text-left px-3 py-3 text-base font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-md"
                >
                  {item.label}
                </button>
              ))}

              {/* Mobile Global Selector controls */}
              <div className="border-t border-white/5 my-3 pt-3 px-3 space-y-3">
                <div className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-widest">Global Preferences</div>
                
                <div className="flex gap-2">
                  {/* Corridor */}
                  <div className="relative flex-1 bg-zinc-900 border border-white/10 p-2 rounded-xl text-center text-xs font-mono font-bold text-gray-300">
                    <span className="block text-[8px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Corridor</span>
                    <span>{corridor}</span>
                    <select 
                      value={corridor}
                      onChange={(e) => setCorridor(e.target.value as any)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    >
                      <option value="SADC">SADC (Africa)</option>
                      <option value="EUROPE">ENTSO-E (Europe)</option>
                      <option value="AMERICAS">Americas</option>
                      <option value="APAC">ASEAN (Asia)</option>
                      <option value="MENA">GCC (MENA)</option>
                    </select>
                  </div>

                  {/* Currency */}
                  <div className="relative flex-1 bg-zinc-900 border border-white/10 p-2 rounded-xl text-center text-xs font-mono font-bold text-gray-300">
                    <span className="block text-[8px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Currency</span>
                    <span>{currency}</span>
                    <select 
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as any)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="ZAR">ZAR (R)</option>
                      <option value="SGD">SGD (S$)</option>
                    </select>
                  </div>

                  {/* Language */}
                  <div className="relative flex-1 bg-zinc-900 border border-white/10 p-2 rounded-xl text-center text-xs font-mono font-bold text-gray-300">
                    <span className="block text-[8px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Language</span>
                    <span>{language}</span>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    >
                      <option value="EN">EN (English)</option>
                      <option value="FR">FR (Français)</option>
                      <option value="ES">ES (Español)</option>
                      <option value="PT">PT (Português)</option>
                      <option value="ZH">ZH (简体中文)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 my-2 pt-2 space-y-2">
                <button
                  onClick={() => { setPage("login"); setIsOpen(false); }}
                  className="block w-full text-left px-3 py-3 text-base font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-md flex items-center gap-2"
                >
                  <User className="h-5 w-5" />
                  Login
                </button>
                <button
                  onClick={() => { setPage("signup"); setIsOpen(false); }}
                  className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl text-base font-bold"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = ({ setPage }: { setPage: (p: Page) => void }) => (
  <footer className="bg-black border-t border-white/10 py-12 px-4">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center mb-6">
          <Zap className="h-6 w-6 text-orange-500 mr-2" />
          <span className="text-xl font-bold tracking-tighter text-white">GEAX™</span>
        </div>
        <p className="text-gray-400 max-w-md leading-relaxed">
          Global Energy Allocation Exchange (GEAX™) is the financial and operational infrastructure for securing the world’s future energy supply.
        </p>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Platform</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li><button onClick={() => setPage("features")} className="hover:text-orange-500">Features</button></li>
          <li><button onClick={() => setPage("how-it-works")} className="hover:text-orange-500">How It Works</button></li>
          <li><button onClick={() => setPage("pricing")} className="hover:text-orange-500">Pricing</button></li>
          <li><button onClick={() => setPage("intelligence")} className="hover:text-orange-500">Intelligence</button></li>
          <li><button onClick={() => setPage("whitepaper")} className="hover:text-orange-500 text-orange-400 font-bold">GEAX™ Whitepaper</button></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Company</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li><button onClick={() => setPage("company")} className="hover:text-orange-500 font-bold text-orange-400">Company Profile</button></li>
          <li><button onClick={() => setPage("investor")} className="hover:text-orange-500 text-orange-400 font-semibold">Investor Relations</button></li>
          <li><button onClick={() => setPage("about")} className="hover:text-orange-500">About Us</button></li>
          <li><button onClick={() => setPage("security")} className="hover:text-orange-500">Security & Trust</button></li>
          <li><button onClick={() => setPage("contact")} className="hover:text-orange-500">Contact</button></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Portals</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li><button onClick={() => setPage("buyer-dashboard")} className="hover:text-orange-500">Buyer Dashboard</button></li>
          <li><button onClick={() => setPage("producer-dashboard")} className="hover:text-orange-500">Producer Dashboard</button></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-xs text-gray-500">
      © {new Date().getFullYear()} Global Energy Allocation Exchange (GEAX™). Powered by B & M Masterlink LTD. All rights reserved.
    </div>
  </footer>
);

// --- Page Components ---

const HomePage = ({ setPage }: { setPage: (p: Page) => void }) => {
  const { user, signInWithGoogle } = useAuth();
  return (
  <div className="pt-20">
    {/* Hero Section */}
    <section className="relative min-h-[90vh] flex items-center px-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black z-10" />
        <img 
          src="https://picsum.photos/seed/energy-grid/1920/1080?blur=5" 
          alt="Energy Grid" 
          className="w-full h-full object-cover opacity-30"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-20 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-[1.1]">
            Secure the Future of Energy — <br className="hidden md:block" />
            <span className="text-orange-500 italic">Before It’s Produced</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-10 leading-relaxed">
            Global Energy Allocation Exchange (GEAX™) is a private marketplace where governments, corporations, and energy producers reserve and allocate future energy supply through structured, high-value contracts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button 
              onClick={() => user ? setPage("buyer-dashboard") : signInWithGoogle()}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center shadow-lg shadow-orange-500/20"
            >
              Get Started Instantly <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={() => setPage("how-it-works")}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg transition-all"
            >
              Explore Solutions
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center md:justify-start gap-2 text-xs text-gray-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Document Release:</span>
            <button 
              onClick={() => setPage("whitepaper")} 
              className="text-orange-500 hover:text-orange-400 font-bold hover:underline"
            >
              GEAX™ Institutional Whitepaper v3.2.0 is Live →
            </button>
          </div>
        </motion.div>
      </div>
    </section>

    {/* What GEAX Does */}
    <section className="py-24 px-4 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-tight">What GEAX™ Does</h2>
            <div className="space-y-6">
              {[
                { title: "Energy producers to pre-sell future capacity", desc: "Monetize production before the first watt is generated." },
                { title: "Governments and corporations to secure long-term energy supply", desc: "Lock in allocation rights to ensure national and industrial security." },
                { title: "Investors to finance energy projects in exchange for allocation rights", desc: "Direct capital into infrastructure with guaranteed yield in energy assets." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-10 text-xl text-orange-500 font-medium italic">
              "We transform energy from a reactive purchase into a strategic, forward-controlled asset."
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
            <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">Why GEAX™ Exists</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Global energy demand is rising, but supply is unpredictable, long-term access is difficult to secure, and deals are fragmented and opaque.
            </p>
            <div className="bg-black/50 p-6 rounded-2xl border border-white/5">
              <p className="text-white font-medium mb-4">GEAX™ creates a centralized, transparent marketplace for future energy allocation.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <div className="text-2xl font-bold text-orange-500">Rising</div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">Demand</div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <div className="text-2xl font-bold text-orange-500">Opaque</div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">Markets</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Platform Snapshot */}
    <section className="py-24 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl md:text-5xl font-bold text-white mb-16 tracking-tighter">Platform Snapshot</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { icon: Zap, label: "Future energy allocation marketplace" },
            { icon: Globe, label: "Global producer and buyer network" },
            { icon: Handshake, label: "Structured contract engine" },
            { icon: BarChart3, label: "Real-time energy intelligence" },
            { icon: Lock, label: "Secure transaction infrastructure" }
          ].map((item, i) => (
            <div key={i} className="p-8 bg-zinc-900/50 border border-white/10 rounded-2xl flex flex-col items-center text-center hover:bg-zinc-900 transition-colors">
              <item.icon className="h-10 w-10 text-orange-500 mb-4" />
              <p className="text-sm font-medium text-gray-300 leading-snug">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
  );
};

const FeaturesPage = () => (
  <div className="pt-32 pb-24 px-4 bg-black min-h-screen">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tighter">Platform Features</h1>
      <p className="text-xl text-gray-400 mb-16 max-w-3xl">Institutional-grade tools for the global energy exchange.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            icon: Zap,
            title: "1. Future Energy Listings",
            desc: "Access available future energy capacity including Electricity (grid-scale), LNG, and Renewable energy (solar, wind, hydro).",
            details: ["Capacity (MW / MWh / volume)", "Delivery timeline", "Pricing structure"]
          },
          {
            icon: Handshake,
            title: "2. Energy Reservation Contracts",
            desc: "Secure supply before production with structured agreements.",
            details: ["Long-term allocation agreements", "Price-lock mechanisms", "Guaranteed delivery structures"]
          },
          {
            icon: BarChart3,
            title: "3. AI Energy Intelligence",
            desc: "Make smarter energy decisions with real-time analytics.",
            details: ["Demand forecasting", "Price trend analysis", "Supply risk evaluation", "Market insights"]
          },
          {
            icon: CreditCard,
            title: "4. Structured Financing Tools",
            desc: "Enable energy project funding through innovative mechanisms.",
            details: ["Prepayment agreements", "Investor-backed capacity financing", "Flexible contract structuring"]
          },
          {
            icon: FileText,
            title: "5. Secure Data Rooms",
            desc: "Access critical project information in a protected environment.",
            details: ["Energy production forecasts", "Infrastructure details", "Legal agreements", "Financial projections"]
          }
        ].map((feature, i) => (
          <div key={i} className="p-8 bg-zinc-900 border border-white/10 rounded-3xl hover:border-orange-500/50 transition-all group">
            <feature.icon className="h-12 w-12 text-orange-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">{feature.desc}</p>
            <ul className="space-y-2">
              {feature.details.map((detail, j) => (
                <li key={j} className="flex items-center text-sm text-gray-300">
                  <ChevronRight className="h-4 w-4 text-orange-500 mr-2" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const HowItWorksPage = () => (
  <div className="pt-32 pb-24 px-4 bg-zinc-950 min-h-screen">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-16 tracking-tighter text-center">How It Works</h1>
      
      <div className="space-y-12 relative">
        <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-orange-500/20 hidden md:block" />
        
        {[
          { step: "Step 1", title: "Join the Platform", desc: "Energy producers list future capacity. Buyers and governments register for access." },
          { step: "Step 2", title: "Verification", desc: "All participants undergo identity verification, financial capability checks, and compliance validation." },
          { step: "Step 3", title: "Discover Opportunities", desc: "Browse and filter by energy type, region, capacity size, and contract duration." },
          { step: "Step 4", title: "Reserve Energy", desc: "Secure future supply through allocation contracts, price-lock agreements, and structured financing." },
          { step: "Step 5", title: "Execute & Monitor", desc: "Track delivery timelines and contract fulfillment through the platform." }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-8 items-start relative z-10"
          >
            <div className="h-14 w-14 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
              {i + 1}
            </div>
            <div className="pt-2">
              <span className="text-orange-500 font-bold uppercase tracking-widest text-xs mb-2 block">{item.step}</span>
              <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400 text-lg leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  
  // Interactive Onboarding Simulator state
  const [selectedProfile, setSelectedProfile] = useState<"broker" | "buyer" | "producer" | "investor" | "government">("producer");
  const [companyName, setCompanyName] = useState<string>("");
  const [jurisdiction, setJurisdiction] = useState<string>("Zambia (SADC Portal)");
  const [verificationLevel, setVerificationLevel] = useState<"standard" | "priority" | "sovereign">("priority");
  const [simulationStatus, setSimulationStatus] = useState<"idle" | "verifying" | "completed">("idle");
  const [mockAccessKey, setMockAccessKey] = useState<string>("");
  const [mockCertDate, setMockCertDate] = useState<string>("");

  // Plans representing realistic world prices for massive multi-million or billion dollar commodites structures
  const pricingPlans = {
    broker: {
      title: "Registered Commodity Broker",
      sub: "Bilateral arbitrageurs & certified traders",
      monthly: 2800,
      yearly: 28000,
      features: [
        "Direct trade execution & matching access",
        "Multi-client escrow vault controls",
        "Broker Commission Routing API",
        "0.15% cleared volume transaction fee discount",
        "Class-I AML / KYC institutional certification",
        "SADC energy commodity broker ledger listing"
      ],
      icon: Users,
      badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20"
    },
    buyer: {
      title: "Corporate Off-Taking Buyer",
      sub: "Heavy manufacturers, smelters, & industrial hubs",
      monthly: 6500,
      yearly: 65000,
      features: [
        "Comprehensive real-time forward matching orderbook",
        "Dual Sovereign LOI, PPA & NCNDA auto-generation",
        "SADC grid corridor availability notification engines",
        "Standard multi-sig escrow clearing clearance",
        "Dedicated clearing manager & legal vetting desk",
        "Access to forward geological mining benchmarks"
      ],
      icon: Factory,
      badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    },
    producer: {
      title: "Sovereign Energy Producer",
      sub: "Utility projects, IPPs, & mineral operators",
      monthly: 12500,
      yearly: 120000,
      features: [
        "Capacity block listing & off-take claim routing",
        "Certified reserve reporting & audit updates",
        "Exclusive SADC power-pool interconnection routing",
        "Automatic digital carbon avoidance verification",
        "Dynamic legal framework templates customized to SADC",
        "Integration into GEAX physical delivery ledger"
      ],
      icon: Gem,
      badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/20"
    },
    investor: {
      title: "Private Equity & Energy Fund",
      sub: "Infrastructure managers & high-yield financiers",
      monthly: 14500,
      yearly: 140000,
      features: [
        "Early access to pre-commission capital auctions",
        "Deep geological & structural data-room download tool",
        "Dual-signature pre-production escrow hedges",
        "Exclusive contact channels with sovereign ministers",
        "Quarterly private clearinghouse ledger analysis",
        "Premium ESG rating tracking tools"
      ],
      icon: Landmark,
      badgeColor: "text-green-400 bg-green-500/10 border-green-500/20"
    },
    government: {
      title: "Nation-State / Sovereign Grid",
      sub: "Energy ministries, state-grids, & public regulators",
      monthly: 24500,
      yearly: 240000,
      features: [
        "Intergovernmental treaty compliance & tariffs overrides",
        "High-voltage telemetry & national capacity load view",
        "Local currency settlement escrow pools setup",
        "Cross-border interconnector governance portal",
        "Bilateral sovereign trade covenant structures",
        "VIP diplomatic clearing officer allocation"
      ],
      icon: Globe,
      badgeColor: "text-teal-400 bg-teal-500/10 border-teal-500/20"
    }
  };

  const { formatPrice, currency, corridor, language } = useGlobalPreferences();

  const getPriceLabel = (key: keyof typeof pricingPlans) => {
    const plan = pricingPlans[key];
    const amount = billingCycle === "yearly" ? plan.yearly : plan.monthly;
    return formatPrice(amount);
  };

  const currentDurationLabel = billingCycle === "yearly" ? "/ year" : "/ month";

  const handleSimulateOnboarding = (e: FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    
    setSimulationStatus("verifying");
    
    setTimeout(() => {
      const serialPrefixes = {
        broker: "GEAX-MBR-BRK-",
        buyer: "GEAX-MBR-BYR-",
        producer: "GEAX-MBR-PRD-",
        investor: "GEAX-MBR-INV-",
        government: "GEAX-MBR-GOV-"
      };
      const codeSuffix = Math.random().toString(16).substring(2, 8).toUpperCase();
      const levelCode = verificationLevel === "sovereign" ? "SOV" : verificationLevel === "priority" ? "PRI" : "STD";
      const generatedCode = `${serialPrefixes[selectedProfile]}${levelCode}-${jurisdiction.substring(0, 3).toUpperCase()}-${codeSuffix}`;
      
      setMockAccessKey(generatedCode);
      setMockCertDate(new Date().toISOString().split('T')[0]);
      setSimulationStatus("completed");
    }, 1500);
  };

  return (
    <div className="pt-32 pb-24 px-4 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <span className="text-xs font-mono font-bold text-orange-500 uppercase tracking-widest block animate-pulse">
            GLOBAL TRANSPARENT COVENANT
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">
            Membership & Verification Monetization
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Institutional-grade subscription tiers matching world commodity exchange pricing. Secure legal compliance, advanced market telemetry, and escrow clearance pipelines.
          </p>

          {/* Billing Toggle button */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <span className={`text-xs font-bold tracking-wider uppercase transition-colors ${billingCycle === "monthly" ? "text-orange-500" : "text-gray-500"}`}>Billed Monthly</span>
            <button 
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="w-14 h-7 bg-zinc-800 rounded-full relative p-1 transition-colors border border-white/5"
            >
              <div className={`w-5 h-5 bg-orange-500 rounded-full transition-all duration-300 ${billingCycle === "yearly" ? "translate-x-7" : "translate-x-0"}`} />
            </button>
            <span className={`text-xs font-bold tracking-wider uppercase transition-colors relative ${billingCycle === "yearly" ? "text-orange-500" : "text-gray-500"}`}>
              Billed Annually
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500/10 text-green-400 border border-green-500/30 text-[8px] font-mono px-1.5 py-0.5 rounded-full whitespace-nowrap uppercase tracking-widest">Save ~20%</span>
            </span>
          </div>
        </div>

        {/* Dynamic Display Grid of 5 Key Persona Licenses */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {(Object.keys(pricingPlans) as Array<keyof typeof pricingPlans>).map((key) => {
            const plan = pricingPlans[key];
            const PlanIcon = plan.icon;
            return (
              <div 
                key={key} 
                className={`flex flex-col justify-between bg-zinc-900/50 border rounded-[2rem] p-6 hover:border-orange-500/30 transition-all ${
                  selectedProfile === key ? "border-orange-500/40 shadow-xl shadow-orange-500/5 bg-zinc-900/80" : "border-white/5"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-orange-500">
                      <PlanIcon className="h-5 w-5" />
                    </div>
                    {billingCycle === "yearly" && (
                      <span className="text-[8px] font-mono bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                        Annual Seat
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-white text-sm font-bold tracking-tight">{plan.title}</h3>
                    <p className="text-[10px] text-gray-400 leading-tight mt-1">{plan.sub}</p>
                  </div>

                  <div className="border-t border-white/5 pt-3">
                    <span className="text-2xl font-bold text-white tracking-tight">{getPriceLabel(key)}</span>
                    <span className="text-[10px] text-gray-500 font-mono ml-1">{currentDurationLabel}</span>
                  </div>

                  <ul className="space-y-2.5 pt-2 border-t border-white/5 text-[10px] leading-snug">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex gap-2 text-gray-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => {
                      setSelectedProfile(key);
                      // Reset simulated completed state if switching
                      if (simulationStatus === "completed") {
                        setSimulationStatus("idle");
                      }
                    }}
                    className={`w-full py-2.5 rounded-xl text-[10px] font-bold tracking-wide uppercase transition-all ${
                      selectedProfile === key
                        ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/15"
                        : "bg-black/40 hover:bg-black/60 text-gray-400 hover:text-white border border-white/10"
                    }`}
                  >
                    Select Plan
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Standard Sovereign Transaction Cost Indicators */}
        <div className="bg-orange-500 rounded-[2.5rem] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-orange-600/30 to-red-600/30 blur-2xl opacity-50" />
          <div className="relative space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Institutional High-Value Flow Rates</h3>
            <p className="text-orange-100 max-w-2xl mx-auto text-sm leading-relaxed">
              Standard contract clearing transaction rates scale automatically with validated volume tiers. All fees are transited transparently through the GEAX™ Decentralized Escrow Clearing Ledger.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-4">
              <div className="bg-black/20 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <span className="text-orange-200 text-xs font-mono font-bold uppercase tracking-wider block mb-1">Standard Spot Sourcing</span>
                <span className="text-3xl font-bold text-white block">0.50%</span>
                <span className="text-[10px] text-orange-200/80 block mt-1">Applied to spot bilateral allocations</span>
              </div>
              <div className="bg-black/20 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <span className="text-orange-200 text-xs font-mono font-bold uppercase tracking-wider block mb-1">Complex Hedging / Off-Take</span>
                <span className="text-3xl font-bold text-white block">1.00%</span>
                <span className="text-[10px] text-orange-200/80 block mt-1">Applied to multi-year infrastructure forward allocations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Verification and Onboarding Checkout Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Setup Inputs Form */}
          <div className="lg:col-span-5 bg-zinc-900 border border-white/5 rounded-[2rem] p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-orange-500" />
                <h3 className="text-white font-bold text-lg">Onboarding & Verification Gate</h3>
              </div>
              <p className="text-xs text-gray-400">Instantly execute digital KYC clearances & obtain your cryptographically generated accession code.</p>
            </div>

            <form onSubmit={handleSimulateOnboarding} className="space-y-4 pt-4 border-t border-white/5">
              
              {/* Selected Profile Highlight */}
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Target Member Seat Category
                </label>
                <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-white font-bold">{pricingPlans[selectedProfile].title}</span>
                  <span className="text-xs text-orange-500 font-bold font-mono">
                    {getPriceLabel(selectedProfile)} {currentDurationLabel}
                  </span>
                </div>
              </div>

              {/* Legal Entity inputs */}
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Institutional / Legal Entity Name
                </label>
                <input 
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    if (simulationStatus === "completed") setSimulationStatus("idle");
                  }}
                  placeholder="e.g. Copper Belt Refining Trust Ltd"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-orange-500 font-sans"
                />
              </div>

              {/* Legal Trade Jurisdiction */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Main Legal Jurisdiction
                  </label>
                  <select
                    value={jurisdiction}
                    onChange={(e) => {
                      setJurisdiction(e.target.value);
                      if (simulationStatus === "completed") setSimulationStatus("idle");
                    }}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-orange-500"
                  >
                    <option value="Zambia (SADC)">Zambia SADC Gate</option>
                    <option value="DRC (SADC)">DRC Congo SADC Gate</option>
                    <option value="United Kingdom">United Kingdom (LCIA)</option>
                    <option value="Singapore">Singapore (SIAC)</option>
                    <option value="South Africa (SADC)">South Africa SADC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    KYC Verification Grade
                  </label>
                  <select
                    value={verificationLevel}
                    onChange={(e) => {
                      setVerificationLevel(e.target.value as any);
                      if (simulationStatus === "completed") setSimulationStatus("idle");
                    }}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-orange-500"
                  >
                    <option value="standard">Class 1: Standard Broker</option>
                    <option value="priority">Class 2: Priority Escrow</option>
                    <option value="sovereign">Class 3: Sovereign Clear</option>
                  </select>
                </div>
              </div>

              {/* Price Calculation breakdown */}
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2 text-[10px] font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>Standard Admission Processing</span>
                  <span className="text-white">{formatPrice(250)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>KYC Vetting & Bond Trust Assessment</span>
                  <span className="text-white">
                    {formatPrice(verificationLevel === "sovereign" ? 4500 : verificationLevel === "priority" ? 1800 : 850)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Subscription Base Plan Fee</span>
                  <span className="text-orange-400">
                    {getPriceLabel(selectedProfile)} / year (Deferred)
                  </span>
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between text-white font-bold">
                  <span>Immediately Cleared Ledger Escrow</span>
                  <span className="text-orange-500 font-bold">
                    {formatPrice(250 + (verificationLevel === "sovereign" ? 4500 : verificationLevel === "priority" ? 1800 : 850))}
                  </span>
                </div>
              </div>

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={simulationStatus === "verifying" || !companyName.trim()}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-orange-500/20"
              >
                {simulationStatus === "idle" && "Simulate Seat Escrow Checkout"}
                {simulationStatus === "verifying" && "Verifying Security Credentials on Ledger..."}
                {simulationStatus === "completed" && "Re-generate Verified Trust Badge"}
              </button>

            </form>
          </div>

          {/* Verification Results Screen with Certificate visualization */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between min-h-[480px]">
              
              {/* Star-burst clean decorative pattern background top right */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Stamp watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full border border-dashed border-orange-500/5 flex items-center justify-center rotate-45 select-none pointer-events-none p-2">
                <div className="w-full h-full rounded-full border border-orange-500/5 flex flex-col items-center justify-center font-mono text-[8px] text-center tracking-widest text-orange-500/10 uppercase">
                  <span>GEAX ALLOCATION SYSTEM</span>
                  <span>VERIFICATION AUDITOR</span>
                </div>
              </div>

              {simulationStatus === "idle" && (
                <div className="my-auto text-center space-y-4 py-8">
                  <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-gray-500 mx-auto">
                    <ShieldCheck className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-white font-bold text-lg">Awaiting Clearance Certification</h4>
                    <p className="text-xs text-gray-400">
                      Enter your legal entity name in the verification gate and launch the sandbox checkout. The platform will query live AML pools to stamp your authorized credentials.
                    </p>
                  </div>
                </div>
              )}

              {simulationStatus === "verifying" && (
                <div className="my-auto text-center space-y-6 py-8">
                  <div className="relative h-16 w-16 mx-auto">
                    <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-dashed border-orange-500 animate-spin" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <ShieldCheck className="h-6 w-6 text-orange-400" />
                    </div>
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-orange-400 font-bold text-md font-mono uppercase tracking-widest animate-pulse">Running Live SADC Registry Verification...</h4>
                    <p className="text-xs text-gray-400">
                      Vetting {companyName} legal bounds, configuring multi-sig escrow access points, and processing the secure transaction on SWIFT channels.
                    </p>
                  </div>
                </div>
              )}

              {simulationStatus === "completed" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between animate-fade-in text-left">
                  
                  {/* Certificate Top */}
                  <div className="flex justify-between items-start border-b border-white/5 pb-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-green-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        ACCESS MEMBER CLEARED
                      </span>
                      <h4 className="text-white font-serif text-lg md:text-xl font-bold italic tracking-tight">
                        GLOBAL ENERGY ALLOCATION EXCHANGE
                      </h4>
                      <p className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">REGISTRATION CERTIFICATE & ESCROW LEDGER TICKET</p>
                    </div>
                    <Gem className="h-8 w-8 text-orange-500 shrink-0" />
                  </div>

                  {/* Certificate Center Metadata */}
                  <div className="py-6 space-y-4 font-mono text-[11px] leading-relaxed text-gray-300">
                    <div>
                      <span className="text-gray-500 uppercase text-[9px] block">AUTHORIZED ACCESS GRANTEER:</span>
                      <strong className="text-white text-sm font-semibold">{companyName.toUpperCase()}</strong>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500 uppercase text-[9px] block">STAKEHOLDER CLASS:</span>
                        <span className="text-orange-400 font-bold uppercase">{selectedProfile} tier</span>
                      </div>
                      <div>
                        <span className="text-gray-500 uppercase text-[9px] block">JURISDICTION REGION:</span>
                        <span className="text-white font-bold">{jurisdiction}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500 uppercase text-[9px] block">FEE ARRANGEMENT:</span>
                        <span className="text-white font-bold">{getPriceLabel(selectedProfile)} {currentDurationLabel}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 uppercase text-[9px] block">TRUST LEVEL STAMPER:</span>
                        <span className="text-green-400 font-bold uppercase flex items-center gap-1">
                          Class-{verificationLevel === "sovereign" ? "3 " : verificationLevel === "priority" ? "2 " : "1 "}
                          Confirmed
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl relative">
                      <span className="text-gray-500 uppercase text-[9px] block mb-0.5">CRYPTOGRAPHIC SEAT ACCESS KEY:</span>
                      <div className="text-white font-bold break-all select-all font-mono text-[10px] tracking-wider bg-black/60 p-2 rounded border border-white/5">
                        {mockAccessKey}
                      </div>
                    </div>
                  </div>

                  {/* Certificate Footer Stamp */}
                  <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[10px] font-mono text-gray-500">
                    <div>
                      <span>ISSUANCE DATE: {mockCertDate}</span>
                      <span className="block text-[8px] text-gray-600">GEAX Clearinghouse System (Lusaka SADC Node)</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          window.print();
                        }}
                        className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-[10px] font-bold transition-all"
                      >
                        Print Ledger Ticket
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

        {/* Global Payment rails disclaimer / list trust */}
        <div className="p-10 bg-zinc-900 border border-white/10 rounded-3xl text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <ShieldCheck className="h-10 w-10" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Escrow Payment Gateway</h3>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            All high-value transactions on GEAX™ are secured through our integrated Escrow Payment Gateway. Funds are held securely and only released upon verified contract milestones, ensuring 100% protection for both buyers and producers.
          </p>
          
          <div className="mb-10 text-center">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Integrated Payment Rails</div>
            <div className="flex flex-wrap items-center justify-center gap-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="flex items-center gap-2 group">
                <div className="h-10 w-32 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center px-4 group-hover:bg-blue-600/10 group-hover:border-blue-500/30 transition-all">
                  <span className="text-white font-bold italic tracking-tighter text-xl">Pay<span className="text-blue-500">Pal</span></span>
                </div>
              </div>
              <div className="flex items-center gap-2 group">
                <div className="h-10 w-32 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center px-4 group-hover:bg-purple-600/10 group-hover:border-purple-500/30 transition-all">
                  <span className="text-white font-bold tracking-tighter text-2xl">stripe</span>
                </div>
              </div>
              <div className="flex items-center gap-2 group">
                <div className="h-10 w-32 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center px-4 group-hover:bg-green-600/10 group-hover:border-green-500/30 transition-all">
                  <span className="text-white font-bold tracking-tighter text-xl">Pesa<span className="text-green-500">Pal</span></span>
                </div>
              </div>
              <div className="flex items-center gap-2 group">
                <div className="h-10 w-32 bg-white/5 rounded-lg border border-orange-500/50 flex items-center justify-center px-4 group-hover:bg-orange-500/10 transition-all">
                  <ShieldCheck className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-white font-bold text-xs uppercase tracking-widest">ESCROW</span>
                </div>
              </div>
              <div className="flex items-center gap-2 group">
                <div className="h-10 w-32 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center px-4 group-hover:bg-orange-600/10 group-hover:border-orange-500/30 transition-all">
                   <Landmark className="h-5 w-5 mr-2 text-gray-400 group-hover:text-orange-500 transition-colors" />
                   <span className="text-white font-bold text-xs uppercase tracking-widest">SWIFT</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold text-orange-500 border border-orange-500/20 uppercase tracking-widest font-bold">Milestone-Based Release</span>
            <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold text-orange-500 border border-orange-500/20 uppercase tracking-widest font-bold">Multi-Signature Approval</span>
            <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold text-orange-500 border border-orange-500/20 uppercase tracking-widest font-bold">Global Compliance</span>
          </div>
        </div>

      </div>
    </div>
  );
};

const BuyerPage = ({ setPage }: { setPage: (p: Page) => void }) => (
  <div className="pt-32 pb-24 px-4 bg-zinc-950 min-h-screen">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter leading-tight">
            Secure Long-Term <br />Energy Supply
          </h1>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed">
            Gain strategic control over future energy access. GEAX™ provides governments and corporations the infrastructure to ensure national energy security and industrial stability.
          </p>
          
          <div className="space-y-8 mb-12">
            <h3 className="text-white font-bold text-xl">Key Benefits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Guaranteed supply stability",
                "Protection against price volatility",
                "Access to global energy markets",
                "Long-term planning advantage"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <ShieldCheck className="h-5 w-5 text-orange-500 mr-3" />
                  <span className="text-gray-300 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => setPage("login")} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold transition-all">Portal Login</button>
            <button onClick={() => setPage("signup")} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-full font-bold transition-all">Request Access</button>
          </div>
        </div>
        <div className="bg-zinc-900 p-10 rounded-3xl border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-8">Strategic Use Cases</h3>
          <div className="space-y-6">
            {[
              { title: "National Energy Security", desc: "Governments securing base-load power for critical infrastructure and population needs." },
              { title: "Industrial Energy Supply", desc: "Large-scale manufacturing and tech hubs locking in energy costs for decade-long horizons." },
              { title: "Infrastructure Projects", desc: "Financing new energy developments in exchange for guaranteed future allocation." }
            ].map((uc, i) => (
              <div key={i} className="p-6 bg-black/30 rounded-2xl border border-white/5">
                <h4 className="text-orange-500 font-bold mb-2">{uc.title}</h4>
                <p className="text-gray-400 text-sm">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProducerPage = ({ setPage }: { setPage: (p: Page) => void }) => (
  <div className="pt-32 pb-24 px-4 bg-black min-h-screen">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1">
          <div className="bg-zinc-900 p-10 rounded-3xl border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-8">What You Can List</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Building2, label: "Power Plants" },
                { icon: Zap, label: "Renewable Projects" },
                { icon: Globe, label: "LNG Capacity" },
                { icon: TrendingUp, label: "Future Production" }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-black/30 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                  <item.icon className="h-8 w-8 text-orange-500 mb-3" />
                  <span className="text-white font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter leading-tight">
            Monetize Future <br />Energy Capacity
          </h1>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed">
            Convert future production into immediate financial value. GEAX™ connects energy producers with global institutional buyers to accelerate project development and reduce risk.
          </p>
          
          <div className="space-y-8 mb-12">
            <h3 className="text-white font-bold text-xl">Producer Benefits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Secure upfront capital",
                "Reduce project risk",
                "Access global buyers",
                "Accelerate project development"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <CheckCircle2 className="h-5 w-5 text-orange-500 mr-3" />
                  <span className="text-gray-300 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => setPage("login")} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold transition-all">Portal Login</button>
            <button onClick={() => setPage("signup")} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-full font-bold transition-all">Request Access</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const BuyerDashboard = ({ setPage }: { setPage: (p: Page) => void }) => {
  const { user, profile } = useAuth();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "contracts"), where("buyerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setContracts(snapshot.docs.map(doc => doc.data()));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, "list", "contracts");
    });
    return () => unsubscribe();
  }, [user]);

  const stats = [
    { label: "Total Reserved", value: contracts.reduce((acc, c) => acc + (parseFloat(c.capacity) || 0), 0).toFixed(1) + " GW", sub: "Live allocation", icon: Zap },
    { label: "Active Contracts", value: contracts.length.toString(), sub: `${contracts.filter(c => c.status === "Pending").length} pending`, icon: FileText },
    { label: "Next Delivery", value: "Oct 2026", sub: "Scheduled", icon: Globe },
    { label: "Escrow Balance", value: "$840M", sub: "Collateralized", icon: ShieldCheck }
  ];

  return (
    <div className="pt-32 pb-24 px-4 bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome, {profile?.name || "Buyer"}</h1>
            <p className="text-gray-400">{profile?.company} — Institutional Portfolio</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setPage("producer-dashboard")} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all">Producer Portal</button>
            <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition-all">Browse Capacity</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="p-6 bg-zinc-900 border border-white/10 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</span>
                <stat.icon className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-orange-500/70">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Active Reservations</h3>
                <button onClick={() => setPage("contracts")} className="text-orange-500 text-sm font-bold hover:underline">Marketplace</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black/20 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                      <th className="px-6 py-4">Contract Title</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Capacity</th>
                      <th className="px-6 py-4">Producer</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      [1, 2, 3].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-6 py-4 bg-white/5 h-12"></td>
                        </tr>
                      ))
                    ) : contracts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">No active contracts found in your portfolio.</td>
                      </tr>
                    ) : (
                      contracts.map((row, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer">
                          <td className="px-6 py-4 text-sm font-bold text-white">{row.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{row.type}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{row.capacity}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{row.producerName}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${
                              row.status === 'Active' ? 'bg-green-500/10 text-green-500' : 
                              row.status === 'Pending' ? 'bg-orange-500/10 text-orange-500' : 
                              'bg-gray-500/10 text-gray-400'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        <div className="space-y-8">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Funding & Settlement</h3>
            <div className="space-y-4">
              <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 bg-orange-500/10 border border-orange-500/20 rounded flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">GEAX™ Native Escrow</div>
                    <div className="text-[9px] text-orange-500 font-bold uppercase tracking-widest">Default Gateway</div>
                  </div>
                </div>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest px-2 py-1 bg-white/5 rounded border border-white/10 italic">Secured</span>
              </div>
              <div className="p-4 bg-black/30 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 bg-white/5 border border-white/10 rounded flex items-center justify-center">
                    <span className="text-[8px] font-bold italic tracking-tighter text-white">Pay<span className="text-blue-500">Pal</span></span>
                  </div>
                  <div className="text-sm font-bold text-white">PayPal Business</div>
                </div>
                <button className="text-[10px] font-bold text-orange-500 hover:underline">Manage</button>
              </div>
              <div className="p-4 bg-black/30 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 bg-white/5 border border-white/10 rounded flex items-center justify-center">
                    <span className="text-[10px] font-bold tracking-tighter text-white">stripe</span>
                  </div>
                  <div className="text-sm font-bold text-white">Stripe Connect</div>
                </div>
                <button className="text-[10px] font-bold text-orange-500 hover:underline">Manage</button>
              </div>
              <div className="p-4 bg-black/30 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 bg-white/5 border border-white/10 rounded flex items-center justify-center">
                    <span className="text-[8px] font-bold tracking-tighter text-white text-green-500">Pesa<span className="text-white">Pal</span></span>
                  </div>
                  <div className="text-sm font-bold text-white">PesaPal Global</div>
                </div>
                <button className="text-[10px] font-bold text-orange-500 hover:underline">Link</button>
              </div>
              <div className="p-4 bg-black/30 rounded-xl border border-white/5 flex items-center justify-between opacity-50">
                <div className="flex items-center gap-3">
                   <Landmark className="h-4 w-4 text-gray-500" />
                   <div className="text-sm font-bold text-white">Global SWIFT</div>
                </div>
                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Primary</span>
              </div>
            </div>
            <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all">
              Add New Funding Source
            </button>
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Market Watch</h3>
            <div className="space-y-4">
              {[
                { label: "Brent Crude", price: "$84.62", change: "+1.2%" },
                { label: "Henry Hub", price: "$3.42", change: "-0.8%" },
                { label: "EU Carbon", price: "€92.15", change: "+0.5%" }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-black/30 rounded-xl border border-white/5">
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</div>
                    <div className="text-white font-bold">{item.price}</div>
                  </div>
                  <div className={`text-xs font-bold ${item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {item.change}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setPage("intelligence")} className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-400 transition-all">Full Market Analysis</button>
          </div>

          <div className="bg-orange-500 rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <ShieldCheck className="h-24 w-24" />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10">Escrow Security</h3>
            <p className="text-sm text-orange-100 mb-6 relative z-10">Your $840M allocation balance is secured through institutional-grade escrow.</p>
            <button className="bg-black/20 hover:bg-black/30 px-4 py-2 rounded-lg text-xs font-bold transition-all relative z-10">Review Audit Logs</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

const ProducerDashboard = ({ setPage }: { setPage: (p: Page) => void }) => {
  const { user, profile } = useAuth();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    capacity: "",
    duration: "",
    buyerName: "",
    producerName: profile?.name || "",
    status: "Pending",
    type: "",
    highlights: "",
    terms: ""
  });

  const handleCreateContract = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      const contractId = `GEAX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newContract = {
        ...formData,
        id: contractId,
        producerId: user.uid,
        buyerId: "SYSTEM-PENDING",
        highlights: formData.highlights.split(',').map(h => h.trim()).filter(h => h !== ""),
        terms: formData.terms.split('\n').filter(t => t.trim() !== ""),
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "contracts", contractId), newContract);
      setIsModalOpen(false);
      setFormData({
        title: "",
        value: "",
        capacity: "",
        duration: "",
        buyerName: "",
        producerName: profile?.name || "",
        status: "Pending",
        type: "",
        highlights: "",
        terms: ""
      });
    } catch (error) {
      handleFirestoreError(error, "write", "contracts");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "contracts"), where("producerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setContracts(snapshot.docs.map(doc => doc.data()));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, "list", "contracts");
    });
    return () => unsubscribe();
  }, [user]);

  const stats = [
    { label: "Revenue Allocated", value: "$" + contracts.reduce((acc, c) => acc + (parseFloat(c.value.replace(/[^0-9.]/g, '')) || 0), 0).toFixed(1) + "B", sub: "Committed capital", icon: TrendingUp },
    { label: "Active Listings", value: contracts.length.toString(), sub: "Managed projects", icon: Building2 },
    { label: "Capacity Sold", value: contracts.reduce((acc, c) => acc + (parseFloat(c.capacity) || 0), 0).toFixed(1) + " GW", sub: "Market delivery", icon: Zap },
    { label: "Buyer Interest", value: "84", sub: "High demand", icon: BarChart3 }
  ];

  return (
    <div className="pt-32 pb-24 px-4 bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome, {profile?.name || "Producer"}</h1>
            <p className="text-gray-400">{profile?.company} — Strategic Production Suite</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setPage("buyer-dashboard")} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all">Buyer Portal</button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              List New Capacity
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="p-6 bg-zinc-900 border border-white/10 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</span>
                <stat.icon className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-orange-500/70">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Active Listings</h3>
                <button onClick={() => setPage("contracts")} className="text-orange-500 text-sm font-bold hover:underline">Manage All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black/20 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                      <th className="px-6 py-4">Project Title</th>
                      <th className="px-6 py-4">Buyer</th>
                      <th className="px-6 py-4">Capacity</th>
                      <th className="px-6 py-4">Value</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      [1, 2, 3].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-6 py-4 bg-white/5 h-12"></td>
                        </tr>
                      ))
                    ) : contracts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">No energy listings found. Start by listing your project capacity.</td>
                      </tr>
                    ) : (
                      contracts.map((row, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer">
                          <td className="px-6 py-4 text-sm font-bold text-white">{row.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{row.buyerName}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{row.capacity}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{row.value}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${
                              row.status === 'Active' ? 'bg-green-500/10 text-green-500' : 
                              row.status === 'Pending' ? 'bg-orange-500/10 text-orange-500' : 
                              'bg-gray-500/10 text-gray-400'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        <div className="space-y-8">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Payout Channels</h3>
            <div className="space-y-4">
              <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 bg-orange-500/10 border border-orange-500/20 rounded flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Escrow Settlement</div>
                    <div className="text-[9px] text-orange-500 font-bold uppercase tracking-widest">Native Rail</div>
                  </div>
                </div>
                <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Live</span>
              </div>
              <div className="p-4 bg-black/30 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 bg-white/5 border border-white/10 rounded flex items-center justify-center">
                    <span className="text-[8px] font-bold italic tracking-tighter text-white">Pay<span className="text-blue-500">Pal</span></span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">PayPal Settlements</div>
                    <div className="text-[9px] text-green-500 font-bold uppercase tracking-widest">Active</div>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-orange-500 hover:underline">Settings</button>
              </div>
              <div className="p-4 bg-black/30 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 bg-white/5 border border-white/10 rounded flex items-center justify-center">
                    <span className="text-[10px] font-bold tracking-tighter text-white">stripe</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Stripe Payouts</div>
                    <div className="text-[9px] text-orange-500 font-bold uppercase tracking-widest">Verification Pending</div>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-orange-500 hover:underline">Complete</button>
              </div>
              <div className="p-4 bg-black/30 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 bg-white/5 border border-white/10 rounded flex items-center justify-center">
                    <span className="text-[8px] font-bold tracking-tighter text-white text-green-500">Pesa<span className="text-white">Pal</span></span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">PesaPal Africa</div>
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Not Linked</div>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-orange-500 hover:underline">Setup</button>
              </div>
            </div>
            <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all">
              Configure Settlement Rules
            </button>
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Buyer Inquiries</h3>
            <div className="space-y-4">
              {[
                { buyer: "European Energy Grid", cap: "500 MW", time: "2h ago" },
                { buyer: "Global Tech Corp", cap: "1.2 GW", time: "5h ago" },
                { buyer: "National Power Auth", cap: "200 MW", time: "1d ago" }
              ].map((item, i) => (
                <div key={i} className="p-4 bg-black/30 rounded-xl border border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-bold text-white">{item.buyer}</div>
                    <div className="text-[10px] text-gray-500">{item.time}</div>
                  </div>
                  <div className="text-xs text-gray-400">Requesting <span className="text-orange-500 font-bold">{item.cap}</span> allocation</div>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold rounded-lg transition-all">Respond</button>
                    <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold rounded-lg transition-all">Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Production Forecast</h3>
            <div className="h-32 flex items-end gap-2 px-2">
              {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 bg-orange-500/20 rounded-t-sm relative group">
                  <div style={{ height: `${h}%` }} className="bg-orange-500 rounded-t-sm transition-all group-hover:bg-orange-400" />
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 font-bold">M{i+1}</div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-10 text-center">Projected GW output for the next 7 months.</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                <h2 className="text-xl font-bold text-white">Create New Allocation Contract</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleCreateContract} className="p-8 overflow-y-auto space-y-6 flex-grow custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Project Title</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. North Sea Wind Phase II"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Buyer</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. European Energy Consortium"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all"
                      value={formData.buyerName}
                      onChange={e => setFormData({ ...formData, buyerName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contract Value</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. $1.2 Billion"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all"
                      value={formData.value}
                      onChange={e => setFormData({ ...formData, value: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Capacity (GW/MW)</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. 2.5 GW"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all"
                      value={formData.capacity}
                      onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Duration</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. 15 Years"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all"
                      value={formData.duration}
                      onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Energy Type</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Wind (Offshore)"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contract Highlights (Comma separated)</label>
                  <textarea 
                    placeholder="e.g. Fixed Price Floor, Escrow-Backed, Guaranteed Uptime"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all h-20 resize-none"
                    value={formData.highlights}
                    onChange={e => setFormData({ ...formData, highlights: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contract Terms (One per line)</label>
                  <textarea 
                    required
                    placeholder="1. ALLOCATION: ...&#10;2. PRICING: ..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all h-32 resize-none"
                    value={formData.terms}
                    onChange={e => setFormData({ ...formData, terms: e.target.value })}
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-sm font-bold text-white transition-all shadow-lg shadow-orange-500/20"
                  >
                    {isSubmitting ? "Creating..." : "Initialize Allocation"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
};

const ContractsPage = () => {
  const { user } = useAuth();
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Digital Contracting Suite Options
  const [activeSuiteTab, setActiveSuiteTab] = useState<"marketplace" | "suite">("marketplace");
  const [docType, setDocType] = useState<"loi" | "mou" | "ncnda" | "allocation" | "ppa">("loi");
  const [buyerName, setBuyerName] = useState("Katanga Smelting Corporation");
  const [producerName, setProducerName] = useState("B & M Masterlink LTD");
  const [assetName, setAssetName] = useState("Kafue Gorge West Hydro-Core");
  const [capacityMW, setCapacityMW] = useState("45");
  const [contractDuration, setContractDuration] = useState("10 Years");
  const [pricePerMWh, setPricePerMWh] = useState("44.50");
  const [governingJurisdiction, setGoverningJurisdiction] = useState("SADC Tribunal, Lusaka Headquarters");
  const [signingDate, setSigningDate] = useState("2026-05-21");
  const [isSigned, setIsSigned] = useState(false);
  const [signatureHash, setSignatureHash] = useState("");
  const [signingEntity, setSigningEntity] = useState("");
  const [recentClaims, setRecentClaims] = useState<any[]>([
    { id: "LOI-2026-901", type: "LOI", title: "Katanga Allocation Intent Lock", status: "Active (Muted)", date: "2026-05-19" },
    { id: "NCNDA-Master-08", type: "NCNDA", title: "Kansanshi Copper Mutual NDA", status: "Multi-Signature Locked", date: "2026-05-21" }
  ]);

  useEffect(() => {
    const qSample = query(collection(db, "sample_contracts"), orderBy("createdAt", "desc"));
    const qLive = query(collection(db, "contracts"), orderBy("createdAt", "desc"));

    let sampleData: any[] = [];
    let liveData: any[] = [];

    const unsubscribeSample = onSnapshot(qSample, (snapshot) => {
      sampleData = snapshot.docs.map(doc => ({ id: doc.id, isSample: true, ...doc.data() }));
      setContracts([...sampleData, ...liveData].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching sample contracts:", error);
    });

    const unsubscribeLive = onSnapshot(qLive, (snapshot) => {
      liveData = snapshot.docs.map(doc => ({ id: doc.id, isSample: false, ...doc.data() }));
      setContracts([...sampleData, ...liveData].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setLoading(false);
    }, (error) => {
      // It's okay if this fails (e.g. permission issues for non-logged in)
      console.log("Live contracts omitted or restricted");
      setContracts([...sampleData]);
      setLoading(false);
    });

    return () => {
      unsubscribeSample();
      unsubscribeLive();
    };
  }, [user]);

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contract.buyerName && contract.buyerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (contract.producerName && contract.producerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (contract.buyer && contract.buyer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (contract.producer && contract.producer.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "All" || contract.status === statusFilter;
    const matchesType = typeFilter === "All" || (contract.type && contract.type.includes(typeFilter));

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="pt-32 pb-24 px-4 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation Tabs Switcher */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-zinc-900 border border-white/5 p-1 rounded-2xl">
            <button
              onClick={() => setActiveSuiteTab("marketplace")}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSuiteTab === "marketplace"
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Globe className="h-4 w-4" />
              Energy Allocation Marketplace
            </button>
            <button
              onClick={() => setActiveSuiteTab("suite")}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSuiteTab === "suite"
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              Sovereign Digital Contracting Suite
            </button>
          </div>
        </div>

        {activeSuiteTab === "marketplace" ? (
          <>
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter">Energy Allocation Marketplace</h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">High-value institutional contracts and strategic allocations secured via GEAX™ infrastructure.</p>
          
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by ID, Title, Buyer or Producer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500 transition-all shadow-xl shadow-black/50"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 p-1 rounded-xl">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-3 mr-1">Status:</span>
                {["All", "Active", "Fully Collateralized", "Verified Escrow", "Milestone-Based"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === status 
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 p-1 rounded-xl">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-3 mr-1">Type:</span>
                {["All", "Wind", "Solar", "LNG"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      typeFilter === type 
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="bg-zinc-900 border border-white/10 rounded-3xl p-8 h-64 animate-pulse" />
            ))
          ) : filteredContracts.length === 0 ? (
            <div className="lg:col-span-3 text-center py-24 text-gray-500 italic border border-dashed border-white/10 rounded-3xl">
              No contracts found matching your search criteria.
            </div>
          ) : (
            filteredContracts.map((contract, i) => (
            <div key={i} className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
              <div className="p-8 border-b border-white/10 bg-gradient-to-br from-orange-500/5 to-transparent">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-2">
                    {contract.isSample && (
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 py-1 bg-white/5 rounded-full border border-white/10 italic">
                        Project Specimen
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest px-2 py-1 bg-orange-500/10 rounded-full border border-orange-500/20">
                      {contract.id}
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{contract.title}</h3>
                <div className="text-3xl font-bold text-orange-500 mb-4">{contract.value}</div>
                <div className="flex items-center text-sm text-gray-400">
                  <Globe className="h-4 w-4 mr-2 text-gray-500" />
                  {contract.type}
                </div>
              </div>

              <div className="p-8 space-y-6 flex-grow">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Capacity</div>
                    <div className="text-white font-bold">{contract.capacity}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Duration</div>
                    <div className="text-white font-bold">{contract.duration}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Buyer</div>
                  <div className="text-white font-medium">{contract.buyer || contract.buyerName}</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Producer</div>
                  <div className="text-white font-medium">{contract.producer || contract.producerName}</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Key Terms</div>
                  <ul className="mt-2 space-y-2">
                    {contract.highlights.map((h, j) => (
                      <li key={j} className="flex items-center text-xs text-gray-400">
                        <CheckCircle2 className="h-3 w-3 text-orange-500 mr-2" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-8 pt-0 mt-auto">
                <div className="p-4 bg-black/30 rounded-2xl border border-white/5 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Escrow Status</span>
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-sm font-bold text-white">{contract.status}</div>
                </div>
                <button 
                  onClick={() => setSelectedContract(contract)}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all"
                >
                  View Full Contract Terms
                </button>
              </div>
            </div>
            ))
          )}
        </div>

        {filteredContracts.length === 0 && (
          <div className="py-20 text-center bg-zinc-900 rounded-[3rem] border border-white/5">
            <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-gray-700" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No contracts found</h3>
            <p className="text-gray-500">We couldn't find any contract matching your current filter criteria.</p>
            <button 
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
                setTypeFilter("All");
              }}
              className="mt-8 text-orange-500 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        <div className="mt-20 p-12 bg-zinc-900/50 border border-white/10 rounded-[3rem] text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Custom Contract Engineering</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            GEAX™ provides the legal and financial framework to design custom energy allocation contracts tailored to your specific strategic needs.
          </p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full font-bold transition-all">
            Consult with Contract Experts
          </button>
        </div>
      </>
    ) : (
      <div className="space-y-12 text-left">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-orange-500 uppercase tracking-widest mb-2 block animate-pulse">
            INSTITUTIONAL TRANSACTION PLATFORM
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
            Sovereign Digital Contracting
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Legally binding smart documentation generator for high-value cross-border energy allocations and complex pre-production hedging.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Form Config Side */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
              <div>
                <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-orange-500" /> Contract Configurator
                </h3>
                <p className="text-xs text-gray-400">Specify bilateral parameters to instantly update your sovereign draft.</p>
              </div>

              {/* Document Type Selectors */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Select Legal Framework
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: "loi", label: "LOI (Letter of Intent)" },
                    { id: "mou", label: "MOU (Coordination)" },
                    { id: "ncnda", label: "NCNDA (Confidential)" },
                    { id: "allocation", label: "Allocation Agreement" },
                    { id: "ppa", label: "PPA (Off-Take Purchase)" }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setDocType(type.id as any);
                        setIsSigned(false);
                        setSignatureHash("");
                      }}
                      className={`px-3 py-2.5 rounded-xl text-[11px] font-bold border transition-all text-left ${
                        docType === type.id
                          ? "bg-orange-500 text-white border-orange-600 shadow-lg shadow-orange-500/15"
                          : "bg-black/40 border-white/5 text-gray-400 hover:text-white hover:bg-black/60"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-white/5 pt-5">
                {/* Buyer Entity input */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Off-Taker / Buyer Legal Entity
                  </label>
                  <input 
                    type="text"
                    value={buyerName}
                    onChange={e => {
                      setBuyerName(e.target.value);
                      setIsSigned(false);
                    }}
                    placeholder="e.g. SADC Smelting Conglomerate Ltd"
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-orange-500"
                  />
                </div>

                {/* Producer Entity input */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Producer / Supplying Entity
                  </label>
                  <input 
                    type="text"
                    value={producerName}
                    onChange={e => {
                      setProducerName(e.target.value);
                      setIsSigned(false);
                    }}
                    placeholder="e.g. B & M Masterlink LTD"
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-orange-500"
                  />
                </div>

                {/* Asset Name Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Target Generation Asset
                  </label>
                  <select
                    value={assetName}
                    onChange={e => {
                      setAssetName(e.target.value);
                      setIsSigned(false);
                    }}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-orange-500"
                  >
                    <option value="Kafue Gorge West Hydro-Core">Kafue Gorge West Hydro-Core (DRC-Zam Corridors)</option>
                    <option value="Luwingu Solar Array block V">Luwingu Solar Array Phase III Block V</option>
                    <option value="Kariba Hydro Sovereign extension">Kariba Hydro Sovereign Extension Complex</option>
                    <option value="Solwezi Clean Geothermal Plant">Solwezi Clean Geothermal Thermal Core</option>
                  </select>
                </div>

                {/* Grid Volume Options (MW) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-[10px] mb-1.5 font-bold text-gray-500">
                      <span className="uppercase tracking-widest">Allocation Capacity</span>
                      <span className="text-orange-400 font-mono font-bold">{capacityMW} MW</span>
                    </div>
                    <input 
                      type="range"
                      min="5"
                      max="250"
                      step="5"
                      value={capacityMW}
                      onChange={e => {
                        setCapacityMW(e.target.value);
                        setIsSigned(false);
                      }}
                      className="w-full accent-orange-500 h-1 bg-zinc-800 rounded-lg outline-none cursor-ew-resize"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Trading Duration
                    </label>
                    <select 
                      value={contractDuration}
                      onChange={e => {
                        setContractDuration(e.target.value);
                        setIsSigned(false);
                      }}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-orange-500"
                    >
                      <option value="5 Years">5 Years Strategic Block</option>
                      <option value="10 Years">10 Years Sovereign Off-Take</option>
                      <option value="15 Years">15 Years Infrastructure Anchor</option>
                      <option value="25 Years">25 Years Sovereignty Covenant</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Base Tariff (USD/MWh)
                    </label>
                    <input 
                      type="number"
                      step="0.10"
                      value={pricePerMWh}
                      onChange={e => {
                        setPricePerMWh(e.target.value);
                        setIsSigned(false);
                      }}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Governing Jurisdiction
                    </label>
                    <select 
                      value={governingJurisdiction}
                      onChange={e => {
                        setGoverningJurisdiction(e.target.value);
                        setIsSigned(false);
                      }}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-orange-500"
                    >
                      <option value="SADC Tribunal, Lusaka Headquarters">SADC Tribunal, Lusaka</option>
                      <option value="London Court of International Arbitration">LCIA, London Court</option>
                      <option value="Singapore International Arbitration Centre">SIAC, Singapore Court</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Signing Execution Date
                  </label>
                  <input 
                    type="date"
                    value={signingDate}
                    onChange={e => {
                      setSigningDate(e.target.value);
                      setIsSigned(false);
                    }}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Left side signing button block */}
            <div className="bg-zinc-950 border border-white/5 rounded-3xl p-5 space-y-4">
              <div className="text-xs text-gray-400">
                <span className="text-orange-500 font-bold mr-1">💡 Sovereign Guideline:</span> NCNDA and LOI contracts must be fully executed before dispatching physical grid allocation agreements.
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                   Dual Representative Signatory Name
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={signingEntity}
                    onChange={e => setSigningEntity(e.target.value)}
                    placeholder="e.g. Moses Mwale, Managing Director"
                    className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={() => {
                      if (!signingEntity.trim()) return;
                      setIsSigned(true);
                      setSignatureHash("0x_sec_sign_" + Math.random().toString(16).substring(2, 10).toUpperCase() + "_block_" + Math.floor(Math.random() * 80000 + 420000));
                      // Append to history
                      const newDoc = {
                        id: `${docType.toUpperCase()}-2026-${Math.floor(Math.random() * 900 + 100)}`,
                        type: docType.toUpperCase(),
                        title: `${buyerName.split(' ')[0]} ${docType.toUpperCase()} Agreement`,
                        status: "Sovereign Locked",
                        date: signingDate
                      };
                      setRecentClaims(prev => [newDoc, ...prev]);
                    }}
                    disabled={isSigned || !signingEntity.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-orange-500/10"
                  >
                    Seal Draft
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Document Interactive Preview Columns */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between min-h-[550px]">
              
              {/* Ledger Stamp Watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-orange-500/5 flex items-center justify-center pointer-events-none p-4 select-none rotate-12">
                <div className="w-full h-full rounded-full border-4 border-dashed border-orange-500/5 flex flex-col items-center justify-center">
                  <span className="text-orange-500/5 text-xs font-mono font-bold uppercase tracking-widest text-center">GEAX SECURITIES TRUSTEE</span>
                  <span className="text-orange-500/5 text-[9px] font-mono tracking-widest">SOVEREIGN ESCROW COVENANT</span>
                </div>
              </div>

              {/* Document Header */}
              <div className="pb-8 border-b border-white/5 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-orange-500 uppercase tracking-widest">
                    <Lock className="h-3 w-3" /> OFFICIAL CONTRACT RECORD FILE
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif text-white tracking-tight mt-1">
                    {docType === "loi" && "LETTER OF INTENT: FUTURE ALLOCATION"}
                    {docType === "mou" && "MEMORANDUM OF UNDERSTANDING (COORDINATION)"}
                    {docType === "ncnda" && "NON-CIRCUMVENTION NON-DISCLOSURE INTERSTATE"}
                    {docType === "allocation" && "GUARANTEED ESCROW ALLOCATION DEED"}
                    {docType === "ppa" && "POWER PURCHASE DEED (PPA AGREEMENT)"}
                  </h3>
                  <p className="text-gray-500 text-[10px] font-mono mt-0.5">GEAX Platform ID: TX-SEC-{docType.toUpperCase()}-{signingDate.replace(/-/g, "")}</p>
                </div>
                <FileText className="h-10 w-10 text-orange-500 shrink-0" />
              </div>

              {/* Document Body Text with Serif Layout */}
              <div className="py-8 font-serif text-gray-300 text-xs sm:text-sm leading-relaxed space-y-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {docType === "loi" && (
                  <div className="space-y-4">
                    <p>
                      This Letter of Intent (&ldquo;LOI&rdquo;) is recorded on this <span className="text-white font-serif underline">{signingDate}</span>, by and between:
                    </p>
                    <p className="pl-4 border-l-2 border-orange-500/30 italic">
                      <strong>THE OFF-TAKER / BUYER:</strong> <span className="text-white font-bold">{buyerName}</span>, an institutional participant of the Global Energy Allocation Exchange.
                    </p>
                    <p className="pl-4 border-l-2 border-orange-500/30 italic">
                      <strong>THE PRODUCER / OPERATOR:</strong> <span className="text-white font-bold">{producerName}</span>, in legal association with the geological mining and supply core of B & M Masterlink LTD.
                    </p>
                    <p className="underline uppercase tracking-wide text-[10px] font-bold text-orange-400 font-mono">RECITALS & STRATEGIC STATEMENT</p>
                    <p>
                      WHEREAS, the Producer holds exclusive rights of extraction, mining, and supply of clean energy allocations from the power generator known as <span className="text-white font-bold">{assetName}</span>; and WHEREAS, the Buyer desires to secure a guaranteed long-term physical allocation block of <span className="text-white font-bold">{capacityMW} Megawatts (MW)</span> continuous volume.
                    </p>
                    <p>
                      NOW, THEREFORE, the Partners formulate this Intent under the preliminary transfer price of <span className="text-orange-500 font-bold">${pricePerMWh} per Megawatt Hour (MWh)</span> which shall remain locked for the duration of negotiations, preceding formal Power Purchase Agreement executions.
                    </p>
                  </div>
                )}

                {docType === "mou" && (
                  <div className="space-y-4">
                    <p>
                      This Memorandum of Understanding (&ldquo;MOU&rdquo;) is establishing regulatory consensus on this <span className="text-white font-serif underline">{signingDate}</span>, by and between:
                    </p>
                    <p className="pl-4 border-l-2 border-orange-500/30 italic">
                      <strong>ADMINISTRATIVE PARTY A:</strong> <span className="text-white font-bold">{buyerName}</span>
                    </p>
                    <p className="pl-4 border-l-2 border-orange-500/30 italic">
                      <strong>ADMINISTRATIVE PARTY B:</strong> <span className="text-white font-bold">{producerName}</span>
                    </p>
                    <p className="underline uppercase tracking-wide text-[10px] font-bold text-orange-400 font-mono">TECHNICAL AND INFRASTRUCTURE ACTION MATRICES</p>
                    <p>
                      1. <strong>Grid Interconnection Study:</strong> The parties commit to fund collective feasibility corridors to link <span className="text-white font-bold">{assetName}</span> into the designated regional interconnect boards.
                    </p>
                    <p>
                      2. <strong>Scale & Horizon Parameters:</strong> The cooperative target reserves a core volume block of <span className="text-white font-bold">{capacityMW} MW</span> extending for an operational term of <span className="text-white font-serif">{contractDuration}</span> from commissioning.
                    </p>
                    <p>
                      3. <strong>Arbitral Alignment:</strong> Feasibility actions and jurisdictional complaints shall register cleanly within the administrative zone of <span className="text-orange-400 font-mono text-xs">{governingJurisdiction}</span>.
                    </p>
                  </div>
                )}

                {docType === "ncnda" && (
                  <div className="space-y-4">
                    <p>
                      This Non-Circumvention Non-Disclosure Agreement (&ldquo;NCNDA&rdquo;) is executed on <span className="text-white font-serif underline">{signingDate}</span> to lock broker confidentiality:
                    </p>
                    <p className="pl-4 border-l-2 border-orange-500/30 italic">
                      <strong>DISCLOSING COMPANY:</strong> <span className="text-white font-bold">{producerName}</span>
                    </p>
                    <p className="pl-4 border-l-2 border-orange-500/30 italic">
                      <strong>RECEIVING COMPANY:</strong> <span className="text-white font-bold">{buyerName}</span>
                    </p>
                    <p className="underline uppercase tracking-wide text-[10px] font-bold text-orange-400 font-mono">SPECIFIC COVENANTS & SAFEGUARDS</p>
                    <p>
                      1. <strong>Strict Confidences:</strong> The Receiving Company shall hold all proprietary pricing corridors, private allocation clearing, and geological mining specifics of <span className="text-white font-bold">{assetName}</span> in high confidentiality.
                    </p>
                    <p>
                      2. <strong>Bilateral Non-Circumvention:</strong> The parties covenant not to circumvent either side by engaging in parallel discussions with the SADC sovereign state grid, mining sub-councils, or associated private clearing systems regarding the <span className="text-white font-bold">{capacityMW} MW</span> volume.
                    </p>
                    <p>
                      3. <strong>Governing Covenant:</strong> Enforced and legally locked under the laws of <span className="text-orange-400 font-sans">{governingJurisdiction}</span> for a non-revocable period of five (5) years.
                    </p>
                  </div>
                )}

                {docType === "allocation" && (
                  <div className="space-y-4">
                    <p>
                      This binding Sovereign Energy Allocation and Escrow Deed is recorded effective <span className="text-white font-serif underline">{signingDate}</span>:
                    </p>
                    <p className="pl-4 border-l-2 border-orange-500/30 italic">
                      <strong>PRIMARY ALLOCATEE:</strong> <span className="text-white font-bold">{buyerName}</span>
                    </p>
                    <p className="pl-4 border-l-2 border-orange-500/30 italic">
                      <strong>SOVEREIGN OPERATOR:</strong> <span className="text-white font-bold">{producerName}</span>
                    </p>
                    <p className="underline uppercase tracking-wide text-[10px] font-bold text-orange-400 font-mono">ESCROW COVENANTS & SEPARATION LAWS</p>
                    <p>
                      1. <strong>Capacity Allocation Lock:</strong> The Operator assigns an absolute priority offtake of <span className="text-white font-bold">{capacityMW} MW</span> representing physical energy generated of <span className="text-white font-bold">{assetName}</span>, ensuring zero double-claims.
                    </p>
                    <p>
                      2. <strong>Financial Custody Escrow:</strong> Clearing payments representing standard tariffs of <span className="text-orange-500 font-serif">${pricePerMWh} / MWh</span> shall transit solely via the GEAX™ decentralized clearinghouse pools.
                    </p>
                    <p>
                      3. <strong>Arbitration:</strong> Any irreconcilable settlement dispute will be arbitrated at <span className="text-orange-400 font-mono text-xs font-bold">{governingJurisdiction}</span>.
                    </p>
                  </div>
                )}

                {docType === "ppa" && (
                  <div className="space-y-4">
                    <p>
                      This definitive and binding Power Purchase Agreement (&ldquo;PPA&rdquo;) is executed on this <span className="text-white font-serif underline">{signingDate}</span>, by and between:
                    </p>
                    <p className="pl-4 border-l-2 border-orange-500/30 italic">
                      <strong>THE ELECTRICITY BUYER:</strong> <span className="text-white font-medium">{buyerName}</span>
                    </p>
                    <p className="pl-4 border-l-2 border-orange-500/30 italic">
                      <strong>THE ELECTRICITY PRODUCER:</strong> <span className="text-white font-medium">{producerName}</span>
                    </p>
                    <p className="underline uppercase tracking-wide text-[10px] font-bold text-orange-400 font-mono">SUPPLY TERMS & REMEDY DEED</p>
                    <p>
                      1. <strong>Power Commitment:</strong> The Producer agrees to generate, and Buyer commits to purchase, a continuous base load block representing <span className="text-white font-bold">{capacityMW} MW</span> from the asset <span className="text-white font-bold">{assetName}</span>.
                    </p>
                    <p>
                      2. <strong>Base Price Mechanism:</strong> Electrical energy is purchased at the flat rate tariff of <span className="text-white font-bold">${pricePerMWh} USD per MWh</span>, or linked adjustive index tracking from GEAX™ Commodity Index.
                    </p>
                    <p>
                      3. <strong>Operational Term:</strong> This contract is rigid, binding, and active for a term of <span className="text-white font-bold">{contractDuration}</span>, under <span className="text-orange-400">{governingJurisdiction}</span> laws.
                    </p>
                  </div>
                )}
              </div>

              {/* Document Footer/Signatures */}
              <div className="border-t border-white/5 pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-8 text-[10px] font-mono text-gray-400">
                  <div>
                    <span>Buyer Authorized Signatory</span>
                    <div className="h-10 border-b border-white/10 mt-2 flex items-end justify-start font-bold">
                      {isSigned ? (
                        <span className="text-green-400 font-serif italic text-xs tracking-wide">Signed via GEAX Cryptographic Key</span>
                      ) : (
                        <span className="text-gray-700 italic">Awaiting Seal...</span>
                      )}
                    </div>
                    <span className="text-white block mt-1">{buyerName.length > 25 ? buyerName.substring(0,25)+'...' : buyerName}</span>
                  </div>
                  <div>
                    <span>Producer Authorized Signatory</span>
                    <div className="h-10 border-b border-white/10 mt-2 flex items-end justify-start font-bold">
                      {isSigned ? (
                        <span className="text-orange-400 font-serif italic text-xs tracking-wide">Stamped: {signingEntity || "Moses Mwale"}</span>
                      ) : (
                        <span className="text-gray-700 italic">Awaiting Seal...</span>
                      )}
                    </div>
                    <span className="text-white block mt-1">{producerName}</span>
                  </div>
                </div>

                {isSigned && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between text-[10px] font-mono text-green-400 animate-slide-in font-bold">
                    <div className="truncate pr-4">
                      <strong>Signature Verified:</strong> {signatureHash}
                    </div>
                    <span className="bg-green-500 text-black px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shrink-0">State Locked</span>
                  </div>
                )}
              </div>

            </div>

            {/* Right Bottom historical document logs */}
            <div className="mt-5 p-5 bg-zinc-950 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">Active Clearinghouse Ledger Locks</span>
                <div className="flex flex-wrap gap-2">
                  {recentClaims.slice(0, 3).map((hist, hIdx) => (
                    <span key={hIdx} className="px-2 py-1 rounded bg-white/5 text-gray-400 text-[10px] border border-white/5 font-mono flex items-center gap-1.5 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      {hist.id} ({hist.type})
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Download className="h-3.5 w-3.5 text-gray-400" />
                  Save Draft & Print
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    )}
      </div>

      {/* Contract Detail Modal */}
      <AnimatePresence>
        {selectedContract && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContract(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white text-black rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <div className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">GEAX™ Institutional Framework</div>
                  <h2 className="text-2xl font-bold tracking-tight">Contract Document: {selectedContract.id}</h2>
                </div>
                <button 
                  onClick={() => setSelectedContract(null)}
                  className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="p-8 sm:p-12 overflow-y-auto flex-grow font-serif leading-relaxed">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-12">
                    <Zap className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-2 uppercase tracking-tighter">Energy Allocation Agreement</h1>
                    <div className="text-sm text-gray-500 italic">Execution Date: March 28, 2026</div>
                  </div>

                  <div className="grid grid-cols-2 gap-12 mb-12 pb-12 border-b border-gray-100">
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Between (The Buyer)</div>
                      <div className="font-bold text-lg">{selectedContract.buyer || selectedContract.buyerName}</div>
                      <div className="text-sm text-gray-500 mt-1">Institutional Entity ID: GEAX-B-9921</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">And (The Producer)</div>
                      <div className="font-bold text-lg">{selectedContract.producer || selectedContract.producerName}</div>
                      <div className="text-sm text-gray-500 mt-1">Production Entity ID: GEAX-P-4402</div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <h3 className="font-bold text-lg mb-4 border-l-4 border-orange-500 pl-4 uppercase tracking-tight">Recitals</h3>
                      <p className="text-gray-700">
                        WHEREAS, the Producer owns and operates the energy production asset known as <span className="font-bold">"{selectedContract.title}"</span>; and 
                        WHEREAS, the Buyer desires to secure a long-term allocation of energy capacity to ensure strategic supply stability; 
                        NOW, THEREFORE, the parties agree to the following binding terms:
                      </p>
                    </section>

                    <section>
                      <h3 className="font-bold text-lg mb-4 border-l-4 border-orange-500 pl-4 uppercase tracking-tight">Core Terms</h3>
                      <div className="space-y-4">
                        {selectedContract.terms.map((term: string, idx: number) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800">
                            {term}
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="pt-8 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Allocation Value</div>
                          <div className="text-3xl font-bold text-orange-600">{selectedContract.value}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Escrow Verification</div>
                          <div className="flex items-center text-green-600 font-bold">
                            <ShieldCheck className="h-5 w-5 mr-2" />
                            SECURED
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className="grid grid-cols-2 gap-8 pt-12">
                      <div className="space-y-4">
                        <div className="h-px bg-gray-300 w-full" />
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Authorized Signatory (Buyer)</div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-px bg-gray-300 w-full" />
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Authorized Signatory (Producer)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center gap-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">
                  <FileText className="h-4 w-4" />
                  Download PDF Copy
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
                  <Handshake className="h-4 w-4" />
                  Request Amendment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LoginPage = ({ setPage }: { setPage: (p: Page) => void }) => {
  const { user, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setPage("home");
    }
  }, [user, setPage]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const authUser = userCredential.user;
      
      const docSnap = await getDoc(doc(db, "users", authUser.uid));
      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        if (profile.role === "buyer") setPage("buyer-dashboard");
        else if (profile.role === "producer") setPage("producer-dashboard");
        else setPage("home");
      } else {
        setError("User profile not found. Please contact support.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-4 bg-zinc-950 min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2rem] p-8 sm:p-12 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-6">
            <Lock className="h-8 w-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Institutional Login</h1>
          <p className="text-gray-400">Access the GEAX™ Energy Exchange</p>
        </div>

        <div className="space-y-4 mb-8">
          <button 
            onClick={() => signInWithGoogle()}
            className="w-full bg-white text-black hover:bg-gray-100 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="relative mb-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <span className="relative px-4 bg-zinc-900 text-gray-500 text-xs font-bold uppercase tracking-widest">Or login with Email</span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Corporate Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@corporation.com"
                className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-orange-500 transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
              <button type="button" className="text-[10px] font-bold text-orange-500 hover:text-orange-400 uppercase tracking-widest">Forgot?</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-orange-500 transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
          >
            {loading ? <Zap className="h-5 w-5 animate-spin" /> : "Sign In to Portal"}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">
            Don't have an account?{" "}
            <button onClick={() => setPage("signup")} className="text-orange-500 font-bold hover:underline">Request Access</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const SignupPage = ({ setPage }: { setPage: (p: Page) => void }) => {
  const { signInWithGoogle } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    role: "buyer" as "buyer" | "producer" | "trader",
    region: "Europe"
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(2);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const profileData: UserProfile = {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        company: formData.company,
        role: formData.role,
        isVerified: false,
        paymentGateways: {
          paypal: false,
          stripe: false,
          pesapal: false,
          escrow: true
        }
      };

      await setDoc(doc(db, "users", user.uid), {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setPage("home");
      alert("Registration successful. Our compliance team will contact you to verify your identity.");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-4 bg-zinc-950 min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-[2rem] p-8 sm:p-12 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-6">
            <ShieldCheck className="h-8 w-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Institutional Registration</h1>
          <p className="text-gray-400">Join the Global Energy Allocation Exchange</p>
        </div>

        <div className="space-y-4 mb-8">
          <button 
            onClick={() => signInWithGoogle()}
            className="w-full bg-white text-black hover:bg-gray-100 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Instant Google Registration
          </button>
        </div>

        <div className="relative mb-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <span className="relative px-4 bg-zinc-900 text-gray-500 text-xs font-bold uppercase tracking-widest">Or Register with Email</span>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-10">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-orange-500" : "bg-white/5"}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-orange-500" : "bg-white/5"}`} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="John Doe"
                      className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Corporate Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="name@corporation.com"
                      className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Organization Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
                  <input 
                    type="text" 
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="Global Energy Corp"
                    className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Primary Interest</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none"
                >
                  <option value="buyer">Energy Buyer (Government/Corporate)</option>
                  <option value="producer">Energy Producer (Utility/IPB)</option>
                  <option value="trader">Institutional Trader</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                Next Step <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <div className="p-6 bg-orange-500/5 border border-orange-500/20 rounded-2xl mb-8">
                <div className="flex gap-4">
                  <Info className="h-6 w-6 text-orange-500 shrink-0" />
                  <p className="text-sm text-gray-400 leading-relaxed">
                    GEAX™ is a regulated institutional marketplace. All participants must undergo KYC/AML verification. Our compliance team will review your application.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-black/50 rounded-xl border border-white/5">
                  <input type="checkbox" required className="h-5 w-5 rounded border-white/10 bg-zinc-800 text-orange-500 focus:ring-orange-500" />
                  <label className="text-sm text-gray-400">I agree to the Institutional Terms of Service and Privacy Policy.</label>
                </div>
                <div className="flex items-center gap-3 p-4 bg-black/50 rounded-xl border border-white/5">
                  <input type="checkbox" required className="h-5 w-5 rounded border-white/10 bg-zinc-800 text-orange-500 focus:ring-orange-500" />
                  <label className="text-sm text-gray-400">I confirm that I am an authorized representative of my organization.</label>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-bold transition-all"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-all"
                >
                  Submit Registration
                </button>
              </div>
            </>
          )}
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <button onClick={() => setPage("login")} className="text-orange-500 font-bold hover:underline">Sign In</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const IntelligencePage = () => {
  const [pricing, setPricing] = useState<any[]>([]);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Growth Suite active tab
  const [activeTab, setActiveTab] = useState<"forecasting" | "auction" | "reservation" | "blockchain" | "grid" | "commodity" | "multicountry">("forecasting");

  // --- Subcomponent States ---
  // 1. AI Forecasting
  const [forecastRegion, setForecastRegion] = useState("Zambia Copperbelt");
  const [forecastSector, setForecastSector] = useState("Heavy Copper Smelting");
  const [forecastHorizon, setForecastHorizon] = useState(5); // years
  const [aiPredictorActive, setAiPredictorActive] = useState(true);

  // 2. Energy Auction System
  const [selectedAuctionId, setSelectedAuctionId] = useState("auc-101");
  const [userBidName, setUserBidName] = useState("");
  const [userBidPrice, setUserBidPrice] = useState(48); // USD/MWh
  const [userBidQuantity, setUserBidQuantity] = useState(15); // MW
  const [activeAuctions, setActiveAuctions] = useState([
    { id: "auc-101", title: "Copperbelt Solar Core - 50MW", basePrice: 42, highestBid: 45, highestBidder: "ZCCM-IH", endMinutes: 8, status: "Open" },
    { id: "auc-102", title: "Luapula Hydro Phase 1 - 120MW", basePrice: 38, highestBid: 41, highestBidder: "Katanga Smelters Corp", endMinutes: 14, status: "Open" },
    { id: "auc-103", title: "Kafue Gorge West Buffer - 30MW", basePrice: 45, highestBid: 45, highestBidder: "None (System Reserve)", endMinutes: 22, status: "Open" }
  ]);
  const [auctionLogs, setAuctionLogs] = useState<string[]>(["Auction system initialized securely.", "Real-time pricing corridors locked."]);

  // 3. Capacity Reservation Engine
  const [reserveAsset, setReserveAsset] = useState("Solar Photovoltaic");
  const [reserveTerm, setReserveTerm] = useState("10-Year Sovereign Hedge");
  const [reserveVolume, setReserveVolume] = useState(100); // MW
  const [generatedCertificate, setGeneratedCertificate] = useState<any | null>(null);
  const [certifying, setCertifying] = useState(false);

  // 4. Blockchain Vault
  const [blockchainSearchHash, setBlockchainSearchHash] = useState("");
  const [blockchainVerificationOutput, setBlockchainVerificationOutput] = useState<any | null>(null);
  const [contractLedger, setContractLedger] = useState([
    { hash: "0x_geax_183ab9", block: 451928, buyer: "Kansanshi Copper Mines", asset: "Solar PV", volume: "45 MW", duration: "10 Years", status: "Verified" },
    { hash: "0x_geax_cf291a", block: 451935, buyer: "State Utility Grid Board", asset: "Hydro Power", volume: "120 MW", duration: "25 Years", status: "Verified" },
    { hash: "0x_geax_7e31b0", block: 451941, buyer: "Luanshya Processing Hub", asset: "Biomass Co-Gen", volume: "12 MW", duration: "5 Years", status: "Verified" }
  ]);
  const [hashProgressState, setHashProgressState] = useState(false);

  // 5. Grid Controller Dashboard
  const [gridStress, setGridStress] = useState(45); // % stress
  const [gridBatteryDeploying, setGridBatteryDeploying] = useState(false);
  const [gridReserveCapacity, setGridReserveCapacity] = useState(240); // MWh reserve remaining

  // 6. Energy Commodity Indexing
  const [indexSelected, setIndexSelected] = useState("CleanPV_ZAM");
  const [calcTalcTons, setCalcTalcTons] = useState(5000); // metric tons of raw talc processing

  // 7. Multi-Country Tracking
  const [selectedSourceCountry, setSelectedSourceCountry] = useState("Zambia");
  const [selectedRecipientCountry, setSelectedRecipientCountry] = useState("DR Congo");
  const [transmissionFlowMW, setTransmissionFlowMW] = useState(40); // Megawatts

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [priceRes, newsRes] = await Promise.all([
          fetch("/api/market/pricing"),
          fetch("/api/market/news")
        ]);

        const priceData = await priceRes.json();
        const newsData = await newsRes.json();

        if (priceData.pricing) setPricing(priceData.pricing);
        if (priceData.indicators) setIndicators(priceData.indicators);
        if (newsData.articles) setNews(newsData.articles);
      } catch (error) {
        console.error("Failed to fetch intelligence data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Submit Bid action for Auction system
  const handlePlaceBid = (e: FormEvent) => {
    e.preventDefault();
    if (!userBidName.trim()) return;

    const auctionIndex = activeAuctions.findIndex(a => a.id === selectedAuctionId);
    if (auctionIndex === -1) return;

    const currentAuction = activeAuctions[auctionIndex];
    if (userBidPrice <= currentAuction.highestBid) {
      setAuctionLogs(prev => [
        `[Bid Denied] Bid by ${userBidName} of $${userBidPrice}/MWh must exceed current high bid of $${currentAuction.highestBid}/MWh`,
        ...prev
      ]);
      return;
    }

    // Accept bid
    const updatedAuctions = [...activeAuctions];
    updatedAuctions[auctionIndex] = {
      ...currentAuction,
      highestBid: userBidPrice,
      highestBidder: userBidName.trim()
    };

    setActiveAuctions(updatedAuctions);
    setAuctionLogs(prev => [
      `[Success] New Highest Bid registered: $${userBidPrice}/MWh for ${userBidQuantity}MW of energy by ${userBidName}!`,
      ...prev
    ]);
  };

  // Generate Reservation Certificate
  const handleGenerateCertificate = () => {
    setCertifying(true);
    setTimeout(() => {
      const code = `GEAX-RES-${reserveVolume}-${reserveAsset.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900000 + 100000)}`;
      setGeneratedCertificate({
        certId: code,
        assetClassValue: reserveAsset,
        allocationVolume: `${reserveVolume} Megawatt (MW) Block`,
        contractTerm: reserveTerm,
        signDate: new Date().toLocaleDateString(),
        escrowLedgerHash: "0x_geax_alloc_" + Math.random().toString(16).substring(2, 9),
        physicalEquivalence: `${(reserveVolume * 8.76).toFixed(1)} GWh Projected Annual Supply`
      });
      setCertifying(false);
    }, 1200);
  };

  // Verify Blockchain Document Code
  const handleVerifyContractHash = (e: FormEvent) => {
    e.preventDefault();
    if (!blockchainSearchHash.trim()) return;

    const target = blockchainSearchHash.trim().toLowerCase();
    const match = contractLedger.find(c => c.hash.toLowerCase().includes(target));

    if (match) {
      setBlockchainVerificationOutput({
        status: "Sovereign Stamp Verified",
        blockHeight: match.block,
        owner: match.buyer,
        assetClass: match.asset,
        quantity: match.volume,
        yearsSigned: match.duration,
        timestamp: "2026-05-21 13:11 State Lock System",
        arbitralZone: "SADC Energy Commission Clearinghouse"
      });
    } else {
      setBlockchainVerificationOutput({
        status: "Hash Not Found",
        error: "Verification failed. Hash does not match any current active allocation ledger on the platform."
      });
    }
  };

  // Custom visual demand series calculation
  const getDemandSeries = () => {
    const base = forecastRegion === "Zambia Copperbelt" ? 450 :
                 forecastRegion === "Shaba Province (DRC)" ? 680 :
                 forecastRegion === "Choma Wind Corridor" ? 120 : 380;
    
    const factor = forecastSector === "AI Hyper-scale Centers" ? 1.25 :
                   forecastSector === "Heavy Copper Smelting" ? 1.15 :
                   forecastSector === "Urban Megalopolis" ? 1.08 : 1.40;

    let points = [];
    for (let k = 1; k <= 10; k++) {
      const yearDemand = Math.round(base * Math.pow(factor, k / 6));
      const gridSupply = Math.round(base * 1.04 * (1 + k * 0.02));
      points.push({
        year: 2026 + k,
        demand: yearDemand,
        supply: gridSupply,
        shortfall: Math.max(0, yearDemand - gridSupply)
      });
    }
    return points;
  };

  const currentSeries = getDemandSeries();

  return (
    <div className="pt-32 pb-24 px-4 bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Badge & Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-wider mb-6">
            <Cpu className="h-4 w-4 text-orange-500" /> SYSTEM ENGINE
          </div>
          <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 tracking-tighter leading-none">
            AI Energy Intelligence
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Data-driven strategic indicators, high-impact allocation modeling, and sovereign grid metrics powering national development.
          </p>
        </div>

        {/* Global Energy Benchmarks Section */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
            <Globe className="h-5 w-5 text-orange-500" /> Global Energy Benchmarks (Real-Time)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="p-6 bg-zinc-900 border border-white/5 rounded-2xl h-32 animate-pulse" />
              ))
            ) : pricing.length > 0 ? (
              pricing.map((benchmark, i) => (
                <div key={i} className="p-6 bg-zinc-900/50 border border-white/5 rounded-2xl flex flex-col justify-between hover:bg-zinc-900 transition-colors">
                  <div>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2 block">{benchmark.label}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">{benchmark.price}</span>
                      <span className="text-gray-400 text-xs">{benchmark.unit}</span>
                    </div>
                  </div>
                  <div className={`mt-4 text-[10px] font-bold flex items-center ${benchmark.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {benchmark.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {benchmark.change} (Live)
                  </div>
                </div>
              ))
            ) : (
              [
                { label: "Brent Crude Oil", price: "$84.62", unit: "per bbl", change: "+1.2%", trend: "up" },
                { label: "Henry Hub Natural Gas", price: "$3.42", unit: "per MMBtu", change: "-0.8%", trend: "down" },
                { label: "EU Carbon Credits", price: "€92.15", unit: "per tonne", change: "+0.5%", trend: "up" },
                { label: "Global Solar PPA (Avg)", price: "$42.80", unit: "per MWh", change: "-2.1%", trend: "down" }
              ].map((benchmark, i) => (
                <div key={i} className="p-6 bg-zinc-900/50 border border-white/5 rounded-2xl flex flex-col justify-between hover:border-orange-500/20 transition-all duration-300">
                  <div>
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 block">{benchmark.label}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">{benchmark.price}</span>
                      <span className="text-gray-400 text-xs">{benchmark.unit}</span>
                    </div>
                  </div>
                  <div className={`mt-4 text-xs font-bold flex items-center ${benchmark.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {benchmark.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {benchmark.change} (24h)
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* HIGH-IMPACT GROWTH FEATURES PLATFORM CONCEPT CONTAINER */}
        <div className="border border-white/10 bg-zinc-900/40 rounded-[2.5rem] overflow-hidden p-6 md:p-10 mb-16 shadow-2xl">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/5 mb-10">
            <div>
              <span className="text-xs font-mono font-bold text-orange-500 uppercase tracking-widest mb-1 block">CORE STAGED RELEASES</span>
              <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight">Future Growth Concept Suite</h2>
              <p className="text-gray-400 text-xs md:text-sm mt-1">Simulate our core conceptual utilities designed for massive strategic scale.</p>
            </div>

            {/* Platform Feature Selector Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "forecasting", label: "Demand Forecasting", icon: Activity },
                { id: "auction", label: "Energy Auction Room", icon: Target },
                { id: "reservation", label: "Capacity Reservation", icon: Handshake },
                { id: "blockchain", label: "Blockchain Verification", icon: Lock },
                { id: "grid", label: "Grid Telemetry", icon: Cpu },
                { id: "commodity", label: "Commodity Indexing", icon: BarChart3 },
                { id: "multicountry", label: "Cross-Border Flows", icon: Globe }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 border transition-all ${
                    activeTab === t.id
                      ? "bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/20"
                      : "bg-black/40 border-white/5 text-gray-400 hover:text-white hover:bg-black/80"
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* TAB CONTENTS */}
          <div className="min-h-[500px]">

            {/* TAB 1: AI DEMAND FORECASTING */}
            {activeTab === "forecasting" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
                <div className="lg:col-span-4 space-y-6">
                  <div className="p-6 bg-zinc-950 border border-white/5 rounded-2xl">
                    <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-orange-500" />
                      Forecast Parametrics
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Target Integration Grid</label>
                        <select 
                          value={forecastRegion}
                          onChange={e => setForecastRegion(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs"
                        >
                          <option value="Zambia Copperbelt">Zambia Copperbelt Integrated Grid</option>
                          <option value="Shaba Province (DRC)">Shaba Province Interconnector (DRC)</option>
                          <option value="Choma Wind Corridor">Choma Wind Corridor</option>
                          <option value="Lusaka Tech City">Lusaka Tech City Sector B</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Prime Consumer Group</label>
                        <select 
                          value={forecastSector}
                          onChange={e => setForecastSector(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs"
                        >
                          <option value="Heavy Copper Smelting">Heavy Copper & Cobalt Smelting</option>
                          <option value="AI Hyper-scale Centers">AI Hyperscale Cloud Centers</option>
                          <option value="Urban Megalopolis">Urban Municipal High-Density Load</option>
                          <option value="Green-Hydrogen Synthesizers">Green-Hydrogen Synthesizing Complex</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] mb-2 font-mono text-gray-400">
                          <span>Horizon Forecast Matrix:</span>
                          <span className="text-orange-500 font-bold">{forecastHorizon} Years</span>
                        </div>
                        <input 
                          type="range"
                          min="2"
                          max="10"
                          step="1"
                          value={forecastHorizon}
                          onChange={e => setForecastHorizon(Number(e.target.value))}
                          className="w-full accent-orange-500 cursor-ew-resize h-1 bg-zinc-800 rounded-lg outline-none"
                        />
                      </div>

                      <div className="pt-2">
                        <label className="flex items-center gap-3 text-xs text-gray-300 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={aiPredictorActive}
                            onChange={e => setAiPredictorActive(e.target.checked)}
                            className="accent-orange-500 h-4 w-4"
                          />
                          <span>Apply AI Predictive Load Modeling</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/5 rounded-2xl">
                    <h4 className="text-white font-bold text-xs mb-2">Predictor Interpretation</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Using neural grid forecasting, the system computes the likely peak demand spike across the {forecastRegion} corridor. Allocating pre-production capacity directly hedges the risk of grid brownouts by over 94%.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-8 flex flex-col justify-between">
                  {/* Custom Simulated Graph */}
                  <div className="bg-black/60 border border-white/10 rounded-2xl p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">Simulated Grid Load & Offtake Tracking (MW)</h4>
                      <p className="text-[10px] text-gray-500">Comparing forecasted consumer load to guaranteed infrastructure capacity bounds.</p>
                    </div>

                    <div className="my-6 grid grid-cols-5 md:grid-cols-10 items-end gap-3 h-48 pt-4 border-b border-white/5 relative">
                      {/* Grid Line Marks */}
                      <div className="absolute left-0 right-0 top-1/4 border-t border-dashed border-white/5 pointer-events-none" />
                      <div className="absolute left-0 right-0 top-2/4 border-t border-dashed border-white/5 pointer-events-none" />
                      <div className="absolute left-0 right-0 top-3/4 border-t border-dashed border-white/5 pointer-events-none" />
                      
                      {currentSeries.slice(0, forecastHorizon).map((item, idx) => {
                        const maxVal = Math.max(...currentSeries.map(s => s.demand));
                        const demandPercent = (item.demand / maxVal) * 100;
                        const supplyPercent = (item.supply / maxVal) * 100;

                        return (
                          <div key={idx} className="flex flex-col items-center gap-2 group h-full justify-end relative">
                            {/* Hover Details Panel */}
                            <div className="absolute bottom-full mb-2 bg-zinc-900 border border-white/10 p-2 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 text-[9px] font-mono text-white text-center w-28">
                              <div>Yr: {item.year}</div>
                              <div className="text-orange-400 font-bold">Demand: {item.demand}MW</div>
                              <div className="text-emerald-400">Supply: {item.supply}MW</div>
                              {item.shortfall > 0 && <div className="text-red-400 font-bold">Gap: {item.shortfall}MW</div>}
                            </div>

                            {/* Two bars side-by-side */}
                            <div className="flex items-end gap-1 w-full h-full">
                              <div 
                                style={{ height: `${demandPercent}%` }} 
                                className="w-1/2 rounded-t bg-orange-500 group-hover:bg-orange-600 transition-all duration-300"
                              />
                              <div 
                                style={{ height: `${supplyPercent}%` }} 
                                className="w-1/2 rounded-t bg-emerald-500 group-hover:bg-emerald-600 transition-all duration-300"
                              />
                            </div>
                            <span className="text-[9px] font-mono text-gray-500 mt-1">{item.year}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-4 text-[10px] font-mono text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                        <span>Estimated Peak Load (MW)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>Baseline Grid Capacity Allocation</span>
                      </div>
                      {aiPredictorActive && (
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px]">AI Modeling Layer Enabled</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl flex items-center justify-between gap-4">
                    <p className="text-[11px] text-gray-400">
                      <strong>Identified Shortfall Danger:</strong> Significant congestion predicted by year <span className="text-white font-bold">{2206 + forecastHorizon}</span> without substantial structured forward energy long-term reservations.
                    </p>
                    <button 
                      onClick={() => {
                        setReserveVolume(Math.round(currentSeries[forecastHorizon - 1].shortfall || 50));
                        setActiveTab("reservation");
                      }}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[10px] font-bold shrink-0 transition-all"
                    >
                      Instant Capacity Hedge Reservation
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ENERGY AUCTION SYSTEMS */}
            {activeTab === "auction" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
                
                {/* Visual Listings List */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-white font-bold text-base mb-2">Live Pre-Production Asset Blocks</h3>
                  
                  {activeAuctions.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedAuctionId(item.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        selectedAuctionId === item.id
                          ? "bg-zinc-900 border-orange-500/40 shadow-inner"
                          : "bg-black/40 border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div>
                          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{item.id} • Active Allocation Lot</span>
                          <h4 className="text-white font-bold text-sm mt-0.5">{item.title}</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/25 text-[9px] font-mono tracking-widest uppercase">
                          {item.status} ({item.endMinutes}m left)
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-3 text-[11px] font-mono">
                        <div>
                          <span className="text-gray-500 block">Base Corridor Price</span>
                          <span className="text-white font-medium">${item.basePrice} / MWh</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Active High Bid</span>
                          <span className="text-orange-500 font-bold">${item.highestBid} / MWh</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Commitment Lead</span>
                          <span className="text-white truncate block">{item.highestBidder}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Operational Audit Logs Panel */}
                  <div className="bg-zinc-950 border border-white/5 rounded-2xl p-4">
                    <span className="text-[9px] font-mono text-gray-500 uppercase block mb-2">Active Clearinghouse Ledgers</span>
                    <div className="space-y-1.5 h-24 overflow-y-auto font-mono text-[10px] pr-2 custom-scrollbar">
                      {auctionLogs.map((log, lIdx) => (
                        <div key={lIdx} className="text-gray-400 flex items-start gap-1">
                          <span className="text-orange-500 shrink-0">▸</span>
                          <span className="truncate">{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Secure Counter-Bid Placement */}
                <div className="lg:col-span-5">
                  <div className="p-6 md:p-8 bg-zinc-900/60 border border-zinc-800 rounded-3xl space-y-5">
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">Place Bid Request</h4>
                      <p className="text-xs text-gray-400">Simulate placing an institutional bid into {selectedAuctionId}. Bid requires bank guarantee confirmation flags.</p>
                    </div>

                    <form onSubmit={handlePlaceBid} className="space-y-4">
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase font-mono mb-1.5">Corporate / Entity Name</label>
                        <input 
                          type="text"
                          required
                          value={userBidName}
                          onChange={e => setUserBidName(e.target.value)}
                          placeholder="e.g. Stanbic Energy Trust Ltd" 
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-gray-500 uppercase font-mono mb-1.5">Bid Allocation Scale</label>
                          <select 
                            value={userBidQuantity}
                            onChange={e => setUserBidQuantity(Number(e.target.value))}
                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs"
                          >
                            <option value="10">10 MW block</option>
                            <option value="15">15 MW block</option>
                            <option value="25">25 MW block</option>
                            <option value="50">50 MW block</option>
                          </select>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[10px] text-gray-500 uppercase font-mono">Offer Price</label>
                            <span className="text-orange-400 font-bold text-xs font-mono">${userBidPrice}/MWh</span>
                          </div>
                          <input 
                            type="range"
                            min="35"
                            max="90"
                            value={userBidPrice}
                            onChange={e => setUserBidPrice(Number(e.target.value))}
                            className="w-full accent-orange-500 h-1 bg-zinc-800 rounded-lg outline-none"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all shadow-md mt-2 flex items-center justify-center gap-1.5"
                      >
                        Transmit Corporate Bid Slot
                      </button>
                    </form>

                    <p className="text-[10px] text-center text-gray-500 leading-relaxed">
                      *Note: Auction simulation runs cleanly on top of client state engines. Submitted values update local ledgers for rapid scenario analysis.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: CAPACITY RESERVATION ENGINE */}
            {activeTab === "reservation" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
                
                {/* Config Columns */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="p-6 bg-zinc-950 border border-white/5 rounded-3xl space-y-5">
                    <div>
                      <h3 className="text-white font-bold text-base">Generation Hedging Engine</h3>
                      <p className="text-xs text-gray-400 mt-1">Configure asset reservations to mitigate long-term inflation and supply insecurity.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Preferred Generation Asset Class</label>
                        <select 
                          value={reserveAsset}
                          onChange={e => setReserveAsset(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-3 text-white text-xs outline-none focus:border-orange-500"
                        >
                          <option value="Solar Photovoltaic Core">Solar Photovoltaic Array (Copperbelt Sector)</option>
                          <option value="Luwingu Run-of-River Hydro">Sub-Sovereign Run-of-River Hydroelectric</option>
                          <option value="Siavonga Wind Turbine Farm">Siavonga Coastal wind block Array</option>
                          <option value="Megawatt Grid Storage Bank">Megawatt Lithium-Iron Phosphate Battery Bank</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Sovereign Hedging Horizon term</label>
                        <select 
                          value={reserveTerm}
                          onChange={e => setReserveTerm(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-3 text-white text-xs outline-none focus:border-orange-500"
                        >
                          <option value="5-Year Strategic Option">5-Year Options Protective Hedge</option>
                          <option value="10-Year Sovereign Hedge">10-Year Sovereign Backed Offtake Covenant</option>
                          <option value="20-Year Development Anchor">20-Year Institutional Infrastructure Anchor</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-2 font-mono text-gray-400">
                          <span>Target Volume Allocation:</span>
                          <span className="text-orange-500 font-bold">{reserveVolume} MW</span>
                        </div>
                        <input 
                          type="range"
                          min="5"
                          max="500"
                          step="5"
                          value={reserveVolume}
                          onChange={e => setReserveVolume(Number(e.target.value))}
                          className="w-full accent-orange-500 cursor-ew-resize h-1 bg-zinc-800 rounded-lg outline-none"
                        />
                      </div>

                      <button 
                        onClick={handleGenerateCertificate}
                        disabled={certifying}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 py-3.5 rounded-xl font-bold text-white text-xs tracking-wide shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        {certifying ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin text-white" />
                            Locking Hedges & Minting Register...
                          </>
                        ) : (
                          "Generate Certified Reservation Option"
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* High Fidelity Interactive Certificate Preview */}
                <div className="lg:col-span-7 flex items-center justify-center">
                  {generatedCertificate ? (
                    <div className="w-full bg-gradient-to-b from-zinc-900 to-black border-2 border-orange-500/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl animate-fade-in print:bg-white print:text-black">
                      
                      {/* Decorative Background Stamp */}
                      <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full border border-orange-500/10 flex items-center justify-center pointer-events-none p-4 select-none">
                        <div className="w-full h-full rounded-full border-4 border-dashed border-orange-500/5 flex items-center justify-center">
                          <span className="text-orange-500/5 text-[9px] font-mono font-bold text-center">GEAX SECURITIES ZAMBIA</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-start gap-4 pb-6 border-b border-white/5">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-orange-500 uppercase tracking-widest block">MEMORANDUM OF ALLOCATION RESERVATION</span>
                          <h4 className="text-white font-bold text-base mt-1">GEAX™ Sovereign Clearinghouse Option</h4>
                        </div>
                        <ShieldCheck className="h-10 w-10 text-orange-500 shrink-0" />
                      </div>

                      <div className="py-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Allocation Code ID</span>
                            <span className="text-white font-bold font-mono tracking-tight">{generatedCertificate.certId}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Registry Secure Hash</span>
                            <span className="text-orange-400 font-bold font-mono text-[11px] block truncate">{generatedCertificate.escrowLedgerHash}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Target Energy Resource Class</span>
                            <span className="text-white font-medium">{generatedCertificate.assetClassValue}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Standard Contract Horizon</span>
                            <span className="text-white font-medium">{generatedCertificate.contractTerm}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Hedged Capacity Volume</span>
                            <span className="text-green-400 font-bold">{generatedCertificate.allocationVolume}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Equivalent Power Yield</span>
                            <span className="text-white font-medium">{generatedCertificate.physicalEquivalence}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[10px] font-mono text-gray-400">
                        <div>
                          <span>Authorized On behalf of:</span>
                          <span className="text-white block font-bold text-[11px] mt-0.5">B & M Masterlink LTD Director Board</span>
                        </div>
                        <div className="text-right md:text-right">
                          <span>Sovereign Stamp Date:</span>
                          <span className="text-white block mt-0.5">{generatedCertificate.signDate}</span>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-3xl border border-dashed border-white/10 bg-black/40 flex flex-col items-center justify-center p-8 text-center">
                      <Handshake className="h-12 w-12 text-gray-600 mb-3 animate-pulse" />
                      <h4 className="text-white font-bold text-sm">Certificate Vault Empty</h4>
                      <p className="text-gray-400 text-xs max-w-sm mt-1 leading-relaxed">
                        Select source assets, allocate hedging structures, and click &ldquo;Generate Certified Reservation Option&rdquo; to mint a virtual certificate offtake lock.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 4: BLOCKCHAIN CONTRACT VERIFICATION */}
            {activeTab === "blockchain" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
                
                {/* Search / Scan Box */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="p-6 bg-zinc-950 border border-white/5 rounded-3xl space-y-5">
                    <div>
                      <h3 className="text-white font-bold text-base flex items-center gap-2">
                        <Lock className="h-5 w-5 text-orange-500" /> Decentralized Ledger Verification
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">Cross-reference cryptographic clearance hashes to verify active sovereign contracts.</p>
                    </div>

                    <form onSubmit={handleVerifyContractHash} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Contract Transaction Hash (0x)</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            required
                            value={blockchainSearchHash}
                            onChange={e => setBlockchainSearchHash(e.target.value)}
                            placeholder="e.g. 0x_geax_183ab9" 
                            className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-orange-500 font-mono"
                          />
                          <button 
                            type="submit"
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-white text-xs select-none"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    </form>

                    {/* Result Card */}
                    {blockchainVerificationOutput && (
                      <div className="p-5 rounded-2xl border bg-black/80 border-white/10 space-y-3 animate-fade-in text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <span className="font-mono text-[10px] text-gray-500">Validation Response</span>
                          <span className={`font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${blockchainVerificationOutput.status.includes('Verified') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {blockchainVerificationOutput.status}
                          </span>
                        </div>

                        {blockchainVerificationOutput.error ? (
                          <p className="text-red-400 font-medium leading-relaxed">{blockchainVerificationOutput.error}</p>
                        ) : (
                          <div className="space-y-2 font-mono text-[11px] text-gray-400">
                            <div className="flex justify-between"><span>Registry Block:</span> <span className="text-white">{blockchainVerificationOutput.blockHeight}</span></div>
                            <div className="flex justify-between"><span>Authorized Owner:</span> <span className="text-white font-bold">{blockchainVerificationOutput.owner}</span></div>
                            <div className="flex justify-between"><span>Resource Type:</span> <span className="text-white">{blockchainVerificationOutput.assetClass}</span></div>
                            <div className="flex justify-between"><span>Sovereign Load:</span> <span className="text-green-400 font-bold">{blockchainVerificationOutput.quantity}</span></div>
                            <div className="flex justify-between"><span>Validation Stamp:</span> <span className="text-white">{blockchainVerificationOutput.timestamp}</span></div>
                            <div className="flex justify-between truncate"><span>Jurisdictional Rule:</span> <span className="text-orange-500 font-bold">{blockchainVerificationOutput.arbitralZone}</span></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ledger Blocks Display */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-white font-bold text-sm">Synchronized Capacity Ledger Blocks</h4>
                  
                  <div className="overflow-x-auto border border-white/5 rounded-2xl bg-zinc-950">
                    <table className="w-full text-left text-xs text-gray-400 border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-zinc-900/60 font-mono text-[10px] text-gray-500">
                          <th className="p-4">Transaction Hash</th>
                          <th className="p-4">Entity Partner</th>
                          <th className="p-4">Asset Class</th>
                          <th className="p-4">Allocation Volume</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                        {contractLedger.map((item, i) => (
                          <tr key={i} className="hover:bg-zinc-900/40">
                            <td className="p-4 text-orange-400 font-bold font-mono">{item.hash}</td>
                            <td className="p-4 text-white font-medium">{item.buyer}</td>
                            <td className="p-4 text-gray-400">{item.asset}</td>
                            <td className="p-4 text-green-400 font-bold">{item.volume}</td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => {
                                  setBlockchainSearchHash(item.hash);
                                  setBlockchainVerificationOutput({
                                    status: "Sovereign Stamp Verified",
                                    blockHeight: item.block,
                                    owner: item.buyer,
                                    assetClass: item.asset,
                                    quantity: item.volume,
                                    yearsSigned: item.duration,
                                    timestamp: "2026-05-21 13:11 State Lock System",
                                    arbitralZone: "SADC Energy Commission Clearinghouse"
                                  });
                                }}
                                className="text-orange-500 hover:underline font-bold"
                              >
                                Scan
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[10px] text-gray-500 font-mono italic">
                    *Ledger updates sync recursively to regional smart directories, safeguarding energy allocations from dual-bidding conflicts.
                  </p>
                </div>

              </div>
            )}

            {/* TAB 5: GRID TELEMETRY */}
            {activeTab === "grid" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
                
                {/* Controller Sidebar options */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="p-6 bg-zinc-950 border border-white/5 rounded-3xl space-y-5">
                    <div>
                      <h3 className="text-white font-semibold text-base flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-orange-500" /> Overload Contingency Controller
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">Interactively simulate grid load behaviors to evaluate network defenses.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-[11px] mb-2 font-mono text-gray-400">
                          <span>Simulated Grid stress level:</span>
                          <span className={`font-bold ${gridGridStressColor(gridStress)}`}>{gridStress}% Stress</span>
                        </div>
                        <input 
                          type="range"
                          min="10"
                          max="98"
                          step="1"
                          value={gridStress}
                          onChange={e => setGridStress(Number(e.target.value))}
                          className="w-full accent-orange-500 cursor-ew-resize h-1 bg-zinc-800 rounded-lg outline-none"
                        />
                      </div>

                      {gridStress > 75 ? (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs space-y-3 animate-pulse">
                          <p className="text-red-400 font-bold block">🚨 WARN: Severe Grid Overload Spike Detected!</p>
                          <p className="text-gray-400 text-[11px] leading-relaxed">Local reserve buffers are eroding. Deploy grid backup batteries immediately to regulate thermal grid fatigue.</p>
                          
                          <button 
                            onClick={() => {
                              setGridBatteryDeploying(true);
                              setTimeout(() => {
                                setGridStress(42);
                                setGridReserveCapacity(prev => Math.max(0, prev - 35));
                                setGridBatteryDeploying(false);
                              }, 1100);
                            }}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg text-[10px] transition-all"
                          >
                            {gridBatteryDeploying ? "Re-Routing Load Matrices..." : "Engage 150MW Grid Battery Buffer"}
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-xl text-xs">
                          <span className="text-green-400 font-bold block mb-1">✓ Status: Operational Equivalence</span>
                          <p className="text-gray-400 text-[11px] leading-relaxed">Grid frequency response is highly stable at 50.02 Hz. Generous capacity overhead remains locked.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dashboard grid outputs */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Active Line Loss Transmission Index", value: `${(gridStress * 0.08).toFixed(2)}% Loss`, detail: "Real-time copperline impedance tracking", status: gridStress > 75 ? "Escalated" : "Normal" },
                    { label: "System Stabilizer Frequency Core", value: gridStress > 75 ? "49.12 Hz (Critical)" : "50.02 Hz (Nominated)", detail: "Automatic frequency restoration threshold tracking", status: gridStress > 75 ? "Warning" : "Fine" },
                    { label: "Active Battery Backup Reserve", value: `${gridReserveCapacity} MWh Remaining`, detail: "B&M regional grid storage battery complex", status: "Active Lock" },
                    { label: "SADC Cross-Border Load Offset", value: `${(gridStress * 1.8).toFixed(1)} MW Export`, detail: "Dynamic continental power-pool allocation coordination", status: "Live Feed" }
                  ].map((metric, idx) => (
                    <div key={idx} className="p-6 bg-black/60 border border-white/5 rounded-2xl flex flex-col justify-between hover:border-orange-500/20 transition-all">
                      <div>
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">{metric.label}</span>
                        <div className="text-2xl font-bold text-white mt-1.5">{metric.value}</div>
                      </div>
                      <div className="mt-4 flex justify-between items-center text-[10px] text-gray-400 font-mono">
                        <span>{metric.detail}</span>
                        <span className={`font-bold ${metric.status.includes('Critical') || metric.status.includes('Escalated') ? 'text-red-400' : 'text-orange-500'}`}>{metric.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 6: COMMODITY INDEXING */}
            {activeTab === "commodity" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
                
                {/* Index List and Values */}
                <div className="lg:col-span-6 space-y-4">
                  <h3 className="text-white font-bold text-base">CEI™ Global Clean Energy Indices</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { code: "CleanPV_ZAM", title: "Zambian Solar Composite (Avg)", spot: "$40.85/MWh", variance: "+0.8%", color: "text-amber-400", desc: "Aggregated index tracking pre-offtake solar bids in Central Province" },
                      { code: "HydroPool_SADC", title: "SADC Consolidated Hydro Index", spot: "$38.20/MWh", variance: "-0.4%", color: "text-blue-400", desc: "Consolidated index reflecting large Kariba wind/hydro reserve allocations" },
                      { code: "TalcMH_ZAM", title: "High-Purity Zambia Talc ($/Ton)", spot: "$345.00/Ton", variance: "+2.1%", color: "text-teal-400", desc: "Zambian high-grade Talc industrial raw material benchmark extraction price" },
                      { code: "GEAX_GreenH2", title: "Green Hydrogen Equiv Index", spot: "$4.12/kg", variance: "+1.9%", color: "text-indigo-400", desc: "Experimental index mapping baseline grid co-generation power parameters" }
                    ].map(item => (
                      <div 
                        key={item.code}
                        onClick={() => setIndexSelected(item.code)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                          indexSelected === item.code
                            ? "bg-zinc-900 border-orange-500/40"
                            : "bg-black/50 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-1">{item.code}</span>
                        <h4 className="text-white font-bold text-xs">{item.title}</h4>
                        <div className="flex items-baseline gap-2 mt-3 justify-between">
                          <span className="text-lg font-bold text-white font-mono">{item.spot}</span>
                          <span className={`text-[10px] font-bold ${item.variance.includes('+') ? 'text-green-500' : 'text-red-500'}`}>{item.variance}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Industrial Exchange Tool */}
                <div className="lg:col-span-6">
                  <div className="p-6 md:p-8 bg-zinc-950 border border-white/10 rounded-3xl space-y-5">
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">Industrial Carbon Offset Estimator</h4>
                      <p className="text-xs text-gray-400">Calculate estimated carbon-offset credit generation by tying high-purity industrial Talc mining complexes in Zambia directly over clean solar power systems.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-[11px] mb-2 font-mono text-gray-400">
                          <span>Target Talc Milling Volume:</span>
                          <span className="text-white font-bold">{calcTalcTons} Metric Tons</span>
                        </div>
                        <input 
                          type="range"
                          min="1000"
                          max="20000"
                          step="500"
                          value={calcTalcTons}
                          onChange={e => setCalcTalcTons(Number(e.target.value))}
                          className="w-full accent-orange-500 cursor-ew-resize h-1 bg-zinc-800 rounded-lg outline-none"
                        />
                      </div>

                      <div className="p-5 bg-black/80 border border-white/5 rounded-2xl space-y-3 text-xs">
                        <div className="flex justify-between items-center text-gray-400 font-mono">
                          <span>Required Grid Input Demand:</span>
                          <span className="text-white font-bold">{(calcTalcTons * 0.12).toFixed(1)} MW Peak</span>
                        </div>

                        <div className="flex justify-between items-center text-gray-400 font-mono">
                          <span>Equivalent CO2 Displaced annually:</span>
                          <span className="text-green-400 font-bold">{(calcTalcTons * 0.44).toFixed(1)} Metric Tons CO2e</span>
                        </div>

                        <div className="flex justify-between items-center text-gray-400 font-mono pt-2 border-t border-white/5">
                          <span>Simulated Carbon Credits Generable:</span>
                          <span className="text-orange-500 font-bold">{(calcTalcTons * 0.44 * 1.55).toFixed(0)} Credits ($/yr)</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-500/5 rounded-xl text-[11px] text-gray-400 leading-relaxed text-center">
                      *By feeding CleanPV offsets directly into B&M Talc mineral silos, we produce a revolutionary, ultra-clean zero-carbon high-purity mineral value chain, heavily sought after by global battery manufacturers.
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 7: MULTI-COUNTRY ALLOCATION TRACKING */}
            {activeTab === "multicountry" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
                
                {/* Configuration side panel */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="p-6 bg-zinc-950 border border-white/5 rounded-3xl space-y-5">
                    <div>
                      <h3 className="text-white font-bold text-base flex items-center gap-2">
                        <Globe className="h-5 w-5 text-orange-500" /> Cross-Border Transmission Interface
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">Simulate cross-border power transmission routes between participating Southern African countries.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Primary Export Source Country</label>
                        <select 
                          value={selectedSourceCountry}
                          onChange={e => setSelectedSourceCountry(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-3 text-white text-xs"
                        >
                          <option value="Zambia">Zambia (SAPP Hub Leader)</option>
                          <option value="Botswana">Botswana (Chobe Block)</option>
                          <option value="Mozambique">Mozambique (Cahora Bassa Hydro)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Recipient sovereign Corridor</label>
                        <select 
                          value={selectedRecipientCountry}
                          onChange={e => setSelectedRecipientCountry(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-3 text-white text-xs animate-none"
                        >
                          <option value="DR Congo">DR Congo (Katanga Mining Zone)</option>
                          <option value="Zimbabwe">Zimbabwe (Kariba Southern Split)</option>
                          <option value="Tanzania">Tanzania (Southern Ring Connection)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-2 font-mono text-gray-400">
                          <span>Allocated Export flow Capacity:</span>
                          <span className="text-orange-500 font-bold">{transmissionFlowMW} MW</span>
                        </div>
                        <input 
                          type="range"
                          min="5"
                          max="200"
                          step="5"
                          value={transmissionFlowMW}
                          onChange={e => setTransmissionFlowMW(Number(e.target.value))}
                          className="w-full accent-orange-500 cursor-ew-resize h-1 bg-zinc-800 rounded-lg outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytical routing outputs */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                  {/* Schematic visual map mapping flows */}
                  <div className="bg-black/60 border border-white/10 rounded-2xl p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">Interactive Southern African Power Pool Routing</h4>
                      <p className="text-[10px] text-gray-500">Live schematics of energy transfers and physical line losses across borders.</p>
                    </div>

                    <div className="my-8 py-8 flex items-center justify-center gap-4 text-center">
                      <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 w-32 shrink-0">
                        <span className="text-xs font-bold text-white block">{selectedSourceCountry}</span>
                        <span className="text-[9px] font-mono text-orange-400 block mt-1">Exporting</span>
                        <span className="text-lg font-bold text-white font-mono mt-1 block">{transmissionFlowMW} MW</span>
                      </div>

                      <div className="flex-1 max-w-sm flex flex-col items-center gap-1.5 relative px-2">
                        {/* Dynamic loading motion flow direction */}
                        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden relative">
                          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-orange-400 to-amber-500 w-1/3 animate-ping" style={{ animationDuration: '2s' }} />
                          <div className="absolute top-0 bottom-0 left-1/3 bg-gradient-to-r from-orange-400 to-amber-500 w-1/3 animate-ping" style={{ animationDuration: '2.5s' }} />
                        </div>
                        <span className="text-[9px] font-mono text-orange-500 font-bold">Line Loss: {(transmissionFlowMW * 0.045).toFixed(1)} MW ({((transmissionFlowMW * 0.045 / transmissionFlowMW) * 100).toFixed(1)}%)</span>
                        <span className="text-[8px] text-gray-500">Estimated distance: {selectedRecipientCountry === 'DR Congo' ? '410 km' : '315 km'} vector link</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-zinc-900 border border-orange-500/20 w-32 shrink-0">
                        <span className="text-xs font-bold text-white block">{selectedRecipientCountry}</span>
                        <span className="text-[9px] font-mono text-green-400 block mt-1">Import Received</span>
                        <span className="text-lg font-bold text-green-400 font-mono mt-1 block">{(transmissionFlowMW - (transmissionFlowMW * 0.045)).toFixed(1)} MW</span>
                      </div>
                    </div>

                    <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/10 text-[10px] text-gray-400 leading-relaxed font-mono">
                      <strong>Grid Operations Dispatcher:</strong> Zambia holds the strategic central geographic coordinates matching SAPP. We route surplus energy to deficit minerals mines, bypassing congestion bottlenecks.
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Existing Indicators Section */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
            <BarChart3 className="h-6 w-6 text-orange-500 mr-3" />
            Supply & Demand Indicators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="p-8 bg-zinc-900 border border-white/10 rounded-3xl h-40 animate-pulse" />
              ))
            ) : indicators.length > 0 ? (
              indicators.map((indicator, i) => (
                <div key={i} className="p-8 bg-zinc-900 border border-white/10 rounded-3xl hover:border-orange-500/30 transition-all">
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4 block">{indicator.label}</span>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-white">{indicator.value}</span>
                    <span className="text-gray-500 text-sm">{indicator.unit}</span>
                  </div>
                  <div className="text-orange-500 font-bold text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    {indicator.status}
                  </div>
                </div>
              ))
            ) : (
                <div className="md:col-span-3 p-8 bg-zinc-900/50 border border-white/5 rounded-3xl text-center text-gray-500">
                  Detailed indicators are computed based on active GEAX™ contract volumes.
                </div>
            )}
          </div>
        </div>

        {/* Existing News Feed Section */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
            <Info className="h-6 w-6 text-orange-500 mr-3" />
            Real-Time Market News
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-zinc-900 border border-white/10 rounded-3xl h-80 animate-pulse" />
              ))
            ) : news.length > 0 ? (
              news.slice(0, 3).map((article, i) => (
                <div key={i} className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden group hover:border-orange-500/50 transition-all">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={article.urlToImage || article.image || "https://picsum.photos/seed/energy/800/450"} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2 block">{article.source?.name || article.source || "Market News"}</span>
                    <h3 className="text-lg font-bold text-white mb-4 line-clamp-2 leading-tight group-hover:text-orange-500 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-6">
                      {article.description || "Access detailed market analysis and strategic energy allocation insights through the GEAX™ platform."}
                    </p>
                    <a 
                      href={article.url || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white text-xs font-bold flex items-center gap-2 hover:gap-3 transition-all"
                    >
                      Read Analysis <ArrowRight className="h-4 w-4 text-orange-500" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
                <div className="md:col-span-3 p-12 bg-white/5 border border-white/10 rounded-3xl text-center">
                  <p className="text-gray-400">Secure news feed is only available for verified institutional partners.</p>
                </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-6">Strategic Outcome</h2>
            <p className="text-xl text-gray-300 italic">
              "Make informed, strategic energy allocation decisions that protect your organization's future in an increasingly volatile global market."
            </p>
          </div>
          <div className="w-full md:w-64 h-64 bg-black rounded-full border-8 border-orange-500/20 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-orange-500/10 animate-pulse" />
            <BarChart3 className="h-24 w-24 text-orange-500 relative z-10" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple helper grid stress color calculator
function gridGridStressColor(stress: number) {
  if (stress < 50) return "text-green-400";
  if (stress < 78) return "text-orange-400";
  return "text-red-400 animate-pulse";
}

const SecurityPage = () => (
  <div className="pt-32 pb-24 px-4 bg-black min-h-screen">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter leading-tight">
            Institutional-Grade <br />Security
          </h1>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed">
            GEAX™ is built for high-value energy transactions, ensuring the highest standards of safety, privacy, and regulatory alignment.
          </p>
          
          <div className="space-y-6 mb-12">
            {[
              { icon: ShieldCheck, title: "Verified Participant Network", desc: "Strict KYC/AML onboarding for all users." },
              { icon: Lock, title: "Encrypted Communications", desc: "End-to-end encryption for all platform interactions." },
              { icon: FileText, title: "Secure Document Storage", desc: "Military-grade protection for legal and financial data." },
              { icon: Handshake, title: "Escrow Payment Gateway", desc: "Institutional-grade transaction protection through secure escrow mechanisms." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-6 bg-zinc-900 rounded-2xl border border-white/5">
                <item.icon className="h-6 w-6 text-orange-500 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-bold mb-1">{item.title}</h4>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-zinc-900 p-12 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="h-64 w-64 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-8 relative z-10">Compliance & Regulatory</h3>
          <div className="space-y-8 relative z-10">
            <div>
              <h4 className="text-orange-500 font-bold mb-2">KYC & AML</h4>
              <p className="text-gray-400">Comprehensive Know Your Customer and Anti-Money Laundering protocols integrated into the onboarding process.</p>
            </div>
            <div>
              <h4 className="text-orange-500 font-bold mb-2">Global Alignment</h4>
              <p className="text-gray-400">Regulatory alignment across multiple jurisdictions to facilitate cross-border energy allocation.</p>
            </div>
            <div className="pt-8 border-t border-white/10">
              <div className="flex items-center text-white font-bold">
                <Lock className="h-5 w-5 text-orange-500 mr-2" />
                Secure Data Infrastructure
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CompanyPage = ({ setPage }: { setPage: (p: Page) => void }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "mining" | "energy" | "strategy">("overview");
  const [dmForm, setDmForm] = useState({ name: "", email: "", org: "", msg: "" });
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="pt-32 pb-24 px-4 bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Hero / Header Badge */}
        <div className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-wider mb-6">
            <Building2 className="h-4 w-4 text-orange-500" /> Corporate Information
          </div>
          <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 tracking-tighter leading-none">
            B & M MASTERLINK LTD
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Connecting mineral wealth, industrial development, and future energy security through innovation and strategic partnerships.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl relative overflow-hidden group hover:bg-zinc-900 transition-colors">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Gem className="h-24 w-24 text-white" />
            </div>
            <div className="text-orange-500 font-mono text-xs uppercase tracking-widest mb-4">Mineral Infrastructure</div>
            <h3 className="text-2xl font-bold text-white mb-2">Mining & Talc Supply</h3>
            <p className="text-gray-400 text-sm leading-relaxed">High-grade industrial minerals processed for paint, plastics, cosmetics, and paper manufacturing.</p>
          </div>
          
          <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl relative overflow-hidden group hover:bg-zinc-900 transition-colors">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Zap className="h-24 w-24 text-white" />
            </div>
            <div className="text-orange-500 font-mono text-xs uppercase tracking-widest mb-4">Market Operations</div>
            <h3 className="text-2xl font-bold text-white mb-2">GEAX™ Private Exchange</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Structured strategic forward allocation securing capacity and energy supply before production.</p>
          </div>

          <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl relative overflow-hidden group hover:bg-zinc-900 transition-colors">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Globe className="h-24 w-24 text-white" />
            </div>
            <div className="text-orange-500 font-mono text-xs uppercase tracking-widest mb-4">Geographic Presence</div>
            <h3 className="text-2xl font-bold text-white mb-2">Zambian Hub, Global Scale</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Headquartered in Zambia, actively contributing to developmental growth across Africa & international markets.</p>
          </div>
        </div>

        {/* Interactive Deep-Dive Tabs */}
        <div className="border border-white/5 bg-zinc-900/30 rounded-3xl p-4 md:p-8 mb-20 shadow-2xl backdrop-blur-md">
          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-6 mb-8">
            {[
              { id: "overview", label: "Overview", icon: Building2 },
              { id: "mining", label: "Mining & Industrial Talc", icon: Gem },
              { id: "energy", label: "GEAX™ Operations", icon: Zap },
              { id: "strategy", label: "Vision & Strategy", icon: Target }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                    : "text-gray-400 hover:text-white bg-white/5"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-12 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Synergizing Mineral Wealth & Innovative Energy Solutions
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
                  <div className="lg:col-span-7 space-y-4">
                    <p className="text-lg text-gray-300 leading-relaxed">
                      B & M Masterlink LTD is a diversified company operating at the confluence of mining, industrial mineral production, and digital energy infrastructure. By pairing traditional high-value material harvesting with standard-setting digital allocation software, we establish solid infrastructure foundations across emerging economies.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                      As the sole operator and owner of <span className="text-white font-semibold">GEAX™ (Global Energy Allocation Exchange)</span>, we deliver future capacity protection and transaction frameworks directly to large-scale buyers and governments. Simultaneously, our mineral division processes high-grade industrial Talc to serve international polymers, coatings, and pharmaceutical supply chains.
                    </p>
                  </div>
                  <div className="lg:col-span-5 bg-gradient-to-br from-zinc-900 to-black p-8 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-orange-500" />
                        Value Proposition
                      </h3>
                      <div className="space-y-3">
                        <p className="text-xs text-gray-300"><strong className="text-white">Industry Diversification:</strong> Cohesive business pillars in both heavy resource extraction and digital exchange architecture create solid commercial resilience.</p>
                        <p className="text-xs text-gray-300"><strong className="text-white">Strategic Innovation:</strong> Redefining energy allocation with high-value forward reserve agreements before generation.</p>
                        <p className="text-xs text-gray-300"><strong className="text-white">African Market Positioning:</strong> Utilizing Zambia's strategic geographic hub to support long-term infrastructural developments across African regions.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setPage("investor")}
                      className="mt-6 w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      Institutional Investment Portal <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Corporate Values Row */}
                <div className="pt-6 border-t border-white/5">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Core Corporate Values</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                      { val: "Integrity", desc: "Honest operations" },
                      { val: "Innovation", desc: "Constant progression" },
                      { val: "Sustainability", desc: "Eco-centric mining" },
                      { val: "Reliability", desc: "Stable supply lines" },
                      { val: "Partnership", desc: "Long-term synergy" },
                      { val: "Excellence", desc: "Premium standards" }
                    ].map((item, i) => (
                      <div key={i} className="p-4 bg-zinc-900/50 rounded-xl border border-white/5 flex flex-col justify-between min-h-[90px]">
                        <div className="text-white font-bold text-xs flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                          {item.val}
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MINING */}
          {activeTab === "mining" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <span className="px-3 py-1 rounded-full bg-orange-500/15 text-orange-500 text-xs font-bold uppercase tracking-wider inline-block">
                    Mineral Division
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Mining & Industrial Talc Supply
                  </h2>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    B & M Masterlink LTD is actively involved in the exploration, mining, processing, and supply of high-grade Talc for standard and specialized industrial applications. We focus on securing reliable mineral quality indicators, safe operations, and pristine logistical delivery pathways.
                  </p>
                  <p className="text-gray-400 text-sm">
                    Our processed Talc acts as a powerhouse ingredient across several global industries, valued for its extreme purity, softness, and compliance.
                  </p>
                </div>

                <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                    <Factory className="h-5 w-5 text-orange-500" />
                    Industrial Applications of Talc
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { title: "Paint Manufacturing", desc: "Reinforces coatings and improves weather resistance." },
                      { title: "Plastics & Polymers", desc: "Boosts stiffness, heat deflection, and impact resistance." },
                      { title: "Ceramics & Pottery", desc: "Controls expansion, preventing crazing and structural cracking." },
                      { title: "Cosmetic Powders", desc: "Provides safe lubricating slip and standard sebum absorption." },
                      { title: "Pharmaceuticals", desc: "Serves as a binder, anti-tack agent, and tablet lubricant." },
                      { title: "Paper Production", desc: "Optimizes brightness, smooth printability, and ink retention." },
                      { title: "Rubber Compounds", desc: "Prevents stickiness and assists extrusion mold release." },
                      { title: "Agriculture / Fillers", desc: "Acts as a carrier and flow-aid for fertilizers." }
                    ].map((app, i) => (
                      <div key={i} className="p-3 bg-black/40 rounded-xl border border-white/5">
                        <h4 className="text-white font-bold text-xs mb-1">{app.title}</h4>
                        <p className="text-[10px] text-gray-400 leading-normal">{app.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ENERGY */}
          {activeTab === "energy" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Zap className="h-48 w-48 text-orange-500" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">The GEAX™ Operator</h3>
                  <p className="text-lg text-orange-400 italic font-serif leading-relaxed">
                    “Secure the Future of Energy — Before It’s Produced.”
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    GEAX™ enables governments, corporations, and utilities to lock in future energy capacity. B & M Masterlink LTD runs the technological marketplace framework behind these historic high-value transactions.
                  </p>
                  <div className="pt-2">
                    <button 
                      onClick={() => setPage("how-it-works")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-orange-500 transition-colors"
                    >
                      How GEAX™ Works <ChevronRight className="h-3.5 w-3.5 text-orange-500" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <span className="px-3 py-1 rounded-full bg-orange-500/15 text-orange-500 text-xs font-bold uppercase tracking-wider inline-block">
                  Platform Operations
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Energy Allocation & Digital Marketplace Operations
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  GEAX™ operates as an advanced marketplace designed to assist participants in bypassing spot market volatility. By allocating energy allocations directly from offtake producers, global buyers and governments gain reliable energy independence.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    "Reserve complex future generation capacity",
                    "Establish long-term capacity reservation agreements",
                    "Directly connect energy producers with buyers & sponsors",
                    "Magnify regional planning and allocation efficiencies",
                    "Unlock structured funding and project developments",
                    "Draft institutional milestone-based escrow contracts"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                      <div className="h-4 w-4 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 text-orange-500 mt-0.5">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Sectors Under Active Supervision</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Solar", "Hydro", "Wind", "LNG & Gas", "Coal", "Nuclear", "Biomass", "Grid Infrastructure"].map((sec, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-md text-[10px] font-semibold text-gray-300">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STRATEGY */}
          {activeTab === "strategy" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-2xl">
                  <h3 className="text-orange-500 font-bold uppercase tracking-wider text-[10px] mb-2">Our Vision</h3>
                  <p className="text-white text-base leading-relaxed font-semibold">
                    To become a leading African resource and energy solutions company connecting mineral wealth, industrial development, and future energy security through innovation and strategic partnerships.
                  </p>
                </div>

                <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-2xl">
                  <h3 className="text-orange-500 font-bold uppercase tracking-wider text-[10px] mb-3">Our Mission</h3>
                  <ul className="space-y-3 text-gray-400 text-xs leading-relaxed">
                    <li className="flex gap-2 items-start">
                      <ChevronRight className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <span>To responsibly develop and supply high-quality Talc and industrial minerals.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <ChevronRight className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <span>To create reliable energy allocation systems through GEAX™.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <ChevronRight className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <span>To support governments, industries, investors, and energy producers with sustainable and future-focused solutions.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <ChevronRight className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <span>To contribute to economic growth through strategic resource management and technology-driven platforms.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-8 bg-zinc-900 border border-white/10 rounded-2xl">
                <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Strategic Objectives</h3>
                <div className="space-y-4">
                  {[
                    "Expand Talc mining operations and industrial mineral exports globally.",
                    "Establish deep strategic partnerships with governments, investors, and industrial buyers.",
                    "Position GEAX™ as a recognized global energy allocation platform.",
                    "Support critical energy security initiatives across Africa and emerging markets.",
                    "Promote sustainable resource utilization and responsible corporate business practices."
                  ].map((obj, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="h-5 w-5 rounded bg-orange-500/10 text-orange-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-xs text-gray-300 leading-normal">{obj}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Outlook callout */}
        <div className="p-8 md:p-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-[2rem] text-white/95 mb-20 shadow-xl shadow-orange-500/15">
          <div className="max-w-4xl">
            <h3 className="text-[10px] font-mono tracking-widest font-bold uppercase mb-2 text-white/80">Corporate Outlook</h3>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 tracking-tight leading-normal">
              Expanding African Resource & Digital Infrastructures
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-orange-50">
              B & M Masterlink LTD aims to become a major contributor to industrial mineral development and future energy market infrastructure by combining resource production with digital allocation systems that support global energy security and economic growth.
            </p>
          </div>
        </div>

        {/* Contact Info Channels */}
        <div id="company-corporate-contact" className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-zinc-900 border border-white/10 rounded-[2rem] p-8 md:p-12 overflow-hidden relative">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">General Corporate Office</span>
            <h3 className="text-2xl font-bold text-white tracking-tight">Direct Contact Channels</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              We welcome strategic collaborations with governments, project developers, industrial powder buyers, mining partners, and investment managers.
            </p>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <Globe className="h-4.5 w-4.5 text-orange-500 shrink-0" />
                <div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Operator Portal</div>
                  <a href="https://geax.net.zm/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-500 font-bold text-xs hover:underline">
                    https://geax.net.zm/
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4.5 w-4.5 text-orange-500 shrink-0" />
                <div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Direct Email</div>
                  <a href="mailto:moses.mwale26@gmail.com" className="text-white hover:text-orange-500 font-bold text-xs hover:underline">
                    moses.mwale26@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4.5 w-4.5 text-orange-500 shrink-0" />
                <div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Zambia Hotline</div>
                  <a href="tel:+260967650685" className="text-white hover:text-orange-500 font-bold text-xs hover:underline">
                    +260 967 650 685 (WhatsApp)
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-black/40 rounded-2xl border border-white/5 p-6 md:p-8 flex flex-col justify-between">
            <h4 className="text-white font-bold text-sm mb-4">Send a Direct Message</h4>
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-zinc-900 border border-orange-500/20 rounded-xl">
                <CheckCircle2 className="h-10 w-10 text-green-500 mb-3 animate-bounce" />
                <h4 className="text-sm font-bold text-white mb-1">Message Dispatched Successfully</h4>
                <p className="text-gray-400 text-[11px] leading-relaxed max-w-sm">
                  Your inquiry has been received. Our directors will get back to you at <span className="text-white font-semibold">{dmForm.email}</span> as soon as possible.
                </p>
                <button 
                  onClick={() => { setSubmitted(false); setDmForm({ name: "", email: "", org: "", msg: "" }); }}
                  className="mt-4 text-xs text-orange-500 font-bold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="space-y-4 font-sans" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required value={dmForm.name} onChange={e => setDmForm({...dmForm, name: e.target.value})} type="text" placeholder="Your Name" className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-orange-500 outline-none transition-all" />
                  <input required value={dmForm.email} onChange={e => setDmForm({...dmForm, email: e.target.value})} type="email" placeholder="Your Email Address" className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-orange-500 outline-none transition-all" />
                </div>
                <input required value={dmForm.org} onChange={e => setDmForm({...dmForm, org: e.target.value})} type="text" placeholder="Organization / Company Name" className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-orange-500 outline-none transition-all" />
                <textarea required value={dmForm.msg} onChange={e => setDmForm({...dmForm, msg: e.target.value})} rows={3} placeholder="Describe mining supply or GEAX allocation inquiries..." className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-orange-500 outline-none transition-all resize-none" />
                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 font-bold text-white py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 text-xs">
                  Submit Corporate Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InvestorPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    budget: "Under $1 Million USD",
    interest: "GEAX™ Platform Development & Equity",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      const inquiryId = "inv_" + Math.random().toString(36).substring(2, 15);
      const docRef = doc(db, "investor_inquiries", inquiryId);
      
      const inquiryData = {
        id: inquiryId,
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        budget: form.budget,
        interest: form.interest,
        message: form.message.trim() || "No detailed message provided."
      };

      await setDoc(docRef, inquiryData);
      setSubmitted(true);
    } catch (error: any) {
      console.error("Error submitting investor inquiry:", error);
      setErrorMsg("We encountered an issue registering your inquiry. For direct assistance, please contact us at moses.mwale26@gmail.com.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-4 bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Badge & Header */}
        <div className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldCheck className="h-4 w-4 text-orange-500" /> INSTITUTIONAL PORTAL
          </div>
          <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 tracking-tighter leading-none">
            Investor Relations
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Secure strategic allocation rights, infrastructure equity, and premium entry points into resource-backed energy market pipelines.
          </p>
        </div>

        {/* Investment Pillars Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 animate-fade-in">
          {[
            {
              icon: Landmark,
              title: "Investment Opportunities",
              tag: "Equity & Growth",
              desc: "Capital participation in the expansion of B & M Masterlink LTD global assets. Direct exposure to industrial mineral extraction systems and the primary architecture of the GEAX™ exchange engine."
            },
            {
              icon: Handshake,
              title: "Strategic Partnerships",
              tag: "Sovereign Connections",
              desc: "Deploy structured capital alongside governments, international regional authorities, and state-backed entities. Build robust forward capacity networks that lock in critical national utility targets."
            },
            {
              icon: BarChart3,
              title: "Infrastructure Play",
              tag: "Physical Integration",
              desc: "Participation in real physical energy asset buildouts. Tap into solar parks, wind blocks, and high-purity Talc processing centers in Zambia with high-yield regional logistics frameworks."
            },
            {
              icon: Lock,
              title: "Energy Asset Acquisition",
              tag: "Forward Offtake",
              desc: "First-tier access to future energy allocation blocks before grid production. Purchase secure capacity allocations shielded from volatile fossil-fuel spot fluctuations."
            }
          ].map((pillar, idx) => (
            <div key={idx} className="p-8 bg-zinc-900/40 border border-white/5 rounded-3xl relative overflow-hidden group hover:border-orange-500/20 hover:bg-zinc-900/80 transition-all duration-300">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-300">
                <pillar.icon className="h-24 w-24 text-white" />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-orange-500 uppercase block mb-3">
                {pillar.tag}
              </span>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <pillar.icon className="h-5 w-5 text-orange-500/80" />
                {pillar.title}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>

        {/* Detailed Strategic Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 col-span-2">
          
          {/* Detailed Info Column */}
          <div className="lg:col-span-6 space-y-10">
            <div>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block mb-1">CAPITAL ALLOCATION STAGE 2026</span>
              <h2 className="text-3xl font-bold text-white tracking-tight">Structured Asset Pipelines & Institutional Scaling</h2>
              <p className="text-gray-400 text-sm leading-relaxed mt-4">
                B & M Masterlink LTD bridges two of the most critical macroeconomic sectors of the upcoming decade: high-precision industrial raw materials and structural power supply grids. Through GEAX™, our proprietary marketplace, we solve major long-term energy offtake challenges for large consumers.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  title: "Expand Industrial Mineral Mining (Talc)",
                  details: "We are scaling our processing yields to meet the rapidly expanding polymer, paint, and medical coatings market. Strategic partners gain secure physical material delivery hedges."
                },
                {
                  title: "Leverage Multi-Megawatt Energy Offtakes",
                  details: "Institutions acquire future power allocation assets before they hit standard distribution pools. Our contracts utilize modern smart system logic and sovereign backstops."
                },
                {
                  title: "Platform Equity & Clearinghouse Architecture",
                  details: "The digital exchange infrastructure runs on top of advanced institutional transaction escrow registries, opening global licensing opportunities."
                }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-5 bg-zinc-900/30 border border-white/5 rounded-2xl">
                  <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-xs shrink-0 mt-0.5">
                    0{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{item.details}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 rounded-3xl flex items-center gap-4">
              <ShieldCheck className="h-10 w-10 text-orange-500 shrink-0" />
              <div>
                <h5 className="text-white font-bold text-xs">Pristine Institutional Safeguards</h5>
                <p className="text-gray-500 text-[11px] leading-relaxed mt-1">
                  All formal investments, escrow mechanisms, and capacity reservations conform perfectly to regional standards and institutional regulatory frameworks.
                </p>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-6">
            <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Institutional Inquiry</h3>
              <p className="text-gray-400 text-xs mb-8 leading-relaxed">
                Connect with our directorship board regarding major mineral contracts, platform licensing, asset acquisition, or custom joint ventures.
              </p>

              {submitted ? (
                <div className="text-center py-12 px-6 bg-zinc-950/60 border border-orange-500/20 rounded-2xl">
                  <div className="h-14 w-14 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mx-auto mb-4 animate-bounce">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Institutional Application Received</h4>
                  <p className="text-gray-400 text-xs max-w-md mx-auto leading-relaxed mb-6">
                    Thank you. Your strategic inquiry has been securely stored in our vault. An investment director will review your request and connect with you at <span className="text-white font-semibold">{form.email}</span>.
                  </p>
                  <button 
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: "",
                        email: "",
                        company: "",
                        role: "",
                        budget: "Under $1 Million USD",
                        interest: "GEAX™ Platform Development & Equity",
                        message: ""
                      });
                    }}
                    className="text-xs font-bold text-orange-500 hover:underline"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {errorMsg && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium leading-relaxed">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Your Name</label>
                      <input 
                        required 
                        type="text" 
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        placeholder="Director Name" 
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-orange-500 outline-none transition-all placeholder:text-gray-600 animate-none select-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Corporate Email</label>
                      <input 
                        required 
                        type="email" 
                        value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})}
                        placeholder="name@institution.com" 
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-orange-500 outline-none transition-all placeholder:text-gray-600" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Organization</label>
                      <input 
                        required 
                        type="text" 
                        value={form.company}
                        onChange={e => setForm({...form, company: e.target.value})}
                        placeholder="Fund / Enterprise Name" 
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-orange-500 outline-none transition-all placeholder:text-gray-600" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Your Corporate Title</label>
                      <input 
                        required 
                        type="text" 
                        value={form.role}
                        onChange={e => setForm({...form, role: e.target.value})}
                        placeholder="e.g. Managing Director" 
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-orange-500 outline-none transition-all placeholder:text-gray-600" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Capital Allocation Bracket</label>
                    <select 
                      value={form.budget}
                      onChange={e => setForm({...form, budget: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-orange-500 outline-none transition-all"
                    >
                      <option value="Under $1 Million USD">Under $1 Million USD</option>
                      <option value="$1M - $5M USD">$1M - $5M USD</option>
                      <option value="$5M - $25M USD">$5M - $25M USD</option>
                      <option value="$25M - $100M USD">$25M - $100M USD</option>
                      <option value="$100M+ USD">$100M+ USD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Primary Area of Interest</label>
                    <select 
                      value={form.interest}
                      onChange={e => setForm({...form, interest: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-orange-500 outline-none transition-all"
                    >
                      <option value="GEAX™ Platform Development & Equity">GEAX™ Platform Development & Equity</option>
                      <option value="Industrial Talc Mining Expansion">Industrial Talc Mining Expansion</option>
                      <option value="Direct Energy Asset Acquisition">Direct Energy Asset & Offtake Acquisition</option>
                      <option value="Strategic Sovereign Infrastructure Partnerships">Strategic Corporate Partnerships</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Partnership Parameters & Notes</label>
                    <textarea 
                      value={form.message}
                      onChange={e => setForm({...form, message: e.target.value})}
                      rows={4} 
                      placeholder="Outline any special parameters, timelines, or allocation volume requests..." 
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-orange-500 outline-none transition-all resize-none placeholder:text-gray-600" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 font-bold text-white py-4 rounded-xl transition-all shadow-lg shadow-orange-500/25 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="inline-block h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    ) : (
                      "Submit Portfolio Inquiry"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Support & Contacts row */}
        <div className="p-8 md:p-12 border border-white/5 rounded-[2rem] bg-zinc-900/40 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl font-bold text-white font-sans tracking-tight">Direct Advisory Inquiries</h4>
            <p className="text-xs text-gray-400 max-w-xl">
              For rapid response outside standard system channels, qualified institutional fund managers can engage directly with our corporate operations officers in Zambia.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center shrink-0">
            <a href="mailto:moses.mwale26@gmail.com" className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs transition-colors flex items-center gap-2">
              <Mail className="h-4 w-4 text-orange-500" /> moses.mwale26@gmail.com
            </a>
            <a href="tel:+260967650685" className="px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors flex items-center gap-2">
              <Phone className="h-4 w-4" /> +260 967 650 685
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

const WhitepaperPage = ({ setPage }: { setPage: (p: Page) => void }) => {
  const [activeSection, setActiveSection] = useState("exec-summary");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [targetMW, setTargetMW] = useState(100); // 100 MW default

  // Sector list from data
  const supportedSectors = [
    { name: "Solar Energy", icon: "☀️", color: "from-amber-400 to-orange-500" },
    { name: "Hydro Energy", icon: "💧", color: "from-blue-400 to-indigo-600" },
    { name: "Wind Energy", icon: "💨", color: "from-teal-400 to-cyan-500" },
    { name: "LNG & Natural Gas", icon: "🔥", color: "from-emerald-400 to-teal-600" },
    { name: "Coal Energy", icon: "🪵", color: "from-neutral-700 to-zinc-900" },
    { name: "Nuclear Energy", icon: "⚛️", color: "from-purple-400 to-rose-500" },
    { name: "Biomass Energy", icon: "🍃", color: "from-green-400 to-emerald-500" },
    { name: "Battery Storage & Grid Systems", icon: "🔋", color: "from-orange-400 to-red-500" },
    { name: "Green Hydrogen", icon: "🧪", color: "from-indigo-400 to-purple-500" }
  ];

  // Stepper for How It Works
  const steps = [
    {
      num: 1,
      title: "Capacity Listing",
      desc: "Energy producers and project developers list future generation capacity (GW/MW), timelines, and minimum project viability thresholds on the exchange."
    },
    {
      num: 2,
      title: "Allocation & Reservation",
      desc: "Governments, corporations, and strategic buyers specify requirements, expressing formal reservation interest using standard capacity tokens."
    },
    {
      num: 3,
      title: "Structured Negotiation",
      desc: "Parties negotiate allocation blocks, pricing corridors, multi-year timelines, and sovereign/corporate guarantee terms in a secure data system."
    },
    {
      num: 4,
      title: "Financial & Infrastructure Coordination",
      desc: "Platform brings in institutional capital managers and clearing escrow utilities to guarantee funding in exchange for the finalized allocations."
    },
    {
      num: 5,
      title: "Long-Term Management",
      desc: "GEAX monitors ongoing generation schedules, grid connection stages, capacity utilization flags, and active offtake delivery enforcement."
    }
  ];

  // Whitepaper chapters and content pieces for searching
  const chapters = [
    {
      id: "exec-summary",
      title: "1. Executive Summary",
      icon: FileText,
      content: "The global energy industry is entering a new era defined by increasing demand, supply instability, infrastructure constraints, geopolitical uncertainty, and accelerating industrialization. Governments, corporations, utilities, and investors are under growing pressure to secure reliable future energy supply while balancing economic growth, sustainability objectives, and energy security. GEAX™ (Global Energy Allocation Exchange) was established to address these challenges by creating a structured private marketplace where future energy supply can be reserved, allocated, negotiated, and strategically managed before production occurs. GEAX™ enables energy producers, governments, corporations, infrastructure developers, and institutional investors to participate in a future-oriented allocation ecosystem designed to support long-term energy security."
    },
    {
      id: "introduction",
      title: "2. Introduction",
      icon: Info,
      content: "Global energy demand continues to rise due to rapid population growth, industrial expansion, urbanization, digital infrastructure growth, manufacturing demand, mining sector expansion, electrification of transportation, and the massive acceleration of data centers and artificial intelligence infrastructure. At the same time, the energy sector faces serious structural challenges like grid instability, insufficient generation capacity, delayed infrastructure investment, volatile energy spot markets, emergency procurement costs, geopolitical supply disruptions, and financing difficulties for large projects. Particular emerging markets are constrained. The GEAX platform was built specifically to bridge the coordination gap between long-term supply and future demand."
    },
    {
      id: "problem-statement",
      title: "3. The Global Energy Allocation Problem",
      icon: AlertTriangle,
      content: "Reactive energy procurement systems are a primary bottleneck. Most models buy energy on immediate demand rather than planning 10+ years ahead. This causes industrial delays, massive grid congestion, power rationing, and high-risk operational uncertainty. Additionally, project financing is difficult because developers struggle to obtain capital without robust, locked-in multi-year buyers. Grid and infrastructure constraints exacerbate the problem, producing localized energy bottlenecks. Currently fragmented global energy markets isolate producers from governments, developers, and global capital providers, delaying critical megawatt expansions."
    },
    {
      id: "geax-model",
      title: "4. The GEAX™ Model & Core Participants",
      icon: Landmark,
      content: "GEAX™ (Global Energy Allocation Exchange) is a private strategic marketplace designed to facilitate the reservation, allocation, negotiation, and coordination of future energy supply. Governments use GEAX to secure sovereign capacity and protect critical public utility targets. Energy Producers utilize the exchange to showcase future output capacity, lock in commitment pledges, and secure project bankability. Corporations and industrial buyers reserve reliable power at predictable costs, ensuring strategic manufacturing, mining, or data center expansion. Utilities and grid operators gain accurate forecast visualizers, improving transmission pipeline scheduling."
    },
    {
      id: "how-it-works",
      title: "5. How GEAX™ Works",
      icon: Target,
      content: "GEAX operates as a secure digital clearinghouse. Listing represents step 1, where developers publish verified prospectuses. Strategic buyers discover listings, formulating high-value block reservations. Standardized term sheet renegotiations and multi-party escrow clearing follow, backed by institutional funding parameters. Following financing, the system coordinates active construction checkpoints right up to grid physical-injection offtake milestones."
    },
    {
      id: "market-opportunities",
      title: "6. Market Opportunities & Regional Hotspots",
      icon: Globe,
      content: "Africa represents one of the largest growth terrains for future energy. Rapid urbanization, mineral smelting plants, high-value copper extraction hubs, and cross-border interconnectors require massive multi-gigawatt infrastructure planning. Industrial corporate energy security is another major vector; miners, processing complexes, and large AI hyperscalers require dedicated supply corridors. Simultaneously, the global shift towards solar, hydro, wind, biomass, energy storage, and green hydrogen demands high-trust, structured international capacity reserving mechanics."
    },
    {
      id: "infrastructure-economics",
      title: "7. Infrastructure Economics & Valuation",
      icon: BarChart3,
      content: "Energy is a sovereign strategic asset. A region with secured high-volume energy allocations attains automatic manufacturing superiority and investment priority. The GEAX platform utilizes allocation-driven financing to boost bankability. When developers list multi-year allocation commitments, senior debt managers and private wealth desks can fund construction with high project confidence. This generates sustainable, high-yield long-term value for all infrastructure participants."
    },
    {
      id: "technology",
      title: "8. Technology & Secure Architecture",
      icon: Lock,
      content: "GEAX is architected as a robust digital marketplace. Core technology layers include real-time capacity allocators, secured digital contract drawers, verified participant registers, smart multi-country escrow coordination corridors, and advanced demand forecast analytics. These digital elements provide ironclad confidentiality, regulatory compliance, zero-trust participant screening, and clear transaction tracking across national boundaries."
    },
    {
      id: "strategic-advantages",
      title: "9. Strategic Advantages của GEAX™",
      icon: Gem,
      content: "Strategic advantages include forward-oriented coordination (focusing on pre-production reservation), multi-stakeholder connection (linking governments, public utilities, and private capital directly), and scalable regional application. By structuring pre-production offtake risks, GEAX unlocks billions in underutilized resource pipelines, bringing stability to erratic emerging grids."
    },
    {
      id: "risks-roadmap",
      title: "10. Risks & Roadmap Horizons",
      icon: ShieldCheck,
      content: "Key risks include regulatory variations, grid connection delays, geopolitical policy shifts, and interest rate spikes. The GEAX roadmap outlines Phase 1 (Core platform infrastructure & Zambian pilot projects), Phase 2 (Multi-country onboarding & expanding into alternative solar-hydro blends), Phase 3 (Clearinghouse scaling and escrow automation), and Phase 4 (Global integration to serve cross-border continental energy trade networks)."
    }
  ];

  // Helper mock calculator formula for allocation modeling
  const estimateCapitalValue = (mw: number) => {
    return (mw * 1.2).toFixed(1); // Speculative 1.2M per MW
  };
  const estimateSovereignConfidence = (mw: number) => {
    if (mw < 100) return "High Priority (Stable)";
    if (mw < 500) return "Sovereign Strategic Grade";
    return "Consortium Critical (Ultra Scale)";
  };

  const jumpToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(`wp-sec-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Instant keyword filtering of sections
  const filteredChapters = chapters.filter(chap => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return chap.title.toLowerCase().includes(term) || chap.content.toLowerCase().includes(term);
  });

  return (
    <div className="pt-32 pb-24 px-4 bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Document Header & Meta */}
        <div className="border border-white/5 bg-zinc-900/30 rounded-3xl p-8 md:p-12 mb-12 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <BookOpen className="h-64 w-64 text-orange-500" />
          </div>

          <div className="relative z-10 max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-mono font-bold uppercase tracking-widest">
              <FileText className="h-3.5 w-3.5 text-orange-500" /> OFFICIAL CONSTITUTIONAL DOCUMENT
            </div>
            <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tighter leading-none">
              GEAX™ <span className="text-orange-500">Whitepaper</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-300 font-medium leading-relaxed max-w-3xl">
              Global Energy Allocation Exchange: Securing the Future of Energy — Before It’s Produced.
            </p>

            <div className="flex flex-wrap gap-6 items-center pt-4 border-t border-white/5 text-gray-500 text-xs font-mono">
              <div>
                <span className="text-gray-600 uppercase block tracking-wider text-[10px]">Authoring Operator</span>
                <span className="text-white font-bold text-[11px]">B & M MASTERLINK LTD</span>
              </div>
              <div className="h-6 w-px bg-white/10 hidden sm:block" />
              <div>
                <span className="text-gray-600 block uppercase tracking-wider text-[10px]">Document Release</span>
                <span className="text-white font-bold text-[11px]">v3.2.0 • May 2026 Edition</span>
              </div>
              <div className="h-6 w-px bg-white/10 hidden sm:block" />
              <div>
                <span className="text-gray-600 block uppercase tracking-wider text-[10px]">Security Status</span>
                <span className="text-orange-500 font-bold text-[11px]">PUBLIC STRATEGIC MEMORANDUM</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <button 
                onClick={() => window.print()} 
                className="px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20"
              >
                <Download className="h-4 w-4" /> Export / Print Official PDF
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById("wp-calculator-box");
                  el?.scrollIntoView({ behavior: "smooth" });
                }} 
                className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-semibold transition-all"
              >
                Jump to Capacity Calculator
              </button>
            </div>
          </div>
        </div>

        {/* Global Real-time Search Panel */}
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 md:p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-1/2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
            <input 
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search chapters, keywords (e.g., Solar, Zambia, Escrow)..." 
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-xs focus:border-orange-500 outline-none transition-all placeholder:text-gray-600 font-sans"
            />
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-gray-500">Showing {filteredChapters.length} of {chapters.length} chapters</span>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="text-orange-500 font-bold hover:underline"
              >
                Reset Search
              </button>
            )}
          </div>
        </div>

        {/* Major Grid System: Interactive Sidebar + Reading Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* STICKY OUTLINE SIDEBAR (Desktop) */}
          <div className="lg:col-span-4 sticky top-28 space-y-6 hidden lg:block">
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-orange-500 mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Document Outline
              </h3>
              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {filteredChapters.map(chap => (
                  <button
                    key={chap.id}
                    onClick={() => jumpToSection(chap.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 border transition-all ${
                      activeSection === chap.id
                        ? "bg-orange-500/10 border-orange-500/30 text-white"
                        : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate">{chap.title}</span>
                    <chap.icon className={`h-3.5 w-3.5 shrink-0 ${activeSection === chap.id ? 'text-orange-500' : 'text-gray-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Investor Portal Shortcut Card */}
            <div className="p-6 bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl space-y-4">
              <h4 className="text-white font-bold text-sm">Strategic Advisory Panel</h4>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Qualified sovereigns, fund managers, and developers can access custom-tailored strategic allocations directly via our directorship boards.
              </p>
              <button 
                onClick={() => setPage("investor")}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                Access Investor Portal <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* MAIN DOCUMENT CORE READOUTFLOW */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* CHAP: 1 */}
            <div id="wp-sec-exec-summary" className="p-8 md:p-10 bg-zinc-900/20 border border-white/5 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">1. Executive Summary</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed font-sans">
                The global energy industry is entering a new era defined by increasing demand, supply instability, infrastructure constraints, geopolitical uncertainty, and accelerating industrialization. Governments, corporations, utilities, and investors are under growing pressure to secure reliable future energy supply while balancing economic growth, sustainability objectives, and energy security.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed font-sans">
                Traditional energy procurement systems are often reactive, fragmented, regionally constrained, and unable to efficiently coordinate long-term allocation of future energy production. This creates uncertainty in industrial planning, infrastructure financing, and national energy strategies.
              </p>
              <div className="p-5 bg-orange-500/5 border-l-2 border-orange-500 rounded-r-xl">
                <p className="text-orange-300 font-mono text-xs italic">
                  &ldquo;GEAX™ (Global Energy Allocation Exchange) was established to address these challenges by creating a structured private marketplace where future energy supply can be reserved, allocated, negotiated, and strategically managed before production occurs.&rdquo;
                </p>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                GEAX™ enables energy producers, governments, corporations, infrastructure developers, and institutional investors to participate in a future-oriented allocation ecosystem designed to support long-term energy security, infrastructure expansion, and strategic market coordination.
              </p>
            </div>

            {/* CHAP: 2 */}
            <div id="wp-sec-introduction" className="p-8 md:p-10 bg-zinc-900/20 border border-white/5 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Info className="h-5 w-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">2. Introduction</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Global energy demand continues to rise exponentially due to major megatrends: population explosion, industrial expansion, rapid third-world urbanization, digital infrastructure growth, manufacturing demand, mining sector expansion, electrification of transport systems, and the explosive buildout of data centers driven by next-generation Artificial Intelligence infrastructure.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                  <h4 className="text-white font-bold text-xs mb-2">Demand Accelerators</h4>
                  <ul className="space-y-1.5 text-[11px] text-gray-400">
                    <li>• AI Datacenter Clustering</li>
                    <li>• Mining and Metal Processing</li>
                    <li>• Sovereign Urbanization Hedges</li>
                    <li>• Global Grid Electrification</li>
                  </ul>
                </div>
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                  <h4 className="text-white font-bold text-xs mb-2">Systemic Grid Vulnerabilities</h4>
                  <ul className="space-y-1.5 text-[11px] text-gray-400">
                    <li>• Chronic under-investment</li>
                    <li>• Volatile regional spot markets</li>
                    <li>• Extreme load congestion events</li>
                    <li>• Emergency generation pricing</li>
                  </ul>
                </div>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Particularly across emerging economies, critical heavy industrial programs are being severely throttled by unpredictable electricity reserves. This volatile ecosystem establishes a baseline requirement for structured forward-looking coordination.
              </p>
            </div>

            {/* CHAP: 3 */}
            <div id="wp-sec-problem-statement" className="p-8 md:p-10 bg-zinc-900/20 border border-white/5 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">3. The Global Energy Allocation Problem</h2>
              </div>
              
              <div className="space-y-4 text-sm text-gray-300">
                <h4 className="text-white font-bold text-base">Key Problem Domains:</h4>
                
                <div className="space-y-3">
                  <div className="p-5 bg-black/50 border border-white/5 rounded-xl">
                    <span className="text-orange-500 font-bold text-xs">1. Reactive Energy Procurement Systems</span>
                    <p className="text-xs text-gray-400 mt-1">Historically, offtake is reserved only when power stations are already hot and integrated into regional grids. This instigates severe bidding wars, localized supply rationing, and immense fiscal waste.</p>
                  </div>
                  
                  <div className="p-5 bg-black/50 border border-white/5 rounded-xl">
                    <span className="text-orange-500 font-bold text-xs">2. Financing Challenges for Major Infrastructure</span>
                    <p className="text-xs text-gray-400 mt-1">Lenders are reluctant to authorize capital flows for new greenfield hydro or solar builds without ironclad pre-committed buyers. Risk premiums escalate, stagnating construction stages.</p>
                  </div>

                  <div className="p-5 bg-black/50 border border-white/5 rounded-xl">
                    <span className="text-orange-500 font-bold text-xs">3. Volatility and Fragmented Market Corridors</span>
                    <p className="text-xs text-gray-400 mt-1">A profound coordinate gap separates multi-national mining groups, state utility boards, global developers, and banking consortiums, culminating in slow strategic growth.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CHAP: 4 */}
            <div id="wp-sec-geax-model" className="p-8 md:p-10 bg-zinc-900/20 border border-white/5 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Landmark className="h-5 w-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">4. The GEAX™ Model & Participants</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                GEAX is not a standard high-frequency derivative trading platform. It functions as a structured structural coordinator specializing in multi-year forward planning capacity reservations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  { title: "Governments & Authorities", desc: "Lock in core national load indexes, coordinate developmental policies, and safeguard industrial hubs." },
                  { title: "Energy Producers", desc: "Gain massive visibility to pre-sell output, secure long-term capital bankability, and accelerate site development." },
                  { title: "Corporations & Smelters", desc: "Shield extensive mining blocks or global server farms from short-term peak grid inflation waves." },
                  { title: "Investors & Clearinghouses", desc: "Redirect capital straight into vetted clean projects with pre-committed global tier-1 buyers." }
                ].map((p, i) => (
                  <div key={i} className="p-5 bg-black/40 border border-white/5 rounded-xl">
                    <h5 className="text-white font-bold text-xs flex items-center gap-2 mb-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                      {p.title}
                    </h5>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CHAP: 5 */}
            <div id="wp-sec-how-it-works" className="p-8 md:p-10 bg-zinc-900/20 border border-white/5 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Target className="h-5 w-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">5. How GEAX™ Works</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                The transaction process on GEAX follows a rigorous five-step strategic funnel designed to minimize participant risks and coordinate project flow:
              </p>

              {/* Graphical Stepper */}
              <div className="border border-white/5 bg-black/60 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6 overflow-x-auto pb-2 gap-2">
                  {steps.map(s => (
                    <button
                      key={s.num}
                      onClick={() => setActiveStep(s.num)}
                      className={`h-9 w-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 transition-all ${
                        activeStep === s.num
                          ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                          : "bg-white/5 border border-white/10 text-gray-400"
                      }`}
                    >
                      {s.num}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-mono tracking-wider uppercase text-orange-500">Step {activeStep} of 5</div>
                  <h4 className="text-white font-bold text-base font-sans">{steps[activeStep - 1].title}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">{steps[activeStep - 1].desc}</p>
                </div>
              </div>
            </div>

            {/* CHAP: 6 - Regional / opportunities */}
            <div id="wp-sec-market-opportunities" className="p-8 md:p-10 bg-zinc-900/20 border border-white/5 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Globe className="h-5 w-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">6. Market Opportunities & Sectors</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                The convergence of Africa&apos;s unprecedented mineral wealth expansion (e.g., Copperbelt industrialization in Zambia and neighboring states) with digital and clean energy infrastructures has created massive requirements for pre-production capacity allocation.
              </p>

              {/* Supported Sectors Grid */}
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sectors Administered by GEAX™</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {supportedSectors.map((sector, i) => (
                  <div key={i} className="p-4 bg-zinc-900 border border-white/5 rounded-xl flex items-center gap-3">
                    <span className="text-2xl">{sector.icon}</span>
                    <div>
                      <h4 className="text-white font-bold text-xs">{sector.name}</h4>
                      <p className="text-[10px] font-mono text-gray-500">Active Corridor</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CHAP: 7 - Economics & Interactive Calculator */}
            <div id="wp-sec-infrastructure-economics" className="p-8 md:p-10 bg-zinc-900/20 border border-white/5 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">7. Infrastructure Economics</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                By enabling structured forward capacity reservation, GEAX minimizes project development risks. This structural stability serves to reduce capital borrowing rates from global financial desks.
              </p>

              {/* Interactive MW Capital Modeler Box */}
              <div id="wp-calculator-box" className="p-6 bg-gradient-to-tr from-zinc-900 via-zinc-950 to-black border border-white/10 rounded-2xl space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-orange-500" /> GEAX™ Allocation Economic Modeler
                  </h4>
                  <p className="text-gray-400 text-[11px] mt-1">Estimating infrastructure capitalization confidence & required reserve targets.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-300 mb-2 font-mono">
                      <span>Reserve Target Capacity:</span>
                      <span className="text-white font-bold text-sm">{targetMW} Megawatts (MW)</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="1000" 
                      step="10" 
                      value={targetMW} 
                      onChange={e => setTargetMW(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-ew-resize h-1 bg-zinc-800 rounded-lg outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                      <span className="text-gray-500 text-[9px] uppercase tracking-wider block">Estimated Project Fund Confidence</span>
                      <span className="text-green-400 font-bold text-xs block mt-1">98.2% Guarantee Block</span>
                    </div>

                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                      <span className="text-gray-500 text-[9px] uppercase tracking-wider block">Approx Capitalized Value</span>
                      <span className="text-white font-bold text-xs block mt-1">${estimateCapitalValue(targetMW)} Million USD</span>
                    </div>

                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                      <span className="text-gray-500 text-[9px] uppercase tracking-wider block">Institutional Priority Grade</span>
                      <span className="text-orange-500 font-bold text-[10px] block mt-1 truncate">{estimateSovereignConfidence(targetMW)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[10px] text-gray-500">
                  <span>*Speculatively modeled using 2026 standardized index metrics.</span>
                  <button 
                    onClick={() => setPage("investor")}
                    className="text-orange-500 hover:text-orange-400 font-bold hover:underline"
                  >
                    Discuss Allocations Directly →
                  </button>
                </div>
              </div>
            </div>

            {/* CHAP: 8 - Technology & Portal Safety */}
            <div id="wp-sec-technology" className="p-8 md:p-10 bg-zinc-900/20 border border-white/5 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Lock className="h-5 w-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">8. Secure Digital Architecture</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Security and data privacy remain absolute core pillars of our exchange design. GEAX utilizes modern enterprise security structures to ensure data validation, secure multi-country contract tracking, zero-trust investor screening corridors, and robust firestore isolation layers to fully guarantee PII protections.
              </p>
              <div className="p-4 bg-zinc-900 border border-white/5 rounded-xl flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-green-500 shrink-0" />
                <p className="text-xs text-gray-400">
                  Enterprise-grade digital security protocols are audited periodically under Zambian regulatory jurisdictions and regional trade clearing frameworks.
                </p>
              </div>
            </div>

            {/* CHAP: 9 */}
            <div id="wp-sec-strategic-advantages" className="p-8 md:p-10 bg-zinc-900/20 border border-white/5 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Gem className="h-5 w-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">9. Strategic Advantages</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                By providing an organized market and transparent price discovery parameters for pre-production capacity, GEAX converts speculative energy planning into highly predictable investments.
              </p>
              <ul className="space-y-2 text-xs text-gray-400 font-sans">
                <li className="flex gap-2 items-start">
                  <ChevronRight className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <span><strong>Zero Spot Market Vulnerability:</strong> Locks in capacity guarantees, bypassing fossil-fuel supply price shockwaves.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <ChevronRight className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <span><strong>Infrastructure Bankability Multiplier:</strong> Producers leverage verified reservations directly to speed construct financing.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <ChevronRight className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <span><strong>Sovereign and Private Alignment:</strong> High-risk regional constraints yield to highly collaborative corporate/state joint agreements.</span>
                </li>
              </ul>
            </div>

            {/* CHAP: 10 - Roadmap */}
            <div id="wp-sec-risks-roadmap" className="p-8 md:p-10 bg-zinc-900/20 border border-white/5 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">10. Risks & Roadmap Horizons</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-red-500/5 border border-red-500/15 rounded-xl text-xs text-gray-400">
                  <strong className="text-white block mb-1">Risk Factors under Active Surveillance:</strong>
                  Cross-border transaction coordination, evolving national regulatory updates, power transmission line bottlenecks, and general construction delay liabilities.
                </div>

                {/* Vertical roadmap visual */}
                <div className="space-y-4 pt-2">
                  {[
                    { title: "Phase 1: Foundation (Current)", detail: "Launching core GEAX platform infrastructure, piloting early Zambian solar and high-purity Talc asset coordinates." },
                    { title: "Phase 2: Regional Integration", detail: "Extending multi-agency partnerships across eastern and southern African grids. Adding advanced wind-hydro allocation modules." },
                    { title: "Phase 3: Digital Automation", detail: "Incorporating micro-analytics forecasting engines, escrow clearance utilities, and verified sovereign audit portals." },
                    { title: "Phase 4: Global Scale", detail: "Pioneering highly liquid cross-continental energy allocation agreements and institutional trade registries." }
                  ].map((phase, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="h-7 w-7 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-[10px] font-bold">
                          {i + 1}
                        </div>
                        {i < 3 && <div className="w-0.5 h-10 bg-white/5" />}
                      </div>
                      <div>
                        <h5 className="text-white font-bold text-xs">{phase.title}</h5>
                        <p className="text-gray-400 text-[10px] leading-relaxed mt-0.5">{phase.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CONCLUDING OPPORTUNISM CALL - Direct Form Bridge */}
            <div className="p-8 md:p-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-[2rem] text-white space-y-6">
              <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-orange-100">CONCLUSION & CONSTITUTION</h3>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Lock In Future Energy Capacity Today</h2>
              <p className="text-sm text-orange-50/90 leading-relaxed">
                As worldwide demand climbs, the entities that control secure forward energy plans command massive macroeconomic advantages. GEAX and B & M Masterlink LTD provide the infrastructure, technology, and strategic mineral reserves to power tomorrow.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <button 
                  onClick={() => setPage("investor")} 
                  className="px-6 py-3 rounded-full bg-white text-orange-600 font-bold text-xs transition-transform hover:scale-105 shadow-xl"
                >
                  Join Strategic Investor Channels
                </button>
                <button 
                  onClick={() => setPage("contact")} 
                  className="px-6 py-3 rounded-full bg-black/20 hover:bg-black/40 text-white font-bold text-xs transition-colors border border-white/20"
                >
                  Contact Desk Team
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

const AboutPage = () => (
  <div className="pt-32 pb-24 px-4 bg-zinc-950 min-h-screen">
    <div className="max-w-7xl mx-auto">
      <div className="max-w-3xl mb-24">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter">About GEAX™</h1>
        <div className="space-y-12">
          <div>
            <h2 className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-4">Our Vision</h2>
            <p className="text-3xl text-white font-medium leading-tight">
              To become the global infrastructure for allocating and securing future energy supply.
            </p>
          </div>
          <div>
            <h2 className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-4">Our Mission</h2>
            <p className="text-xl text-gray-400 leading-relaxed">
              To bring transparency, efficiency, and scale to the global energy market by enabling structured forward allocation of energy resources.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        {[
          { title: "Future Focused", desc: "Exclusive focus on future energy allocation rather than spot markets." },
          { title: "AI-Powered", desc: "Advanced market intelligence built into every transaction." },
          { title: "Institutional Grade", desc: "Infrastructure designed for billion-dollar energy contracts." },
          { title: "Global Network", desc: "Direct access to the world's largest producers and buyers." }
        ].map((item, i) => (
          <div key={i} className="p-8 bg-zinc-900 border border-white/10 rounded-2xl">
            <h3 className="text-white font-bold mb-4">{item.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-orange-500 rounded-3xl p-12 text-white">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tighter">Final Positioning</h2>
        <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-5xl">
          Global Energy Allocation Exchange (GEAX™) is not just a marketplace — it is the financial and operational infrastructure for securing the world’s future energy supply, enabling governments, corporations, and producers to transact billions in energy capacity through a single intelligent platform.
        </p>
      </div>
    </div>
  </div>
);

const ContactPage = () => (
  <div className="pt-32 pb-24 px-4 bg-black min-h-screen">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter">Connect With GEAX™</h1>
          <p className="text-xl text-gray-400 mb-12">Engage with global energy opportunities. Our team is ready to assist with your allocation needs.</p>
          
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-white font-bold">Email</h4>
                <p className="text-gray-400">moses.mwale26@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-white font-bold">Phone</h4>
                <p className="text-gray-400">+260967650685 (WhatsApp)</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-white font-bold">Global Operations</h4>
                <p className="text-gray-400">Active in all major energy hubs.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 p-10 rounded-3xl border border-white/10">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                <input type="text" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Organization</label>
                <input type="text" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" placeholder="Gov / Corp Name" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
              <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors">
                <option>Buyer</option>
                <option>Producer</option>
                <option>Investor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
              <textarea rows={4} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" placeholder="Your inquiry..."></textarea>
            </div>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all">Submit Inquiry</button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

// --- Firebase Helpers (No longer needed here, imported from firebase.ts)

// --- Auth Context ---
interface UserProfile {
  uid: string;
  name: string;
  email: string;
  company: string;
  role: "buyer" | "producer" | "trader";
  isVerified: boolean;
  paymentGateways?: {
    paypal: boolean;
    stripe: boolean;
    pesapal: boolean;
    escrow: boolean;
  };
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// --- Global Preferences Context ---
export type GlobalCurrency = "USD" | "EUR" | "GBP" | "ZAR" | "SGD";
export type GlobalLanguage = "EN" | "FR" | "ES" | "PT" | "ZH";
export type TradeCorridor = "SADC" | "EUROPE" | "AMERICAS" | "APAC" | "MENA";

export interface GlobalPreferencesType {
  currency: GlobalCurrency;
  language: GlobalLanguage;
  corridor: TradeCorridor;
  setCurrency: (c: GlobalCurrency) => void;
  setLanguage: (l: GlobalLanguage) => void;
  setCorridor: (c: TradeCorridor) => void;
  formatPrice: (amountInUSD: number) => string;
}

export const GlobalPreferencesContext = createContext<GlobalPreferencesType | undefined>(undefined);

export const useGlobalPreferences = () => {
  const context = useContext(GlobalPreferencesContext);
  if (!context) throw new Error("useGlobalPreferences must be used within a GlobalPreferencesProvider");
  return context;
};

// --- Main App ---

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Global Preferences
  const [currency, setCurrencyState] = useState<GlobalCurrency>("USD");
  const [language, setLanguageState] = useState<GlobalLanguage>("EN");
  const [corridor, setCorridorState] = useState<TradeCorridor>("SADC");

  const EXCHANGE_RATES: Record<GlobalCurrency, { rate: number; symbol: string }> = {
    USD: { rate: 1.0, symbol: "$" },
    EUR: { rate: 0.92, symbol: "€" },
    GBP: { rate: 0.79, symbol: "£" },
    ZAR: { rate: 18.50, symbol: "R" },
    SGD: { rate: 1.34, symbol: "S$" }
  };

  const formatPrice = (amountInUSD: number) => {
    const { rate, symbol } = EXCHANGE_RATES[currency];
    const converted = Math.round(amountInUSD * rate);
    return `${symbol}${converted.toLocaleString()}`;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        // Seed data if needed once user is signed in
        seedData();
        try {
          const docRef = doc(db, "users", authUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setPage("home");
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if profile exists, if not create one
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const newProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || "New Client",
          email: user.email || "",
          company: "Individual Client",
          role: "buyer",
          isVerified: false,
          paymentGateways: {
            paypal: false,
            stripe: false,
            pesapal: false,
            escrow: true
          }
        };
        await setDoc(docRef, {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setProfile(newProfile);
      } else {
        setProfile(docSnap.data() as UserProfile);
      }
      
      setPage("home");
    } catch (error) {
      console.error("Google sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const renderPage = () => {
    if (loading) {
      return (
        <div className="h-screen w-screen bg-black flex items-center justify-center">
          <Zap className="h-12 w-12 text-orange-500 animate-pulse" />
        </div>
      );
    }

    switch (page) {
      case "home": return <HomePage setPage={setPage} />;
      case "features": return <FeaturesPage />;
      case "how-it-works": return <HowItWorksPage />;
      case "pricing": return <PricingPage />;
      case "buyer": return <BuyerPage setPage={setPage} />;
      case "producer": return <ProducerPage setPage={setPage} />;
      case "buyer-dashboard": return <BuyerDashboard setPage={setPage} />;
      case "producer-dashboard": return <ProducerDashboard setPage={setPage} />;
      case "contracts": return <ContractsPage />;
      case "login": return <LoginPage setPage={setPage} />;
      case "signup": return <SignupPage setPage={setPage} />;
      case "intelligence": return <IntelligencePage />;
      case "security": return <SecurityPage />;
      case "about": return <AboutPage />;
      case "company": return <CompanyPage setPage={setPage} />;
      case "investor": return <InvestorPage />;
      case "whitepaper": return <WhitepaperPage setPage={setPage} />;
      case "contact": return <ContactPage />;
      default: return <HomePage setPage={setPage} />;
    }
  };

  const getPageMetadata = () => {
    const base = "GEAX™";
    switch (page) {
      case "home": return { title: `${base} | Global Energy Allocation Exchange`, desc: "The premier global energy marketplace for governments and corporations." };
      case "features": return { title: `Features | ${base}`, desc: "Explore the innovative features of the Global Energy Allocation Exchange." };
      case "how-it-works": return { title: `How It Works | ${base}`, desc: "Learn how the GEAX platform facilitates secure energy allocation." };
      case "pricing": return { title: `Pricing | ${base}`, desc: "Transparent pricing models for energy buyers and producers." };
      case "intelligence": return { title: `Market Intelligence | ${base}`, desc: "Real-time insights and benchmarks for the global energy market." };
      case "security": return { title: `Security & Compliance | ${base}`, desc: "Enterprise-grade security for international energy transactions." };
      case "about": return { title: `About GEAX | ${base}`, desc: "The mission and vision behind the Global Energy Allocation Exchange." };
      case "company": return { title: `Company Profile | ${base}`, desc: "B & M Masterlink LTD - Exploration, mining, processor/supplier of Talc, and operator of GEAX™." };
      case "investor": return { title: `Investor Relations | ${base}`, desc: "Institutional investment options, physical Talc expansion, and strategic GEAX private clearing partnerships." };
      case "whitepaper": return { title: `GEAX™ Whitepaper | ${base}`, desc: "Global Energy Allocation Exchange - Securing the Future of Energy Before It’s Produced." };
      case "contact": return { title: `Contact Us | ${base}`, desc: "Get in touch with the GEAX team for support or inquiries." };
      case "login": return { title: `Login | ${base}`, desc: "Access your GEAX account." };
      case "signup": return { title: `Join GEAX | ${base}`, desc: "Register as a buyer or producer on the GEAX platform." };
      default: return { title: base, desc: "Global Energy Allocation Exchange" };
    }
  };

  const metadata = getPageMetadata();

  return (
    <HelmetProvider>
      <AuthContext.Provider value={{ user, profile, loading, logout, signInWithGoogle }}>
        <GlobalPreferencesContext.Provider value={{
          currency,
          language,
          corridor,
          setCurrency: setCurrencyState,
          setLanguage: setLanguageState,
          setCorridor: setCorridorState,
          formatPrice
        }}>
          <Helmet>
            <title>{metadata.title}</title>
            <meta name="description" content={metadata.desc} />
            <meta property="og:title" content={metadata.title} />
            <meta property="og:description" content={metadata.desc} />
            <meta name="twitter:title" content={metadata.title} />
            <meta name="twitter:description" content={metadata.desc} />
          </Helmet>
          <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500 selection:text-white flex flex-col">
            <MarketTicker />
            <Navbar currentPage={page} setPage={setPage} />
            
            <main className="flex-grow">
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderPage()}
                </motion.div>
              </AnimatePresence>
            </main>

            <Footer setPage={setPage} />
          </div>
        </GlobalPreferencesContext.Provider>
      </AuthContext.Provider>
    </HelmetProvider>
  );
}
