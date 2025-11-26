import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const images = [
  "https://picsum.photos/400/600?random=1",
  "https://picsum.photos/400/600?random=2",
  "https://picsum.photos/400/600?random=3",
  "https://picsum.photos/400/600?random=4",
  "https://picsum.photos/400/600?random=5",
  "https://picsum.photos/400/600?random=6",
];

const Column = ({ images, duration }: { images: string[], duration: number }) => {
  return (
    <motion.div 
      className="flex flex-col gap-6"
      animate={{ y: [0, -1200] }}
      transition={{ 
        repeat: Infinity, 
        duration: duration, 
        ease: "linear",
        repeatType: "loop"
      }}
    >
      {[...images, ...images, ...images].map((src, i) => (
        <div 
          key={i} 
          className="relative group w-48 h-72 md:w-64 md:h-96 rounded-2xl overflow-hidden border border-white/10 shadow-lg shrink-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <img 
            src={src} 
            alt="Gallery Item" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter grayscale-[50%] group-hover:grayscale-0"
          />
          <div className="absolute bottom-4 left-4 z-20 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="text-cyanLight font-mono text-xs block mb-1">SYS.IMG.0{i}</span>
            <span className="text-white font-display text-lg">Art Cyber</span>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

const FloatingGallery: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax transforms
  const bgY = useTransform(smoothProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(smoothProgress, [0, 1], ["0%", "60%"]);
  const columnsY = useTransform(smoothProgress, [0, 1], ["-10%", "10%"]);
  
  const blob1Y = useTransform(smoothProgress, [0, 1], ["-20%", "20%"]);
  const blob2Y = useTransform(smoothProgress, [0, 1], ["20%", "-20%"]);

  return (
    <section ref={containerRef} className="relative w-full h-[120vh] overflow-hidden bg-obsidian flex justify-center items-center">
        {/* Background Layers with Parallax */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 w-full h-[120%] -top-[10%] z-0 pointer-events-none">
             <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-[#1a1a1a] to-obsidian opacity-80"></div>
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neonPurple/20 via-transparent to-transparent opacity-40"></div>
             
             {/* Cyber Grid */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(76,201,240,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(76,201,240,0.05)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </motion.div>

        {/* Floating Gradient Orbs */}
        <motion.div 
            style={{ y: blob1Y }}
            className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-neonPink/10 rounded-full blur-[100px] z-0 pointer-events-none mix-blend-screen"
        />
         <motion.div 
            style={{ y: blob2Y }}
            className="absolute bottom-[20%] -right-[10%] w-[500px] h-[500px] bg-electricBlue/10 rounded-full blur-[100px] z-0 pointer-events-none mix-blend-screen"
        />

        {/* Gallery Container */}
        <motion.div 
            style={{ y: columnsY }}
            className="flex gap-6 md:gap-8 -rotate-6 scale-110 opacity-80 hover:opacity-100 transition-opacity duration-700 z-10"
        >
            <div className="pt-24">
                <Column images={images.slice(0,3)} duration={45} />
            </div>
            <div className="">
                <Column images={images.slice(3,6)} duration={55} />
            </div>
            <div className="pt-48 hidden md:block">
                <Column images={images.slice(0,3)} duration={40} />
            </div>
             <div className="pt-12 hidden lg:block">
                <Column images={images.slice(3,6)} duration={50} />
            </div>
        </motion.div>

        {/* Text Layer - Moves faster for depth */}
        <motion.div 
            style={{ y: textY }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
        >
            <div className="relative">
                <h2 className="text-7xl md:text-9xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-transparent tracking-tighter mix-blend-overlay opacity-50">
                    GALERIE
                </h2>
                <h2 className="absolute top-0 left-0 text-7xl md:text-9xl font-display font-black text-cyanLight/20 tracking-tighter blur-xl mix-blend-screen">
                    GALERIE
                </h2>
            </div>
        </motion.div>
        
        {/* Overlay Vignette to blend edges */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian z-20 pointer-events-none"></div>
    </section>
  );
};

export default FloatingGallery;