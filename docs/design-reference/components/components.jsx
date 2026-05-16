// BloodCrown — shared components: ornaments, frames, inputs, icons

// --- Filigree corner SVG ---
const FiligreeCorner = ({ size = 28, color = '#D4AF37', opacity = 0.7 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={{display:'block'}}>
    <path
      d="M2 14 L2 8 Q2 2 8 2 L14 2 M2 4 L6 4 M4 2 L4 6 M8 6 Q8 8 10 8"
      stroke={color} strokeWidth="1" opacity={opacity} strokeLinecap="round"
    />
    <circle cx="4" cy="4" r="1.2" fill={color} opacity={opacity} />
    <circle cx="9" cy="9" r="0.8" fill={color} opacity={opacity * 0.6} />
  </svg>
);

// --- Decorative frame wrapper ---
const HeraldicFrame = ({ children, style, className = '' }) => (
  <div className={`bc-frame bc-vein ${className}`} style={style}>
    <div className="bc-frame-inner"></div>
    <div className="bc-corner tl"><FiligreeCorner /></div>
    <div className="bc-corner tr"><FiligreeCorner /></div>
    <div className="bc-corner bl"><FiligreeCorner /></div>
    <div className="bc-corner br"><FiligreeCorner /></div>
    {children}
  </div>
);

// --- Filigree divider with center glyph ---
const Divider = ({ glyph = '✦', style }) => (
  <div className="bc-divider" style={style}>
    <span className="bc-divider-glyph cinzel">{glyph}</span>
  </div>
);

// --- Logo (BLOOD white + CROWN shimmer gold) ---
const Logo = ({ size = 'lg' }) => {
  const sizes = {
    sm: { fs: 18, gap: 6, sub: 9 },
    md: { fs: 28, gap: 8, sub: 10 },
    lg: { fs: 42, gap: 12, sub: 11 },
    xl: { fs: 56, gap: 14, sub: 12 },
  };
  const s = sizes[size];
  return (
    <div style={{display:'inline-flex', flexDirection:'column', alignItems:'center', gap: 4}}>
      <div style={{
        fontFamily:'Cinzel, serif', fontWeight:700, fontSize: s.fs,
        letterSpacing:'0.22em', display:'flex', gap: s.gap, lineHeight: 1,
      }}>
        <span style={{color:'#FBF6E4', textShadow:'0 0 14px rgba(255,255,255,0.15)'}}>BLOOD</span>
        <span className="bc-shimmer" style={{fontWeight:700}}>CROWN</span>
      </div>
    </div>
  );
};

// --- Wax seal w/ glyph ---
const WaxSeal = ({ glyph = '✠', size = 56 }) => (
  <div className="bc-seal" style={{width: size, height: size, fontSize: size * 0.36}}>
    {glyph}
  </div>
);

// --- Icons (minimal stroke SVG) ---
const Icon = ({ name, size = 16, color = 'currentColor', strokeWidth = 1.6 }) => {
  const paths = {
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></>,
    lock: <><rect x="5" y="11" width="14" height="10" rx="1.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
    eye:  <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
    crown: <><path d="M3 8l4 5 5-7 5 7 4-5v10H3z"/><circle cx="12" cy="4" r="1" fill={color}/></>,
    trash: <><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></>,
    plus:  <><path d="M12 5v14M5 12h14"/></>,
    shield:<><path d="M12 2l9 4v6c0 5-4 9-9 11-5-2-9-6-9-11V6z"/></>,
    sword: <><path d="M14.5 17.5L21 11l-2-2-6.5 6.5M3 21l3.5-1 .5-2.5L17 7l-3-3-10.5 10.5L1 17z"/></>,
    note:  <><path d="M5 4h11l4 4v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M9 9h6M9 13h6M9 17h3"/></>,
    arrow_left: <><path d="M19 12H5M12 19l-7-7 7-7"/></>,
    tent: <><path d="M12 3L3 21h18z M12 3v18 M8 21l4-7 4 7"/></>,
    save: <><path d="M5 3h11l3 3v15H5z M8 3v6h8V3 M8 14h8v7H8z"/></>,
    dot: <circle cx="12" cy="12" r="3" fill={color}/>,
    dungeon: <><path d="M4 21V8a8 8 0 0 1 16 0v13 M10 21v-6h4v6 M4 12h16"/></>,
    edit:  <><path d="M16 3l5 5L8 21H3v-5z"/></>,
    bolt:  <><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></>,
    book:  <><path d="M4 4h7v16H4z M13 4h7v16h-7z M4 4c2 0 2 1 2 2v12c0 1 0 2-2 2 M20 4c-2 0-2 1-2 2v12c0 1 0 2 2 2"/></>,
    star:  <><path d="M12 2l3 7 7 .5-5.5 5L18 22l-6-4-6 4 1.5-7.5L2 9.5 9 9z"/></>,
    flame: <><path d="M12 22c4 0 7-3 7-7 0-3-2-4-3-7 0-2-1-4-4-6 0 4-2 5-4 7-2 2-3 4-3 6 0 4 3 7 7 7z M12 22c2 0 3-1 3-3s-1-2-2-4c-1 2-3 2-3 4s0 3 2 3z"/></>,
    skull: <><path d="M4 11a8 8 0 0 1 16 0v4l-2 2v3h-3v-2h-2v2h-2v-2h-2v2H6v-3l-2-2z"/><circle cx="9" cy="11" r="1.5" fill={color}/><circle cx="15" cy="11" r="1.5" fill={color}/></>,
    close: <><path d="M6 6l12 12 M18 6L6 18"/></>,
    dice:  <><rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8" cy="8" r="1.2" fill={color}/><circle cx="16" cy="16" r="1.2" fill={color}/><circle cx="12" cy="12" r="1.2" fill={color}/></>,
    moon:  <><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></>,
    scroll:<><path d="M5 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7l-2-2V4z M8 8h7M8 12h7M8 16h5"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
         style={{display:'block', flex:'0 0 auto'}}>
      {paths[name] || <circle cx="12" cy="12" r="6"/>}
    </svg>
  );
};

// --- Input with label + icon ---
const Field = ({ label, icon, type = 'text', placeholder, value, eye }) => (
  <div>
    {label && <label className="bc-input-label">{label}</label>}
    <div className="bc-input-wrap">
      {icon && <span className="bc-input-icon"><Icon name={icon} size={16} /></span>}
      <input className="bc-input" type={type} placeholder={placeholder} defaultValue={value} />
      {eye && (
        <button style={{
          position:'absolute', right: 12, top:'50%', transform:'translateY(-50%)',
          background:'transparent', border:'none', color:'var(--bc-ink-faint)', cursor:'pointer'
        }}>
          <Icon name="eye" size={16} />
        </button>
      )}
    </div>
  </div>
);

// --- Attribute medallion ---
const Attribute = ({ label, value, buffed = false, onClick }) => (
  <div style={{position:'relative', display:'flex', flexDirection:'column', alignItems:'center', paddingTop: 18}}>
    <div className="bc-medallion-label">{label}</div>
    <div className={`bc-medallion ${buffed ? 'buffed' : ''}`} onClick={onClick}>
      <span className="bc-medallion-num">{value}</span>
    </div>
  </div>
);

// --- Status bar ---
const StatusBar = ({ label, color, glow, cur, max, critical = false, dark }) => {
  const pct = Math.max(0, Math.min(100, (cur / max) * 100));
  const palette = {
    red:    { base: '#B91C1C', bright: '#EF4444', dark: '#4A0303', glow: 'rgba(220,38,38,0.6)', text: '#FCA5A5' },
    blue:   { base: '#1D4ED8', bright: '#3B82F6', dark: '#0F1A4A', glow: 'rgba(59,130,246,0.5)', text: '#93C5FD' },
    green:  { base: '#15803D', bright: '#22C55E', dark: '#0A3D1F', glow: 'rgba(34,197,94,0.5)', text: '#86EFAC' },
    yellow: { base: '#CA8A04', bright: '#EAB308', dark: '#4A3503', glow: 'rgba(234,179,8,0.5)', text: '#FDE68A' },
  };
  const p = palette[color];
  return (
    <div style={{marginBottom: 12}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 4}}>
        <span className="cinzel tracked-soft" style={{fontSize:10, color: p.text, fontWeight:600}}>
          {label}
        </span>
        <span style={{fontFamily:'Cinzel', fontSize:13, color: p.text, letterSpacing:'0.05em'}}>
          {cur}<span style={{opacity:0.5}}> / {max}</span>
        </span>
      </div>
      <div className={`bc-bar ${critical ? 'critical' : ''}`}>
        <div className="bc-bar-fill" style={{
          width: `${pct}%`,
          '--c-bright': p.bright,
          '--c-base': p.base,
          '--c-dark': p.dark,
          '--c-glow': p.glow,
        }}></div>
      </div>
    </div>
  );
};

