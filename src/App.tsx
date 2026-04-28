import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Library, X, ArrowLeft, Mic, Sparkles, ChevronRight, Info } from 'lucide-react';
import { AppState, HallType, Sticker, Hall } from './types';
import { HALLS, INITIAL_STICKERS } from './constants';
import { askAboutPhoto } from './services/geminiService';

export default function App() {
  const [appState, setAppState] = useState<AppState>('HOME');
  const [stickers, setStickers] = useState<Sticker[]>(INITIAL_STICKERS);
  const [activeHall, setActiveHall] = useState<Hall | null>(null);
  const [currentCapturedPhoto, setCurrentCapturedPhoto] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [newSticker, setNewSticker] = useState<Sticker | null>(null);

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4 font-sans select-none overflow-hidden">
      {/* Device Frame Simulation 960x640 Landscape */}
      <div className="w-[960px] h-[640px] bg-stone-100 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col ring-8 ring-stone-800 shrink-0">
        
        <AnimatePresence mode="wait">
          {/* HOME VIEW */}
          {appState === 'HOME' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col p-10 space-y-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-black text-stone-800 tracking-tight">观察世界</h1>
                  <p className="text-stone-500 text-lg italic mt-1">Hello! 今天想看点什么新鲜的？</p>
                </div>
                <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center">
                  <Info size={24} className="text-stone-400" />
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-8">
                <motion.button
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAppState('CAMERA')}
                  className="rounded-[48px] bg-blue-500 shadow-2xl shadow-blue-200 flex flex-col items-center justify-center text-white space-y-6 group relative overflow-hidden border-b-8 border-blue-600"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors backdrop-blur-md">
                    <Camera size={64} />
                  </div>
                  <div className="text-center">
                    <span className="text-4xl font-black block">AI 相机</span>
                    <span className="text-white/70 text-sm font-bold uppercase tracking-widest mt-2">AI CAMERA</span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAppState('MUSEUM')}
                  className="rounded-[48px] bg-amber-500 shadow-2xl shadow-amber-200 flex flex-col items-center justify-center text-white space-y-6 group relative overflow-hidden border-b-8 border-amber-600"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors backdrop-blur-md">
                    <Library size={64} />
                  </div>
                  <div className="text-center">
                    <span className="text-4xl font-black block">我的博物馆</span>
                    <span className="text-white/70 text-sm font-bold uppercase tracking-widest mt-2">MUSEUM</span>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* CAMERA VIEW */}
          {appState === 'CAMERA' && (
            <CameraView 
              onCapture={(url) => {
                setCurrentCapturedPhoto(url);
                setAppState('RESULT');
              }}
              onBack={() => setAppState('HOME')}
            />
          )}

          {/* PHOTO RESULT & AI ACTION */}
          {appState === 'RESULT' && currentCapturedPhoto && (
            <PhotoResultView
              photoUrl={currentCapturedPhoto}
              onBack={() => {
                setCurrentCapturedPhoto(null);
                setAppState('CAMERA');
              }}
              onProcess={() => setAppState('PROCESSING')}
              isAsking={isAsking}
              setIsAsking={setIsAsking}
              aiResponse={aiResponse}
              setAiResponse={setAiResponse}
            />
          )}

          {/* PROCESSING VIEW */}
          {appState === 'PROCESSING' && (
            <ProcessingView
              onComplete={(sticker) => {
                setStickers(prev => [...prev, sticker]);
                setNewSticker(sticker);
                setAppState('MUSEUM');
              }}
            />
          )}

          {/* MUSEUM HOME */}
          {appState === 'MUSEUM' && (
            <MuseumHome
              halls={HALLS}
              onBack={() => setAppState('HOME')}
              onEnterHall={(hall) => {
                setActiveHall(hall);
                setAppState('HALL_DETAIL');
              }}
              newSticker={newSticker}
              clearNewSticker={() => setNewSticker(null)}
            />
          )}

          {/* HALL DETAIL */}
          {appState === 'HALL_DETAIL' && activeHall && (
            <HallDetail
              hall={activeHall}
              stickers={stickers.filter(s => s.hallType === activeHall.id)}
              onBack={() => setAppState('MUSEUM')}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function CameraView({ onCapture, onBack }: { onCapture: (url: string) => void, onBack: () => void }) {
  const [flash, setFlash] = useState(false);
  const subjects = [
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=960', // Golden Retriever
    'https://images.unsplash.com/photo-1501004318641-72e542844e27?w=960', // House Plant
    'https://images.unsplash.com/photo-1481433948246-248196627dd3?w=960', // Museum Artifact
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=960', // Skyscraper
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleCapture = () => {
    setFlash(true);
    setTimeout(() => {
      setFlash(false);
      onCapture(subjects[currentIndex]);
    }, 150);
  };

  return (
    <div className="flex-1 flex bg-black relative">
      {/* Viewfinder */}
      <div className="flex-1 relative overflow-hidden">
        <img 
          src={subjects[currentIndex]} 
          alt="Viewfinder" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 border-2 border-white/20 m-12 pointer-events-none">
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white/60 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white/60 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white/60 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white/60 rounded-br-xl"></div>
        </div>

        <button 
          onClick={() => setCurrentIndex((prev) => (prev + 1) % subjects.length)}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg border border-white/30 text-white"
        >
           <Sparkles size={32} />
        </button>
      </div>

      {flash && <div className="absolute inset-0 bg-white z-50 animate-pulse"></div>}

      {/* Side Control Bar */}
      <div className="w-48 bg-stone-900 flex flex-col items-center justify-between py-10 border-l border-white/10">
        <button onClick={onBack} className="p-4 text-white/40 hover:text-white transition-colors">
          <X size={44} />
        </button>
        
        <button 
          onClick={handleCapture}
          className="w-32 h-32 bg-white rounded-full p-2 ring-12 ring-white/10 ring-offset-4 ring-offset-stone-900 active:scale-95 transition-all border-8 border-stone-800 shadow-2xl"
        >
          <div className="w-full h-full border-4 border-stone-900 rounded-full bg-stone-50"></div>
        </button>

        <div className="w-20 h-20 bg-stone-800 rounded-3xl flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-inner">
           <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop" alt="" className="w-full h-full object-cover opacity-50" />
        </div>
      </div>
    </div>
  );
}

function PhotoResultView({ 
  photoUrl, onBack, onProcess, isAsking, setIsAsking, aiResponse, setAiResponse 
}: { 
  photoUrl: string, onBack: () => void, onProcess: () => void,
  isAsking: boolean, setIsAsking: (v: boolean) => void,
  aiResponse: string | null, setAiResponse: (v: string | null) => void
}) {
  const startAsking = () => {
    setIsAsking(true);
    setAiResponse(null);
  };

  const stopAsking = async () => {
    setIsAsking(false);
    const response = await askAboutPhoto("请告诉我这张照片里是什么，有什么有趣的知识吗？", photoUrl);
    setAiResponse(response);
  };

  return (
    <div className="flex-1 flex bg-stone-100 p-8 space-x-8">
      {/* Left Column: Photo */}
      <div className="flex-1 relative rounded-[48px] overflow-hidden shadow-2xl border-8 border-white bg-white group">
        <img src={photoUrl} className="w-full h-full object-cover" />
        
        <AnimatePresence>
          {aiResponse && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-xl p-6 rounded-[32px] border-2 border-blue-100 shadow-2xl"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg">
                   <Sparkles size={20} />
                </div>
                <p className="text-lg text-stone-800 font-bold leading-relaxed">{aiResponse}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isAsking && (
          <div className="absolute inset-0 bg-blue-600/40 backdrop-blur-md flex flex-col items-center justify-center text-white">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-32 h-32 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-2xl"
            >
              <Mic size={64} />
            </motion.div>
            <p className="mt-8 text-3xl font-black drop-shadow-xl tracking-widest">请提问...</p>
          </div>
        )}
      </div>

      {/* Right Column: Controls */}
      <div className="w-80 flex flex-col space-y-6">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack} className="p-4 bg-white rounded-3xl shadow-sm text-stone-600 border-2 border-stone-200">
            <ArrowLeft size={32} />
          </button>
          <span className="font-black text-stone-400 italic text-xl tracking-widest">REVIEW</span>
        </div>

        <div className="flex-1 flex flex-col justify-end space-y-6">
          <motion.button
            onMouseDown={startAsking}
            onMouseUp={stopAsking}
            onTouchStart={startAsking}
            onTouchEnd={stopAsking}
            className={`py-8 rounded-[40px] flex flex-col items-center justify-center space-y-3 shadow-xl transition-all ${isAsking ? 'bg-blue-600 text-white translate-y-2' : 'bg-white text-blue-600 border-4 border-blue-100'}`}
          >
            <Mic size={40} />
            <span className="font-black text-xl">按住提问</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onProcess}
            className="py-10 rounded-[40px] bg-blue-500 text-white font-black text-3xl shadow-2xl shadow-blue-200 flex flex-col items-center justify-center border-b-8 border-blue-700 active:translate-y-2 transition-all"
          >
            <div className="flex items-center space-x-3">
              <Sparkles size={32} />
              <span>AI 入馆</span>
            </div>
            <span className="text-xs text-white/60 font-black tracking-[0.4em] mt-3">GENERATE & ARCHIVE</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function ProcessingView({ onComplete }: { onComplete: (s: Sticker) => void }) {
  const [step, setStep] = useState(0);
  const steps = ["主体识别中...", "智能抠图中...", "AI风格渲染...", "正在送往博物馆..."];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => {
        if (s >= steps.length - 1) {
          clearInterval(timer);
          setTimeout(() => {
             onComplete({
               id: Math.random().toString(),
               nameZh: '神奇金毛狗',
               nameEn: 'Golden Retriever',
               hallType: HallType.ANIMAL,
               imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop',
               originalImageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
               fact: '金毛性格温顺，是极其聪明的陪伴犬。它们特别喜欢玩球哦！',
               capturedAt: Date.now(),
               interactionType: 'sound'
             });
          }, 800);
          return s;
        }
        return s + 1;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white">
      <div className="relative w-56 h-56 mb-12 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-8 border-transparent border-t-blue-500 border-r-blue-200 rounded-full"
        />
        <motion.div
           animate={{ scale: [1, 1.1, 1] }}
           transition={{ duration: 2, repeat: Infinity }}
           className="w-40 h-40 bg-stone-50 rounded-full flex items-center justify-center shadow-inner"
        >
          <Sparkles size={64} className="text-blue-500" />
        </motion.div>
      </div>
      <h3 className="text-3xl font-black text-stone-800 mb-2 italic tracking-tighter">{steps[step]}</h3>
      <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Processing Discovery</p>
    </div>
  );
}

function MuseumHome({ halls, onBack, onEnterHall, newSticker, clearNewSticker }: { 
  halls: Hall[], onBack: () => void, onEnterHall: (h: Hall) => void, newSticker: Sticker | null, clearNewSticker: () => void 
}) {
  return (
    <div className="flex-1 flex flex-col bg-stone-100 relative">
      <div className="p-10 pb-4">
        <div className="flex items-center space-x-6 mb-2">
           <button onClick={onBack} className="p-4 bg-white rounded-3xl shadow-sm text-stone-600 border-2 border-stone-200">
             <ArrowLeft size={32} />
           </button>
           <div>
             <h1 className="text-4xl font-black text-stone-800 leading-none">我的博物馆</h1>
             <p className="text-stone-400 font-bold text-lg tracking-[0.4em] uppercase">Private Museum</p>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto flex items-center space-x-8 px-10 pb-12 snap-x snap-mandatory no-scrollbar">
        {halls.map((hall) => (
          <motion.button
            key={hall.id}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEnterHall(hall)}
            className={`flex-shrink-0 w-72 aspect-[3/4] rounded-[56px] bg-gradient-to-br ${hall.color} p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden snap-center group border-b-[12px] border-black/20`}
          >
            <div className="absolute top-0 right-0 text-[180px] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
               {hall.icon}
            </div>
            <div className="relative z-10">
              <span className="text-white/60 font-black tracking-[0.3em] text-xs block mb-2 uppercase">{hall.titleEn}</span>
              <h3 className="text-5xl font-black text-white">{hall.titleZh}</h3>
            </div>
            <div className="relative z-10 flex items-center justify-center text-white/90 font-black bg-white/20 self-start px-8 py-4 rounded-3xl backdrop-blur-md text-lg">
              进入展厅 <ChevronRight size={24} className="ml-2" />
            </div>
          </motion.button>
        ))}
        {/* Placeholder to allow scrolling past the last item */}
        <div className="flex-shrink-0 w-10 h-10"></div>
      </div>

      <AnimatePresence>
        {newSticker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/90 backdrop-blur-2xl flex items-center justify-center p-10"
          >
            <motion.div
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[56px] p-10 w-full max-w-2xl flex flex-row items-center space-x-10 shadow-2xl relative border-8 border-stone-100"
            >
              <div className="absolute -top-8 left-10 bg-blue-500 text-white px-10 py-4 rounded-full font-black -rotate-3 shadow-2xl text-2xl ring-8 ring-white">
                🎉 成功入馆！
              </div>
              
              <div className="w-64 h-64 rounded-full overflow-hidden border-[16px] border-stone-50 shadow-inner shrink-0">
                <img src={newSticker.imageUrl} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 flex flex-col items-start text-left">
                <h2 className="text-5xl font-black text-stone-800 leading-tight">{newSticker.nameZh}</h2>
                <p className="text-stone-400 font-black mb-8 uppercase tracking-[0.4em] text-lg">{newSticker.nameEn}</p>
                
                <div className="bg-stone-50 p-6 rounded-[32px] mb-10 border-2 border-stone-100 w-full">
                  <p className="text-stone-700 font-bold text-xl leading-relaxed italic">"{newSticker.fact}"</p>
                </div>

                <button 
                  onClick={clearNewSticker}
                  className="w-full py-6 bg-stone-900 text-white rounded-[32px] font-black text-2xl shadow-xl border-b-8 border-stone-700 active:translate-y-2 transition-all"
                >
                  太棒了！
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HallDetail({ hall, stickers, onBack }: { hall: Hall, stickers: Sticker[], onBack: () => void }) {
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);

  return (
    <div className={`flex-1 flex flex-col bg-white relative`}>
      <header className={`p-10 pb-8 bg-gradient-to-b ${hall.color} text-white rounded-b-[64px] shadow-2xl mb-8 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 text-[240px] opacity-10 rotate-12">{hall.icon}</div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-6">
             <button onClick={onBack} className="p-4 bg-white/20 rounded-3xl backdrop-blur-md ring-2 ring-white/30">
               <ArrowLeft size={32} />
             </button>
             <div>
               <h2 className="text-5xl font-black leading-tight">{hall.titleZh}</h2>
               <p className="text-white/60 font-black uppercase tracking-[0.4em] text-xs">{hall.titleEn}</p>
             </div>
          </div>
          <div className="flex items-center space-x-8">
             <div className="flex flex-col items-end">
               <span className="text-5xl font-black drop-shadow-xl">{stickers.length}</span>
               <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm mt-1">Collections</span>
             </div>
             <div className="text-8xl drop-shadow-2xl">{hall.icon}</div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-10 grid grid-cols-4 gap-8 pb-16 no-scrollbar">
        {stickers.map((sticker) => (
          <motion.button
            key={sticker.id}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedSticker(sticker)}
            className="bg-stone-50 p-6 rounded-[48px] shadow-md border-2 border-stone-100 flex flex-col group relative"
          >
            <div className="aspect-square w-full rounded-[32px] overflow-hidden bg-white mb-6 shadow-sm border-2 border-white">
              <img src={sticker.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            </div>
            <h4 className="font-black text-stone-800 text-center tracking-tight text-xl">{sticker.nameZh}</h4>
          </motion.button>
        ))}

        {stickers.length === 0 && (
          <div className="col-span-4 flex flex-col items-center justify-center py-20 text-stone-300 space-y-6">
             <div className="w-32 h-32 bg-stone-50 rounded-full flex items-center justify-center text-7xl grayscale opacity-20 border-4 border-dashed border-stone-200">
               {hall.icon}
             </div>
             <p className="font-black italic tracking-[0.5em] text-xl">EMPTY HALL</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedSticker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-stone-900/80 backdrop-blur-2xl flex items-center justify-center p-12"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white w-full max-w-4xl rounded-[64px] p-12 shadow-2xl relative border-8 border-stone-100 flex flex-row items-center space-x-12"
            >
              <button 
                onClick={() => setSelectedSticker(null)}
                className="absolute top-8 right-8 p-4 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200 transition-colors"
              >
                <X size={32} />
              </button>

              <div className="w-72 flex-shrink-0">
                 <motion.div 
                    whileTap={{ rotate: [0, -4, 4, -4, 0], scale: 1.05 }}
                    className="aspect-square rounded-full overflow-hidden border-[20px] border-stone-50 shadow-2xl relative group cursor-pointer"
                 >
                   <img src={selectedSticker.imageUrl} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors"></div>
                 </motion.div>
                 <div className="mt-8 text-center px-4 py-2 bg-blue-50 text-blue-500 rounded-2xl font-black text-xs uppercase tracking-widest border border-blue-100">
                   Long-tap for interaction
                 </div>
              </div>

              <div className="flex-1 flex flex-col items-start">
                 <h3 className="text-6xl font-black text-stone-800 leading-none mb-3">{selectedSticker.nameZh}</h3>
                 <p className="text-stone-400 font-black uppercase tracking-[0.4em] mb-12 text-lg">{selectedSticker.nameEn}</p>
                 
                 <div className="bg-stone-50 p-10 rounded-[48px] w-full border-2 border-stone-100 mb-10 relative">
                    <div className="absolute -top-5 left-10 bg-blue-500 text-white px-6 py-2 rounded-full font-black text-xs tracking-widest uppercase shadow-lg">
                       Observation Log
                    </div>
                    <p className="text-stone-700 font-bold text-2xl leading-relaxed italic">"{selectedSticker.fact}"</p>
                 </div>

                 <div className="w-full flex items-center justify-between text-stone-400 font-black text-xs tracking-[0.4em] px-4 uppercase">
                   <span>Section: {hall.titleEn}</span>
                   <span>Observed {new Date(selectedSticker.capturedAt).toLocaleDateString()}</span>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
