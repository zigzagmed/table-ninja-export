
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TableHead } from '@/components/ui/table';

interface SortableTableHeaderProps {
  id: string;
  title: string;
}

export const SortableTableHeader: React.FC<SortableTableHeaderProps> = React.memo(({ id, title }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move select-none bg-muted/50 font-semibold"
    >
      {title}
    </TableHead>
  );
});

SortableTableHeader.displayName = 'SortableTableHeader';
