import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'motion/react';

interface DraggableComponentProps {
  id: string;
  type: string;
  children: React.ReactNode;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function DraggableComponent({ 
  id, 
  type, 
  children, 
  isSelected = false, 
  onSelect 
}: DraggableComponentProps) {
  const dragRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { id, type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Connect the drag ref
  drag(dragRef);

  return (
    <motion.div
      ref={dragRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      className={`relative ${
        isSelected ? 'ring-2 ring-purple-500 ring-offset-2' : ''
      }`}
      onClick={onSelect}
      whileHover={!isDragging ? { scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full"
        >
          Selected
        </motion.div>
      )}
    </motion.div>
  );
}