// BloodCrown — Sheet screen (the heart of the app)

const SheetHeader = ({ saved = true, heroic = false }) => (
  <div style={{
    height: 68, padding: '0 24px',
    display:'grid',
    gridTemplateColumns: '2fr 1.4fr 0.8fr auto auto',
    alignItems:'center', gap: 16,
    background:'linear-gradient(180deg, #0E0A12 0%, #0A0507 100%)',
    borderBottom:'1px solid rgba(212,175,55,0.18)',
    position:'relative'
  }}>
    {/* gold hairline */}
    <div style={{
      position:'absolute', bottom: -1, left: 0, right: 0, height: 1,
      background:'linear-gradient(90deg, transparent, rgba(212,175,55,0.5) 20%, rgba(212,175,55,0.5) 80%, transparent)'
    }}></div>

    {/* Character */}
    <div>
      <label className="cinzel tracked" style={{
        fontSize: 9, color:'var(--bc-gold-dim)'
      }}>PERSONAGEM</label>
      <input className="bc-input" defaultValue="Morrigan Vex" style={{
        padding:'6px 0', background:'transparent', border:'none',
        borderBottom:'1px solid rgba(212,175,55,0.18)',
        fontFamily:'Cinzel, serif', fontSize: 19, fontWeight: 600,
        color:'var(--bc-ink)', borderRadius: 0
      }}/>
    </div>

    {/* Class */}
    <div>
      <label className="cinzel tracked" style={{
        fontSize: 9, color:'var(--bc-gold-dim)'
      }}>CLASSE</label>
      <input className="bc-input" defaultValue="Necromante de Sangue" style={{
        padding:'6px 0', background:'transparent', border:'none',
        borderBottom:'1px solid rgba(212,175,55,0.18)',
        fontFamily:'Cinzel, serif', fontSize: 15,
        color:'var(--bc-ink)', borderRadius: 0
      }}/>
    </div>

    {/* Level */}
    <div>
      <label className="cinzel tracked" style={{
        fontSize: 9, color:'var(--bc-gold-dim)'
      }}>NÍVEL</label>
      <input className="bc-input" defaultValue="7" style={{
        padding:'6px 0', background:'transparent', border:'none',
        borderBottom:'1px solid rgba(212,175,55,0.18)',
        fontFamily:'Cinzel, serif', fontSize: 19, fontWeight: 600,
        color:'var(--bc-gold-bright)', borderRadius: 0, textAlign:'left'
      }}/>
    </div>

    {/* Heroic toggle */}
    <div style={{display:'flex', alignItems:'center', gap: 10, paddingLeft: 12,
      borderLeft:'1px solid rgba(212,175,55,0.1)'}}>
      <div className={`bc-switch ${heroic ? 'on' : ''}`}></div>
      <span className="cinzel tracked" style={{
        fontSize: 10, color: heroic ? 'var(--bc-gold-bright)' : 'var(--bc-ink-dim)',
        fontWeight: 600
      }}>HERÓICO</span>
    </div>

    {/* Action cluster */}
    <div style={{display:'flex', alignItems:'center', gap: 8}}>
      {[
        { name:'note', label:'Notas' },
        { name:'arrow_left', label:'Voltar' },
        { name:'tent', label:'Descanso Longo' },
      ].map(b => (
        <button key={b.name} title={b.label} style={{
          width: 36, height: 36, borderRadius: 3,
          background:'rgba(26,24,32,0.85)',
          border:'1px solid rgba(212,175,55,0.18)',
          color:'var(--bc-ink-dim)', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <Icon name={b.name} size={15}/>
        </button>
      ))}

      {/* Saved indicator */}
      <div style={{
        display:'flex', alignItems:'center', gap: 6,
        padding:'8px 12px', borderRadius: 3,
        background:'rgba(34,197,94,0.06)',
        border:'1px solid rgba(34,197,94,0.25)'
      }}>
        <div style={{
          width: 7, height: 7, borderRadius:'50%',
          background:'#22C55E',
          boxShadow:'0 0 8px rgba(34,197,94,0.8)',
          animation: 'bc-buff-pulse 2s ease-in-out infinite'
        }}></div>
        <span style={{fontSize: 11, color:'#86EFAC',
          letterSpacing:'0.1em', textTransform:'uppercase'}}>Salvo</span>
      </div>

      <button className="bc-btn bc-btn-primary" style={{padding:'10px 18px', fontSize: 11}}>
        <Icon name="save" size={13} color="#F5D76E"/>
        Salvar
      </button>
    </div>
  </div>
);

// === LEFT COLUMN ===
const AttributesBlock = () => {
  const attrs = [
    { label:'DES', val: 14 },
    { label:'FOR', val: 12 },
    { label:'INT', val: 18, buffed: true },
    { label:'CAR', val: 13 },
    { label:'COS', val: 11 },
    { label:'SAB', val: 16, buffed: true },
  ];
  return (
    <div style={{
      padding: '18px 18px 22px',
      background:'linear-gradient(180deg, #14121A 0%, #0E0A12 100%)',
      border:'1px solid rgba(212,175,55,0.12)',
      borderRadius: 3, position:'relative'
    }}>
      <BlockHeader>ATRIBUTOS</BlockHeader>
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(3, 1fr)',
        rowGap: 32, columnGap: 6, paddingTop: 8
      }}>
        {attrs.map(a => <Attribute key={a.label} {...a} />)}
      </div>
    </div>
  );
};

