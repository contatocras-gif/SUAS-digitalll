import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [loginVal, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = login(loginVal, password);
    if (!result.ok) setError(result.msg);
    setLoading(false);
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, #1a5276 0%, #148f77 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div style={{ background:'#fff', borderRadius:'16px', padding:'40px', width:'100%', maxWidth:'400px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ width:'72px', height:'72px', background:'linear-gradient(135deg,#1a5276,#148f77)', borderRadius:'18px', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'32px', marginBottom:'14px' }}>
            🏛️
          </div>
          <h1 style={{ fontSize:'22px', fontWeight:700, color:'#1a5276' }}>SUAS Digital</h1>
          <p style={{ fontSize:'13px', color:'#9ca3af', marginTop:'4px' }}>Sistema Unificado de Assistência Social</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:'16px' }}>
            <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>Login</label>
            <input
              type="text" value={loginVal} onChange={e => setLogin(e.target.value)}
              placeholder="Seu login de acesso" required autoFocus
              style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #d1d5db', borderRadius:'8px', fontSize:'14px', outline:'none', color:'#1a202c' }}
            />
          </div>
          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>Senha</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Sua senha" required
              style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #d1d5db', borderRadius:'8px', fontSize:'14px', outline:'none', color:'#1a202c' }}
            />
          </div>

          {error && (
            <div style={{ background:'#fee2e2', color:'#991b1b', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'16px', borderLeft:'3px solid #c0392b' }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width:'100%', padding:'12px', background:'linear-gradient(135deg,#1a5276,#148f77)', color:'#fff', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}>
            {loading ? 'Verificando...' : '→ Entrar no Sistema'}
          </button>
        </form>

        {/* Hint logins */}
        <div style={{ marginTop:'24px', padding:'14px', background:'#f8fafc', borderRadius:'8px', fontSize:'12px', color:'#64748b' }}>
          <div style={{ fontWeight:700, marginBottom:'8px', color:'#374151' }}>Logins de demonstração:</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px' }}>
            {[['admin','admin123','Admin'],['cras.tecnica','cras123','CRAS'],['creas.as','creas123','CREAS'],['scfv.edu','scfv123','SCFV'],['gestora','gestao123','GESTÃO']].map(([l,p,s]) => (
              <div key={l} style={{ cursor:'pointer', padding:'4px 8px', borderRadius:'4px', border:'1px solid #e2e8f0', background:'#fff' }}
                onClick={() => { setLogin(l); setPassword(p); }}>
                <span style={{ fontWeight:600, color:'#1a5276' }}>{s}</span>: {l}
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign:'center', fontSize:'11px', color:'#d1d5db', marginTop:'20px' }}>
          SUAS Digital v1.0 — Gestão Municipal de Assistência Social
        </p>
      </div>
    </div>
  );
}
