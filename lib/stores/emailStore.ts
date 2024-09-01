import create from 'zustand';

interface EmailStore {
    email: string | null;
    setEmail: (email: string) => void;
}

const useEmailStore = create<EmailStore>((set) => ({
    email: null,
    setEmail: (email) => set({ email }),
}));

export default useEmailStore;