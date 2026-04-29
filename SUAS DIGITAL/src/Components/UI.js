import React, { useState } from 'react';

// ─── BUTTON ───────────────────────────────────────────────────────────────────
export function Btn({ children, variant = 'primary', size = '', onClick, type = 'button', disabled, className = '' }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: size === 'sm' ? '5px 10px' : '8px 16px',
    fontSize: size === 'sm' ? '12px' : '13px', fontWeight: 600,
    borderRadius: '7px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1, transition: 'all 0.15s', whiteSpace: 'nowrap',
  };
  const variants = {
    primary:   { background: '#1a5276', color: '#fff' },
    success:   { background: '#148f77', color: '#fff' },
    danger:    { background: '#c0392b', color: '#fff' },
    secondary: { background: '#f1f5f9', color: '#374151', border: '1px solid #d1d5db' },
    ghost:     { background: 'transparent', color: '#1a5276', border: '1px solid #1a5276' },
    warning:   { background: '#e67e22', color: '#fff' },
  };
  return (
    <button type={type} style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'gray' }) {
  const colors = {
    green:  { bg: '#d1fae5', text: '#065f46' },
    blue:   { bg: '#dbeafe', text: '#1e40af' },
    orange: { bg: '#fef3c7', text: '#92400e' },
    red:    { bg: '#fee2e2', text: '#991b1b' },
    gray:   { bg: '#f1f5f9', text: '#475569' },
    purple: { bg: '#ede9fe', text: '#5b21b6' },
    yellow: { bg: '#fef9c3', text: '#713f12' },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{ display:'inline-block', padding:'2px 9px', borderRadius:'20px', fontSize:'11px', fontWeight:600, background:c.bg, color:c.text }}>
      {children}
    </span>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
export function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{ background:'#fff', borderRadius:'10px', border:'0.5px solid rgba(0,0,0,0.1)', padding:'16px', ...style, cursor: onClick ? 'pointer' : undefined }}>
      {children}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 560 }) {
  if (!open) return null;
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'100%', maxWidth:`${width}px`, maxHeight:'90vh', overflowY:'auto', position:'relative' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h2 style={{ fontSize:'16px', fontWeight:700 }}>{title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'#9ca3af', lineHeight:1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── FORM FIELD ───────────────────────────────────────────────────────────────
export function Field({ label, required, children, error }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
      <label style={{ fontSize:'11px', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.5px' }}>
        {label}{required && <span style={{ color:'#c0392b' }}> *</span>}
      </label>
      {children}
      {error && <span style={{ fontSize:'11px', color:'#c0392b' }}>{error}</span>}
    </div>
  );
}

const inputStyle = { width:'100%', padding:'8px 12px', border:'1.5px solid #d1d5db', borderRadius:'7px', fontSize:'13px', outline:'none', color:'#1a202c', background:'#fff' };

export function Input({ value, onChange, placeholder, type = 'text', required, disabled, style }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} disabled={disabled} style={{ ...inputStyle, ...style, opacity: disabled ? 0.6 : 1 }} />;
}

export function Select({ value, onChange, children, disabled, style }) {
  return <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled} style={{ ...inputStyle, ...style, opacity: disabled ? 0.6 : 1 }}>{children}</select>;
}

export function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...inputStyle, resize:'vertical', lineHeight:'1.5' }} />;
}

// ─── FORM ROW ─────────────────────────────────────────────────────────────────
export function FormRow({ children, cols = 2 }) {
  const cols_map = { 1:'1fr', 2:'1fr 1fr', 3:'1fr 1fr 1fr', 4:'1fr 1fr 1fr 1fr' };
  return (
    <div style={{ display:'grid', gridTemplateColumns: cols_map[cols] || '1fr', gap:'14px', marginBottom:'14px' }}>
      {children}
    </div>
  );
}

