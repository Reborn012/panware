import React, { createContext, useContext } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface DragDropContextType {
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

const DragDropContext = createContext<DragDropContextType | null>(null);

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};

interface DragDropProviderProps {
  children: React.ReactNode;
}

export function DragDropProvider({ children }: DragDropProviderProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <DndProvider backend={HTML5Backend}>
      <DragDropContext.Provider value={{ isDragging, setIsDragging }}>
        {children}
      </DragDropContext.Provider>
    </DndProvider>
  );
}