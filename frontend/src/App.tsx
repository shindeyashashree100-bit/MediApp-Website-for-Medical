import { Route, Routes } from 'react-router-dom';
import { AppShell } from '@/layouts/app-shell';
import { appRoutes } from '@/routes/app-routes';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {appRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>
    </Routes>
  );
}
