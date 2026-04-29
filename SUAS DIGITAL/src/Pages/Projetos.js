import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  Card, Btn, Badge, Modal, Field, Input, Select, Textarea,
  FormRow, SectionTitle, SearchBar, Toast, Confirm, ProgressBar
} from '../components/UI';

const PUBLICOS = ['Famílias','Crianças (0-12)','Adolescentes (13-17)','Jovens (18-29)','Adultos','Idosos (60+)','Mulheres','Pessoas com deficiência','Todos'];
const EMPTY = { nome:'', setor:'CRAS', publicoAlvo:'Famílias', inicio:'', fim:'', orcamento:0, beneficiarios:0, tecnicos:1, progresso:0, status:'ativo', descricao:'', responsavel:'' };

export default function Projetos() {
  const { currentUser, canAccessSetor } = useAuth();
  const { projetos, addProjeto, updateProjeto, deleteProjeto } = useData();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setoresVisiveis = ['CRAS','SCFV','GESTAO','CREAS'].filter(s => canAccessSetor(s));

  const lista = projetos.filter(p => {
    if (!canAccessSetor(p.setor)) return false;
    if (search) return p.nome.toLowerCase().includes(search.toLowerCase()) || p.descricao?.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const SETOR_COLOR = { CRAS:'#1a5276', CREAS:'#145a32', SCFV:'#5b21b6', GESTAO:'#e67e22' };
  const STATUS_COLOR = { ativo:'green', concluido:'blue', suspenso:'orange', cancelado:'red' };

  function openNew() {
    const setor = currentUser.setor === 'GESTAO' ? 'CRAS' : currentUser.setor;
    setForm({ ...EMPTY, setor });
    setEditing(false);
    setModalOpen(true);
  }

  function openEdit(p) {
    setForm({ ...p });
    setEditing(true);
    setModalOpen(true);
    setDetailOpen(false);
  }

  function handleSave() {
    if (!form.nome) { showToast('Informe o nome do projeto.'); return; }
    if (editing) { updateProjeto(form.id, form); showToast('Projeto atualizado!'); }
    else { addProjeto(form); showToast('Projeto cadastrado!'); }
    setModalOpen(false);
  }

  function handleDelete() {
    deleteProjeto(deleteConfirm);
    setDeleteConfirm(null);
    setDetailOpen(false);
    showToast('Projeto removido.');
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
      <Toast msg={toast} />
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar projeto...">
        <Btn onClick={openNew}>+ Novo Projeto</Btn>
      </SearchBar>

      {/* Resumo */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'16px', flexWrap:'wrap' }}>
        {[['Ativos','green',lista.filter(p=>p.status==='ativo').length],['Concluídos','blue',lista.filter(p=>p.status==='concluido').length],['Suspensos','orange',lista.filter(p=>p.status==='suspenso').length]].map(([l,c,n])=>(
          <div key={l} style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.1)', borderRadius:'8px', padding:'8px 16px', fontSize:'13px' }}>
            <span style={{ color:'#9ca3af' }}>{l}: </span><strong>{n}</strong>
          </div>
        ))}
      </div>

      {lista.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px', color:'#9ca3af' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>📋</div>
          <div style={{ fontSize:'15px', fontWeight:600, color:'#6b7280' }}>Nenhum projeto encontrado</div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:'16px' }}>
        {lista.map(p => (
          <Card key={p.id} style={{ borderLeft:`4px solid ${SETOR_COLOR[p.setor]||'#ccc'}`, cursor:'pointer' }} onClick={() => { setSelected(p); setDetailOpen(true); }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
              <div style={{ flex:1, paddingRight:'8px' }}>
                <div style={{ fontWeight:700, fontSize:'14px', marginBottom:'3px' }}>{p.nome}</div>
                <div style={{ fontSize:'11px', color:'#9ca3af' }}>{p.setor} · {p.publicoAlvo} · {p.inicio} → {p.fim||'Em aberto'}</div>
              </div>
              <Badge color={STATUS_COLOR[p.status]||'gray'}>{p.status}</Badge>
            </div>
            <p style={{ fontSize:'12px', color:'#6b7280', marginBottom:'12px', lineHeight:1.5 }}>{p.descricao}</p>
            <div style={{ display:'flex', gap:'16px', fontSize:'12px', marginBottom:'10px' }}>
              <span>👥 <strong>{p.beneficiarios}</strong> beneficiários</span>
              <span>👤 <strong>{p.tecnicos}</strong> técnico(s)</span>
              {p.orcamento > 0 && <span>💰 <strong>R$ {Number(p.orcamento).toLocaleString('pt-BR')}</strong></span>}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#9ca3af', marginBottom:'4px' }}>
              <span>Progresso</span><span style={{ fontWeight:700, color: SETOR_COLOR[p.setor] }}>{p.progresso}%</span>
            </div>
            <ProgressBar value={p.progresso} color={SETOR_COLOR[p.setor]||'#1a5276'} />
          </Card>
        ))}
      </div>

      {/* DETALHE */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`📋 ${selected?.nome||''}`} width={580}>
        {selected && <>
          <SectionTitle>Informações do Projeto</SectionTitle>
          {[['Setor',selected.setor],['Público-alvo',selected.publicoAlvo],['Responsável',selected.responsavel||'—'],['Início',selected.inicio||'—'],['Término',selected.fim||'Em aberto'],['Orçamento',`R$ ${Number(selected.orcamento).toLocaleString('pt-BR')}`],['Beneficiários',selected.beneficiarios],['Técnicos',selected.tecnicos],['Status',selected.status],['Progresso',`${selected.progresso}%`]].map(([l,v])=>(
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'0.5px solid rgba(0,0,0,0.06)', fontSize:'13px' }}>
              <span style={{ color:'#9ca3af' }}>{l}</span><span style={{ fontWeight:500 }}>{v}</span>
            </div>
          ))}
          {selected.descricao && <>
            <SectionTitle>Descrição</SectionTitle>
            <p style={{ fontSize:'13px', color:'#374151', lineHeight:1.6 }}>{selected.descricao}</p>
          </>}
          <SectionTitle>Progresso</SectionTitle>
          <ProgressBar value={selected.progresso} color={SETOR_COLOR[selected.setor]||'#1a5276'} />
          <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'20px' }}>
            <Btn variant="secondary" onClick={() => setDetailOpen(false)}>Fechar</Btn>
            <Btn variant="ghost" onClick={() => openEdit(selected)}>✏️ Editar</Btn>
            <Btn variant="danger" size="sm" onClick={() => setDeleteConfirm(selected.id)}>Excluir</Btn>
          </div>
        </>}
      </Modal>

      {/* FORM */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '✏️ Editar Projeto' : '📋 Novo Projeto'} width={600}>
        <FormRow cols={1}>
          <Field label="Nome do Projeto" required><Input value={form.nome} onChange={v => set('nome',v)} placeholder="Nome do projeto ou programa" /></Field>
        </FormRow>
        <FormRow cols={2}>
          <Field label="Setor">
            <Select value={form.setor} onChange={v => set('setor',v)}>
              {setoresVisiveis.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Público-alvo">
            <Select value={form.publicoAlvo} onChange={v => set('publicoAlvo',v)}>
              {PUBLICOS.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
          </Field>
        </FormRow>
        <FormRow cols={2}>
          <Field label="Data de início"><Input type="date" value={form.inicio} onChange={v => set('inicio',v)} /></Field>
          <Field label="Data de término"><Input type="date" value={form.fim} onChange={v => set('fim',v)} /></Field>
        </FormRow>
        <FormRow cols={3}>
          <Field label="Orçamento (R$)"><Input type="number" value={form.orcamento} onChange={v => set('orcamento',v)} /></Field>
          <Field label="Beneficiários"><Input type="number" value={form.beneficiarios} onChange={v => set('beneficiarios',v)} /></Field>
          <Field label="Técnicos"><Input type="number" value={form.tecnicos} onChange={v => set('tecnicos',v)} /></Field>
        </FormRow>
        <FormRow cols={2}>
          <Field label="Responsável"><Input value={form.responsavel} onChange={v => set('responsavel',v)} placeholder="Nome do coordenador" /></Field>
          <Field label="Status">
            <Select value={form.status} onChange={v => set('status',v)}>
              <option value="ativo">Ativo</option>
              <option value="concluido">Concluído</option>
              <option value="suspenso">Suspenso</option>
              <option value="cancelado">Cancelado</option>
            </Select>
          </Field>
        </FormRow>
        <FormRow cols={1}>
          <Field label={`Progresso: ${form.progresso}%`}>
            <input type="range" min="0" max="100" value={form.progresso} onChange={e => set('progresso', Number(e.target.value))} style={{ width:'100%' }} />
          </Field>
        </FormRow>
        <FormRow cols={1}>
          <Field label="Descrição / Objetivos">
            <Textarea value={form.descricao} onChange={v => set('descricao',v)} placeholder="Descreva o projeto, objetivos, metodologia..." rows={3} />
          </Field>
        </FormRow>
        <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'16px' }}>
          <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Btn>
          <Btn onClick={handleSave}>{editing ? 'Salvar' : 'Cadastrar Projeto'}</Btn>
        </div>
      </Modal>

      <Confirm open={!!deleteConfirm} message="Deseja excluir este projeto permanentemente?" onConfirm={handleDelete} onCancel={() => setDeleteConfirm(null)} />
    </div>
  );
}
