'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  DashboardIcon,
  ProgramIcon,
  PerformanceIcon,
  AthletesIcon,
  RelationsIcon,
  SettingsIcon,
  LogoutIcon,
} from './icons';
import styles from './Sidebar.module.css';

const menuItems = [
  { label: 'Tableau de Bord', path: '/dashboard', icon: DashboardIcon },
  { label: 'Programmes', path: '/dashboard/programmes', icon: ProgramIcon },
  { label: 'Indicateurs de Performance', path: '/dashboard/performance', icon: PerformanceIcon },
  { label: 'Athlètes', path: '/dashboard/athletes', icon: AthletesIcon },
  { label: 'Relations', path: '/dashboard/relations', icon: RelationsIcon },
];

const bottomMenuItems = [
  { label: 'Paramètres', path: '/dashboard/settings', icon: SettingsIcon },
  { label: 'Déconnexion', path: '/auth/signout', icon: LogoutIcon },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <Image
          src="/img/Logotuathavide.png"
          alt="Tuatha Logo"
          width={240}
          height={80}
          priority
          style={{ objectFit: 'contain' }}
        />
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
          >
            <span className={styles.icon}>
              <item.icon />
            </span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        ))}
      </nav>

      <nav className={styles.bottomNav}>
        {bottomMenuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
          >
            <span className={styles.icon}>
              <item.icon />
            </span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
