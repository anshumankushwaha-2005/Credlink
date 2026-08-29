import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';
import MobileNav from './MobileNav.jsx';

export default function Layout({ title, children }) {
  return (
    <div className="flex min-h-screen bg-[#FCFBF9]">
      <Sidebar />
      <div className="flex-1 flex flex-col pb-24 md:pb-0">
        <Navbar title={title} />
        <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
