
import { Link, useLocation } from "react-router-dom";
import {
  PlusCircle,
  Clock,
  Users,
  Image,
  Settings,
  History,
  CalendarDays,
  SettingsIcon
} from "lucide-react";

const navItems = [
  {
    label: "Create",
    icon: PlusCircle,
    href: "/create"
  },
  {
    label: "Campaign",
    icon: Clock,
    href: "/dashboard"
  },
  // {
  //   label: "Past Campaigns",
  //   icon: History,
  //   href: "/dashboard/past"
  // },
  {
    label: "Reservations",
    icon: CalendarDays,
    href: "/reservations"
  }
  // ,
  // {
  //   label: "Media Library",
  //   icon: Image,
  //   href: "/media-library"
  // }
];
const settingItem = [
  {
    label: "Setting",
    icon: SettingsIcon,
    href: "/setting"
  }
]

const Separator = () => {
  return (
    <div data-svg-wrapper className="relative">
      <svg className="w-full" height="2" viewBox="0 0 307 2" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect className="w-full" height="1.5" fill="#D1D1D1" />
      </svg>
    </div>
  )

}

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-full h-full p-8 flex-col justify-center items-start gap-6 inline-flex">
      <div className="w-full h-full p-8 rounded-3xl bg-[#f4f3eb] self-stretch grow shrink basis-0 flex-col justify-between items-start flex">
        <div className="self-stretch h-48 flex-col justify-start items-start gap-6 flex">
          <div className="grow shrink basis-0 h-7 justify-start items-center gap-2.5 flex">
            <img className="w-12 h-12 rounded-full" src="../../public/SUMAC_logo.png" />
            <div className="text-center text-[#121212] text-lg font-normal leading-none">SUMAC SF</div>
          </div>
          <Separator />
          <nav className="space-y-1 flex-1 w-full">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 py-3 px-6 rounded-3xl text-md font-medium transition-colors ${location.pathname === item.href
                  ? "bg-[#CFB232] text-accent-foreground"
                  : "hover:bg-[#CFB232]/10 text-gray-700"
                  }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="self-stretch w-full h-20 flex-col justify-start items-start gap-6 flex">
          <Separator />
          <nav className="space-y-1 flex-1 w-full">
            {settingItem.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 py-3 px-6 rounded-3xl text-md font-medium transition-colors ${location.pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/10 text-gray-700"
                  }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