// ─── SECTION TITLE ────────────────────────────────────────────────────────────
export function SectionTitle({ children }) {
  return (
    <div style={{ fontSize:'12px', fontWeight:700, color:'#1a5276', borderBottom:'2px solid #1a5276', paddingBottom:'6px', marginBottom:'14px', marginTop:'20px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
      {children}
    </div>
  );
}

// ─── TABLE ────────────────────────────────────────────────────────────────────
export function Table({ headers, children, empty = 'Nenhum registro encontrado.' }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ background:'#f8fafc', padding:'9px 12px', textAlign:'left', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', color:'#64748b', borderBottom:'1px solid rgba(0,0,0,0.08)', whiteSpace:'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function TR({ children, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <tr onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onClick}
      style={{ background: hover ? '#f8fafc' : 'transparent', cursor: onClick ? 'pointer' : 'default', transition:'background 0.1s' }}>
      {children}
    </tr>
  );
}

export function TD({ children, style }) {
  return <td style={{ padding:'10px 12px', borderBottom:'0.5px solid rgba(0,0,0,0.06)', color:'#1a202c', ...style }}>{children}</td>;
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color = '#1a5276', icon }) {
  return (
    <Card>
      <div style={{ fontSize:'11px', color:'#6b7280', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px', display:'flex', alignItems:'center', gap:'6px' }}>
        {icon && <span>{icon}</span>}{label}
      </div>
      <div style={{ fontSize:'28px', fontWeight:700, color, margin:'0 0 4px' }}>{value}</div>
      {sub && <div style={{ fontSize:'11px', color:'#9ca3af' }}>{sub}</div>}
    </Card>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, color = '#1a5276' }) {
  return (
    <div style={{ height:'6px', background:'#e5e7eb', borderRadius:'3px', overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${Math.min(100,value)}%`, background:color, borderRadius:'3px', transition:'width 0.4s' }} />
    </div>
  );
}

// ─── SEARCH BAR ───────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Buscar...', children }) {
  return (
    <div style={{ display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap' }}>
      <input
        value={value} onChange={e => onChange(e.target.value)} placeholder={`🔍 ${placeholder}`}
        style={{ flex:1, minWidth:'200px', padding:'8px 14px', border:'1.5px solid #d1d5db', borderRadius:'7px', fontSize:'13px', outline:'none' }}
      />
      {children}
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
export function Toast({ msg, type = 'success' }) {
  if (!msg) return null;
  const bg = { success:'#148f77', error:'#c0392b', info:'#1a5276' }[type] || '#1a5276';
  return (
    <div style={{ position:'fixed', bottom:'24px', right:'24px', background:bg, color:'#fff', padding:'12px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:500, zIndex:9999, boxShadow:'0 4px 16px rgba(0,0,0,0.2)', maxWidth:'360px' }}>
      {msg}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export function Empty({ icon = '📭', title, desc }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'#9ca3af' }}>
      <div style={{ fontSize:'48px', marginBottom:'12px' }}>{icon}</div>
      <div style={{ fontSize:'15px', fontWeight:600, color:'#6b7280', marginBottom:'6px' }}>{title}</div>
      {desc && <div style={{ fontSize:'13px' }}>{desc}</div>}
    </div>
  );
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
export function Confirm({ open, onConfirm, onCancel, message }) {
  return (
    <Modal open={open} onClose={onCancel} title="Confirmar ação" width={380}>
      <p style={{ fontSize:'14px', marginBottom:'20px', color:'#374151' }}>{message}</p>
      <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
        <Btn variant="secondary" onClick={onCancel}>Cancelar</Btn>
        <Btn variant="danger" onClick={onConfirm}>Confirmar</Btn>
      </div>
    </Modal>
  );
}

// ─── ACCESS DENIED ────────────────────────────────────────────────────────────
export function AccessDenied() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh', color:'#9ca3af' }}>
      <div style={{ fontSize:'64px', marginBottom:'16px' }}>🔒</div>
      <h2 style={{ fontSize:'20px', fontWeight:700, color:'#374151', marginBottom:'8px' }}>Acesso Negado</h2>
      <p style={{ fontSize:'14px', textAlign:'center', maxWidth:'360px' }}>
        Você não tem permissão para acessar este setor.<br/>
        Entre em contato com o administrador do sistema.
      </p>
    </div>
  );
}
