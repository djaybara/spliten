'use client';

export default function RatioBar({
  leftPct,
  rightPct,
  height = 24,
}: {
  leftPct: number;
  rightPct: number;
  height?: number;
}) {
  return (
    <div
      style={{
        height,
        background: 'var(--bg)',
        borderRadius: 12,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--line)',
      }}
    >
      {/* LEFT */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${leftPct}%`,
          background: 'linear-gradient(90deg, var(--yes) 0%, var(--yes-2) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: 8,
          transition: 'width .35s ease',
        }}
      >
        {leftPct > 15 && (
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{leftPct}%</span>
        )}
      </div>

      {/* RIGHT */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: `${rightPct}%`,
          background: 'linear-gradient(90deg, var(--no) 0%, var(--no-2) 100%)',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 8,
          transition: 'width .35s ease',
        }}
      >
        {rightPct > 15 && (
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{rightPct}%</span>
        )}
      </div>
    </div>
  );
}
