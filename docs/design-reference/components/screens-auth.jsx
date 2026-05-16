// BloodCrown — Auth screens (Login + Register)

const AuthCard = ({ title, subtitle, children, footer }) => (
  <div style={{
    position:'relative', width: '100%', height: '100%',
    background:
      'radial-gradient(ellipse 60% 50% at 50% 35%, rgba(123,44,191,0.18), transparent 60%), #0A0507',
    display:'flex', alignItems:'center', justifyContent:'center',
    overflow:'hidden', padding: 24
  }} className="bc-page bc-grain">
    {/* Background heraldic ornament — faint giant glyph */}
    <div style={{
      position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
      fontSize: 800, fontFamily:'Cinzel, serif', color:'rgba(212,175,55,0.025)',
      pointerEvents:'none', userSelect:'none', lineHeight: 0.8, fontWeight: 700
    }}>♚</div>

    <div style={{position:'relative', width: 420, zIndex: 2}}>
      {/* Outer arch crown — pointed gothic arch SVG */}
      <svg viewBox="0 0 420 80" style={{
        display:'block', width:'100%', height: 60, marginBottom: -1
      }}>
        <defs>
          <linearGradient id="archG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="rgba(212,175,55,0.5)" />
            <stop offset="1" stopColor="rgba(212,175,55,0.15)" />
          </linearGradient>
        </defs>
        <path d="M0 80 L0 40 Q210 -20 420 40 L420 80 Z"
              fill="rgba(26,24,32,0.92)" stroke="url(#archG)" strokeWidth="1" />
        <path d="M210 12 L214 22 L210 32 L206 22 Z" fill="rgba(212,175,55,0.6)"/>
        <circle cx="210" cy="22" r="1.5" fill="#F5D76E"/>
        <line x1="80" y1="58" x2="180" y2="32"
              stroke="rgba(212,175,55,0.25)" strokeWidth="0.5" />
        <line x1="340" y1="58" x2="240" y2="32"
              stroke="rgba(212,175,55,0.25)" strokeWidth="0.5" />
      </svg>

      <HeraldicFrame style={{padding: '36px 38px 32px', borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0}}>
        {/* Logo */}
        <div style={{textAlign:'center', marginBottom: 6}}>
          <Logo size="lg" />
        </div>

        {/* Subtitle */}
        <div style={{textAlign:'center', marginBottom: 28}}>
          <span className="cinzel tracked" style={{
            fontSize: 11, color: 'var(--bc-gold-dim)', fontWeight: 500
          }}>R · P · G  ·  M · A · N · A · G · E · R</span>
        </div>

        <Divider glyph={title === 'Login' ? '✶  Acesso  ✶' : '✶  Iniciação  ✶'} style={{marginBottom: 24}}/>

        {/* Page title */}
        {title !== 'Login' && (
          <div style={{textAlign:'center', marginBottom: 6}}>
            <h2 className="cinzel tracked" style={{
              fontSize: 18, color: 'var(--bc-ink)', fontWeight: 600, margin: 0
            }}>{title.toUpperCase()}</h2>
            <p style={{
              color: 'var(--bc-ink-dim)', fontSize: 13, fontStyle:'italic',
              margin: '6px 0 22px', letterSpacing:'0.03em'
            }}>{subtitle}</p>
          </div>
        )}

        {children}

        {footer}
      </HeraldicFrame>

      {/* Pendant ornament below card */}
      <div style={{
        display:'flex', justifyContent:'center', marginTop: -1
      }}>
        <svg width="80" height="40" viewBox="0 0 80 40">
          <path d="M0 0 L40 30 L80 0 L80 1 L40 31 L0 1 Z"
                fill="rgba(26,24,32,0.92)" stroke="rgba(212,175,55,0.3)" strokeWidth="1"/>
          <circle cx="40" cy="28" r="2.5" fill="#8A0303" stroke="rgba(212,175,55,0.6)" strokeWidth="0.6"/>
        </svg>
      </div>
    </div>
  </div>
);

const LoginScreen = () => (
  <AuthCard title="Login">
    <div style={{display:'flex', flexDirection:'column', gap: 18}}>
      <Field label="Usuário" icon="user" placeholder="thaumiel.veyra" />
      <Field label="Senha" icon="lock" type="password" placeholder="••••••••••••" eye />

      <button className="bc-btn bc-btn-primary" style={{marginTop: 10, width:'100%'}}>
        <Icon name="crown" size={14} color="#F5D76E"/>
        Entrar
      </button>
    </div>

    <div style={{
      textAlign:'center', marginTop: 24, paddingTop: 20,
      borderTop: '1px solid rgba(212,175,55,0.1)'
    }}>
      <span style={{color:'var(--bc-ink-dim)', fontSize: 13}}>
        Não tem uma conta?{' '}
        <a href="#" style={{
          color:'var(--bc-gold)', textDecoration:'none', fontWeight: 500,
          borderBottom: '1px dotted rgba(212,175,55,0.4)'
        }}>Criar agora</a>
      </span>
    </div>
  </AuthCard>
);

const RegisterScreen = () => (
  <AuthCard title="Criar conta" subtitle="Junte-se à aventura">
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      <Field label="Usuário" icon="user" placeholder="seu_nome" />
      <Field label="Senha" icon="lock" type="password" placeholder="••••••••" eye />
      <Field label="Confirmar senha" icon="lock" type="password" placeholder="••••••••" eye />

      <button className="bc-btn bc-btn-primary" style={{marginTop: 8, width:'100%'}}>
        <Icon name="crown" size={14} color="#F5D76E"/>
        Registrar
      </button>
    </div>

    <div style={{
      textAlign:'center', marginTop: 24, paddingTop: 20,
      borderTop: '1px solid rgba(212,175,55,0.1)'
    }}>
      <span style={{color:'var(--bc-ink-dim)', fontSize: 13}}>
        Já tem uma conta?{' '}
        <a href="#" style={{
          color:'var(--bc-gold)', textDecoration:'none', fontWeight: 500,
          borderBottom: '1px dotted rgba(212,175,55,0.4)'
        }}>Fazer Login</a>
      </span>
    </div>
  </AuthCard>
);

Object.assign(window, { LoginScreen, RegisterScreen });
