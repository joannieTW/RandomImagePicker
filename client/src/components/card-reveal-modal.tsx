import React, { useEffect, useState, memo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Image } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface CardRevealModalProps {
  image?: Image;
  open: boolean;
  onClose: () => void;
}

// 煙火組件
const Firework = memo(({ id, x, y, color }: { id: number; x: number; y: number; color: string }) => {
  return (
    <motion.div
      key={id}
      className="absolute z-20"
      initial={{ x, y, scale: 0, opacity: 1 }}
      animate={{
        scale: [0, 1.5, 1],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 1.2,
        ease: "easeOut",
      }}
      style={{ top: 0, left: 0 }}
    >
      <div
        className="w-6 h-6 rounded-full"
        style={{
          boxShadow: `0 0 20px 10px ${color}`,
          background: color,
        }}
      />
    </motion.div>
  );
});

// 閃爍星星效果
const SparkleEffect = () => {
  const sparkPositions = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100 - 50,
    y: Math.random() * 100 - 50,
    size: Math.random() * 4 + 1,
    delay: Math.random() * 2,
    duration: Math.random() * 2 + 1,
  }));

  return (
    <>
      {sparkPositions.map((spark) => (
        <motion.div
          key={spark.id}
          className="absolute bg-white rounded-full z-20"
          style={{
            width: spark.size,
            height: spark.size,
            top: "50%",
            left: "50%",
            x: spark.x + "%",
            y: spark.y + "%",
            boxShadow: `0 0 ${spark.size * 2}px ${spark.size}px rgba(255, 255, 255, 0.8)`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: spark.duration,
            delay: spark.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
};

export function CardRevealModal({ image, open, onClose }: CardRevealModalProps) {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [fireworks, setFireworks] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);
  
  // 生成隨機顏色
  const getRandomColor = () => {
    const colors = [
      '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', 
      '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', 
      '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41', 
      '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // 射出煙火
  const launchFirework = () => {
    if (!animationComplete) return;
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // 在卡片周圍隨機生成煙火位置
    const offsetX = (Math.random() - 0.5) * 300;
    const offsetY = (Math.random() - 0.5) * 300;
    
    const newFirework = {
      id: Date.now(),
      x: centerX + offsetX,
      y: centerY + offsetY,
      color: getRandomColor(),
    };
    
    setFireworks(prev => [...prev, newFirework]);
    
    // 一段時間後自動移除煙火
    setTimeout(() => {
      setFireworks(prev => prev.filter(fw => fw.id !== newFirework.id));
    }, 1500);
  };

  // 產生連續的煙火
  useEffect(() => {
    if (!animationComplete || !open) return;
    
    // 發射第一個煙火
    const timeout = setTimeout(launchFirework, 300);
    
    // 設置煙火發射間隔
    const interval = setInterval(launchFirework, 800);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      setFireworks([]);
    };
  }, [animationComplete, open]);
  
  useEffect(() => {
    if (open) {
      setAnimationComplete(false);
      setFireworks([]);
    }
  }, [open]);
  
  // 在這裡直接獲取選中次數，避免使用默認值
  const selectedCount = image?.selected_count || 0;
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm md:max-w-md border-0 p-0 bg-transparent">
        <DialogTitle className="sr-only">抽到的卡片</DialogTitle>
        {/* 煙火效果 */}
        {fireworks.map(fw => (
          <Firework key={fw.id} id={fw.id} x={fw.x} y={fw.y} color={fw.color} />
        ))}
                
        <AnimatePresence>
          {open && image && (
            <motion.div
              className="w-full relative z-10"
              initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 15 }}
              transition={{ 
                duration: 0.8,
                type: "spring",
                bounce: 0.5
              }}
              onAnimationComplete={() => setAnimationComplete(true)}
            >
              <div className={cn(
                "w-full relative rounded-lg overflow-hidden aspect-square shadow-2xl transition-all transform bg-white",
                "border-4 border-white"
              )}>
                <img 
                  src={image.data} 
                  alt={image.name} 
                  className="w-full h-full object-cover"
                />
                
                {/* 閃爍效果 */}
                {animationComplete && <SparkleEffect />}
                
                <motion.div 
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-0 pointer-events-none z-10"
                  animate={{ 
                    backgroundColor: animationComplete ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)" 
                  }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                >
                  {animationComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-white text-center px-4 py-3 rounded-xl backdrop-blur-sm bg-black/30"
                    >
                      <div className="flex justify-center items-center mb-2">
                        <Sparkles className="h-5 w-5 mr-2 text-yellow-300" />
                        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-amber-300">
                          抽到的卡片
                        </h3>
                        <Sparkles className="h-5 w-5 ml-2 text-yellow-300" />
                      </div>
                      <p className="text-lg font-medium">{image.name}</p>
                      <p className="text-sm mt-1 opacity-80">
                        第 {selectedCount > 0 ? selectedCount : 1} 次抽到
                        {(image.group_id ?? 0) > 0 ? ` (組別 ${image.group_id})` : ""}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
                
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30" 
                  style={{ mixBlendMode: "overlay" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
                
                <motion.div 
                  className="absolute -inset-1 bg-white"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}