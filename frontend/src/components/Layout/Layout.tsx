import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import AppHeader from '../Shared/AppHeader';

export default function Layout() {
 const { menu } = useAuth();

 return (
  <div className="min-h-screen flex flex-col bg-white">
   <AppHeader variant="funcionario" notificationPath="/notificaciones" />
   <div className="flex flex-1">
    <Sidebar menu={menu} />
    <main className="flex-1 p-6 bg-white overflow-y-auto">
     <Outlet />
    </main>
   </div>
  </div>
 );
}