const StatusBlock = ({ hpCritical }) => (
  <div style={{
    padding:'18px 18px 8px', marginTop: 14,
    background:'linear-gradient(180deg, #14121A 0%, #0E0A12 100%)',
    border:'1px solid rgba(212,175,55,0.12)',
    borderRadius: 3
  }}>
    <BlockHeader>STATUS</BlockHeader>
    <StatusBar label="Vida"    color="red"    cur={hpCritical ? 11 : 48} max={62} critical={hpCritical} />
    <StatusBar label="Sanidade" color="blue"   cur={31} max={40} />
    <StatusBar label="Mana"    color="green"  cur={22} max={28} />
    <StatusBar label="Estamina" color="yellow" cur={9}  max={18} />
  </div>
);

const DefenseBlock = () => (
  <div style={{
    padding:'18px 18px 22px', marginTop: 14,
    background:'linear-gradient(180deg, #14121A 0%, #0E0A12 100%)',
    border:'1px solid rgba(212,175,55,0.12)',
    borderRadius: 3
  }}>
    <BlockHeader>DEFESA</BlockHeader>

    {/* Big shield with number */}
    <div style={{display:'flex', alignItems:'center', gap: 16, marginBottom: 14}}>
      <div style={{
        width: 76, height: 88, position:'relative',
        display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto'
      }}>
        <svg viewBox="0 0 76 88" style={{position:'absolute', inset: 0}}>
          <defs>
            <linearGradient id="shieldG" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#2A2335" />
              <stop offset="1" stopColor="#0E0A12" />
            </linearGradient>
          </defs>
          <path d="M38 4 L70 12 L70 44 Q70 70 38 84 Q6 70 6 44 L6 12 Z"
                fill="url(#shieldG)"
                stroke="rgba(212,175,55,0.5)" strokeWidth="1.2"/>
          <path d="M38 10 L66 16 L66 44 Q66 66 38 78 Q10 66 10 44 L10 16 Z"
                fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="0.5"/>
        </svg>
        <div style={{
          position:'relative', zIndex: 2, textAlign:'center'
        }}>
          <div className="cinzel" style={{
            fontSize: 9, color:'var(--bc-gold-dim)', letterSpacing:'0.2em', marginBottom: -2
          }}>CA</div>
          <div className="cinzel" style={{
            fontSize: 30, color:'var(--bc-ink)', fontWeight: 700, lineHeight: 1,
            textShadow:'0 2px 4px rgba(0,0,0,0.8)'
          }}>17</div>
        </div>
      </div>

      <div style={{flex: 1, display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, fontSize: 11}}>
        {[
          { l:'BASE', v: '10' }, { l:'DES', v: '+2' },
          { l:'ARM',  v: '+4' }, { l:'OUT', v: '+1' },
        ].map(x => (
          <div key={x.l} style={{
            background:'rgba(10,5,7,0.6)',
            border:'1px solid rgba(212,175,55,0.12)',
            padding:'6px 8px', borderRadius: 2,
            display:'flex', justifyContent:'space-between', alignItems:'baseline'
          }}>
            <span className="cinzel" style={{
              fontSize: 9, color:'var(--bc-gold-dim)', letterSpacing:'0.15em'
            }}>{x.l}</span>
            <span className="cinzel" style={{
              fontSize: 13, color:'var(--bc-ink)', fontWeight: 600
            }}>{x.v}</span>
          </div>
        ))}
      </div>
    </div>

    <Divider glyph="◆" style={{margin:'14px 0'}}/>

    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10}}>
      <div>
        <div className="cinzel tracked" style={{
          fontSize: 9, color:'var(--bc-gold-dim)', marginBottom: 4
        }}>RES. FÍSICA</div>
        <input className="bc-input" defaultValue="+3" style={{
          padding:'6px 10px', textAlign:'center',
          fontFamily:'Cinzel, serif', fontSize: 16, fontWeight: 600,
          color:'var(--bc-ink)'
        }}/>
      </div>
      <div>
        <div className="cinzel tracked" style={{
          fontSize: 9, color:'var(--bc-gold-dim)', marginBottom: 4
        }}>RES. MÁGICA</div>
        <input className="bc-input" defaultValue="+5" style={{
          padding:'6px 10px', textAlign:'center',
          fontFamily:'Cinzel, serif', fontSize: 16, fontWeight: 600,
          color:'var(--bc-ink)'
        }}/>
      </div>
    </div>
  </div>
);

