/**
 * (c) 2024-2026 Nishant Bihola & Aura Labs. All Rights Reserved.
 * Unauthorized copying or distribution of this file is strictly prohibited.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppWrapper } from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
);
