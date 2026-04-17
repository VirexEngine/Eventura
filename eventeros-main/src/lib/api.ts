/**
 * api.ts — Minimal API client for the json-server backend.
 * Base URL: http://localhost:3001
 */

const BASE = '/api';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'organizer' | 'judge' | 'team';
  avatar?: string;
  teamId?: string;
}

export interface ApiTeam {
  id: string;
  name: string;
  members: {
    id: string;
    name: string;
    role: string;
    email?: string;
    contribution: string;
  }[];
}

// ── Auth ─────────────────────────────────────────────────────────────────────

/** Login: find user by email + password. The role is optional and will be inferred if not provided. */
export async function apiLogin(
  email: string,
  password: string,
  role?: string
): Promise<Omit<ApiUser, 'password'> | null> {
  try {
    const url = role 
      ? `${BASE}/users?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`
      : `${BASE}/users?email=${encodeURIComponent(email)}`;
    
    const res = await fetch(url);
    if (!res.ok) return null;
    const users: ApiUser[] = await res.json();
    const found = users.find(u => u.password === password);
    if (!found) return null;
    const { password: _pw, ...user } = found;
    return user;
  } catch {
    return null;
  }
}

/** Fetch a user by id. */
export async function apiGetUser(id: string): Promise<Omit<ApiUser, 'password'> | null> {
  try {
    const res = await fetch(`${BASE}/users/${id}`);
    if (!res.ok) return null;
    const user: ApiUser = await res.json();
    const { password: _pw, ...safe } = user;
    return safe;
  } catch {
    return null;
  }
}

/** Update a user's profile (name, email). */
export async function apiUpdateUserProfile(
  id: string,
  updates: { name?: string; email?: string }
): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Teams ─────────────────────────────────────────────────────────────────────

/** Fetch a team by id. */
export async function apiGetTeam(id: string): Promise<ApiTeam | null> {
  try {
    const res = await fetch(`${BASE}/teams/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Update a team (e.g. members array). */
export async function apiUpdateTeam(
  id: string,
  updates: Partial<ApiTeam>
): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/teams/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Check if backend is reachable. */
export async function apiPing(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/users?_limit=1`);
    return res.ok;
  } catch {
    return false;
  }
}
