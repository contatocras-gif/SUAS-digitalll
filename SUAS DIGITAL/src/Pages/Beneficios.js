import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  Card, Btn, Badge, Modal, Field, Input, Select, Textarea,
  FormRow, SectionTitle, Table, TR, TD, SearchBar, Toast, StatCard
} from '../components/UI';

const TIPOS_BENEF = ['Bolsa Família','BPC - Idoso','BPC - Deficiência','Cesta Básica','Benefício Eventual - Natalidade','Benefício Eventual - Funeral','Auxílio Moradia Emergencial','Passagem Social','Kit Escolar'];
const STATUS_COLOR = { ativo:'green', analise:'blue', renovar:'orange', suspenso:'red', cancelado:'gray' };
const STATUS_LABEL = { ativo:'Ativo', analise:'Em análise', renovar:'Renovar', suspenso:'Suspenso', cancelado:'Cancelado' };

const EMPTY = { beneficiario:'', cpf:'', tipo:'Bolsa Família', valor:0, inicio:'', renovacao:'', status:'analise', setor:'CRAS', obs:'' };

export default function Beneficios() {
  const { currentUser, canAccessSetor } = useAuth();
  const { beneficios, addBeneficio, updateBeneficio } = useData();

  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState('');
  const [aba, setAba] = useState('lista'); // lista | bpc | resumo

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const lista = beneficios.filter(b => {
    if (filtroStatus !== 'TODOS' && b.status !== filtroStatus) return false;
    if (filtroTipo !== 'TODOS' && b.tipo !== filtroTipo) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.beneficiario.toLowerCase().includes(q) || b.cpf.includes(q);
    }
    return true;
  });

  function openNew() {
    const setor = currentUser.setor === 'GESTAO' ? 'CRAS' : currentUser.setor;
    setForm({ ...EMPTY, setor });
    setEditing(false);
    setModalOpen(true);
  }

  function openEdit(b) {
    setForm({ ...b });
    setEditing(true);
    setModalOpen(true);
    setDetailOpen(false);
  }

  function handleSave() {
    if (!form.beneficiario || !form.tipo) { showToast('Preencha beneficiário e tipo.'); return; }
    if (editing) { updateBeneficio(form.id, form); showToast('Benefício atualizado!'); }
    else { addBeneficio(form); showToast('Benefício registrado!'); }
    setModalOpen(false);
  }

  function renovar(b) {
    updateBeneficio(b.id, { ...b, status: 'ativo' });
    setDetailOpen(false);
    showToast('Benefício renovado!');
  }

  const bf = beneficios.filter(b => b.tipo === 'Bolsa Família' && b.status === 'ativo').length;
  const bpcIdoso = beneficios.filter(b => b.tipo === 'BPC - Idoso' && b.status === 'ativo').length;
  const bpcDef = beneficios.filter(b => b.tipo === 'BPC - Deficiência' && b.status === 'ativo').length;
  const eventuais = beneficios.filter(b => b.tipo.includes('Eventual') && b.status === 'ativo').length;
  const renovar_count = beneficios.filter(b => b.status === 'renovar').length;

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
      <Toast msg={toast} />

      {/* Abas */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'16px', borderBottom:'1px solid #e5e7eb', paddingBottom:'0' }}>
        {[['lista','📋 Lista'],['bpc','🏛️ BF / BPC'],['resumo','📊 Resumo']].map(([id,label])=>(
          <button key={id} onClick={()=>setAba(id)} style={{ padding:'8px 16px', border:'none', borderBottom:`2px solid ${aba===id?'#1a5276':'transparent'}`, background:'transparent', fontWeight: aba===id?700:400, color: aba===id?'#1a5276':'#6b7280', cursor:'pointer', fontSize:'13px' }}>
            {label}
          </button>
        ))}
      </div>

      {aba === 'lista' && <>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por beneficiário ou CPF...">
          <Select value={filtroTipo} onChange={setFiltroTipo} style={{ width:'160px' }}>
            <option value="TODOS">Todos os tipos</option>
            {TIPOS_BENEF.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select value={filtroStatus} onChange={setFiltroStatus} style={{ width:'130px' }}>
            <option value="TODOS">Todos status</option>
            <option value="ativo">Ativo</option>
            <option value="analise">Em análise</option>
            <option value="renovar">Renovar</option>
            <option value="suspenso">Suspenso</option>
          </Select>
          <Btn onClick={openNew}>+ Registrar Benefício</Btn>
        </SearchBar>

        {renovar_count > 0 && (
          <div style={{ background:'#fef3c7', border:'1px solid #f59e0b', borderRadius:'8px', padding:'10px 14px', marginBottom:'14px', fontSize:'13px', color:'#92400e', display:'flex', alignItems:'center', gap:'8px' }}>
            ⚠️ <strong>{renovar_count} benefício(s)</strong> precisam de renovação este mês.
          </div>
        )}

        <Card style={{ padding:0 }}>
          <Table headers={['Beneficiário','CPF','Tipo','Valor','Início','Renovação','Status','Ações']}>
            {lista.length === 0 && <tr><td colSpan={8} style={{ padding:'40px', textAlign:'center', color:'#9ca3af' }}>Nenhum benefício encontrado.</td></tr>}
            {lista.map(b => (
              <TR key={b.id}>
                <TD style={{ fontWeight:600 }}>{b.beneficiario}</TD>
                <TD style={{ fontSize:'12px', color:'#6b7280' }}>{b.cpf}</TD>
                <TD><Badge color={b.tipo.includes('BPC')?'purple':b.tipo.includes('Bolsa')?'blue':b.tipo.includes('Eventual')?'orange':'gray'}>{b.tipo}</Badge></TD>
                <TD>{b.valor > 0 ? `R$ ${Number(b.valor).toLocaleString('pt-BR')}` : '—'}</TD>
                <TD style={{ fontSize:'12px' }}>{b.inicio||'—'}</TD>
                <TD style={{ fontSize:'12px' }}>{b.renovacao||'—'}</TD>
                <TD><Badge color={STATUS_COLOR[b.status]||'gray'}>{STATUS_LABEL[b.status]||b.status}</Badge></TD>
                <TD style={{ display:'flex', gap:'4px' }}>
                  <Btn size="sm" variant="secondary" onClick={() => { setSelected(b); setDetailOpen(true); }}>Ver</Btn>
                  {b.status === 'renovar' && <Btn size="sm" variant="warning" onClick={() => renovar(b)}>Renovar</Btn>}
                </TD>
              </TR>
            ))}
          </Table>
        </Card>
      </>}

      {aba === 'bpc' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          <Card>
            <h3 style={{ fontWeight:700, fontSize:'14px', marginBottom:'14px' }}>🏦 Bolsa Família</h3>
            {[['Benefício base familiar','R$ 600,00/mês por família',bf,'green'],['Primeira infância','R$ 150,00 por criança 0-6 anos',Math.round(bf*0.4),'blue'],['Benefício variável','Gestantes, nutrizes, crianças',Math.round(bf*0.2),'orange']].map(([nome,meta,qtd,cor])=>(
              <div key={nome} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'0.5px solid rgba(0,0,0,0.06)' }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'8px', background:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>💳</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:'13px' }}>{nome}</div>
                  <div style={{ fontSize:'11px', color:'#9ca3af' }}>{meta}</div>
                </div>
                <Badge color={cor}>{qtd}</Badge>
              </div>
            ))}
          </Card>
          <Card>
            <h3 style={{ fontWeight:700, fontSize:'14px', marginBottom:'14px' }}>🏛️ BPC — Benefício de Prestação Continuada</h3>
            {[['BPC Idoso (65+ anos)','1 salário mínimo — renda per capita ≤ 1/4 SM','👴',bpcIdoso,'purple'],['BPC Deficiência','Pessoa com deficiência de qualquer idade','♿',bpcDef,'red']].map(([nome,desc,icon,qtd,cor])=>(
              <div key={nome} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'0.5px solid rgba(0,0,0,0.06)' }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'8px', background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>{icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:'13px' }}>{nome}</div>
                  <div style={{ fontSize:'11px', color:'#9ca3af' }}>{desc}</div>
                </div>
                <Badge color={cor}>{qtd}</Badge>
              </div>
            ))}
            <div style={{ marginTop:'14px', display:'flex', gap:'8px' }}>
              <Btn size="sm" onClick={() => showToast('Consulta ao CadÚnico iniciada...')}>Consultar CadÚnico</Btn>
              <Btn size="sm" variant="secondary" onClick={() => showToast('Relatório gerado!')}>Gerar Relatório</Btn>
            </div>
          </Card>
        </div>
      )}

      {aba === 'resumo' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'14px', marginBottom:'20px' }}>
            <StatCard label="Bolsa Família" value={bf} sub="beneficiários ativos" color="#1a5276" />
            <StatCard label="BPC Total" value={bpcIdoso+bpcDef} sub={`${bpcIdoso} idosos · ${bpcDef} deficiência`} color="#148f77" />
            <StatCard label="Eventuais" value={eventuais} sub="benefícios ativos" color="#e67e22" />
            <StatCard label="Para Renovar" value={renovar_count} sub="precisam de atenção" color="#c0392b" />
          </div>
          <Card>
            <h3 style={{ fontWeight:700, fontSize:'13px', marginBottom:'14px' }}>Distribuição por tipo de benefício</h3>
            <Table headers={['Tipo','Ativos','Análise','Renovar','Suspensos']}>
              {TIPOS_BENEF.map(tipo => {
                const ativos = beneficios.filter(b=>b.tipo===tipo&&b.status==='ativo').length;
                const analise = beneficios.filter(b=>b.tipo===tipo&&b.status==='analise').length;
                const renov = beneficios.filter(b=>b.tipo===tipo&&b.status==='renovar').length;
                const susp = beneficios.filter(b=>b.tipo===tipo&&b.status==='suspenso').length;
                if (ativos+analise+renov+susp === 0) return null;
                return (
                  <TR key={tipo}>
                    <TD style={{ fontWeight:500 }}>{tipo}</TD>
                    <TD><Badge color="green">{ativos}</Badge></TD>
                    <TD><Badge color="blue">{analise}</Badge></TD>
                    <TD><Badge color="orange">{renov}</Badge></TD>
                    <TD><Badge color="red">{susp}</Badge></TD>
                  </TR>
                );
              })}
            </Table>
          </Card>
        </div>
      )}

      {/* DETALHE */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`💰 Benefício — ${selected?.beneficiario||''}`} width={520}>
        {selected && <>
          <SectionTitle>Dados do Benefício</SectionTitle>
          {[['Tipo',selected.tipo],['Valor',selected.valor > 0 ? `R$ ${Number(selected.valor).toLocaleString('pt-BR')}` : '—'],['CPF',selected.cpf],['Início',selected.inicio||'—'],['Renovação',selected.renovacao||'—'],['Status',STATUS_LABEL[selected.status]||selected.status],['Setor',selected.setor]].map(([l,v])=>(
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'0.5px solid rgba(0,0,0,0.06)', fontSize:'13px' }}>
              <span style={{ color:'#9ca3af' }}>{l}</span><span style={{ fontWeight:500 }}>{v}</span>
            </div>
          ))}
          {selected.obs && <><SectionTitle>Observações</SectionTitle><p style={{ fontSize:'13px', color:'#374151' }}>{selected.obs}</p></>}
          <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'20px' }}>
            <Btn variant="secondary" onClick={() => setDetailOpen(false)}>Fechar</Btn>
            <Btn variant="ghost" onClick={() => openEdit(selected)}>✏️ Editar</Btn>
            {selected.status === 'renovar' && <Btn variant="warning" onClick={() => renovar(selected)}>Renovar</Btn>}
          </div>
        </>}
      </Modal>

      {/* FORM */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '✏️ Editar Benefício' : '💰 Registrar Benefício'} width={560}>
        <FormRow cols={2}>
          <Field label="Beneficiário" required><Input value={form.beneficiario} onChange={v => set('beneficiario',v)} placeholder="Nome completo" /></Field>
          <Field label="CPF"><Input value={form.cpf} onChange={v => set('cpf',v)} placeholder="000.000-**" /></Field>
        </FormRow>
        <FormRow cols={2}>
          <Field label="Tipo de benefício" required>
            <Select value={form.tipo} onChange={v => set('tipo',v)}>
              {TIPOS_BENEF.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Valor (R$)"><Input type="number" value={form.valor} onChange={v => set('valor',v)} /></Field>
        </FormRow>
        <FormRow cols={3}>
          <Field label="Data início"><Input type="month" value={form.inicio} onChange={v => set('inicio',v)} /></Field>
          <Field label="Renovação"><Input type="month" value={form.renovacao} onChange={v => set('renovacao',v)} /></Field>
          <Field label="Status">
            <Select value={form.status} onChange={v => set('status',v)}>
              <option value="analise">Em análise</option>
              <option value="ativo">Ativo</option>
              <option value="renovar">Renovar</option>
              <option value="suspenso">Suspenso</option>
              <option value="cancelado">Cancelado</option>
            </Select>
          </Field>
        </FormRow>
        <FormRow cols={1}>
          <Field label="Observações"><Textarea value={form.obs} onChange={v => set('obs',v)} rows={2} /></Field>
        </FormRow>
        <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'16px' }}>
          <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Btn>
          <Btn onClick={handleSave}>{editing ? 'Salvar' : 'Registrar'}</Btn>
        </div>
      </Modal>
    </div>
  );
}
