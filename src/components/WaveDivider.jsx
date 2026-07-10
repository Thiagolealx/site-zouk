export default function WaveDivider({ flip = false, withSun = false }) {
  return (
    <div className={`relative overflow-hidden leading-none ${flip ? 'rotate-180' : ''}`}>
      {withSun && (
        <div className="sun-bob absolute left-1/2 -translate-x-1/2 -top-10 w-24 h-24 md:w-32 md:h-32 rounded-full bg-sunset-gradient blur-[1px] z-0" />
      )}
      <svg
        className="wave-divider relative z-10"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,40 C240,90 480,0 720,30 C960,60 1200,10 1440,50 L1440,100 L0,100 Z"
          fill="#0E2A32"
        />
      </svg>
    </div>
  )
}