// === MIDDLE COLUMN ===
const SkillsBlock = () => {
  const skills = [
    ['Acrobacia',     'DES', 4],
    ['Atletismo',     'FOR', 6],
    ['Conhecimento',  'INT', 8],
    ['Diplomacia',    'CAR', 3],
    ['Enganação',     'CAR', 5],
    ['Furtividade',   'DES', 7],
    ['Iniciativa',    'DES', 4],
    ['Intimidação',   'CAR', 6],
    ['Intuição',      'SAB', 5],
    ['Investigação',  'INT', 7],
    ['Luta',          'FOR', 3],
    ['Magia',         'SAB', 9],
    ['Manuseio',      'DES', 2],
    ['Medicina',      'SAB', 4],
    ['Ofício',        'INT', 1],
    ['Percepção',     'SAB', 7],
    ['Pontaria',      'DES', 5],
    ['Prestidigitação','DES', 3],
    ['Reflexos',      'DES', 6],
    ['Religião',      'SAB', 5],
    ['Sobrevivência', 'SAB', 4],
    ['Vontade',       'SAB', 8],
    ['Performance',   'CAR', 2],
  ];
  return (
    <div style={{
      background:'linear-gradient(180deg, #14121A 0%, #0E0A12 100%)',
      border:'1px solid rgba(212,175,55,0.12)',
      borderRadius: 3, height: '100%',
      display:'flex', flexDirection:'column'
    }}>
      <div style={{padding:'18px 18px 0'}}>
        <BlockHeader>PERÍCIAS</BlockHeader>
      </div>

      <div style={{
        display:'grid', gridTemplateColumns:'1fr 60px',
        padding:'0 18px 6px', fontSize: 9, letterSpacing:'0.2em',
        color:'var(--bc-gold-dim)', textTransform:'uppercase',
        fontFamily:'Cinzel, serif'
      }}>
        <span>NOME (ATR)</span>
        <span style={{textAlign:'center'}}>VALOR</span>
      </div>

      <div className="bc-scroll" style={{
        overflowY:'auto', flex: 1, padding:'0 14px'
      }}>
        {skills.map(([name, attr, val]) => (
          <div className="bc-skill-row" key={name}>
            <span>
              <span className="bc-skill-name">{name}</span>
              <span className="bc-skill-attr">({attr})</span>
            </span>
            <input className="bc-skill-val" defaultValue={`+${val}`}/>
          </div>
        ))}
      </div>
    </div>
  );
};

