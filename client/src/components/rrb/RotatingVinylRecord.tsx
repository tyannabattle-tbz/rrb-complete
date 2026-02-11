import React from 'react';

export default function RotatingVinylRecord() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <style>{`
        @keyframes spin {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }

        .vinyl-container {
          perspective: 1000px;
          width: 100%;
          max-width: 400px;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vinyl-record {
          width: 100%;
          height: 100%;
          animation: spin 8s linear infinite;
          transform-style: preserve-3d;
        }

        .vinyl-record img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .vinyl-record:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="vinyl-container">
        <div className="vinyl-record">
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/dvidjRisUJpNxgGn.jpg"
            alt="Rockin Rockin Boogie - Music and Vocal by Little Richard, Story lyrics and vocal melody by Seabrun Candy Hunter"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Album Details Below */}
      <div className="mt-8 text-center max-w-md">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Rockin' Rockin' Boogie
        </h3>
        <p className="text-lg text-accent font-semibold mb-1">
          Music & Vocal: Little Richard
        </p>
        <p className="text-lg text-accent font-semibold mb-2">
          Story, Lyrics & Vocal Melody: Seabrun Candy Hunter
        </p>
        <p className="text-sm text-foreground/70 mb-4">
          A timeless recording that defined an era. Featuring the iconic track "Rockin' Rockin' Boogie" with its infectious groove and memorable hooks.
        </p>
        <p className="text-xs text-foreground/50">
          Hover over the record to pause the rotation
        </p>
      </div>
    </div>
  );
}
