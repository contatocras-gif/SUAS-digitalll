import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Senhas padrão (em produção real use hash bcrypt no backend)
const DEFAULT_USERS = [
  { id: 1, name: 'Administrador', login: 'admin', password: 'admin123', role: 'admin', setor: 'GESTAO', active: true, createdAt: '2026-01-01' },
  { id: 2, name: 'Técnica CRAS', login: 'cras.tecnica', password: 'cras123', role: 'tecnico', setor: 'CRAS', active: true, createdAt: '2026-01-01' },
  { id: 3, name: 'Assistente CREAS', login: 'creas.as', password: 'creas123', role: 'tecnico', setor: 'CREAS', active: true, createdAt: '2026-01-01' },
  { id: 4, name: 'Educador SCFV', login: 'scfv.edu', password: 'scfv123', role: 'tecnico', setor: 'SCFV', active: true, createdAt: '2026-01-01' },
  { id: 5, name: 'Gestora Municipal', login: 'gestora', password: 'gestao123', role: 'gestor', setor: 'GESTAO', active: true, createdAt: '2026-01-01' },
];

export const SETORES = ['CRAS', 'CREAS', 'SCFV', 'GESTAO'];
export const ROLES = ['admin', 'gestor', 'tecnico', 'visualizador'];

export const SETOR_CONFIG = {
  CRAS:   { label: 'CRAS',   fullName: 'Centro de Referência de Assistência Social',      color: '#1a5276', bg: '#1a5276', badge: 'badge-blue'   },
  CREAS:  { label: 'CREAS',  fullName: 'Centro de Referência Especializado',               color: '#145a32', bg: '#145a32', badge: 'badge-green'  },
  SCFV:   { label: 'SCFV',   fullName: 'Serviço de Convivência e Fortalecimento de Vínculos', color: '#512e5f', bg: '#5b21b6', badge: 'badge-purple' },
  GESTAO: { label: 'GESTÃO', fullName: 'Gestão Central — Secretaria de Assistência Social', color: '#7d6608', bg: '#1a5276', badge: 'badge-orange' },
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem('suas_users');
    return stored ? JSON.parse(stored) : DEFAULT_USERS;
  });

  useEffect(() => {
    localStorage.setItem('suas_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    const session = localStorage.getItem('suas_session');
    if (session) {
      const u = JSON.parse(session);
      const found = users.find(x => x.id === u.id && x.active);
      if (found) setCurrentUser(found);
    }
  }, []);

  function login(loginStr, password) {
    const user = users.find(u => u.login === loginStr && u.password === password && u.active);
    if (!user) return { ok: false, msg: 'Usuário ou senha inválidos.' };
    setCurrentUser(user);
    localStorage.setItem('suas_session', JSON.stringify(user));
    return { ok: true };
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem('suas_session');
  }

  function addUser(data) {
    const exists = users.find(u => u.login === data.login);
    if (exists) return { ok: false, msg: 'Login já cadastrado.' };
    const newUser = { ...data, id: Date.now(), active: true, createdAt: new Date().toISOString().split('T')[0] };
    setUsers(prev => [...prev, newUser]);
    return { ok: true };
  }

  function updateUser(id, data) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  }

  function deleteUser(id) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: false } : u));
  }

  function resetPassword(id, newPass) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, password: newPass } : u));
  }

  // Verifica se o usuário tem acesso a um determinado setor
  // Regra: CREAS só é visível para usuários do próprio setor CREAS ou admin
  function canAccessSetor(setor) {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (setor === 'CREAS') return currentUser.setor === 'CREAS';
    if (currentUser.setor === 'GESTAO') return true; // GESTAO vê tudo exceto CREAS
    return currentUser.setor === setor;
  }

  function isAdmin() { return currentUser?.role === 'admin'; }
  function isGestao() { return currentUser?.setor === 'GESTAO' || currentUser?.role === 'admin'; }

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, addUser, updateUser, deleteUser, resetPassword, canAccessSetor, isAdmin, isGestao }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
