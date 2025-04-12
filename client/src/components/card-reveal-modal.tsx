import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Image } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface CardRevealModalProps {
  image?: Image;
  open: boolean;
  onClose: () => void;
}

export function CardRevealModal({ image, open, onClose }: CardRevealModalProps) {
  const [animationComplete, setAnimationComplete] = useState(false);
  
  useEffect(() => {
    if (open) {
      setAnimationComplete(false);
    }
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-0 p-0 bg-transparent">
        <AnimatePresence>
          {open && image && (
            <motion.div
              className="w-full"
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
                
                <motion.div 
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-0 pointer-events-none"
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
                      className="text-white text-center"
                    >
                      <h3 className="text-2xl font-bold mb-2">抽到的卡片</h3>
                      <p className="text-lg">{image.name}</p>
                    </motion.div>
                  )}
                </motion.div>
                
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20" 
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