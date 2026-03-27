import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { Package, Code2, Play, MousePointer2, CheckCircle2, Rocket, Heart, ArrowRight } from 'lucide-react';

import Home from './pages/Home';
import TemplatesPage from './pages/TemplatesPage';

const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const [trail, setTrail] = useState([]);

  useEffect(() => {
    let trailItems = [];
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 1); // precise tip alignment
      cursorY.set(e.clientY - 1);
      
      const now = Date.now();
      trailItems.push({ x: e.clientX, y: e.clientY, id: now });
      if (trailItems.length > 20) trailItems.shift();
      setTrail([...trailItems]);
    };
    
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      
      {/* Trail */}
      {trail.map((pos, index) => (
         <motion.div
           key={pos.id}
           className="fixed top-[0] left-[0] rounded-full pointer-events-none z-[9998] mix-blend-screen"
           initial={{ opacity: 0.6, scale: 1 }}
           animate={{ opacity: 0, scale: 0 }}
           transition={{ duration: 0.4 }}
           style={{
             x: pos.x - 4,
             y: pos.y - 4,
             width: 8,
             height: 8,
             backgroundColor: 'rgba(96, 165, 250, 0.4)',
             boxShadow: '0 0 10px rgba(29, 99, 237, 0.8)'
           }}
         />
      ))}
      
      {/* 3D Isometric Pointy Cube Cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: cursorXSpring, y: cursorYSpring }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 4px 8px rgba(29, 99, 237, 0.8))' }}>
          {/* Top illuminated face forming the pointer tip */}
          <path d="M1 1 L 18 6 L 11 11 L 1 1 Z" fill="rgba(96,165,250,0.95)" stroke="#eff6ff" strokeWidth="1" strokeLinejoin="round"/>
          {/* Left dark face */}
          <path d="M1 1 L 11 11 L 11 22 L 1 14 Z" fill="rgba(29,99,237,0.95)" stroke="#bfdbfe" strokeWidth="1" strokeLinejoin="round"/>
          {/* Right medium face */}
          <path d="M18 6 L 11 11 L 11 22 L 18 15 Z" fill="rgba(30,58,138,0.95)" stroke="#60a5fa" strokeWidth="1" strokeLinejoin="round"/>
        </svg>
      </motion.div>
    </>
  );
};

const GlobalBackground = () => {
  const [dots, setDots] = useState([]);

  useEffect(() => {
    // Generate glowing dots for the global background
    const bgDots = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 5,
    }));
    setDots(bgDots);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen opacity-100">
      <motion.div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{
          backgroundImage: 'linear-gradient(to right, #1D63ED 1px, transparent 1px), linear-gradient(to bottom, #1D63ED 1px, transparent 1px)',
          backgroundSize: '12rem 12rem',
        }}
        animate={{
          backgroundPosition: ['0rem 0rem', '12rem 12rem']
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 bg-docker-bg" style={{ maskImage: 'radial-gradient(circle at center, transparent 0%, black 100%)', WebkitMaskImage: 'radial-gradient(circle at center, transparent 0%, black 100%)' }}></div>
      </motion.div>

      {/* Prominent floating dots */}
      <div className="absolute inset-0 opacity-50">
        {dots.map(p => (
          <motion.div
             key={p.id}
             className="absolute rounded-full bg-docker-blue blur-[1px]"
             style={{
               left: `${p.x}%`,
               top: `${p.y}%`,
               width: p.size,
               height: p.size,
               boxShadow: `0 0 ${p.size * 3}px rgba(96, 165, 250, 0.9)`
             }}
             animate={{
               y: [0, -100, 0],
               opacity: [0.1, 0.8, 0.1]
             }}
             transition={{
               duration: p.duration,
               repeat: Infinity,
               delay: p.delay,
               ease: "easeInOut"
             }}
          />
        ))}
      </div>
    </div>
  );
};

const HeroBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dynamic Grid */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-[0.15]" 
        style={{
          backgroundImage: 'linear-gradient(to right, #1D63ED 1px, transparent 1px), linear-gradient(to bottom, #1D63ED 1px, transparent 1px)',
          backgroundSize: '4rem 4rem',
        }}
        animate={{
          backgroundPosition: ['0rem 0rem', '4rem 4rem']
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 bg-docker-bg" style={{ maskImage: 'radial-gradient(circle at center, transparent 0%, black 80%)', WebkitMaskImage: 'radial-gradient(circle at center, transparent 0%, black 80%)' }}></div>
      </motion.div>
      
      {/* Glowing Mesh Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [-100, 50, -100],
          y: [-50, 100, -50]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full mix-blend-screen blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(29,99,237,0.5) 0%, rgba(0,0,0,0) 70%)' }}
      />
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.5, 0.2],
          y: [0, -100, 0],
          x: [0, -200, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full mix-blend-screen blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.4) 0%, rgba(0,0,0,0) 70%)' }}
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[30%] right-[30%] w-[400px] h-[400px] rounded-full mix-blend-screen blur-[80px]"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(0,0,0,0) 70%)' }}
      />

      {/* Network Animated Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-40 mix-blend-screen" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="glowLine1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1D63ED" stopOpacity="0" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="1" />
            <stop offset="100%" stopColor="#1D63ED" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="glowLine2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <motion.path 
          d="M -100 200 C 300 100, 500 600, 1000 300 S 1400 500, 2000 200"
          fill="none" 
          stroke="url(#glowLine1)" 
          strokeWidth="3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <motion.path 
          d="M -100 600 C 200 400, 600 200, 1100 500 S 1600 300, 2000 600"
          fill="none" 
          stroke="url(#glowLine2)" 
          strokeWidth="2.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 1 }}
        />
        <motion.path 
          d="M 2000 800 C 1500 600, 1000 900, 500 700 S 200 800, -100 500"
          fill="none" 
          stroke="url(#glowLine1)" 
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 7, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.5 }}
        />
        <motion.path 
          d="M 500 -100 C 700 300, 300 700, 800 1100"
          fill="none" 
          stroke="url(#glowLine2)" 
          strokeWidth="4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
        />
        <motion.path 
          d="M -200 800 C 400 1000, 800 200, 1500 600 S 1800 100, 2200 400"
          fill="none" 
          stroke="url(#glowLine1)" 
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 6.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 1.5 }}
        />
      </svg>
    </div>
  );
};

const Typewriter = ({ text }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayed}<span className="animate-pulse">_</span></span>;
};

const LandingPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="min-h-screen bg-docker-bg text-white font-sans selection:bg-docker-blue/30"
    >
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
        <HeroBackground />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto pt-20">
          <motion.div
            initial={{ scale: 0, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ type: "spring", duration: 1.5, bounce: 0.4 }}
            className="mb-8 relative"
          >
            <div className="absolute inset-0 bg-docker-blue blur-[40px] opacity-30 rounded-full"></div>
            <Package size={80} className="text-docker-blue drop-shadow-[0_0_15px_rgba(29,99,237,0.5)] animate-float" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-8xl font-black tracking-tight mb-6"
          >
            <span className="text-white">Container</span>
            <span className="gradient-text glow-text leading-tight">Craft</span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xl md:text-3xl text-docker-muted font-medium mb-12 h-10"
          >
            <Typewriter text="Visual Docker Compose Builder" />
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, staggerChildren: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto"
          >
            <Link to="/editor" className="group w-full sm:w-auto px-8 py-4 bg-docker-blue hover:bg-blue-600 text-white rounded-xl font-bold text-lg transition-all glow-border hover:scale-105 flex items-center justify-center gap-2">
              Start Building <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/templates" className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-docker-border hover:border-docker-blue hover:bg-docker-surface text-white rounded-xl font-bold text-lg transition-all text-center">
              Browse Templates
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-docker-muted animate-bounce"
          >
            <div className="w-6 h-10 border-2 border-docker-muted/50 rounded-full flex justify-center p-1">
              <div className="w-1.5 h-3 bg-docker-muted/50 rounded-full" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* PAIN POINTS SECTION */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400"
        >
          Why does Docker Compose hurt?
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "😕", title: "Gap in YAML", desc: "One wrong indentation and everything breaks. Debugging invisible spaces isn't fun." },
            { icon: "盲", title: "No Visual Tools", desc: "Mentally visualizing how a dozen services connect via networks is impossible." },
            { icon: "⛰️", title: "Steep Curve", desc: "Volumes, restart policies, depends_on... remembering syntax takes hours of Googling." }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.2 }}
              className="glass p-8 rounded-2xl border-red-500/20 hover:border-red-500/50 hover:bg-red-500/5 transition-colors group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{item.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-docker-muted">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES BENTO GRID */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-center mb-16 text-white"
        >
          Everything you need.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-2 glass p-8 rounded-3xl border border-docker-border hover:border-docker-blue/50 flex flex-col justify-end group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-docker-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <MousePointer2 size={48} className="text-docker-blue mb-4 opacity-50 absolute top-8 right-8 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
            <h3 className="text-3xl font-bold mb-3 z-10">Drag & Drop Editor</h3>
            <p className="text-docker-muted text-lg z-10 max-w-md">Visually construct your architecture. Connect services, configure ports, and manage networks like building blocks.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass p-8 rounded-3xl border border-docker-border hover:border-docker-blue/50 flex flex-col justify-end group relative"
          >
            <Package size={32} className="text-[#8b5cf6] mb-4 absolute top-8 right-8" />
            <h3 className="text-xl font-bold mb-2">10+ Templates</h3>
            <p className="text-docker-muted text-sm">LAMP, MERN, Django, Flask, Node architectures ready instantly.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass p-8 rounded-3xl border border-docker-border hover:border-docker-blue/50 flex flex-col justify-end relative"
          >
            <Code2 size={32} className="text-[#10b981] mb-4 absolute top-8 right-8" />
            <h3 className="text-xl font-bold mb-2">Real-time YAML</h3>
            <p className="text-docker-muted text-sm">See the code generate live as you connect nodes.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-2 glass p-8 rounded-3xl border border-docker-border hover:border-docker-blue/50 flex flex-col justify-end relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-docker-blue/20 to-transparent"></div>
            <Rocket size={40} className="text-docker-blue mb-4 absolute top-8 right-12 opacity-80" />
            <h3 className="text-2xl font-bold mb-2 z-10">Export & Deploy</h3>
            <p className="text-docker-muted text-md z-10">Download your valid docker-compose.yml and launch anywhere immediately.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass p-8 rounded-3xl border border-docker-border hover:border-docker-blue/50 flex flex-col items-center justify-center text-center relative"
          >
            <Heart size={32} className="text-red-500 mb-3 fill-red-500/20" />
            <h3 className="text-lg font-bold">100% Free</h3>
            <p className="text-docker-muted text-xs">Open Source <br />Built for devs</p>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 bg-[#0c1222] border-y border-docker-border relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-20 text-white">How it works</h2>

          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-12 relative">

            {/* Connecting Line Desktop */}
            <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-1 overflow-hidden pointer-events-none">
              <motion.div
                className="w-full h-full bg-gradient-to-r from-transparent via-docker-blue to-transparent"
                initial={{ x: '-100%' }}
                whileInView={{ x: '100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {[
              { num: 1, title: 'Drag Services', desc: 'Pull containers from the library onto your canvas.', icon: '🖱️' },
              { num: 2, title: 'Connect & Configure', desc: 'Link networks and map ports visually.', icon: '🔗' },
              { num: 3, title: 'Export YAML', desc: 'Download standard syntax instantly.', icon: '📤' }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.3 }}
                className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3"
              >
                <div className="w-14 h-14 rounded-full bg-docker-blue text-white font-bold text-xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(29,99,237,0.5)] border-4 border-[#0c1222]">
                  {step.num}
                </div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
                <p className="text-docker-muted text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATE MARQUEE */}
      <section className="py-24 overflow-hidden border-b border-docker-border">
        <div className="max-w-6xl mx-auto px-6 mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Start with a template</h2>
        </div>

        <div className="w-full flex py-4 overflow-hidden mask-edges group">
          <div className="flex gap-6 animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap min-w-full px-3">
            {[1, 2, 3].map((set) => (
              <React.Fragment key={set}>
                {[
                  { name: 'LAMP Stack', tags: ['Linux', 'Apache', 'MySQL', 'PHP'], letter: 'L', color: '#8b5cf6' },
                  { name: 'MERN Stack', tags: ['Mongo', 'Express', 'React', 'Node'], letter: 'M', color: '#3b82f6' },
                  { name: 'Django + PG', tags: ['Python', 'Postgres'], letter: 'D', color: '#10b981' },
                  { name: 'Flask + Redis', tags: ['Python', 'Redis'], letter: 'F', color: '#f59e0b' }
                ].map((tmpl, i) => (
                  <div key={`${set}-${i}`} className="inline-flex gap-4 p-4 rounded-2xl bg-docker-surface border border-docker-border hover:border-docker-blue w-72 flex-shrink-0 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl" style={{ backgroundColor: `${tmpl.color}22`, color: tmpl.color }}>
                      {tmpl.letter}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white leading-tight mb-1">{tmpl.name}</h4>
                      <div className="text-xs text-docker-muted flex gap-1 truncate max-w-[140px]">
                        {tmpl.tags.join(' • ')}
                      </div>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
          {/* Duplicate for seamless loop */}
          <div className="flex gap-6 animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap min-w-full px-3" aria-hidden="true">
            {[1, 2, 3].map((set) => (
              <React.Fragment key={`dup-${set}`}>
                {[
                  { name: 'LAMP Stack', tags: ['Linux', 'Apache', 'MySQL', 'PHP'], letter: 'L', color: '#8b5cf6' },
                  { name: 'MERN Stack', tags: ['Mongo', 'Express', 'React', 'Node'], letter: 'M', color: '#3b82f6' },
                  { name: 'Django + PG', tags: ['Python', 'Postgres'], letter: 'D', color: '#10b981' },
                  { name: 'Flask + Redis', tags: ['Python', 'Redis'], letter: 'F', color: '#f59e0b' }
                ].map((tmpl, i) => (
                  <div key={`dup-${set}-${i}`} className="inline-flex gap-4 p-4 rounded-2xl bg-docker-surface border border-docker-border hover:border-docker-blue w-72 flex-shrink-0 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl" style={{ backgroundColor: `${tmpl.color}22`, color: tmpl.color }}>
                      {tmpl.letter}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white leading-tight mb-1">{tmpl.name}</h4>
                      <div className="text-xs text-docker-muted flex gap-1 truncate max-w-[140px]">
                        {tmpl.tags.join(' • ')}
                      </div>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-[#050812] text-center border-t border-docker-border px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Package className="text-docker-blue" size={24} />
            <span className="font-bold text-lg tracking-tight flex">
              <span className="text-white">Container</span>
              <span className="text-docker-blue">Craft</span>
            </span>
          </div>
          {/* <p className="text-docker-muted text-sm relative">
            Built with <Heart size={14} className="inline text-red-500 fill-red-500 hover:animate-ping absolute mx-1" /><span className="invisible">x</span> at Hackathon 2026
          </p> */}
          <a href="#" className="w-10 h-10 rounded-full bg-docker-surface border border-docker-border flex items-center justify-center hover:text-docker-blue hover:border-docker-blue transition-colors">
            <Code2 size={18} />
          </a>
        </div>
      </footer>
    </motion.div>
  );
};

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0f1e] overflow-hidden">
      <CustomCursor />
      <GlobalBackground />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/editor" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-screen w-full"
            >
              <Home />
            </motion.div>
          } />
          <Route path="/templates" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen"
            >
              <TemplatesPage />
            </motion.div>
          } />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
