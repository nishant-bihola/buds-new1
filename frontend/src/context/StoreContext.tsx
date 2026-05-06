import { createContext, useContext } from "react";
import useSWR from "swr";

export interface StoreInfo {
  name: string;
  address: string;
  addressShort: string;
  phone: string;
  phoneDial: string;
  hours: string;
  hoursShort: string;
  googleMapsUrl: string;
  instagram: string;
  twitter: string;
  facebook: string;
  email: string;
}

const STORE_DEFAULTS: StoreInfo = {
  name: "Bud N' Buddies",
  address: "130-75 Salisbury Way, Sherwood Park, AB T8B 1K4",
  addressShort: "130-75 Salisbury Way, Sherwood Park, AB",
  phone: "(825) 218-8234",
  phoneDial: "+18252188234",
  hours: "Open Every Day · Until 2:00 AM",
  hoursShort: "Open Until 2AM",
  googleMapsUrl: "https://maps.google.com/?q=130-75+Salisbury+Way+Sherwood+Park+AB",
  instagram: "",
  twitter: "",
  facebook: "",
  email: "",
};

const StoreContext = createContext<StoreInfo>(STORE_DEFAULTS);

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { data } = useSWR("/api/store", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  });
  const store: StoreInfo = data?.store ? { ...STORE_DEFAULTS, ...data.store } : STORE_DEFAULTS;
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() { return useContext(StoreContext); }
