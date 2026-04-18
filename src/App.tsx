/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { 
  Dumbbell, 
  Utensils, 
  Flame, 
  History, 
  ChevronRight, 
  Play, 
  Pause, 
  Music, 
  Sparkles, 
  User, 
  TrendingUp, 
  Camera, 
  MessageSquare, 
  Droplets,
  Award,
  Search,
  CheckCircle2,
  Timer,
  Plus,
  ArrowLeft,
  X,
  CreditCard,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import { cn } from "./lib/utils";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const EXERCISE_IMAGES = {
  1: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
  2: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80",
  3: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  4: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80",
};

const MEAL_IMAGES = [
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=80",
  "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
  "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&q=80",
  "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&q=80",
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80",
  "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80",
];

const WORKOUTS: Record<number, { name: string; exercises: any[] }> = {
  1: {
    name: "الصدر والكتفين 💪",
    exercises: [
      { name: "ضغط بالبار", sets: 4, reps: "8-10", rest: 90, muscle: "الصدر" },
      { name: "ضغط بالدمبل مائل", sets: 3, reps: "10-12", rest: 75, muscle: "الصدر العلوي" },
      { name: "ضغط كتف بالبار", sets: 4, reps: "8-10", rest: 90, muscle: "الكتف" },
      { name: "رفع جانبي بالدمبل", sets: 3, reps: "12-15", rest: 60, muscle: "الكتف الجانبي" },
      { name: "تمديد الصدر بالكابل", sets: 3, reps: "12-15", rest: 60, muscle: "الصدر" },
    ]
  },
  2: {
    name: "الظهر والبايسبس 🦾",
    exercises: [
      { name: "سحب بالبار (Deadlift)", sets: 4, reps: "6-8", rest: 120, muscle: "الظهر الكامل" },
      { name: "تجديف بالبار", sets: 4, reps: "8-10", rest: 90, muscle: "الظهر العريض" },
      { name: "سحب علوي بالكابل", sets: 3, reps: "10-12", rest: 75, muscle: "الظهر" },
      { name: "كيرل بالبار", sets: 4, reps: "10-12", rest: 75, muscle: "البايسبس" },
      { name: "كيرل مطرقة بالدمبل", sets: 3, reps: "12-15", rest: 60, muscle: "البايسبس" },
    ]
  },
  3: {
    name: "الأرجل 🦵",
    exercises: [
      { name: "سكوات بالبار", sets: 4, reps: "8-10", rest: 120, muscle: "الفخذ الأمامي" },
      { name: "ضغط أرجل (Leg Press)", sets: 4, reps: "10-12", rest: 90, muscle: "الفخذ" },
      { name: "تمديد أرجل بالجهاز", sets: 3, reps: "12-15", rest: 60, muscle: "الرباعية" },
      { name: "ثني أرجل بالجهاز", sets: 3, reps: "12-15", rest: 60, muscle: "الفخذ الخلفي" },
      { name: "رفع أصابع القدم", sets: 4, reps: "15-20", rest: 60, muscle: "الساق" },
    ]
  },
  4: {
    name: "الترايسبس والبطن 🔥",
    exercises: [
      { name: "ضغط ضيق بالبار", sets: 4, reps: "8-10", rest: 90, muscle: "الترايسبس" },
      { name: "دفع كابل علوي", sets: 3, reps: "12-15", rest: 60, muscle: "الترايسبس" },
      { name: "كيك باك بالدمبل", sets: 3, reps: "12-15", rest: 60, muscle: "الترايسبس" },
      { name: "كرنش عادي", sets: 4, reps: "20", rest: 45, muscle: "البطنة" },
      { name: "رفع الأرجل", sets: 3, reps: "15", rest: 45, muscle: "البطن السفلي" },
    ]
  },
};

const MEALS = [
  { time: "الإفطار 7:00 ص", icon: "🌅", calories: 700, items: ["6 بيضات مقلية أو مسلوقة", "3 شرائح خبز أسمر", "كوب حليب كامل الدسم", "موزة واحدة"] },
  { time: "منتصف النهار 10:00 ص", icon: "⚡", calories: 400, items: ["مشروب بروتين Whey", "حفنة مكسرات مشكلة", "تفاحة أو برتقالة"] },
  { time: "الغداء 1:00 م", icon: "☀️", calories: 900, items: ["200g صدر دجاج مشوي", "كوب ونصف أرز", "سلطة خضار", "ملعقة زيت زيتون"] },
  { time: "بعد التمرين 7:00 م", icon: "🔄", calories: 600, items: ["مشروب بروتين", "كوب أرز أو معكرونة", "100g تونا أو دجاج"] },
  { time: "العشاء 9:00 م", icon: "🌙", calories: 550, items: ["200g لحم بقري أو دجاج", "خضار مشوية", "خبز أسمر"] },
];

const SHOPPING_LIST = [
  { cat: "بروتينات 🥩", items: ["صدر دجاج (1.5 كغ)", "لحم بقري (500g)", "تونا معلبة (4 علب)", "بيض (30 حبة)", "جبن قريش (500g)"] },
  { cat: "كاربوهيدرات 🌾", items: ["أرز (2 كغ)", "شوفان (1 كغ)", "خبز أسمر (2 رغيف)", "معكرونة (500g)", "بطاطا (1 كغ)"] },
  { cat: "خضار وفواكه 🥦", items: ["موز (2 كيلو)", "طماطم", "خيار", "سلطة خضراء", "ليمون"] },
];

const DAILY_TIPS = [
  { tip: "شرب 500ml ماء فور الاستيقاظ يرفع معدل الحرق 30% لمدة ساعة كاملة 💧", cat: "ماء" },
  { tip: "نم 7-9 ساعات — النوم هو وقت بناء العضلات الحقيقي. بدون نوم كافٍ، لا نمو 😴", cat: "نوم" },
  { tip: "البروتين يجب أن يكون في كل وجبة. الجسم لا يخزن البروتين مثل الدهون 🥩", cat: "تغذية" },
  { tip: "التمرين بالجسم الدافئ يقلل الإصابات 50%. 5 دقائق إحماء قبل كل تمرين 🔥", cat: "تمرين" },
];

const TRACKS = [
  { name: "Epic Workout Beats", bpm: "128 BPM", mood: "قوي 💪", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { name: "High Energy Pump", bpm: "140 BPM", mood: "حماسي 🔥", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
];

// ─── INITIALIZATION ───────────────────────────────────────────────────────────
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Profile {
  name: string;
  gender: string;
  age: string;
  height: string;
  weight: string;
}

interface WeightEntry {
  date: string;
  weight: number;
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function RestTimer({ seconds, onComplete, onCancel }: { seconds: number; onComplete: () => void; onCancel: () => void }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const percentage = (timeLeft / seconds) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
    >
      <div className="bg-[#0f172a] border border-green-500/20 rounded-3xl p-10 w-full max-w-xs text-center shadow-2xl shadow-green-500/10">
        <h3 className="text-sm font-bold tracking-widest text-green-400 mb-8 uppercase">وقت الراحة</h3>
        
        <div className="relative w-40 h-40 mx-auto mb-8">
          <svg className="w-full h-full -rotate-90">
            <circle cx="80" cy="80" r="70" className="fill-none stroke-slate-800 stroke-[8]" />
            <motion.circle 
              cx="80" cy="80" r="70" 
              className="fill-none stroke-green-500 stroke-[8]" 
              strokeDasharray={440}
              strokeDashoffset={440 * (1 - timeLeft / seconds)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-white font-mono">{timeLeft}</span>
            <span className="text-xs text-slate-500 mt-1">ثانية</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setTimeLeft(prev => Math.min(prev + 15, seconds))}
            className="flex-1 bg-slate-800 text-white rounded-xl py-3 text-sm font-bold"
          >
            +15ث
          </button>
          <button 
            onClick={onCancel}
            className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl py-3 text-sm font-bold"
          >
            تخطي
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── MAIN APPLICATION ─────────────────────────────────────────────────────────

export default function App() {
  const [setupDone, setSetupDone] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const [profile, setProfile] = useState<Profile>({ name: "", gender: "", age: "25", height: "175", weight: "75" });
  const [tab, setTab] = useState("home");
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
  const [restTime, setRestTime] = useState<number | null>(null);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [playing, setPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [showMusic, setShowMusic] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [waterCups, setWaterCups] = useState(0);
  
  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (setupDone && weights.length === 0) {
      setWeights([{ date: `${new Date().getDate()} ${MONTHS[new Date().getMonth()]}`, weight: parseFloat(profile.weight) }]);
    }
  }, [setupDone, profile.weight]);

  const toggleSet = (day: number, exIdx: number, setIdx: number) => {
    const key = `${day}-${exIdx}-${setIdx}`;
    setCompletedSets(prev => ({ ...prev, [key]: !prev[key] }));
    if (!completedSets[key]) {
      const rest = WORKOUTS[day % 4 + 1].exercises[exIdx].rest;
      setRestTime(rest);
    }
  };

  const handleImageAnalysis = async (file: File) => {
    setAiLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        const mimeType = file.type;
        
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                { inlineData: { data: base64, mimeType } },
                { text: 'Analyze the food in this image. Return a JSON object ONLY with: {"foodName": string, "calories": number, "macros": {"p": number, "c": number, "f": number}, "healthScore": number(1-10), "advice": string}. Language: Arabic.' }
              ]
            }
          ],
          config: { responseMimeType: "application/json" }
        });
        
        setAiResult(JSON.parse(response.text || "{}"));
        setAiLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setAiLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user", text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setAiLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...chatMessages.map(m => ({ 
            role: m.role === "user" ? "user" : "model", 
            parts: [{ text: m.text }] 
          })), 
          { role: "user", parts: [{ text: chatInput }] }
        ],
        config: {
          systemInstruction: `أنت مدرب لياقة بدنية محترف. المستخدم اسمه ${profile.name}. أجب بالعربية باختصار وبطريقة مشجعة.`,
        }
      });
      
      setChatMessages(prev => [...prev, { role: "assistant", text: response.text || "عذراً، لم أستطع فهم ذلك." }]);
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  if (!setupDone) {
    const steps = [
      { 
        title: "ما اسمك؟", 
        body: (
          <input 
            className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-xl text-center outline-none focus:border-green-500 transition-colors"
            placeholder="ادخل اسمك هنا"
            value={profile.name}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
          />
        )
      },
      {
        title: "ما هو جنسك؟",
        body: (
          <div className="flex gap-4">
            {["ذكر", "أنثى"].map(g => (
              <button 
                key={g}
                onClick={() => setProfile(p => ({ ...p, gender: g }))}
                className={cn(
                  "flex-1 p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4",
                  profile.gender === g ? "bg-green-500 border-green-500 text-black" : "bg-slate-900 border-slate-800 text-slate-400"
                )}
              >
                <span className="text-4xl">{g === "ذكر" ? "👨" : "👩"}</span>
                <span className="font-bold">{g}</span>
              </button>
            ))}
          </div>
        )
      },
      {
        title: "بياناتك البدنية",
        body: (
          <div className="space-y-6">
            <div>
              <label className="block text-xs text-slate-500 mb-2 mr-2">العمر</label>
              <input type="range" min="15" max="70" value={profile.age} onChange={e => setProfile(p => ({ ...p, age: e.target.value }))} className="w-full accent-green-500" />
              <div className="text-center font-bold text-2xl mt-2">{profile.age} سنة</div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-2 mr-2">الطول (سم)</label>
              <input type="range" min="140" max="210" value={profile.height} onChange={e => setProfile(p => ({ ...p, height: e.target.value }))} className="w-full accent-green-500" />
              <div className="text-center font-bold text-2xl mt-2">{profile.height} سم</div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-2 mr-2">الوزن الحالي (كغ)</label>
              <input type="range" min="40" max="150" value={profile.weight} onChange={e => setProfile(p => ({ ...p, weight: e.target.value }))} className="w-full accent-green-500" />
              <div className="text-center font-bold text-2xl mt-2">{profile.weight} كغ</div>
            </div>
          </div>
        )
      }
    ];

    return (
      <div dir="rtl" className="min-h-screen bg-[#020617] text-white flex flex-col p-6 font-tajawal">
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="mb-12">
            <div className="flex gap-2 mb-6 justify-center">
              {steps.map((_, i) => (
                <div key={i} className={cn("h-1 rounded-full transition-all", i <= setupStep ? "bg-green-500 w-8" : "bg-slate-800 w-4")} />
              ))}
            </div>
            <h1 className="text-3xl font-black mb-2 text-center">{steps[setupStep].title}</h1>
            <p className="text-slate-500 text-center text-sm">لنخصص لك البرنامج الأنسب لنتائج أسرع</p>
          </div>
          
          <motion.div 
            key={setupStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            {steps[setupStep].body}
          </motion.div>

          <div className="mt-12">
            <button 
              onClick={() => {
                if (setupStep < steps.length - 1) setSetupStep(prev => prev + 1);
                else setSetupDone(true);
              }}
              disabled={setupStep === 0 && !profile.name}
              className="w-full bg-green-500 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {setupStep === steps.length - 1 ? "المتابعة للبرنامج" : "التالي"} <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#020617] text-white font-tajawal pb-24">
      <AnimatePresence>
        {restTime !== null && (
          <RestTimer 
            seconds={restTime} 
            onComplete={() => setRestTime(null)} 
            onCancel={() => setRestTime(null)} 
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-900 p-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-black shadow-lg shadow-green-500/20">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xs text-slate-500 font-bold uppercase tracking-wider">مدربك الشخصي</h2>
              <p className="font-black text-sm">مرحباً، {profile.name} 👋</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setTab("chat")} className="p-2 mr-4 bg-slate-900 rounded-xl border border-slate-800 relative">
              <MessageSquare className="w-5 h-5 text-slate-400" />
              {chatMessages.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-[#020617]" />}
            </button>
            <button onClick={() => setTab("profile")} className="p-2 bg-slate-900 rounded-xl border border-slate-800">
              <User className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Tab Content */}
        {tab === "home" && (
          <div className="space-y-6">
            {/* Today's Hero */}
            <section className="relative h-64 rounded-3xl overflow-hidden group">
              <img 
                src={EXERCISE_IMAGES[selectedDay % 4 + 1 as keyof typeof EXERCISE_IMAGES]} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-block bg-green-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full mb-2">تمرين اليوم</span>
                <h2 className="text-3xl font-black mb-1">{WORKOUTS[selectedDay % 4 + 1].name}</h2>
                <div className="flex gap-4 text-xs text-slate-300 font-medium">
                  <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5 text-green-500" /> 45 دقيقة</span>
                  <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" /> 350 سعرة</span>
                </div>
                <button 
                  onClick={() => setTab("workout")}
                  className="mt-4 bg-white text-black font-black px-6 py-2.5 rounded-xl text-sm flex items-center gap-2"
                >
                  ابدأ البرنامج <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </section>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-blue-500" />
                  </div>
                  <button onClick={() => setWaterCups(prev => Math.min(8, prev + 1))} className="text-green-500 text-xs font-bold">+ كوب</button>
                </div>
                <h4 className="text-xs text-slate-500 font-bold mb-1">الماء اليومي</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black">{waterCups}</span>
                  <span className="text-slate-500 text-[10px]">/ 8 أكواب</span>
                </div>
                <div className="mt-3 flex gap-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={cn("flex-1 h-1 rounded-full", i < waterCups ? "bg-blue-500" : "bg-slate-800")} />
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <h4 className="text-xs text-slate-500 font-bold mb-1">السعرات المستهلكة</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black">1,450</span>
                  <span className="text-slate-500 text-[10px]">kcal</span>
                </div>
                <div className="mt-3 overflow-hidden bg-slate-800 h-1 rounded-full">
                  <div className="bg-orange-500 h-full w-[65%]" />
                </div>
              </div>
            </div>

            {/* NutriScan CTA */}
            <section className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-indigo-500/20">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">ميزة ذكية</span>
                </div>
                <h3 className="text-xl font-black mb-1">ماسح الوجبات AI 📸</h3>
                <p className="text-white/70 text-xs mb-4 max-w-[200px] leading-relaxed">حلل وجبتك والتعرف على السعرات والعناصر الغذائية فوراً</p>
                <button 
                  onClick={() => setTab("scan")}
                  className="bg-white text-black font-black px-5 py-2 rounded-xl text-xs flex items-center gap-2"
                >
                  جرب الآن <Camera className="w-4 h-4" />
                </button>
              </div>
              <Camera className="absolute -bottom-4 -left-4 w-32 h-32 text-white/10 rotate-12" />
            </section>

            {/* Daily Tips */}
            <section>
              <h3 className="text-lg font-black mb-4 flex items-center gap-2 px-1">
                نصائح صحية <ChevronRight className="w-4 h-4 text-green-500" />
              </h3>
              <div className="space-y-3">
                {DAILY_TIPS.map((tip, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                      <span className="text-lg">{tip.cat === "ماء" ? "💧" : tip.cat === "نوم" ? "😴" : "🥩"}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">{tip.tip}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === "workout" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar">
              {[1, 2, 3, 4, 5, 6, 7].map(d => (
                <button 
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={cn(
                    "flex flex-col items-center min-w-[50px] p-3 rounded-2xl transition-all border",
                    selectedDay === d ? "bg-green-500 border-green-500 text-black shadow-lg shadow-green-500/20" : "bg-slate-900 border-slate-800 text-slate-500"
                  )}
                >
                  <span className="text-[10px] font-bold mb-1 opacity-70">{DAYS[d % 7]}</span>
                  <span className="text-lg font-black">{d}</span>
                </button>
              ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
              <h2 className="text-2xl font-black mb-1">{WORKOUTS[selectedDay % 4 + 1].name}</h2>
              <p className="text-slate-500 text-sm mb-6 font-medium">ركز اليوم على التكنيك والحصول على أقصى استفادة</p>
              
              <div className="space-y-4">
                {WORKOUTS[selectedDay % 4 + 1].exercises.map((ex, exIdx) => (
                  <div key={exIdx} className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-sm mb-1">{ex.name}</h4>
                        <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded-md font-bold">{ex.muscle}</span>
                      </div>
                      <div className="text-right text-xs text-slate-500 font-bold">
                        {ex.sets} سيت × {ex.reps} تكرار
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {Array.from({ length: ex.sets }).map((_, sIdx) => {
                        const isDone = !!completedSets[`${selectedDay % 4 + 1}-${exIdx}-${sIdx}`];
                        return (
                          <button 
                            key={sIdx}
                            onClick={() => toggleSet(selectedDay % 4 + 1, exIdx, sIdx)}
                            className={cn(
                              "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center text-xs font-black",
                              isDone ? "bg-green-500 border-green-500 text-black" : "bg-transparent border-slate-800 text-slate-500"
                            )}
                          >
                            {isDone ? <CheckCircle2 className="w-5 h-5" /> : sIdx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "diet" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-lg font-black mb-4">برنامجك الغذائي اليومي</h3>
              <div className="space-y-6">
                {MEALS.map((meal, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-xl shadow-lg transition-transform group-hover:scale-110">
                        {meal.icon}
                      </div>
                      {i < MEALS.length - 1 && <div className="w-0.5 flex-1 bg-slate-800 my-2" />}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-500 font-bold">{meal.time}</span>
                        <span className="text-xs text-green-500 font-black">{meal.calories} kcal</span>
                      </div>
                      <div className="bg-slate-950/50 border border-slate-800/50 p-4 rounded-2xl">
                        <ul className="space-y-1">
                          {meal.items.map((item, j) => (
                            <li key={j} className="text-xs text-slate-300 flex items-center gap-2">
                              <span className="w-1 h-1 bg-green-500 rounded-full" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black">قائمة التسوق الأسبوعية</h3>
                <Utensils className="w-5 h-5 text-slate-500" />
              </div>
              <div className="grid grid-cols-1 gap-3">
                {SHOPPING_LIST.map((cat, i) => (
                  <div key={i} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/30">
                    <div className="font-bold text-xs mb-3 text-slate-400">{cat.cat}</div>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((item, j) => (
                        <span key={j} className="bg-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-700">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === "scan" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-500 animate-pulse">
                  <Camera className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black mb-2">ماسح الوجبات AI</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-[240px] mx-auto">ارفع صورة لوجبتك أو التقطها لنتعرف على محتواها الغذائي فوراً</p>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={e => e.target.files?.[0] && handleImageAnalysis(e.target.files[0])} 
                  className="hidden" 
                  accept="image/*"
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={aiLoading}
                  className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {aiLoading ? "جاري التحليل... 👀" : <><Camera className="w-5 h-5" /> التقاط / رفع صورة</>}
                </button>
              </div>
              <Sparkles className="absolute top-4 right-4 text-indigo-500/20 w-12 h-12" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl" />
            </div>

            {aiResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl shadow-indigo-500/10"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-2xl font-black text-white">{aiResult.foodName}</h4>
                    <span className="text-xs text-indigo-400 font-bold">تحليل الذكاء الاصطناعي</span>
                  </div>
                  <div className="bg-indigo-500/10 rounded-2xl p-3 text-center border border-indigo-500/20">
                    <span className="text-sm font-black text-indigo-400">{aiResult.healthScore}/10</span>
                    <div className="text-[8px] font-black text-slate-500 uppercase mt-1">درجة الصحة</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="bg-slate-950 p-4 rounded-2xl text-center border border-slate-800">
                    <div className="text-xs font-black text-indigo-500 mb-1">{aiResult.calories}</div>
                    <div className="text-[9px] text-slate-500 font-bold">سعرة</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl text-center border border-slate-800">
                    <div className="text-xs font-black text-green-500 mb-1">{aiResult.macros?.p}g</div>
                    <div className="text-[9px] text-slate-500 font-bold">بروتين</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl text-center border border-slate-800">
                    <div className="text-xs font-black text-amber-500 mb-1">{aiResult.macros?.c}g</div>
                    <div className="text-[9px] text-slate-500 font-bold">كارب</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl text-center border border-slate-800">
                    <div className="text-xs font-black text-red-500 mb-1">{aiResult.macros?.f}g</div>
                    <div className="text-[9px] text-slate-500 font-bold">دهون</div>
                  </div>
                </div>

                <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase">نصيحة المدرب</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic">"{aiResult.advice}"</p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {tab === "chat" && (
          <div className="flex flex-col h-[calc(100vh-180px)]">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 hide-scrollbar">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-black">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm">مرحباً بك في دردشة التدريب AI</span>
                </div>
                <p className="text-xs text-slate-500 mr-11">اسأل عن أي شيء يخص التمارين، التغذية، أو نصائح المكملات.</p>
              </div>

              {chatMessages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col max-w-[85%] rounded-2xl p-4",
                    msg.role === "user" ? "bg-green-500 text-black self-start rounded-tr-none" : "bg-slate-900 text-white self-end rounded-tl-none border border-slate-800"
                  )}
                >
                  <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                </motion.div>
              ))}
              {aiLoading && (
                <div className="self-end bg-slate-900 p-4 rounded-2xl border border-slate-800 text-slate-500 text-xs font-bold animate-pulse">
                  جاري التفكير...
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input 
                className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-green-500 transition-all"
                placeholder="اسأل مدربك..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChatMessage()}
              />
              <button 
                onClick={sendChatMessage}
                disabled={aiLoading}
                className="w-14 h-14 bg-green-500 text-black rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 active:scale-90 transition-transform"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {tab === "profile" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-3xl border-4 border-slate-950">
                  {profile.gender === "ذكر" ? "👨" : "👩"}
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-green-500 border-4 border-[#020617] flex items-center justify-center text-black">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black">{profile.name}</h3>
              <p className="text-slate-500 text-xs font-bold mb-6">عضو بريميوم • مستوى متوسط</p>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-6">
                <div>
                  <div className="text-lg font-black">{profile.weight}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">الوزن</div>
                </div>
                <div>
                  <div className="text-lg font-black">{profile.height}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">الطول</div>
                </div>
                <div>
                  <div className="text-lg font-black">{profile.age}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">العمر</div>
                </div>
              </div>
            </div>

            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
              <h3 className="font-black mb-4 px-1">الإنجازات</h3>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={cn("aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 border", i < 3 ? "bg-green-500/10 border-green-500/20" : "bg-slate-950/50 border-slate-800 opacity-40")}>
                    <span className="text-2xl">{["🔥", "💧", "🏆", "🦾", "🥗", "⏰"][i]}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                      {["وحش", "ناشف", "بطل", "حديد", "نظيف", "ملتزم"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <button 
              onClick={() => setSetupDone(false)}
              className="w-full bg-slate-900 border border-red-500/20 text-red-500 font-bold p-4 rounded-2xl flex items-center justify-center gap-2 text-sm"
            >
              <X className="w-4 h-4" /> إعادة ضبط البيانات
            </button>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-6 left-6 right-6 z-50">
        <div className="max-w-md mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-2 rounded-[32px] flex justify-between shadow-2xl shadow-black">
          {[
            { id: "home", icon: <History className="w-5 h-5" />, label: "الرئيسية" },
            { id: "workout", icon: <Dumbbell className="w-5 h-5" />, label: "التمارين" },
            { id: "diet", icon: <Utensils className="w-5 h-5" />, label: "التغذية" },
            { id: "progress", icon: <TrendingUp className="w-5 h-5" />, label: "التقدم" },
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex flex-col items-center gap-1 flex-1 py-1.5 rounded-2xl transition-all",
                tab === t.id ? "bg-green-500 text-black scale-105 shadow-lg shadow-green-500/20" : "text-slate-500 hover:text-white"
              )}
            >
              {t.icon}
              <span className="text-[9px] font-black tracking-tight">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
