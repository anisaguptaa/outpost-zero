import React from 'react';

const stars = Array.from({ length: 64 }, (_, i) => ({
  x: (i * 83 + 17) % 1200,
  y: (i * 47 + 19) % 420,
  r: i % 11 === 0 ? 2.2 : i % 4 === 0 ? 1.4 : 0.8,
  delay: `${(i % 8) * -0.55}s`,
}));

/** A layered SVG landscape keeps the mission art crisp at every screen size. */
export default function MarsPanorama({ variant = 'arrival', className = '' }) {
  const id = `mars-${variant}`;
  return <svg className={`mars-panorama ${className}`} viewBox="0 0 1200 720" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A sweeping Martian landscape beneath a glowing sky">
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#171c3a"/><stop offset=".43" stopColor="#74516f"/><stop offset=".72" stopColor="#dd8669"/><stop offset="1" stopColor="#542b37"/></linearGradient>
      <radialGradient id={`${id}-sun`} cx="50%" cy="50%" r="50%"><stop stopColor="#fff0d1"/><stop offset=".22" stopColor="#ffd4a2"/><stop offset=".55" stopColor="#f18b73" stopOpacity=".82"/><stop offset="1" stopColor="#e8796d" stopOpacity="0"/></radialGradient>
      <radialGradient id={`${id}-planet`} cx="32%" cy="25%" r="78%"><stop stopColor="#f1a47d"/><stop offset=".42" stopColor="#c56154"/><stop offset=".78" stopColor="#71363f"/><stop offset="1" stopColor="#342235"/></radialGradient>
      <linearGradient id={`${id}-ridge-back`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#a65a55"/><stop offset="1" stopColor="#60323e"/></linearGradient>
      <linearGradient id={`${id}-ridge-front`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#92504c"/><stop offset=".55" stopColor="#56343e"/><stop offset="1" stopColor="#262633"/></linearGradient>
      <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#b7d9de" stopOpacity=".78"/><stop offset=".45" stopColor="#56727f" stopOpacity=".65"/><stop offset="1" stopColor="#283444" stopOpacity=".85"/></linearGradient>
      <filter id={`${id}-glow`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="20"/></filter>
      <filter id={`${id}-soft`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>
      <pattern id={`${id}-strata`} width="180" height="72" patternUnits="userSpaceOnUse"><path d="M-20 21 Q30 5 68 19 T160 17 M-24 38 Q22 23 64 36 T154 34 M15 55 Q62 42 102 54 T198 51" fill="none" stroke="#f1ad8b" strokeOpacity=".14" strokeWidth="2"/><circle cx="128" cy="12" r="2" fill="#f5c5a0" fillOpacity=".23"/></pattern>
    </defs>
    <rect width="1200" height="720" fill={`url(#${id}-sky)`}/>
    <circle className="mars-halo" cx="850" cy="280" r="225" fill={`url(#${id}-sun)`} filter={`url(#${id}-glow)`}/>
    <g className="mars-stars">{stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff6e8" opacity={i % 3 ? '.52' : '.9'} style={{ '--star-delay': s.delay }}/>)}</g>
    <g className="mars-moon"><circle cx="1000" cy="100" r="70" fill={`url(#${id}-planet)`}/><path d="M946 83q19-24 42-8t39-5q22 11 42 2" fill="none" stroke="#ffd0a7" strokeOpacity=".2" strokeWidth="7"/><circle cx="980" cy="112" r="10" fill="#542d3a" fillOpacity=".25"/><circle cx="1032" cy="70" r="7" fill="#452838" fillOpacity=".3"/></g>
    <path d="M0 430Q95 360 177 405t176-38q86-55 174 13t172-7q91-82 182-4t147-21q86-51 172 24v348H0Z" fill={`url(#${id}-ridge-back)`}/>
    <path d="M0 463Q112 405 213 447t201-31q90-43 168 9t154-10q94-62 173-15t149-24q75-37 142 22v322H0Z" fill={`url(#${id}-ridge-front)`}/>
    <path d="M0 430Q95 360 177 405t176-38q86-55 174 13t172-7q91-82 182-4t147-21q86-51 172 24v348H0Z" fill={`url(#${id}-strata)`} opacity=".75"/>
    <path d="M0 542q125-76 256-21t260-23q139-83 278-21t244-4q90-34 162 8v239H0Z" fill="#312d39"/>
    <path d="M0 552q128-74 256-20t260-22q140-83 278-21t244-4q90-34 162 8" fill="none" stroke="#f1a17d" strokeOpacity=".33" strokeWidth="3"/>
    <g className="mars-dust"><path d="M0 584q177-19 330 8t286-1q186-33 342-11t242 1" fill="none" stroke="#f2ad86" strokeOpacity=".12" strokeWidth="15" filter={`url(#${id}-soft)`}/><path d="M0 644q215-23 414 3t382-8q208-33 404 2" fill="none" stroke="#f7bc91" strokeOpacity=".14" strokeWidth="3"/></g>
    <g className="mars-outpost" transform="translate(690 475)">
      <ellipse cx="116" cy="109" rx="205" ry="25" fill="#171a25" fillOpacity=".45"/>
      <path d="M50 106V68a58 58 0 0 1 116 0v38Z" fill={`url(#${id}-glass)`} stroke="#f5bc91" strokeOpacity=".62" strokeWidth="3"/>
      <path d="M50 106h116" stroke="#f2b48d" strokeWidth="4"/><path d="M108 20v85M67 53h82" stroke="#d7d3d2" strokeOpacity=".28" strokeWidth="2"/>
      <path d="M166 94h44v12h-44M38 99H5v7h33" fill="#45434c" stroke="#dc9c78" strokeWidth="2"/>
      <path d="M197 91 267 75l9 4-73 19ZM201 102l70-17 9 4-73 18Z" fill="#416276" stroke="#b1cad0" strokeOpacity=".5" strokeWidth="1.5"/>
      <path d="M218 86v17M242 80v17M263 76v17" stroke="#c8d6d3" strokeOpacity=".5"/>
      <path d="M-28 96h39v10h-39Z" fill="#48424b" stroke="#e5a178" strokeWidth="2"/><path d="M-21 96V84h24v12" fill={`url(#${id}-glass)`} stroke="#e5a178" strokeWidth="2"/>
      <circle cx="162" cy="97" r="4" fill="#ffe6b4" className="beacon-light"/>
    </g>
    <g className="mars-rover" transform="translate(410 562)"><path d="M0 24h76l14 18H12Z" fill="#dfd4c2" stroke="#fff0d4" strokeOpacity=".6" strokeWidth="2"/><path d="m20 23 12-17h25l12 17" fill="#697b86" stroke="#f3c39a" strokeWidth="2"/><circle cx="21" cy="44" r="9" fill="#20232d" stroke="#bcb2a5" strokeWidth="3"/><circle cx="72" cy="44" r="9" fill="#20232d" stroke="#bcb2a5" strokeWidth="3"/><path d="M47 6V-9l12-7" stroke="#eee2ce" strokeWidth="3"/><circle cx="60" cy="-17" r="4" fill="#ffcf93"/></g>
    <g className="scene-comet"><path d="M0 0h60" stroke="#fff0d4" strokeOpacity=".58" strokeWidth="2"/><circle r="3" fill="#fff3df"/></g>
  </svg>;
}
