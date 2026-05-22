import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, collection, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const handleFirestoreError = (error: unknown, operationType: string, path: string | null) => {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

export const seedData = async () => {
  const sampleContracts = [
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
      ],
      createdAt: serverTimestamp()
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
      ],
      createdAt: serverTimestamp()
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
      ],
      createdAt: serverTimestamp()
    }
  ];

  try {
    for (const contract of sampleContracts) {
      await setDoc(doc(db, "sample_contracts", contract.id), contract);
    }
    console.log("Verified/Restored sample contracts");
  } catch (error) {
    console.error("Error seeding data:", handleFirestoreError(error, "write", "sample_contracts"));
  }
};

// Connectivity check
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
