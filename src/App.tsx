/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
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
  User
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
  | "contact";

// --- Components ---

const MarketTicker = () => {
  const benchmarks = [
    { label: "Brent Crude", price: "$84.62", change: "+1.2%" },
    { label: "Henry Hub", price: "$3.42", change: "-0.8%" },
    { label: "EU Carbon", price: "€92.15", change: "+0.5%" },
    { label: "Global Solar", price: "$42.80", change: "-2.1%" },
    { label: "WTI Crude", price: "$80.15", change: "+0.9%" },
    { label: "UK Gas", price: "£0.72", change: "+1.5%" },
  ];

  return (
    <div className="bg-orange-500/10 border-b border-orange-500/20 py-2 overflow-hidden whitespace-nowrap relative z-[60]">
      <div className="flex animate-marquee">
        {[...benchmarks, ...benchmarks].map((item, i) => (
          <div key={i} className="inline-flex items-center mx-8">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mr-2">{item.label}</span>
            <span className="text-xs font-bold text-white mr-2">{item.price}</span>
            <span className={`text-[10px] font-bold ${item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Navbar = ({ currentPage, setPage }: { currentPage: Page, setPage: (p: Page) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems: { label: string; id: Page }[] = [
    { label: "Features", id: "features" },
    { label: "Pricing", id: "pricing" },
    { label: "Buyers", id: "buyer" },
    { label: "Producers", id: "producer" },
    { label: "Contracts", id: "contracts" },
    { label: "Intelligence", id: "intelligence" },
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
            <div className="h-4 w-px bg-white/10 mx-2" />
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
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Company</h4>
        <ul className="space-y-2 text-sm text-gray-400">
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
      © {new Date().getFullYear()} Global Energy Allocation Exchange (GEAX™). All rights reserved.
    </div>
  </footer>
);

// --- Page Components ---

const HomePage = ({ setPage }: { setPage: (p: Page) => void }) => (
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
              onClick={() => setPage("signup")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center"
            >
              Request Access <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={() => setPage("login")}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg transition-all"
            >
              Portal Login
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

  const producerPrice = billingCycle === "yearly" ? "$25k – $250k" : "$2,100 – $21,000";
  const buyerPrice = billingCycle === "yearly" ? "$50k – $150k" : "$4,200 – $12,500";
  const unit = billingCycle === "yearly" ? "/ year" : "/ month";

  return (
    <div className="pt-32 pb-24 px-4 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter">Transparent Pricing</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">Powering high-value energy transactions with institutional-grade infrastructure.</p>
          
          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-bold ${billingCycle === "monthly" ? "text-orange-500" : "text-gray-500"}`}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="w-14 h-7 bg-zinc-800 rounded-full relative p-1 transition-colors"
            >
              <div className={`w-5 h-5 bg-orange-500 rounded-full transition-transform ${billingCycle === "yearly" ? "translate-x-7" : "translate-x-0"}`} />
            </button>
            <span className={`text-sm font-bold ${billingCycle === "yearly" ? "text-orange-500" : "text-gray-500"}`}>Yearly</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-10 bg-zinc-900 border border-white/10 rounded-3xl">
            <h3 className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-4">For Energy Producers</h3>
            <div className="text-4xl font-bold text-white mb-6">{producerPrice} <span className="text-lg text-gray-500 font-normal">{unit}</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-300"><CheckCircle2 className="h-5 w-5 text-orange-500 mr-3" /> Per capacity listing fee</li>
              <li className="flex items-center text-gray-300"><CheckCircle2 className="h-5 w-5 text-orange-500 mr-3" /> Premium placement options available</li>
              <li className="flex items-center text-gray-300"><CheckCircle2 className="h-5 w-5 text-orange-500 mr-3" /> Global buyer exposure</li>
            </ul>
          </div>
          <div className="p-10 bg-zinc-900 border border-white/10 rounded-3xl">
            <h3 className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-4">For Buyers (Gov & Corp)</h3>
            <div className="text-4xl font-bold text-white mb-6">{buyerPrice} <span className="text-lg text-gray-500 font-normal">{unit}</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-300"><CheckCircle2 className="h-5 w-5 text-orange-500 mr-3" /> Access to exclusive listings</li>
              <li className="flex items-center text-gray-300"><CheckCircle2 className="h-5 w-5 text-orange-500 mr-3" /> Market intelligence dashboard</li>
              <li className="flex items-center text-gray-300"><CheckCircle2 className="h-5 w-5 text-orange-500 mr-3" /> Contract structuring tools</li>
            </ul>
          </div>
        </div>

      <div className="bg-orange-500 rounded-3xl p-12 text-center text-white mb-8">
        <h3 className="text-2xl font-bold mb-8">Transaction Fees: 0.5% – 1% per contract</h3>
        <div className="max-w-2xl mx-auto bg-black/20 p-8 rounded-2xl backdrop-blur-sm">
          <h4 className="text-orange-200 uppercase tracking-widest text-xs font-bold mb-4">Revenue Potential Example</h4>
          <div className="text-4xl md:text-5xl font-bold mb-2">10 contracts/mo × $1B × 0.5%</div>
          <div className="text-2xl font-medium text-orange-100">= $50M/month ($600M/year)</div>
        </div>
      </div>

      <div className="p-10 bg-zinc-900 border border-white/10 rounded-3xl text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
            <ShieldCheck className="h-10 w-10" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">Escrow Payment Gateway</h3>
        <p className="text-gray-400 max-w-2xl mx-auto mb-6">
          All high-value transactions on GEAX™ are secured through our integrated Escrow Payment Gateway. Funds are held securely and only released upon verified contract milestones, ensuring 100% protection for both buyers and producers.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold text-orange-500 border border-orange-500/20 uppercase tracking-widest">Milestone-Based Release</span>
          <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold text-orange-500 border border-orange-500/20 uppercase tracking-widest">Multi-Signature Approval</span>
          <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold text-orange-500 border border-orange-500/20 uppercase tracking-widest">Global Compliance</span>
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

const BuyerDashboard = ({ setPage }: { setPage: (p: Page) => void }) => (
  <div className="pt-32 pb-24 px-4 bg-zinc-950 min-h-screen">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Buyer Dashboard</h1>
          <p className="text-gray-400">Institutional Energy Allocation Portfolio</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setPage("producer-dashboard")} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all">Switch to Producer View</button>
          <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition-all">Reserve New Capacity</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Reserved", value: "4.2 GW", sub: "+15% vs last quarter", icon: Zap },
          { label: "Active Contracts", value: "12", sub: "3 pending verification", icon: FileText },
          { label: "Next Delivery", value: "Oct 2026", sub: "Solar Farm Alpha", icon: Globe },
          { label: "Escrow Balance", value: "$840M", sub: "Fully collateralized", icon: ShieldCheck }
        ].map((stat, i) => (
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
              <button className="text-orange-500 text-sm font-bold hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black/20 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4">Asset Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Capacity</th>
                    <th className="px-6 py-4">Start Date</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { name: "Sahara Solar Hub", type: "Solar", cap: "1.2 GW", date: "Jan 2027", status: "Active" },
                    { name: "North Sea Wind B", type: "Wind", cap: "800 MW", date: "Mar 2028", status: "Pending" },
                    { name: "Arctic LNG Terminal", type: "LNG", cap: "2.5 MTPA", date: "Jun 2026", status: "Active" },
                    { name: "Equatorial Hydro", type: "Hydro", cap: "450 MW", date: "Sep 2029", status: "Negotiation" }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer">
                      <td className="px-6 py-4 text-sm font-bold text-white">{row.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{row.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{row.cap}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{row.date}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
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

const ProducerDashboard = ({ setPage }: { setPage: (p: Page) => void }) => (
  <div className="pt-32 pb-24 px-4 bg-zinc-950 min-h-screen">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Producer Dashboard</h1>
          <p className="text-gray-400">Energy Production & Monetization Hub</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setPage("buyer-dashboard")} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all">Switch to Buyer View</button>
          <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition-all">List New Capacity</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Listed", value: "8.5 GW", sub: "Across 4 projects", icon: Building2 },
          { label: "Sold Capacity", value: "5.2 GW", sub: "61% monetization rate", icon: Handshake },
          { label: "Available", value: "3.3 GW", sub: "Open for reservation", icon: Zap },
          { label: "Revenue Forecast", value: "$2.4B", sub: "Next 5 years (Forward)", icon: TrendingUp }
        ].map((stat, i) => (
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
              <button className="text-orange-500 text-sm font-bold hover:underline">Manage All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black/20 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4">Project Name</th>
                    <th className="px-6 py-4">Total Capacity</th>
                    <th className="px-6 py-4">Sold</th>
                    <th className="px-6 py-4">Price Floor</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { name: "Blue Horizon Wind", cap: "2.0 GW", sold: "1.5 GW", price: "$45/MWh", status: "Active" },
                    { name: "Giga Solar Farm", cap: "4.5 GW", sold: "2.8 GW", price: "$38/MWh", status: "Active" },
                    { name: "Deep Sea LNG", cap: "1.2 MTPA", sold: "0.9 MTPA", price: "Market", status: "Paused" },
                    { name: "Mountain Hydro", cap: "800 MW", sold: "0 MW", price: "$52/MWh", status: "Draft" }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer">
                      <td className="px-6 py-4 text-sm font-bold text-white">{row.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{row.cap}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{row.sold}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{row.price}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${
                          row.status === 'Active' ? 'bg-green-500/10 text-green-500' : 
                          row.status === 'Paused' ? 'bg-orange-500/10 text-orange-500' : 
                          'bg-gray-500/10 text-gray-400'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
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
    </div>
  </div>
);

const ContractsPage = () => {
  const [selectedContract, setSelectedContract] = useState<any>(null);

  const contracts = [
    {
      id: "GEAX-2026-001",
      title: "North Sea Wind Allocation",
      value: "$1.25 Billion",
      capacity: "2.5 GW",
      duration: "15 Years",
      buyer: "European Energy Grid Consortium",
      producer: "Nordic Offshore Power",
      status: "Fully Collateralized",
      type: "Wind (Offshore)",
      highlights: ["Fixed Price Floor: $42/MWh", "Escrow-Backed Milestones", "Guaranteed 98% Uptime"],
      terms: [
        "1. ALLOCATION: The Producer agrees to allocate 2.5 GW of future offshore wind capacity exclusively to the Buyer.",
        "2. PRICING: A fixed price floor of $42/MWh is established, with an annual escalation of 2.5% or CPI, whichever is higher.",
        "3. ESCROW: $1.25 Billion in total contract value is secured via GEAX™ Escrow Gateway, with milestone-based releases.",
        "4. DELIVERY: Commercial operation date (COD) is guaranteed for Q1 2028. Late delivery penalties apply at $500k/day.",
        "5. GOVERNANCE: Disputes shall be settled via bilateral arbitration under GEAX™ standard institutional framework."
      ]
    },
    {
      id: "GEAX-2026-002",
      title: "Sahara Solar Strategic Reserve",
      value: "$980 Million",
      capacity: "1.8 GW",
      duration: "20 Years",
      buyer: "North African Industrial Zone",
      producer: "DesertSun Energy",
      status: "Verified Escrow",
      type: "Solar (PV)",
      highlights: ["Indexed to EU Carbon Prices", "Sovereign Guarantee", "Bilateral Settlement"],
      terms: [
        "1. STRATEGIC RESERVE: 1.8 GW of solar capacity is reserved for industrial base-load stabilization.",
        "2. INDEXING: Pricing is dynamically indexed to EU Carbon Credit (EUA) benchmarks to ensure long-term competitiveness.",
        "3. SOVEREIGN GUARANTEE: This contract is backed by a sovereign guarantee from the host nation's central bank.",
        "4. INFRASTRUCTURE: Includes the development of 500MWh of integrated battery storage for 24/7 reliability.",
        "5. TERMINATION: Early termination requires a 24-month notice period and a 15% exit fee on remaining contract value."
      ]
    },
    {
      id: "GEAX-2026-003",
      title: "Arctic LNG Forward Supply",
      value: "$2.1 Billion",
      capacity: "5.0 MTPA",
      duration: "10 Years",
      buyer: "Global LNG Trading Hub",
      producer: "Arctic Gas Resources",
      status: "Milestone-Based",
      type: "LNG (Natural Gas)",
      highlights: ["Brent-Linked Pricing", "Take-or-Pay Clause", "Infrastructure Financing Included"],
      terms: [
        "1. FORWARD SUPPLY: Guaranteed annual delivery of 5.0 Million Tonnes Per Annum (MTPA) of LNG.",
        "2. PRICING: Linked to Brent Crude benchmarks with a floor of $6.50/MMBtu and a ceiling of $14.00/MMBtu.",
        "3. TAKE-OR-PAY: Buyer is obligated to pay for 85% of the annual contract quantity regardless of actual intake.",
        "4. FINANCING: GEAX™ facilitates $500M in upfront infrastructure financing against future production receivables.",
        "5. FORCE MAJEURE: Standard maritime and geopolitical force majeure clauses apply, managed via GEAX™ legal rail."
      ]
    }
  ];

  return (
    <div className="pt-32 pb-24 px-4 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter">Sample $1B+ Energy Contracts</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Structured, high-value allocations secured through the GEAX™ infrastructure.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {contracts.map((contract, i) => (
            <div key={i} className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
              <div className="p-8 border-b border-white/10 bg-gradient-to-br from-orange-500/5 to-transparent">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest px-2 py-1 bg-orange-500/10 rounded-full border border-orange-500/20">
                    {contract.id}
                  </span>
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
                  <div className="text-white font-medium">{contract.buyer}</div>
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
          ))}
        </div>

        <div className="mt-20 p-12 bg-zinc-900/50 border border-white/10 rounded-[3rem] text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Custom Contract Engineering</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            GEAX™ provides the legal and financial framework to design custom energy allocation contracts tailored to your specific strategic needs.
          </p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full font-bold transition-all">
            Consult with Contract Experts
          </button>
        </div>
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
                      <div className="font-bold text-lg">{selectedContract.buyer}</div>
                      <div className="text-sm text-gray-500 mt-1">Institutional Entity ID: GEAX-B-9921</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">And (The Producer)</div>
                      <div className="font-bold text-lg">{selectedContract.producer}</div>
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "producer">("buyer");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Simulate login
    if (role === "buyer") setPage("buyer-dashboard");
    else setPage("producer-dashboard");
  };

  return (
    <div className="pt-32 pb-24 px-4 bg-zinc-950 min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2rem] p-8 sm:p-12"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-6">
            <Lock className="h-8 w-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Institutional Login</h1>
          <p className="text-gray-400">Access the GEAX™ Energy Exchange</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-2 p-1 bg-black rounded-xl border border-white/5 mb-6">
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${role === "buyer" ? "bg-zinc-800 text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              Buyer Portal
            </button>
            <button
              type="button"
              onClick={() => setRole("producer")}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${role === "producer" ? "bg-zinc-800 text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              Producer Portal
            </button>
          </div>

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
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-500/10"
          >
            Sign In to Portal
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
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "buyer",
    region: "Europe"
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step < 2) setStep(2);
    else {
      // Final submission
      setPage("home");
      alert("Registration request submitted. Our compliance team will contact you within 24 hours.");
    }
  };

  return (
    <div className="pt-32 pb-24 px-4 bg-zinc-950 min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-[2rem] p-8 sm:p-12"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-6">
            <ShieldCheck className="h-8 w-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Institutional Registration</h1>
          <p className="text-gray-400">Join the Global Energy Allocation Exchange</p>
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

const IntelligencePage = () => (
  <div className="pt-32 pb-24 px-4 bg-zinc-950 min-h-screen">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter">AI Energy Intelligence</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">Data-driven decisions for the global energy market.</p>
      </div>

      {/* Global Energy Benchmarks Section */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
          <Globe className="h-6 w-6 text-orange-500 mr-3" />
          Global Energy Benchmarks (Real-Time)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Brent Crude Oil", price: "$84.62", unit: "per bbl", change: "+1.2%", trend: "up" },
            { label: "Henry Hub Natural Gas", price: "$3.42", unit: "per MMBtu", change: "-0.8%", trend: "down" },
            { label: "EU Carbon Credits", price: "€92.15", unit: "per tonne", change: "+0.5%", trend: "up" },
            { label: "Global Solar PPA (Avg)", price: "$42.80", unit: "per MWh", change: "-2.1%", trend: "down" }
          ].map((benchmark, i) => (
            <div key={i} className="p-6 bg-zinc-900/50 border border-white/5 rounded-2xl flex flex-col justify-between">
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
          ))}
        </div>
        <p className="text-gray-500 text-[10px] mt-4 italic">Data provided by GEAX™ Intelligence Engine. Last updated: March 28, 2026.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {[
          { icon: TrendingUp, title: "Live Pricing Trends", desc: "Real-time tracking of energy allocation values across regions." },
          { icon: BarChart3, title: "Demand Forecasts", desc: "AI-powered regional demand modeling for the next 10-20 years." },
          { icon: AlertTriangle, title: "Supply Risk", desc: "Evaluation of geopolitical and infrastructure risks to supply." },
          { icon: Info, title: "Market Insights", desc: "Deep-dive reports on capacity shortages and surpluses." }
        ].map((feature, i) => (
          <div key={i} className="p-8 bg-zinc-900 border border-white/10 rounded-3xl">
            <feature.icon className="h-10 w-10 text-orange-500 mb-6" />
            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
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

// --- Main App ---

export default function App() {
  const [page, setPage] = useState<Page>("home");

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const renderPage = () => {
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
      case "contact": return <ContactPage />;
      default: return <HomePage setPage={setPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500 selection:text-white">
      <MarketTicker />
      <Navbar currentPage={page} setPage={setPage} />
      
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer setPage={setPage} />
    </div>
  );
}
