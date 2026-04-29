import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card, StatCard, Badge, ProgressBar } from '../components/UI';

const COLORS = { CRAS:'#1a5276', CREAS:'#145a32', SCFV:'#5b21b6', GESTAO:'#1a5276' };

export default function Dashboard({ setActivePage }) {
  const { currentUser, canAccessSetor } = useAuth();
  const { familias, atendimentos, beneficios, projetos, agenda } = useData();

  const mySetor = currentUser.setor;
  const isGestao = mySetor === 'GESTAO' || currentUser.role === 'admin';

  // Filter by setor access
  const visibleFamilias = familias.filter(f => canAccessSetor(f.setor));
  const visibleAtendimentos = atendimentos.filter(a => canAccessSetor(a.setor));
  const visibleProjetos = projetos.filter(p => canAccessSetor(p.setor));
  const today = new Date().toISOString().split('T')[0];
  const todayAtend = visibleAtendimentos.filter(a => a.data === today);
  const todayAgenda = agenda.filter(a => a.data === today && canAccessSetor(a.setor));

  const color = COLORS[mySetor] || '#1a5276';

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
      {/* Welcome */}
      <div style={{ marginBottom:'20px' }}>
        <h2 style={{ fontSize:'18px', fontWeight:700, color:'#1a202c' }}>
          Bom dia, {currentUser.name.split(' ')[0]}! 👋
        </h2>
        <p style={{ fontSize:'13px', color:'#9ca3af', marginTop:'3px' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'14px', marginBottom:'20px' }}>
        <StatCard label="Famílias Cadastradas" value={visibleFamilias.filter(f=>f.situacao!=='inativo').length} sub={`${visibleFamilias.filter(f=>f.situacao==='ativo').length} ativas`} color={color} icon="👨‍👩‍👧" />
        <StatCard label="Atendimentos no Mês" value={visibleAtendimentos.length} sub={`${todayAtend.length} hoje`} color="#148f77" icon="🤝" />
        <StatCard label="Benefícios Ativos" value={beneficios.filter(b=>b.status==='ativo').length} sub="BF + BPC + Eventuais" color="#e67e22" icon="💰" />
        <StatCard label="Projetos em Andamento" value={visibleProjetos.filter(p=>p.status==='ativo').length} sub="Projetos ativos" color={color} icon="📋" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
        {/* Atendimentos de hoje */}
        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
            <h3 style={{ fontSize:'13px', fontWeight:700 }}>📅 Agenda de Hoje</h3>
            <span onClick={() => setActivePage('agenda')} style={{ fontSize:'12px', color:'#1a5276', cursor:'pointer' }}>Ver agenda →</span>
          </div>
          {todayAgenda.length === 0 ? (
            <p style={{ fontSize:'13px', color:'#9ca3af', textAlign:'center', padding:'20px' }}>Nenhum agendamento para hoje.</p>
          ) : todayAgenda.slice(0,4).map(a => (
            <div key={a.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'0.5px solid rgba(0,0,0,0.06)' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'12px', flexShrink:0 }}>
                {a.cidadao.split(' ').map(w=>w[0]).slice(0,2).join('')}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:'13px' }}>{a.cidadao}</div>
                <div style={{ fontSize:'11px', color:'#9ca3af' }}>{a.hora} · {a.tipo}</div>
              </div>
              <Badge color={a.status==='confirmado'?'green':a.status==='agendado'?'blue':'orange'}>{a.status}</Badge>
            </div>
          ))}
        </Card>

        {/* Alertas */}
        <Card>
          <h3 style={{ fontSize:'13px', fontWeight:700, marginBottom:'14px' }}>🔔 Alertas e Notificações</h3>
          {[
            { type:'warn', msg:'18 famílias com cadastro vencido (CadÚnico)' },
            { type:'warn', msg:'7 benefícios com pendência de documentação' },
            { type:'warn', msg:`${beneficios.filter(b=>b.status==='renovar').length} benefício(s) para renovar este mês` },
            { type:'info', msg:'Relatório mensal disponível para envio' },
            { type:'success', msg:`${visibleAtendimentos.filter(a=>a.status==='concluido').length} atendimentos concluídos este mês` },
          ].map((n, i) => (
            <div key={i} style={{
              padding:'8px 12px', borderRadius:'7px', fontSize:'12px', marginBottom:'8px',
              display:'flex', gap:'8px', alignItems:'flex-start',
              background: n.type==='warn'?'#fef3c7':n.type==='info'?'#dbeafe':'#d1fae5',
              color: n.type==='warn'?'#92400e':n.type==='info'?'#1e40af':'#065f46',
              borderLeft: `3px solid ${n.type==='warn'?'#f59e0b':n.type==='info'?'#3b82f6':'#10b981'}`,
            }}>
              {n.type==='warn'?'⚠️':n.type==='info'?'ℹ️':'✓'} {n.msg}
            </div>
          ))}
        </Card>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px' }}>
        {/* Projetos */}
        <Card>
          <h3 style={{ fontSize:'13px', fontWeight:700, marginBottom:'14px' }}>📋 Projetos Ativos</h3>
          {visibleProjetos.filter(p=>p.status==='ativo').slice(0,4).map(p => (
            <div key={p.id} style={{ marginBottom:'12px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'4px' }}>
                <span style={{ fontWeight:500 }}>{p.nome}</span>
                <span style={{ color:color, fontWeight:700 }}>{p.progresso}%</span>
              </div>
              <ProgressBar value={p.progresso} color={color} />
            </div>
          ))}
          {visibleProjetos.filter(p=>p.status==='ativo').length === 0 && <p style={{ fontSize:'13px', color:'#9ca3af' }}>Nenhum projeto ativo.</p>}
        </Card>

        {/* Distribuição */}
        <Card>
          <h3 style={{ fontSize:'13px', fontWeight:700, marginBottom:'14px' }}>🗂️ Por Setor</h3>
          {(isGestao ? ['CRAS','SCFV','GESTAO'] : [mySetor]).map(s => (
            <div key={s} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'0.5px solid rgba(0,0,0,0.06)', fontSize:'13px' }}>
              <span style={{ color:'#6b7280' }}>{s}</span>
              <span style={{ fontWeight:700, color: COLORS[s] || '#1a5276' }}>
                {familias.filter(f=>f.setor===s && f.situacao!=='inativo').length} famílias
              </span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', fontSize:'13px' }}>
            <span style={{ color:'#6b7280' }}>Bolsa Família</span>
            <span style={{ fontWeight:700, color:'#e67e22' }}>{beneficios.filter(b=>b.tipo==='Bolsa Família'&&b.status==='ativo').length}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', fontSize:'13px' }}>
            <span style={{ color:'#6b7280' }}>BPC</span>
            <span style={{ fontWeight:700, color:'#c0392b' }}>{beneficios.filter(b=>b.tipo.startsWith('BPC')&&b.status==='ativo').length}</span>
          </div>
        </Card>

        {/* Atendimentos recentes */}
        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
            <h3 style={{ fontSize:'13px', fontWeight:700 }}>🕐 Atendimentos Recentes</h3>
          </div>
          {visibleAtendimentos.slice(0,5).map(a => (
            <div key={a.id} style={{ display:'flex', gap:'10px', marginBottom:'12px' }}>
              <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: a.status==='concluido'?'#148f77':a.status==='urgente'?'#c0392b':'#e67e22', marginTop:'4px', flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'11px', color:'#9ca3af' }}>{a.data} · {a.setor}</div>
                <div style={{ fontSize:'12px', fontWeight:500, marginTop:'2px' }}>{a.cidadao}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
