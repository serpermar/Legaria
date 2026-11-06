import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function FuneralHomeLayout() {
    return (
        <div className="min-h-screen flex bg-[#F7F4EF]">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Topbar />
                <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}