// --- Tab strip ---
const Tabs = ({ tabs, active, onSelect }) => (
  <div style={{
    display:'flex', borderBottom: '1px solid rgba(212,175,55,0.15)',
    overflowX: 'auto', gap: 0
  }} className="bc-scroll">
    {tabs.map(t => (
      <div
        key={t}
        className={`bc-tab ${active === t ? 'active' : ''}`}
        onClick={() => onSelect && onSelect(t)}
      >
        {t}
      </div>
    ))}
  </div>
);

// --- Block header (section label with seal-ish caps) ---
const BlockHeader = ({ children, glyph = '✦', accent = 'gold' }) => (
  <div style={{
    display:'flex', alignItems:'center', gap: 10, marginBottom: 14,
    paddingBottom: 8, borderBottom: '1px solid rgba(212,175,55,0.18)'
  }}>
    <span style={{
      color: accent === 'gold' ? 'var(--bc-gold)' : 'var(--bc-blood-bright)',
      fontSize: 12
    }}>{glyph}</span>
    <span className="cinzel tracked" style={{
      fontSize: 11, color: 'var(--bc-gold-bright)', fontWeight: 600, flex: 1
    }}>{children}</span>
    <span style={{flex: 1, height: 1,
      background: 'linear-gradient(90deg, rgba(212,175,55,0.4), transparent)'}}></span>
  </div>
);

Object.assign(window, {
  FiligreeCorner, HeraldicFrame, Divider, Logo, WaxSeal, Icon, Field,
  Attribute, StatusBar, Tabs, BlockHeader,
});
