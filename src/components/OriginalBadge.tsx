'use client';

export default function OriginalBadge() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        {/* Gear/seal outer ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-600 to-gray-800"
          style={{
            clipPath: 'polygon(50% 0%, 58% 5%, 65% 0%, 70% 8%, 78% 5%, 80% 14%, 88% 14%, 88% 22%, 95% 25%, 92% 33%, 100% 38%, 95% 44%, 100% 50%, 95% 56%, 100% 62%, 92% 67%, 95% 75%, 88% 78%, 88% 86%, 80% 86%, 78% 95%, 70% 92%, 65% 100%, 58% 95%, 50% 100%, 42% 95%, 35% 100%, 30% 92%, 22% 95%, 20% 86%, 12% 86%, 12% 78%, 5% 75%, 8% 67%, 0% 62%, 5% 56%, 0% 50%, 5% 44%, 0% 38%, 8% 33%, 5% 25%, 12% 22%, 12% 14%, 20% 14%, 22% 5%, 30% 8%, 35% 0%, 42% 5%)'
          }}
        />
        {/* Inner circle */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-b from-gray-300 to-gray-500 flex items-center justify-center">
          <div className="absolute inset-1 rounded-full bg-gradient-to-b from-gray-700 to-gray-900 flex flex-col items-center justify-center">
            <span className="text-white text-sm font-serif italic font-bold leading-tight">Original</span>
            <span className="text-gray-300 text-[7px] tracking-[0.2em] uppercase">Product</span>
          </div>
        </div>
      </div>
    </div>
  );
}
