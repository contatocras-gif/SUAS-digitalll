import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  Card, Btn, Badge, Modal, Field, Input, Select, Textarea,
  FormRow, SectionTitle, Table, TR, TD, SearchBar, Toast, Confirm
} from '../components/UI';

const STATUS_COLOR = { concluido:'green', andamento:'orange', urgente:'red', agendado:'blue', cancelado:'gray' };
const STATUS_LABEL = { concluido:'Concluído', andamento:'Em andamento', urgente:'Urgente', agendado:'Agendado', cancelado:'Cancelado' };

const TIPOS = ['Acolhida','Orientação social','Visita domiciliar','Grupo de convivência','Acompanhamento familiar','Encaminhamento','PSB — Proteção Social Básica','PSE — Proteção Social Especial','Medida socioeducativa','Atendimento em crise'];

const EMPTY = { cidadao:'', tipo:'Acolhida', setor:'', data: new Date().toISOString().split('T')[0], hora:'08:00', profissional:'', status:'agendado', prioridade:'normal', descricao:'', encaminhamentos:'' };

export default function Atendimentos() {
  const { currentUser, canAccessSetor } = useAuth();
  const { atendimentos, addAtendimento, updateAtendimento } = useData();

  const [search, setSearch] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [filtroSetor, setFiltroSetor] = useState('TODOS');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setoresVisiveis = ['CRAS','SCFV','GESTAO','CREAS'].filter(s => canAccessSetor(s));

  const lista = atendimentos.filter(a => {
    if (!canAccessSetor(a.setor)) return false;
    if (filtroStatus !== 'TODOS' && a.status !== filtroStatus) return false;
    if (filtroSetor !== 'TODOS' && a.setor !== filtroSetor) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.cidadao.toLowerCase().includes(q) || a.prontuario?.toLowerCase().includes(q) || a.profissional?.toLowerCase().includes(q);
    }
    return true;
  });

  function openNew() {
    const setor = currentUser.setor === 'GESTAO' ? 'CRAS' : currentUser.setor;
    setForm({ ...EMPTY, setor });
    setEditing(false);
    setModalOpen(true);
  }

  function openEdit(a) {
    setForm({ ...a });
    setEditing(true);
    setModalOpen(true);
    setDetailOpen(false);
  }

  function handleSave() {
    if (!form.cidadao || !form.tipo) { showToast('Preencha cidadão e tipo.'); return; }
    if (editing) {
      updateAtendimento(form.id, form);
      showToast('Atendimento atualizado!');
    } else {
      addAtendimento(form);
      showToast('Atendimento registrado!');
    }
    setModalOpen(false);
  }

  function concluir(a) {
    updateAtendimento(a.id, { ...a, status: 'concluido' });
    setDetailOpen(false);
    showToast('Atendimento concluído!');
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
      <Toast msg={toast} />
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar por cidadão, prontuário ou profissional...">
        <Select value={filtroSetor} onChange={setFiltroSetor} style={{ width:'120px' }}>
          <option value="TODOS">Todos setores</option>
          {setoresVisiveis.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={filtroStatus} onChange={setFiltroStatus} style={{ width:'140px' }}>
          <option value="TODOS">Todos status</option>
          <option value="agendado">Agendado</option>
          <option value="andamento">Em andamento</option>
          <option value="urgente">Urgente</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </Select>
        <Btn onClick={openNew}>+ Novo Atendimento</Btn>
      </SearchBar>

      {/* Cards resumo */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'10px', marginBottom:'16px' }}>
        {[['Total', lista.length, '#1a5276'],['Urgentes', lista.filter(a=>a.status==='urgente').length, '#c0392b'],['Em andamento', lista.filter(a=>a.status==='andamento').length, '#e67e22'],['Concluídos', lista.filter(a=>a.status==='concluido').length, '#148f77']].map(([l,n,c]) => (
          <div key={l} style={{ background:'#fff', borderRadius:'8px', border:'0.5px solid rgba(0,0,0,0.1)', padding:'12px 16px' }}>
            <div style={{ fontSize:'11px', color:'#9ca3af', fontWeight:600, textTransform:'uppercase' }}>{l}</div>
            <div style={{ fontSize:'26px', fontWeight:700, color:c, marginTop:'4px' }}>{n}</div>
          </div>
        ))}
      </div>

      <Card style={{ padding:0 }}>
        <Table headers={['Prontuário','Cidadão','Setor','Tipo','Data/Hora','Profissional','Prioridade','Status','Ações']}>
          {lista.length === 0 && <tr><td colSpan={9} style={{ padding:'40px', textAlign:'center', color:'#9ca3af' }}>Nenhum atendimento encontrado.</td></tr>}
          {lista.map(a => (
            <TR key={a.id}>
              <TD><span style={{ fontFamily:'monospace', fontSize:'12px', color:'#6b7280' }}>#{a.prontuario}</span></TD>
              <TD style={{ fontWeight:600 }}>{a.cidadao}</TD>
              <TD><Badge color={a.setor==='CRAS'?'blue':a.setor==='CREAS'?'green':a.setor==='SCFV'?'purple':'gray'}>{a.setor}</Badge></TD>
              <TD style={{ fontSize:'12px' }}>{a.tipo}</TD>
              <TD style={{ fontSize:'12px', whiteSpace:'nowrap' }}>{a.data} {a.hora}</TD>
              <TD style={{ fontSize:'12px' }}>{a.profissional}</TD>
              <TD><Badge color={a.prioridade==='urgente'?'red':a.prioridade==='alta'?'orange':'gray'}>{a.prioridade}</Badge></TD>
              <TD><Badge color={STATUS_COLOR[a.status]||'gray'}>{STATUS_LABEL[a.status]||a.status}</Badge></TD>
              <TD style={{ display:'flex', gap:'4px' }}>
                <Btn size="sm" variant="secondary" onClick={() => { setSelected(a); setDetailOpen(true); }}>Ver</Btn>
                {a.status !== 'concluido' && <Btn size="sm" variant="success" onClick={() => concluir(a)}>✓</Btn>}
              </TD>
            </TR>
          ))}
        </Table>
      </Card>

      {/* DETALHE */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`🤝 Atendimento #${selected?.prontuario || ''}`} width={580}>
        {selected && <>
          {[['Cidadão',selected.cidadao],['Data/Hora',`${selected.data} às ${selected.hora}`],['Tipo',selected.tipo],['Setor',selected.setor],['Profissional',selected.profissional||'—'],['Prioridade',selected.prioridade],['Status',STATUS_LABEL[selected.status]]].map(([l,v]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'0.5px solid rgba(0,0,0,0.06)', fontSize:'13px' }}>
              <span style={{ color:'#9ca3af' }}>{l}</span><span style={{ fontWeight:500 }}>{v}</span>
            </div>
          ))}
          {selected.descricao && <>
            <SectionTitle>Descrição do Atendimento</SectionTitle>
            <p style={{ fontSize:'13px', color:'#374151', lineHeight:1.6 }}>{selected.descricao}</p>
          </>}
          {selected.encaminhamentos && <>
            <SectionTitle>Encaminhamentos</SectionTitle>
            <p style={{ fontSize:'13px', color:'#374151', lineHeight:1.6 }}>{selected.encaminhamentos}</p>
          </>}
          <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'20px' }}>
            <Btn variant="secondary" onClick={() => setDetailOpen(false)}>Fechar</Btn>
            <Btn variant="ghost" onClick={() => openEdit(selected)}>✏️ Editar</Btn>
            {selected.status !== 'concluido' && <Btn variant="success" onClick={() => concluir(selected)}>✓ Concluir</Btn>}
          </div>
        </>}
      </Modal>

      {/* FORM */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '✏️ Editar Atendimento' : '🤝 Registrar Atendimento'} width={600}>
        <FormRow cols={2}>
          <Field label="Cidadão / Família" required><Input value={form.cidadao} onChange={v => set('cidadao',v)} placeholder="Nome do cidadão ou família" /></Field>
          <Field label="Setor">
            <Select value={form.setor} onChange={v => set('setor',v)}>
              {setoresVisiveis.filter(s=>s!=='GESTAO').map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
        </FormRow>
        <FormRow cols={2}>
          <Field label="Data"><Input type="date" value={form.data} onChange={v => set('data',v)} /></Field>
          <Field label="Hora"><Input type="time" value={form.hora} onChange={v => set('hora',v)} /></Field>
        </FormRow>
        <FormRow cols={2}>
          <Field label="Tipo de atendimento" required>
            <Select value={form.tipo} onChange={v => set('tipo',v)}>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Profissional"><Input value={form.profissional} onChange={v => set('profissional',v)} placeholder="Nome do técnico" /></Field>
        </FormRow>
        <FormRow cols={2}>
          <Field label="Prioridade">
            <Select value={form.prioridade} onChange={v => set('prioridade',v)}>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={v => set('status',v)}>
              <option value="agendado">Agendado</option>
              <option value="andamento">Em andamento</option>
              <option value="concluido">Concluído</option>
              <option value="urgente">Urgente</option>
              <option value="cancelado">Cancelado</option>
            </Select>
          </Field>
        </FormRow>
        <FormRow cols={1}>
          <Field label="Descrição do atendimento">
            <Textarea value={form.descricao} onChange={v => set('descricao',v)} placeholder="Descreva o atendimento, demandas apresentadas..." rows={3} />
          </Field>
        </FormRow>
        <FormRow cols={1}>
          <Field label="Encaminhamentos / Providências">
            <Textarea value={form.encaminhamentos} onChange={v => set('encaminhamentos',v)} placeholder="Encaminhamentos realizados para outros serviços..." rows={2} />
          </Field>
        </FormRow>
        <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'16px' }}>
          <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Btn>
          <Btn onClick={handleSave}>{editing ? 'Salvar' : 'Registrar Atendimento'}</Btn>
        </div>
      </Modal>
    </div>
  );
}