// === RIGHT COLUMN ===
const AttackCard = ({ name, dmg, kind, desc }) => (
  <div style={{
    background:'linear-gradient(180deg, rgba(26,24,32,0.6), rgba(14,10,18,0.8))',
    border:'1px solid rgba(212,175,55,0.12)',
    borderLeft:'3px solid #8A0303',
    borderRadius: 2, padding:'12px 14px', marginBottom: 10
  }}>
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 8}}>
      <div>
        <div className="cinzel" style={{
          fontSize: 14, fontWeight: 600, color:'var(--bc-ink)',
          letterSpacing:'0.04em', marginBottom: 2
        }}>{name}</div>
        <div style={{fontSize: 10, color:'var(--bc-gold-dim)',
          letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Cinzel'}}>{kind}</div>
      </div>
      <button style={{
        background:'rgba(138,3,3,0.15)',
        border:'1px solid rgba(185,28,28,0.4)',
        color:'#FCA5A5', cursor:'pointer',
        fontFamily:'Cinzel, serif', fontWeight: 600, fontSize: 13,
        padding:'5px 10px', borderRadius: 2,
        display:'flex', alignItems:'center', gap: 5
      }}>
        <Icon name="dice" size={12}/>
        {dmg}
      </button>
    </div>
    <div style={{fontSize: 12, color:'var(--bc-ink-dim)', lineHeight: 1.5, fontStyle:'italic'}}>
      {desc}
    </div>
  </div>
);

const RightColumn = ({ active }) => {
  const tabs = ['COMBATE','HABILIDADES','MAGIA','DESPERTAR','ARMA','TRANSFORMAÇÃO','ESPECIAIS','INVENTÁRIO','DESCRIÇÃO'];
  return (
    <div style={{
      background:'linear-gradient(180deg, #14121A 0%, #0E0A12 100%)',
      border:'1px solid rgba(212,175,55,0.12)',
      borderRadius: 3, height: '100%',
      display:'flex', flexDirection:'column'
    }}>
      <Tabs tabs={tabs} active={active} />

      <div className="bc-scroll" style={{padding: 16, overflowY:'auto', flex: 1}}>
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 14
        }}>
          <div style={{display:'flex', alignItems:'center', gap: 10}}>
            <Icon name="sword" size={14} color="#B91C1C"/>
            <span className="cinzel tracked" style={{
              fontSize: 11, color:'var(--bc-gold-bright)', fontWeight: 600
            }}>ATAQUES PREPARADOS</span>
          </div>
          <button className="bc-btn" style={{
            background:'transparent',
            border:'1px solid rgba(185,28,28,0.4)',
            color:'#FCA5A5', padding:'6px 12px', fontSize: 10, borderRadius: 2
          }}>
            <Icon name="plus" size={11}/>
            Novo Ataque
          </button>
        </div>

        <AttackCard
          name="Lâmina de Espinhos"
          kind="Arma · Corpo a Corpo"
          dmg="2d8+3"
          desc="Bordo serrilhado embebido em veneno onírico. Em acerto crítico, alvo sangra 1d4 por turno."
        />
        <AttackCard
          name="Estilhaço de Obsidiana"
          kind="Conjuração · 18m"
          dmg="3d6"
          desc="Um caco de cristal negro perfura a alma. Ignora 2 pontos de armadura."
        />
        <AttackCard
          name="Mordida do Vazio"
          kind="Magia · Necromancia"
          dmg="1d10+INT"
          desc="Consome 1 ponto de Sanidade. Alvo deve resistir ou perder o próximo turno."
        />
        <AttackCard
          name="Sussurro Carmesim"
          kind="Magia · Sangue"
          dmg="2d6"
          desc="Cura o conjurador no valor do dano causado. Custo: 4 PV próprios."
        />
      </div>
    </div>
  );
};

