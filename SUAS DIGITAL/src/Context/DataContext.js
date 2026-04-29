import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);

const INITIAL_FAMILIAS = [
  { id: 1, codigo: 'F-0421', responsavel: 'Maria da Silva Santos', cpf: '***456.789-**', nis: '12345678901', membros: 4, renda: 780, setor: 'CRAS', endereco: 'Rua das Flores, 123', bairro: 'Bairro Norte', cep: '87000-000', situacao: 'ativo', telefone: '(44) 99111-2222', email: '', vulnerabilidades: 'Família monoparental, baixa renda', beneficios: ['Bolsa Família', 'BPC'], createdAt: '2026-01-15' },
  { id: 2, codigo: 'F-0420', responsavel: 'José Oliveira da Costa', cpf: '***123.456-**', nis: '23456789012', membros: 6, renda: 1200, setor: 'CRAS', endereco: 'Av. Central, 456', bairro: 'Bairro Sul', cep: '87001-000', situacao: 'ativo', telefone: '(44) 99222-3333', email: '', vulnerabilidades: 'Renda baixa, filho com deficiência', beneficios: ['Bolsa Família'], createdAt: '2026-02-10' },
  { id: 3, codigo: 'F-0419', responsavel: 'Ana Paula Ferreira', cpf: '***789.012-**', nis: '34567890123', membros: 2, renda: 0, setor: 'CRAS', endereco: 'Rua Ipê, 78', bairro: 'Centro', cep: '87002-000', situacao: 'desatualizado', telefone: '(44) 99333-4444', email: '', vulnerabilidades: 'Idosa, sem renda', beneficios: ['BPC'], createdAt: '2025-11-20' },
  { id: 4, codigo: 'F-0418', responsavel: 'Carla Rodrigues', cpf: '***456.012-**', nis: '', membros: 5, renda: 950, setor: 'CRAS', endereco: 'Rua Nova, 321', bairro: 'Jardim Novo', cep: '87003-000', situacao: 'analise', telefone: '(44) 99444-5555', email: '', vulnerabilidades: 'Situação habitacional precária', beneficios: [], createdAt: '2026-04-01' },
  // CREAS - isolado
  { id: 5, codigo: 'C-0101', responsavel: 'Pedro Henrique Alves', cpf: '***321.654-**', nis: '45678901234', membros: 3, renda: 600, setor: 'CREAS', endereco: 'Rua das Pedras, 55', bairro: 'Vila Operária', cep: '87004-000', situacao: 'acompanhamento', telefone: '(44) 99555-6666', email: '', vulnerabilidades: 'Medida socioeducativa, violência doméstica', beneficios: [], createdAt: '2026-03-05' },
];

const INITIAL_INDIVIDUOS = [
  { id: 1, nome: 'Maria da Silva Santos', cpf: '***456.789-**', nis: '12345678901', dataNasc: '1980-03-15', sexo: 'Feminino', familia: 'F-0421', familiaId: 1, perfil: 'adulto', setor: 'CRAS', situacao: 'ativo' },
  { id: 2, nome: 'Pedro Santos Filho', cpf: '***111.222-**', nis: '', dataNasc: '2010-06-10', sexo: 'Masculino', familia: 'F-0421', familiaId: 1, perfil: 'criança', setor: 'CRAS', situacao: 'ativo' },
  { id: 3, nome: 'José Oliveira da Costa', cpf: '***123.456-**', nis: '23456789012', dataNasc: '1975-11-22', sexo: 'Masculino', familia: 'F-0420', familiaId: 2, perfil: 'adulto', setor: 'CREAS', situacao: 'acompanhamento' },
];

