import { Instagram, Twitter, Facebook, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const links = [
    {
      title: "Navigation",
      items: [
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        { name: "About", path: "/about" },
      ],
    },
    {
      title: "Discover",
      items: [
        { name: "Dried Flower", path: "/shop?category=Dried Flower" },
        { name: "Edibles", path: "/shop?category=Edible" },
        { name: "Vapes", path: "/shop?category=Vape" },
        { name: "Pre-Rolls", path: "/shop?category=Pre-Roll" },
      ],
    },
    {
      title: "Community",
      items: [
        { name: "Reviews", path: "/#reviews" },
        { name: "Our Story", path: "/about" },
      ],
    },
  ];

  return (
    <footer className="bg-brand-green text-brand-earth pt-12 md:pt-24 pb-8 md:pb-12 px-4 shadow-[0_-20px_50px_-10px_rgba(30,77,43,0.3)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-12 mb-10 md:mb-24">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-4 self-start">
            <div className="mb-6 h-14 flex items-center">
              <img
                src="/images/buds_n_buddies_logo.png"
                alt="Bud n' Buddies"
                className="h-full w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-brand-earth/40 text-sm mb-6 max-w-xs">
              Sherwood Park's favourite dispensary. Open every day until 2 AM.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <div
                  key={i}
                  className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-white/10 rounded-full hover:bg-white hover:text-brand-green transition-colors cursor-pointer"
                >
                  <Icon size={17} />
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="sm:col-span-2 lg:col-span-5 grid grid-cols-3 gap-4 sm:gap-8">
            {links.map((group, i) => (
              <div key={i}>
                <h4 className="text-white/40 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-4 sm:mb-6">
                  {group.title}
                </h4>
                <ul className="space-y-3 font-bold text-xs sm:text-sm uppercase tracking-wide">
                  {group.items.map((item, j) => (
                    <li key={j}>
                      <Link
                        to={item.path}
                        className="hover:translate-x-1 hover:text-white transition-all inline-block"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Community box */}
          <div className="sm:col-span-2 lg:col-span-3 bg-white/5 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] flex flex-col items-center text-center">
            <div className="flex gap-1 mb-3">
              {[1,2,3,4,5].map((s) => <span key={s} className="text-brand-light-green text-xs">★</span>)}
              <span className="text-[10px] ml-2 font-bold opacity-40 uppercase">Top Rated</span>
            </div>
            <h4 className="text-lg sm:text-xl font-black uppercase tracking-tighter mb-3">
              Loved by the community
            </h4>
            <p className="text-xs sm:text-sm opacity-50 mb-6">
              Praised for pure potency and consistent quality — the go-to for enthusiasts everywhere.
            </p>
            <div className="flex items-center justify-center text-brand-light-green/30">
              <Leaf size={48} />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 text-[9px] font-black uppercase tracking-[0.25em]">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-center md:text-left">
            <p>©2026 Bud n' Buddies Cannabis. All Rights Reserved.</p>
            <p className="text-white/60">Designed & Developed by Nishant Bihola x Aura Labs</p>
          </div>
          <div className="flex gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