// === DICE TOAST ===
const DiceToast = ({ crit = false }) => (
  <div style={{
    position:'absolute', bottom: 20, right: 20, width: 360, zIndex: 10,
    background: crit
      ? 'linear-gradient(180deg, rgba(40,28,8,0.95), rgba(20,14,6,0.98))'
      : 'linear-gradient(180deg, rgba(26,24,32,0.95), rgba(14,10,18,0.98))',
    border: crit ? '1px solid rgba(212,175,55,0.6)' : '1px solid rgba(212,175,55,0.2)',
    borderLeft: crit ? '3px solid #F5D76E' : '3px solid #7B2CBF',
    borderRadius: 3,
    boxShadow: crit
      ? '0 20px 60px -10px rgba(212,175,55,0.5), 0 0 40px rgba(212,175,55,0.25)'
      : '0 20px 60px -10px rgba(123,44,191,0.5)',
    overflow:'hidden',
    animation: crit ? 'bc-shake .4s ease-in-out' : undefined
  }}>
    {crit && (
      <div className="bc-confetti">
        {Array.from({length: 16}).map((_, i) => (
          <span key={i} style={{
            left: `${(i * 6.5) % 100}%`,
            animationDelay: `${(i % 5) * 0.08}s`,
            background: i % 3 === 0 ? '#F5D76E' : i % 3 === 1 ? '#D4AF37' : '#FBF6E4'
          }}></span>
        ))}
      </div>
    )}

    <div style={{
      padding:'10px 14px',
      display:'flex', justifyContent:'space-between', alignItems:'center',
      borderBottom:'1px solid rgba(212,175,55,0.12)'
    }}>
      <div style={{display:'flex', alignItems:'center', gap: 8}}>
        <Icon name="dice" size={12} color={crit ? '#F5D76E' : '#9D4EDD'}/>
        <span className="cinzel tracked" style={{
          fontSize: 10, fontWeight: 600,
          color: crit ? '#F5D76E' : 'var(--bc-ink)'
        }}>{crit ? 'CRÍTICO NATURAL · 20' : 'TESTE DE PERÍCIA'}</span>
      </div>
      <button style={{
        background:'transparent', border:'none', color:'var(--bc-ink-faint)',
        cursor:'pointer', padding: 2
      }}>
        <Icon name="close" size={14}/>
      </button>
    </div>

    <div style={{padding:'14px 16px', display:'flex', alignItems:'center', gap: 16, position:'relative', zIndex: 2}}>
      <div style={{flex: 1}}>
        <div style={{
          fontSize: 10, color: 'var(--bc-ink-dim)', marginBottom: 4,
          letterSpacing:'0.1em', textTransform:'uppercase'
        }}>{crit ? 'Magia (SAB)' : 'Percepção (SAB)'}</div>
        <div style={{fontSize: 13, color:'var(--bc-ink)', marginBottom: 3, fontFamily:'JetBrains Mono, monospace'}}>
          Dados: <span style={{color:'var(--bc-ink-dim)'}}>[</span>
          <span>{crit ? '20' : '13'}</span>
          <span style={{color:'var(--bc-ink-dim)'}}>, </span>
          <span style={{color:'var(--bc-ink-dim)'}}>{crit ? '14' : '18'}</span>
          <span style={{color:'var(--bc-ink-dim)'}}>, </span>
          <span style={{color:'var(--bc-ink-dim)'}}>{crit ? '7' : '5'}</span>
          <span style={{color:'var(--bc-ink-dim)'}}>]</span>
        </div>
        <div style={{display:'flex', gap: 14, fontSize: 12}}>
          <span>
            <span style={{color:'var(--bc-ink-dim)'}}>Maior: </span>
            <span style={{color:'#F5D76E', fontWeight: 600}}>{crit ? '20' : '18'}</span>
          </span>
          <span>
            <span style={{color:'var(--bc-ink-dim)'}}>Bônus: </span>
            <span style={{color:'var(--bc-ink)'}}>+{crit ? '9' : '3'}</span>
          </span>
        </div>
      </div>

      <div style={{textAlign:'center'}}>
        <div style={{
          fontFamily:'Cinzel, serif', fontWeight: 700,
          fontSize: 56, lineHeight: 0.95,
          color: crit ? '#F5D76E' : '#C77DFF',
          textShadow: crit
            ? '0 0 24px rgba(245,215,110,0.8), 0 0 48px rgba(212,175,55,0.5)'
            : '0 0 24px rgba(157,78,221,0.6), 0 4px 8px rgba(0,0,0,0.6)'
        }}>{crit ? '29' : '21'}</div>
        <div className="cinzel tracked" style={{
          fontSize: 9, color: crit ? '#F5D76E' : 'var(--bc-gold-dim)', marginTop: -2
        }}>{crit ? 'TRIUNFO' : 'TOTAL'}</div>
      </div>
    </div>

    {/* progress bar 10s */}
    <div style={{
      height: 2, background:'rgba(0,0,0,0.4)', position:'relative'
    }}>
      <div style={{
        position:'absolute', left: 0, top: 0, bottom: 0, width: '36%',
        background: crit
          ? 'linear-gradient(90deg, #F5D76E, #D4AF37)'
          : 'linear-gradient(90deg, #9D4EDD, #7B2CBF)',
        boxShadow:`0 0 6px ${crit ? 'rgba(245,215,110,0.6)' : 'rgba(157,78,221,0.6)'}`
      }}></div>
    </div>
  </div>
);

