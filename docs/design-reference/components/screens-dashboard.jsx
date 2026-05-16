// BloodCrown — Dashboard

const CharacterCard = ({ name, klass, level, color, glyph, hpPct = 100 }) => {
  const initial = name[0];
  return (
    <div className="bc-card" style={{
      borderRadius: 4, padding: 20, position:'relative',
      display:'flex', flexDirection:'column', gap: 14
    }}>
      {/* Corner ornaments */}
      <div style={{position:'absolute', top: 6, left: 6}}><FiligreeCorner size={18} opacity={0.5}/></div>
      <div style={{position:'absolute', top: 6, right: 30, transform: 'scaleX(-1)'}}>
        <FiligreeCorner size={18} opacity={0.5}/>
      </div>

      {/* Trash */}
      <button style={{
        position:'absolute', top: 8, right: 8,
        background:'transparent', border:'1px solid rgba(185,28,28,0.25)',
        color:'rgba(229,99,94,0.7)', width: 24, height: 24, borderRadius: 3,
        display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'
      }}>
        <Icon name="trash" size={12} />
      </button>

      {/* Avatar circle with initial */}
      <div style={{display:'flex', justifyContent:'center', marginTop: 8}}>
        <div style={{
          width: 76, height: 76, borderRadius:'50%', position:'relative',
          background:
            `radial-gradient(circle at 30% 25%, ${color.bright}66, ${color.base}88 50%, #0E0A12 100%)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:
            'inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -3px 6px rgba(0,0,0,0.6),' +
            'inset 0 0 0 1px rgba(212,175,55,0.3), 0 4px 12px rgba(0,0,0,0.6)',
        }}>
          {/* engraved inner ring */}
          <div style={{
            position:'absolute', inset: 4, borderRadius:'50%',
            border:'1px solid rgba(212,175,55,0.25)'
          }}></div>
          <span style={{
            fontFamily:'Cinzel, serif', fontWeight: 700, fontSize: 30,
            color: 'var(--bc-ink)',
            textShadow:'0 2px 4px rgba(0,0,0,0.8)'
          }}>{initial}</span>
          {/* small glyph badge */}
          <div style={{
            position:'absolute', bottom:-2, right:-2,
            width: 22, height: 22, borderRadius:'50%',
            background:'#0A0507',
            border:'1px solid rgba(212,175,55,0.45)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color: 'var(--bc-gold)'
          }}>
            <Icon name={glyph} size={11}/>
          </div>
        </div>
      </div>

      {/* Name */}
      <div style={{textAlign:'center'}}>
        <div style={{
          fontFamily:'Cinzel, serif', fontWeight: 600, fontSize: 17,
          color: 'var(--bc-ink)', letterSpacing:'0.04em', lineHeight: 1.2,
          marginBottom: 4
        }}>{name}</div>
        <div style={{
          fontSize: 11, color: 'var(--bc-gold-dim)',
          letterSpacing:'0.18em', textTransform:'uppercase',
          fontFamily:'Cinzel, serif'
        }}>{klass}  ·  Nv {level}</div>
      </div>

      {/* HP slim bar */}
      <div style={{display:'flex', alignItems:'center', gap: 6, marginTop: -2}}>
        <Icon name="flame" size={10} color="#B91C1C" />
        <div className="bc-bar" style={{flex: 1, height: 4}}>
          <div className="bc-bar-fill" style={{
            width: `${hpPct}%`,
            '--c-bright': '#EF4444', '--c-base': '#B91C1C',
            '--c-dark': '#4A0303', '--c-glow': 'rgba(220,38,38,0.5)'
          }}></div>
        </div>
      </div>

      {/* Open button */}
      <button className="bc-btn" style={{
        background: 'linear-gradient(180deg, rgba(123,44,191,0.25), rgba(123,44,191,0.10))',
        color: 'var(--bc-gold-bright)',
        border: '1px solid rgba(212,175,55,0.25)',
        padding: '10px 14px', fontSize: 11, marginTop: 4, borderRadius: 3,
      }}>
        <Icon name="book" size={12}/>
        Abrir Ficha
      </button>
    </div>
  );
};

const NewCharacterCard = () => (
  <div style={{
    borderRadius: 4, padding: 20, minHeight: 240,
    border: '1.5px dashed rgba(212,175,55,0.3)',
    background: 'rgba(255,255,255,0.005)',
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    gap: 14, cursor: 'pointer', transition: 'border-color .2s, background .2s'
  }}
  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(212,175,55,0.7)'; e.currentTarget.style.background='rgba(212,175,55,0.04)';}}
  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(212,175,55,0.3)'; e.currentTarget.style.background='rgba(255,255,255,0.005)';}}>
    <div style={{
      width: 56, height: 56, borderRadius:'50%',
      border:'1px solid rgba(212,175,55,0.4)',
      display:'flex', alignItems:'center', justifyContent:'center',
      color:'var(--bc-gold)',
      boxShadow:'inset 0 0 12px rgba(212,175,55,0.1)'
    }}>
      <Icon name="plus" size={24} strokeWidth={1.2}/>
    </div>
    <div style={{textAlign:'center'}}>
      <div className="cinzel tracked" style={{
        fontSize: 12, color:'var(--bc-gold-bright)', fontWeight: 600,
        marginBottom: 4
      }}>Novo Personagem</div>
      <div style={{fontSize: 11, color:'var(--bc-ink-dim)', fontStyle:'italic'}}>
        Forje uma nova lenda
      </div>
    </div>
  </div>
);

const Navbar = () => (
  <div style={{
    height: 64, padding: '0 32px',
    display:'flex', alignItems:'center', gap: 24,
    background: 'linear-gradient(180deg, #0A0507 0%, #0A0507 70%, rgba(10,5,7,0.95) 100%)',
    borderBottom: '1px solid rgba(212,175,55,0.18)',
    position:'relative'
  }}>
    {/* gold hairline bottom glow */}
    <div style={{
      position:'absolute', bottom:-2, left:0, right:0, height: 2,
      background:'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)'
    }}></div>

    <Logo size="sm" />

    <div style={{flex: 1, display:'flex', alignItems:'center', gap: 14, paddingLeft: 24,
      borderLeft: '1px solid rgba(212,175,55,0.12)'}}>
      <span style={{fontSize: 12, color: 'var(--bc-ink-dim)', fontStyle:'italic'}}>
        Bem-vindo,
      </span>
      <span className="cinzel tracked-soft" style={{
        fontSize: 12, color:'var(--bc-gold-bright)', fontWeight:600
      }}>Thaumiel Veyra</span>
    </div>

    <button className="bc-btn bc-btn-danger" style={{fontSize: 11}}>
      <Icon name="close" size={12}/>
      Sair
    </button>
  </div>
);

const DashboardScreen = () => {
  const chars = [
    { name: 'Morrigan Vex', klass: 'Necromante', level: 7,
      glyph: 'skull', hpPct: 88,
      color: { base: '#5A189A', bright: '#9D4EDD' } },
    { name: 'Cassian Drael', klass: 'Caçador', level: 5,
      glyph: 'bolt', hpPct: 62,
      color: { base: '#1D4ED8', bright: '#3B82F6' } },
    { name: 'Lirien Sablek', klass: 'Inquisidora', level: 9,
      glyph: 'shield', hpPct: 100,
      color: { base: '#8A0303', bright: '#B91C1C' } },
    { name: 'Vesper Kael', klass: 'Bruxo de Sangue', level: 4,
      glyph: 'flame', hpPct: 22,
      color: { base: '#CA8A04', bright: '#D4AF37' } },
    { name: 'Orin Thalvex', klass: 'Druida Sombrio', level: 6,
      glyph: 'star', hpPct: 74,
      color: { base: '#15803D', bright: '#22C55E' } },
    { name: 'Sable Maerith', klass: 'Mestre da Lâmina', level: 8,
      glyph: 'sword', hpPct: 95,
      color: { base: '#7B2CBF', bright: '#9D4EDD' } },
    { name: 'Asha Velmoria', klass: 'Sacerdotisa Negra', level: 3,
      glyph: 'moon', hpPct: 50,
      color: { base: '#5A189A', bright: '#7B2CBF' } },
  ];

  return (
    <div className="bc-page bc-grain" style={{
      width:'100%', height:'100%', overflow:'auto'
    }}>
      <Navbar />

      {/* Section header */}
      <div style={{padding: '36px 48px 24px', position:'relative'}}>
        <div style={{display:'flex', alignItems:'center', gap: 18, marginBottom: 8}}>
          <div style={{
            width: 52, height: 52, borderRadius: 3,
            background:'linear-gradient(180deg, #1A1820, #0A0507)',
            border:'1px solid rgba(212,175,55,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'var(--bc-gold)',
            boxShadow:'inset 0 1px 0 rgba(212,175,55,0.18), 0 4px 12px rgba(0,0,0,0.6)'
          }}>
            <Icon name="dungeon" size={26}/>
          </div>
          <div>
            <h1 className="cinzel tracked" style={{
              fontSize: 28, fontWeight: 600, color: 'var(--bc-ink)',
              margin: 0, lineHeight: 1.1
            }}>SEUS PERSONAGENS</h1>
            <div style={{
              fontSize: 13, color:'var(--bc-ink-dim)', fontStyle:'italic',
              marginTop: 4
            }}>Selecione uma ficha para jogar ou editar</div>
          </div>

          <div style={{flex: 1}}></div>

          {/* sigil count */}
          <div style={{
            padding: '8px 16px', borderRadius: 3,
            border:'1px solid rgba(212,175,55,0.2)',
            background:'rgba(10,5,7,0.6)',
            display:'flex', alignItems:'center', gap: 10
          }}>
            <Icon name="scroll" size={14} color="#D4AF37"/>
            <span className="cinzel tracked-soft" style={{
              fontSize: 11, color:'var(--bc-gold-bright)'
            }}>{chars.length} FICHAS</span>
          </div>
        </div>

        <Divider glyph="✦ ✦ ✦" style={{margin:'20px 0 28px'}}/>

        {/* Grid */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(4, 1fr)',
          gap: 20
        }}>
          {chars.map(c => <CharacterCard key={c.name} {...c} />)}
          <NewCharacterCard />
        </div>

        {/* Footer ornament */}
        <div style={{
          marginTop: 48, marginBottom: 24,
          display:'flex', alignItems:'center', justifyContent:'center', gap: 16,
          color:'rgba(212,175,55,0.3)'
        }}>
          <span style={{flex: 1, height: 1, maxWidth: 200,
            background:'linear-gradient(90deg, transparent, rgba(212,175,55,0.3))'}}></span>
          <span className="cinzel tracked" style={{fontSize: 9, color:'rgba(212,175,55,0.5)'}}>
            ✶  PER · ASTRA · AD · CRUOR  ✶
          </span>
          <span style={{flex: 1, height: 1, maxWidth: 200,
            background:'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)'}}></span>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { DashboardScreen });
