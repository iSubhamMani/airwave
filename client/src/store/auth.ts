import { create } from "zustand";

interface AuthStore {
  emailSent: boolean;
  setEmailSent: (value: boolean) => void;
}

export const useAuth = create<AuthStore>((set) => ({
  emailSent: false,
  setEmailSent: (value: boolean) => set({ emailSent: value }),
}));
