import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  Card, Btn, Badge, Modal, Field, Input, Select, Textarea,
  FormRow, SectionTitle, Table, TR, TD, SearchBar, Toast,
  Empty, Confirm, AccessDenied
} from '../components/UI';

const SITUACAO_COLOR = { ativo:'green', desatualizado:'orange', analise:'blue', inativo:'gray', acompanhamento:'purple' };
const SITUACAO_LABEL = { ativo:'Ativo', desatualizado:'Desatualizado', analise:'Em análise', inativo:'Inativo', acompanhamento:'Acompanhamento' };

const EMPTY_FORM = {
  responsavel:'', cpf:'', nis:'', telefone:'', email:'',
  membros:1, renda:0, endereco:'', bairro:'', cep:'', zona:'Urbana',
  situacao:'ativo', beneficios:[], vulnerabilidades:'', setor:'CRAS',
};

export default function Familias() {
  const { currentUser, canAccessSetor } = useAuth();
  const { familias, addFamilia, updateFamilia, deleteFamilia } = useData();

  const [search, setSearch] = useState('');
  const [filtroSetor, setFiltroSetor] = useState('TODOS');
  const [filtroSit, setFiltroSit] = useState('TODOS');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState('');
  const [editing, setEditing] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const visivel = familias.filter(f => {
    if (!canAccessSetor(f.setor)) return false;
    if (filtroSetor !== 'TODOS' && f.setor !== filtroSetor) return false;
    if (filtroSit !== 'TODOS' && f.situacao !== filtroSit) return false;
    if (search) {
      const q = search.toLowerCase();
      return f.responsavel.toLowerCase().includes(q) || f.cpf.includes(q) || f.codigo?.includes(q) || f.bairro?.toLowerCase().includes(q);
    }
    return true;
  });

  function openNew() {
    const setor = currentUser.setor === 'GESTAO' ? 'CRAS' : currentUser.setor;
    setForm({ ...EMPTY_FORM, setor });
    setEditing(false);
    setModalOpen(true);
  }

  function openEdit(f) {
    setForm({ ...f });
    setEditing(true);
    setModalOpen(true);
    setDetailOpen(false);
  }

  function handleSave() {
    if (!form.responsavel || !form.cpf) { showToast('Preencha nome e CPF.'); return; }
    if (editing) {
      updateFamilia(form.id, form);
      showToast('Família atualizada com sucesso!');
    } else {
      addFamilia(form);
      showToast('Família cadastrada com sucesso!');
    }
    setModalOpen(false);
  }

  function handleDelete() {
    deleteFamilia(deleteConfirm);
    setDeleteConfirm(null);
    setDetailOpen(false);
    showToast('Família desativada.');
  }

  const acessoSetores = ['CRAS','SCFV','GESTAO'].filter(s => canAccessSetor(s));
  if (acessoSetores.length === 0) return <AccessDenied />;

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
      <Toast msg={toast} />
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nome, CPF, código ou bairro...">
        <Select value={filtroSetor} onChange={setFiltroSetor} style={{ width:'130px' }}>
          <option value="TODOS">Todos setores</option>
          {acessoSetores.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={filtroSit} onChange={setFiltroSit} style={{ width:'130px' }}>
          <option value="TODOS">Todas situações</option>
          <option value="ativo">Ativo</option>
          <option value="desatualizado">Desatualizado</option>
          <option value="analise">Em análise</option>
          <option value="acompanhamento">Acompanhamento</option>
        </Select>
        <Btn onClick={openNew}>+ Nova Família</Btn>
      </SearchBar>

      {/* Resumo */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'16px', flexWrap:'wrap' }}>
        {[['Total','gray', visivel.length],['Ativas','green', visivel.filter(f=>f.situacao==='ativo').length],['Desatualizadas','orange', visivel.filter(f=>f.situacao==='desatualizado').length],['Em análise','blue', visivel.filter(f=>f.situacao==='analise').length]].map(([l,c,n]) => (
          <div key={l} style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.1)', borderRadius:'8px', padding:'8px 16px', fontSize:'13px' }}>
            <span style={{ color:'#9ca3af' }}>{l}: </span><strong>{n}</strong>
          </div>
        ))}
      </div>

      <Card style={{ padding:0 }}>
        <Table headers={['Código','Família / Responsável','Setor','Membros','Renda','Benefícios','Situação','Ações']}>
          {visivel.length === 0 && (
            <tr><td colSpan={8} style={{ padding:'40px', textAlign:'center', color:'#9ca3af' }}>Nenhuma família encontrada.</td></tr>
          )}
          {visivel.map(f => (
            <TR key={f.id}>
              <TD><span style={{ fontFamily:'monospace', fontSize:'12px', color:'#6b7280' }}>{f.codigo}</span></TD>
              <TD>
                <div style={{ fontWeight:600 }}>{f.responsavel}</div>
                <div style={{ fontSize:'11px', color:'#9ca3af' }}>{f.endereco} — {f.bairro}</div>
              </TD>
              <TD><Badge color={f.setor==='CRAS'?'blue':f.setor==='SCFV'?'purple':'gray'}>{f.setor}</Badge></TD>
              <TD style={{ textAlign:'center' }}>{f.membros}</TD>
              <TD>R$ {Number(f.renda).toLocaleString('pt-BR')}</TD>
              <TD>
                {(f.beneficios||[]).length === 0
                  ? <Badge color="gray">Nenhum</Badge>
                  : (f.beneficios||[]).map(b => <Badge key={b} color="green">{b}</Badge>)
                }
              </TD>
              <TD><Badge color={SITUACAO_COLOR[f.situacao]||'gray'}>{SITUACAO_LABEL[f.situacao]||f.situacao}</Badge></TD>
              <TD>
                <Btn size="sm" variant="secondary" onClick={() => { setSelected(f); setDetailOpen(true); }}>Ver</Btn>
              </TD>
            </TR>
          ))}
        </Table>
      </Card>

      {/* DETALHE */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`👨‍👩‍👧 ${selected?.responsavel || ''} — ${selected?.codigo || ''}`} width={600}>
        {selected && <>
          <SectionTitle>Dados da Família</SectionTitle>
          {[['Código',selected.codigo],['CPF',selected.cpf],['NIS',selected.nis||'—'],['Telefone',selected.telefone||'—'],['E-mail',selected.email||'—'],['Endereço',`${selected.endereco}, ${selected.bairro}`],['CEP',selected.cep||'—'],['Zona',selected.zona||'—'],['Membros',selected.membros],['Renda mensal',`R$ ${Number(selected.renda).toLocaleString('pt-BR')}`],['Setor',selected.setor],['Cadastrado em',selected.createdAt]].map(([l,v]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'0.5px solid rgba(0,0,0,0.06)', fontSize:'13px' }}>
              <span style={{ color:'#9ca3af' }}>{l}</span><span style={{ fontWeight:500 }}>{v}</span>
            </div>
          ))}
          {selected.vulnerabilidades && <>
            <SectionTitle>Vulnerabilidades</SectionTitle>
            <p style={{ fontSize:'13px', color:'#374151', lineHeight:1.6 }}>{selected.vulnerabilidades}</p>
          </>}
          <SectionTitle>Benefícios</SectionTitle>
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
            {(selected.beneficios||[]).length === 0
              ? <Badge color="gray">Nenhum benefício cadastrado</Badge>
              : (selected.beneficios||[]).map(b => <Badge key={b} color="green">{b}</Badge>)
            }
          </div>
          <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'20px' }}>
            <Btn variant="secondary" onClick={() => setDetailOpen(false)}>Fechar</Btn>
            <Btn variant="ghost" onClick={() => openEdit(selected)}>✏️ Editar</Btn>
            <Btn variant="danger" size="sm" onClick={() => setDeleteConfirm(selected.id)}>Desativar</Btn>
          </div>
        </>}
      </Modal>

      {/* FORM MODAL */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '✏️ Editar Família' : '👨‍👩‍👧 Cadastrar Nova Família'} width={640}>
        <SectionTitle>Responsável Familiar</SectionTitle>
        <FormRow cols={2}>
          <Field label="Nome completo" required><Input value={form.responsavel} onChange={v => set('responsavel',v)} placeholder="Nome do responsável" /></Field>
          <Field label="CPF" required><Input value={form.cpf} onChange={v => set('cpf',v)} placeholder="000.000.000-00" /></Field>
        </FormRow>
        <FormRow cols={3}>
          <Field label="NIS"><Input value={form.nis} onChange={v => set('nis',v)} placeholder="CadÚnico" /></Field>
          <Field label="Telefone"><Input value={form.telefone} onChange={v => set('telefone',v)} placeholder="(44) 99999-9999" /></Field>
          <Field label="E-mail"><Input value={form.email} onChange={v => set('email',v)} type="email" /></Field>
        </FormRow>
        <SectionTitle>Endereço</SectionTitle>
        <FormRow cols={2}>
          <Field label="Logradouro"><Input value={form.endereco} onChange={v => set('endereco',v)} placeholder="Rua, Avenida..." /></Field>
          <Field label="Bairro"><Input value={form.bairro} onChange={v => set('bairro',v)} /></Field>
        </FormRow>
        <FormRow cols={3}>
          <Field label="CEP"><Input value={form.cep} onChange={v => set('cep',v)} /></Field>
          <Field label="Zona">
            <Select value={form.zona} onChange={v => set('zona',v)}>
              <option>Urbana</option><option>Rural</option>
            </Select>
          </Field>
          <Field label="Setor">
            <Select value={form.setor} onChange={v => set('setor',v)} disabled={currentUser.setor !== 'GESTAO' && currentUser.role !== 'admin'}>
              {acessoSetores.filter(s=>s!=='GESTAO').map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
        </FormRow>
        <SectionTitle>Composição e Renda</SectionTitle>
        <FormRow cols={3}>
          <Field label="Nº de membros"><Input type="number" value={form.membros} onChange={v => set('membros',v)} /></Field>
          <Field label="Renda familiar (R$)"><Input type="number" value={form.renda} onChange={v => set('renda',v)} /></Field>
          <Field label="Situação">
            <Select value={form.situacao} onChange={v => set('situacao',v)}>
              <option value="ativo">Ativo</option>
              <option value="desatualizado">Desatualizado</option>
              <option value="analise">Em análise</option>
              <option value="acompanhamento">Acompanhamento</option>
            </Select>
          </Field>
        </FormRow>
        <FormRow cols={1}>
          <Field label="Benefícios (separados por vírgula)">
            <Input value={(form.beneficios||[]).join(', ')} onChange={v => set('beneficios', v.split(',').map(x=>x.trim()).filter(Boolean))} placeholder="Bolsa Família, BPC, Cesta Básica..." />
          </Field>
        </FormRow>
        <FormRow cols={1}>
          <Field label="Vulnerabilidades identificadas">
            <Textarea value={form.vulnerabilidades} onChange={v => set('vulnerabilidades',v)} placeholder="Descreva situações de vulnerabilidade, riscos..." rows={3} />
          </Field>
        </FormRow>
        <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'16px' }}>
          <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Btn>
          <Btn onClick={handleSave}>{editing ? 'Salvar alterações' : 'Cadastrar Família'}</Btn>
        </div>
      </Modal>

      <Confirm open={!!deleteConfirm} message="Deseja desativar esta família? Os dados serão mantidos mas ela não aparecerá mais nas listagens ativas." onConfirm={handleDelete} onCancel={() => setDeleteConfirm(null)} />
    </div>
  );
}
