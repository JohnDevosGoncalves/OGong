"use client";

interface Tour {
  id: string;
  numero: number;
  status: string;
}

interface TourIndicatorsProps {
  tours: Tour[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function TourIndicators({ tours, currentIndex, onSelect }: TourIndicatorsProps) {
  return (
    <div className="flex items-center gap-2 mb-2 mt-4 flex-wrap justify-center">
      {tours.map((tour, idx) => (
        <button
          key={tour.id}
          onClick={() => onSelect(idx)}
          className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-all ${
            idx === currentIndex
              ? "bg-primary text-white scale-110"
              : tour.status === "termine"
              ? "bg-success/20 text-success"
              : "bg-border text-muted"
          }`}
        >
          {tour.numero}
        </button>
      ))}
    </div>
  );
}