const INITIAL_ATENDIMENTOS = [
  { id: 1, prontuario: 'A-2847', cidadao: 'Maria da Silva Santos', familiaId: 1, tipo: 'Orientação social', setor: 'CRAS', data: '2026-04-27', hora: '09:00', profissional: 'Ana Souza', status: 'concluido', prioridade: 'normal', descricao: 'Cidadã compareceu para atualização do CadÚnico e informações sobre Bolsa Família.', encaminhamentos: 'Atualização CadÚnico agendada para 30/04.' },
  { id: 2, prontuario: 'A-2846', cidadao: 'José Oliveira da Costa', familiaId: 2, tipo: 'Acompanhamento PSE', setor: 'CREAS', data: '2026-04-27', hora: '11:30', profissional: 'Carlos Lima', status: 'andamento', prioridade: 'alta', descricao: 'Acompanhamento de caso de violência doméstica.', encaminhamentos: 'Encaminhado para delegacia.' },
  { id: 3, prontuario: 'A-2845', cidadao: 'Ana Paula Ferreira', familiaId: 3, tipo: 'Grupo de convivência', setor: 'SCFV', data: '2026-04-26', hora: '14:00', profissional: 'Paula Melo', status: 'concluido', prioridade: 'normal', descricao: 'Participação no grupo de idosos.', encaminhamentos: '' },
  { id: 4, prontuario: 'A-2844', cidadao: 'Família Rodrigues', familiaId: 4, tipo: 'Visita domiciliar', setor: 'CRAS', data: '2026-04-25', hora: '10:00', profissional: 'Ana Souza', status: 'concluido', prioridade: 'normal', descricao: 'Visita de verificação da situação habitacional.', encaminhamentos: 'Situação habitacional preocupante. Encaminhado para habitação.' },
];

const INITIAL_PROJETOS = [
  { id: 1, nome: 'Fortalecimento de Vínculos Familiares', setor: 'CRAS', publicoAlvo: 'Famílias', inicio: '2026-01-01', fim: '2026-12-31', orcamento: 15000, beneficiarios: 124, tecnicos: 3, progresso: 78, status: 'ativo', descricao: 'Atendimento a famílias em situação de vulnerabilidade social.', responsavel: 'Ana Souza' },
  { id: 2, nome: 'Idosos em Ação', setor: 'SCFV', publicoAlvo: 'Idosos (60+)', inicio: '2026-03-01', fim: '2026-11-30', orcamento: 8500, beneficiarios: 87, tecnicos: 2, progresso: 62, status: 'ativo', descricao: 'Serviço de convivência para idosos acima de 60 anos.', responsavel: 'Paula Melo' },
  { id: 3, nome: 'Juventude Conectada', setor: 'SCFV', publicoAlvo: 'Adolescentes (13-17)', inicio: '2026-04-01', fim: '2026-12-31', orcamento: 12000, beneficiarios: 56, tecnicos: 2, progresso: 45, status: 'ativo', descricao: 'Oficinas de tecnologia e protagonismo juvenil.', responsavel: 'Paula Melo' },
  { id: 4, nome: 'Centro de Referência à Mulher', setor: 'CREAS', publicoAlvo: 'Mulheres', inicio: '2026-01-01', fim: '2026-12-31', orcamento: 22000, beneficiarios: 43, tecnicos: 4, progresso: 90, status: 'ativo', descricao: 'Proteção e atendimento a mulheres em situação de violência.', responsavel: 'Carlos Lima' },
];

const INITIAL_BENEFICIOS = [
  { id: 1, beneficiario: 'Maria da Silva Santos', cpf: '***456-**', familiaId: 1, tipo: 'Bolsa Família', valor: 412, inicio: '2024-01', renovacao: '2027-01', status: 'ativo', setor: 'CRAS', obs: '' },
  { id: 2, beneficiario: 'João Almeida', cpf: '***789-**', familiaId: null, tipo: 'BPC - Idoso', valor: 1412, inicio: '2025-03', renovacao: 'Vitalício', status: 'ativo', setor: 'CRAS', obs: '' },
  { id: 3, beneficiario: 'Carla Ferreira', cpf: '***012-**', familiaId: null, tipo: 'Cesta Básica', valor: 0, inicio: '2026-04', renovacao: '2026-05', status: 'renovar', setor: 'CRAS', obs: 'Vence este mês' },
  { id: 4, beneficiario: 'Pedro Costa', cpf: '***345-**', familiaId: null, tipo: 'Benefício Eventual', valor: 300, inicio: '2026-04', renovacao: '', status: 'analise', setor: 'CRAS', obs: '' },
];

