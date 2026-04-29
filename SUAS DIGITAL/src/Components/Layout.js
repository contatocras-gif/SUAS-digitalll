import React, { useState } from 'react';
import { useAuth, SETOR_CONFIG } from '../context/AuthContext';

const ALL_NAV = [
  { section: 'Principal' },
  { id: 'dashboard',    icon: '📊', label: 'Dashboard',           all: true  },
  { id: 'agenda',       icon: '📅', label: 'Agenda da Semana',    all: true  },
  { id: 'atendimentos', icon: '🤝', label: 'Atendimentos',        all: true  },
  { section: 'Cadastros' },
  { id: 'familias',     icon: '👨‍👩‍👧', label: 'Famílias',            all: true  },
  { id: 'individuos',   icon: '👤', label: 'Indivíduos',          all: true  },
  { id: 'projetos',     icon: '📋', label: 'Projetos',            all: true  },
  { section: 'Benefícios' },
  { id: 'beneficios',   icon: '💰', label: 'Controle de Benefícios', all: true },
  { id: 'bolsafamilia', icon: '📄', label: 'Bolsa Família / BPC',  all: true  },
  { section: 'Relatórios' },
  { id: 'relatorios',   icon: '📈', label: 'Relatórios',          all: true  },
  { section: 'Administração', gestaoOnly: true },
  { id: 'usuarios',     icon: '👥', label: 'Usuários',            gestaoOnly: true },
  { id: 'config',       icon: '⚙️', label: 'Configurações',       gestaoOnly: true },
];

export default function Layout({ activePage, setActivePage, children }) {
  const { currentUser, logout, isGestao } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const cfg = SETOR_CONFIG[currentUser?.setor] || SETOR_CONFIG.GESTAO;
  const initials = (currentUser?.name || 'US').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:"'Inter',system-ui,sans-serif" }}>
      {/* SIDEBAR */}
      <div style={{ width: collapsed ? '56px' : '228px', background: cfg.bg, color:'#fff', display:'flex', flexDirection:'column', flexShrink:0, transition:'width 0.2s', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ padding: collapsed ? '14px 8px' : '18px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          {!collapsed && (
            <div style={{ overflow:'hidden' }}>
              <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', background:'rgba(255,255,255,0.2)', padding:'2px 7px', borderRadius:'4px', display:'inline-block', marginBottom:'5px' }}>
                {cfg.label}
              </div>
              <div style={{ fontSize:'13px', fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{cfg.fullName.split('—')[0].trim()}</div>
              <div style={{ fontSize:'11px', opacity:0.65, marginTop:'1px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>Assistência Social</div>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', borderRadius:'6px', padding:'5px 7px', cursor:'pointer', flexShrink:0, fontSize:'13px' }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <div style={{ flex:1, overflowY:'auto', padding:'10px 0' }}>
          {ALL_NAV.map((item, i) => {
            if (item.section) {
              if (item.gestaoOnly && !isGestao()) return null;
              if (collapsed) return null;
              return (
                <div key={i} style={{ padding:'10px 16px 4px', fontSize:'10px', fontWeight:700, letterSpacing:'1px', opacity:0.5, textTransform:'uppercase' }}>
                  {item.section}
                </div>
              );
            }
            if (item.gestaoOnly && !isGestao()) return null;
            const active = activePage === item.id;
            return (
              <div key={item.id} onClick={() => setActivePage(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  padding: collapsed ? '10px 0' : '9px 16px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  cursor:'pointer', fontSize:'13px',
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.8)',
                  fontWeight: active ? 600 : 400,
                  borderLeft: active ? '3px solid #1abc9c' : '3px solid transparent',
                  transition:'all 0.1s',
                }}>
                <span style={{ fontSize:'16px', flexShrink:0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: collapsed ? '10px 6px' : '14px 16px', borderTop:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
          {!collapsed && (
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
              <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'13px', flexShrink:0 }}>{initials}</div>
              <div style={{ overflow:'hidden' }}>
                <div style={{ fontSize:'12px', fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{currentUser?.name}</div>
                <div style={{ fontSize:'10px', opacity:0.6 }}>{cfg.label} · {currentUser?.role}</div>
              </div>
            </div>
          )}
          <button onClick={logout} style={{ width:'100%', padding: collapsed ? '7px 0' : '7px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', borderRadius:'6px', cursor:'pointer', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
            {collapsed ? '↩' : '↩ Sair'}
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {children}
      </div>
    </div>
  );
}