// === EFFECTS PANEL ===
const EffectsPanel = () => {
  const effects = [
    { name:'Voto de Vorgan', dur:'3 trns', buffs:'+2 Força', color:'gold', icon:'flame' },
    { name:'Sangue Carmesim', dur:'1 trn',  buffs:'+1d6 Dano', color:'blood', icon:'flame' },
    { name:'Olho da Coruja',  dur:'5 trns', buffs:'+3 Percepção', color:'purple', icon:'star' },
    { name:'Marca da Caça',   dur:'∞',      buffs:'+2 Dano vs alvo', color:'purple', icon:'bolt' },
  ];
  return (
    <div style={{
      position:'absolute', top: 80, right: 20, width: 240,
      background:'linear-gradient(180deg, rgba(26,24,32,0.92), rgba(14,10,18,0.96))',
      border:'1px solid rgba(212,175,55,0.18)',
      borderRadius: 3,
      boxShadow:'0 20px 60px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.08)',
      backdropFilter:'blur(8px)',
      zIndex: 5
    }}>
      <div style={{
        padding:'12px 14px',
        borderBottom:'1px solid rgba(212,175,55,0.18)',
        display:'flex', alignItems:'center', gap: 8,
        background:'linear-gradient(180deg, rgba(123,44,191,0.18), transparent)'
      }}>
        <Icon name="bolt" size={14} color="#F5D76E"/>
        <span className="cinzel tracked" style={{
          fontSize: 10, color:'var(--bc-gold-bright)', fontWeight: 600, flex: 1
        }}>ATIVOS</span>
        <span style={{
          fontSize: 9, color:'var(--bc-gold-dim)',
          background:'rgba(212,175,55,0.08)',
          padding:'2px 6px', borderRadius: 2, fontFamily:'Cinzel'
        }}>{effects.length}</span>
      </div>

      <div style={{padding: 10, display:'flex', flexDirection:'column', gap: 6}}>
        {effects.map(e => {
          const accents = {
            gold:   { stripe:'#D4AF37', text:'#F5D76E' },
            blood:  { stripe:'#B91C1C', text:'#FCA5A5' },
            purple: { stripe:'#9D4EDD', text:'#C77DFF' },
          };
          const a = accents[e.color];
          return (
            <div key={e.name} style={{
              padding:'9px 10px',
              background:'rgba(10,5,7,0.5)',
              borderLeft:`2px solid ${a.stripe}`,
              borderRadius: 2,
              fontSize: 11
            }}>
              <div style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                marginBottom: 3
              }}>
                <span style={{
                  fontFamily:'Cinzel, serif', fontWeight: 600,
                  color: 'var(--bc-ink)', fontSize: 12
                }}>{e.name}</span>
                <span style={{
                  fontSize: 9, color: a.text, fontFamily:'JetBrains Mono',
                  letterSpacing:'0.1em'
                }}>{e.dur}</span>
              </div>
              <div style={{fontSize: 10, color: a.text, fontStyle:'italic'}}>
                {e.buffs}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{padding:'10px 12px', borderTop:'1px solid rgba(212,175,55,0.15)'}}>
        <button className="bc-btn" style={{
          width:'100%',
          background:'linear-gradient(180deg, rgba(212,175,55,0.18), rgba(123,44,191,0.18))',
          border:'1px solid rgba(212,175,55,0.4)',
          color:'var(--bc-gold-bright)',
          padding:'8px 12px', fontSize: 10, borderRadius: 2
        }}>
          <Icon name="moon" size={11}/>
          Passar Turno
        </button>
      </div>
    </div>
  );
};

// === FULL SHEET ===
const SheetScreen = ({
  hpCritical = false,
  diceToast = false,
  critToast = false,
  effectsPanel = false,
  heroic = true,
}) => (
  <div className="bc-page bc-grain" style={{
    width:'100%', height:'100%', overflow:'hidden', position:'relative',
    display:'flex', flexDirection:'column'
  }}>
    <SheetHeader heroic={heroic} />

    <div style={{
      flex: 1, padding: 20, overflow:'hidden',
      display:'grid',
      gridTemplateColumns:'minmax(0, 3fr) minmax(0, 5fr) minmax(0, 4fr)',
      gap: 20, minHeight: 0
    }}>
      <div style={{display:'flex', flexDirection:'column', overflowY:'auto'}} className="bc-scroll">
        <AttributesBlock />
        <StatusBlock hpCritical={hpCritical} />
        <DefenseBlock />
      </div>
      <SkillsBlock />
      <RightColumn active="COMBATE" />
    </div>

    {diceToast && <DiceToast crit={critToast} />}
    {effectsPanel && <EffectsPanel />}
  </div>
);

Object.assign(window, { SheetScreen, DiceToast, EffectsPanel });
