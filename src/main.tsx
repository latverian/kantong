import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import { db } from './db/db';
import './index.css';
import { requestPersistentStorage } from './lib/backup';
import { ensureSeeded, runAccrual } from './lib/ops';
import { applyTheme } from './lib/theme';

registerSW({ immediate: true });

ensureSeeded()
  .then(async () => {
    applyTheme((await db.settings.get('app'))?.theme); // before the first frame, so the intro matches the theme
    await runAccrual();
  })
  .catch((e) => console.error(e))
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    void requestPersistentStorage();
  });
