
import { Link, useLocation } from "react-router-dom";
import { 
  PlusCircle,
  Clock,
  Users,
  Image,
  Settings,
  History,
  CalendarDays
} from "lucide-react";

const navItems = [
  {
    label: "Create Campaign",
    icon: PlusCircle,
    href: "/create-campaign"
  },
  {
    label: "Current & Upcoming",
    icon: Clock,
    href: "/dashboard"
  },
  {
    label: "Past Campaigns",
    icon: History,
    href: "/dashboard/past"
  },
  {
    label: "Reservations",
    icon: CalendarDays,
    href: "/reservations"
  },
  {
    label: "Media Library",
    icon: Image,
    href: "/media-library"
  }
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 min-h-screen bg-white border-r border-gray-200 px-3 py-6 flex flex-col">
      <div className="mb-8 px-4">
        <h1 className="text-xl font-bold">Jen's Wok</h1>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/10 text-gray-700"
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-accent/10"
        >
          <Settings size={20} />
          Settings
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