const INITIAL_AGENDA = [
  { id: 1, cidadao: 'Maria da Silva Santos', familiaId: 1, data: '2026-04-27', hora: '09:00', tipo: 'Atendimento CRAS', profissional: 'Ana Souza', setor: 'CRAS', status: 'confirmado', obs: '' },
  { id: 2, cidadao: 'José Oliveira da Costa', familiaId: 2, data: '2026-04-28', hora: '08:30', tipo: 'Acompanhamento PSE', profissional: 'Carlos Lima', setor: 'CREAS', status: 'agendado', obs: '' },
  { id: 3, cidadao: 'Ana Paula Ferreira', familiaId: 3, data: '2026-04-27', hora: '14:00', tipo: 'Grupo SCFV', profissional: 'Paula Melo', setor: 'SCFV', status: 'agendado', obs: '' },
  { id: 4, cidadao: 'Família Almeida', familiaId: null, data: '2026-04-29', hora: '09:00', tipo: 'Visita domiciliar', profissional: 'Ana Souza', setor: 'CRAS', status: 'pendente', obs: '' },
];

function useLocalState(key, initial) {
  const [state, setState] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
  return [state, setState];
}

export function DataProvider({ children }) {
  const [familias, setFamilias] = useLocalState('suas_familias', INITIAL_FAMILIAS);
  const [individuos, setIndividuos] = useLocalState('suas_individuos', INITIAL_INDIVIDUOS);
  const [atendimentos, setAtendimentos] = useLocalState('suas_atendimentos', INITIAL_ATENDIMENTOS);
  const [projetos, setProjetos] = useLocalState('suas_projetos', INITIAL_PROJETOS);
  const [beneficios, setBeneficios] = useLocalState('suas_beneficios', INITIAL_BENEFICIOS);
  const [agenda, setAgenda] = useLocalState('suas_agenda', INITIAL_AGENDA);

  // FAMÍLIAS
  function addFamilia(data) {
    const next = { ...data, id: Date.now(), codigo: `F-${String(familias.length + 1).padStart(4,'0')}`, createdAt: new Date().toISOString().split('T')[0] };
    setFamilias(p => [...p, next]); return next;
  }
  function updateFamilia(id, data) { setFamilias(p => p.map(f => f.id === id ? { ...f, ...data } : f)); }
  function deleteFamilia(id) { setFamilias(p => p.map(f => f.id === id ? { ...f, situacao: 'inativo' } : f)); }

  // INDIVÍDUOS
  function addIndividuo(data) {
    const next = { ...data, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] };
    setIndividuos(p => [...p, next]); return next;
  }
  function updateIndividuo(id, data) { setIndividuos(p => p.map(x => x.id === id ? { ...x, ...data } : x)); }

  // ATENDIMENTOS
  function addAtendimento(data) {
    const next = { ...data, id: Date.now(), prontuario: `A-${Date.now().toString().slice(-4)}`, createdAt: new Date().toISOString() };
    setAtendimentos(p => [next, ...p]); return next;
  }
  function updateAtendimento(id, data) { setAtendimentos(p => p.map(x => x.id === id ? { ...x, ...data } : x)); }

  // PROJETOS
  function addProjeto(data) {
    const next = { ...data, id: Date.now(), progresso: 0, createdAt: new Date().toISOString().split('T')[0] };
    setProjetos(p => [...p, next]); return next;
  }
  function updateProjeto(id, data) { setProjetos(p => p.map(x => x.id === id ? { ...x, ...data } : x)); }
  function deleteProjeto(id) { setProjetos(p => p.filter(x => x.id !== id)); }

  // BENEFÍCIOS
  function addBeneficio(data) {
    const next = { ...data, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] };
    setBeneficios(p => [...p, next]); return next;
  }
  function updateBeneficio(id, data) { setBeneficios(p => p.map(x => x.id === id ? { ...x, ...data } : x)); }

  // AGENDA
  function addAgenda(data) {
    const next = { ...data, id: Date.now() };
    setAgenda(p => [...p, next]); return next;
  }
  function updateAgenda(id, data) { setAgenda(p => p.map(x => x.id === id ? { ...x, ...data } : x)); }
  function deleteAgenda(id) { setAgenda(p => p.filter(x => x.id !== id)); }

  return (
    <DataContext.Provider value={{
      familias, addFamilia, updateFamilia, deleteFamilia,
      individuos, addIndividuo, updateIndividuo,
      atendimentos, addAtendimento, updateAtendimento,
      projetos, addProjeto, updateProjeto, deleteProjeto,
      beneficios, addBeneficio, updateBeneficio,
      agenda, addAgenda, updateAgenda, deleteAgenda,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() { return useContext(DataContext); }
