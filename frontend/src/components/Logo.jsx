export const Logo = ({ size = 32 }) => (
  <svg viewBox="0 0 60 60" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="29" fill="#1a1a1a" stroke="#3a3a3a" strokeWidth="1.5"/>
    <path d="M30 13C30 13 21 17.5 21 27C21 33 24.5 37 30 39C35.5 37 39 33 39 27C39 17.5 30 13Z" fill="#c0c0c0"/>
    <circle cx="30" cy="26" r="3.5" fill="#1a1a1a"/>
    <path d="M25 22.5C25 22.5 23 24.5 23 27.5C23 30.5 24.5 33 26.5 34.5" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round"/>
    <rect x="21" y="39" width="18" height="11" rx="3.5" fill="#222222" stroke="#c0c0c0" strokeWidth="1.2"/>
    <rect x="24.5" y="42" width="11" height="2" rx="1" fill="#c0c0c0" opacity="0.7"/>
    <rect x="24.5" y="45.5" width="7" height="1.5" rx="0.75" fill="#c0c0c0" opacity="0.4"/>
  </svg>
);