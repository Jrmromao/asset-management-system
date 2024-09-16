import {create} from "zustand"
import {persist} from "zustand/middleware";
import produce from 'immer';
import {getAll, insert, update, remove} from '@/lib/actions/license.actions';

interface IKitStore {
    kits: Kit[];
    loading: boolean;
    create: (kit: Kit) => void;
    update: (id: string, updatedKit: Kit) => void;
    delete: (id: string) => Promise<void>;
    findById: (id: string) => Kit | null;
    getAll: () => void;
    isAssetOpen: boolean;
    onAssetOpen: () => void;
    onAssetClose: () => void;
    isAccessoryOpen: boolean;
    onAccessoryOpen: () => void;
    onAccessoryClose: () => void;
    isLicenseOpen: boolean;
    onLicenseOpen: () => void;
    onLicenseClose: () => void;
}


export const useKitStore = create(persist<IKitStore>(
    (set, get) => ({
        kits: [],
        loading: false,

        getAll: async () => {
            set({loading: true});
        },

        create: async (kit: Kit) => {
        },

        update: (id: string, updatedKit: Kit) => {
        },

        findById: (id: string) => {
            return null
        },

        delete: async (id: string) => {
        },

        isLicenseOpen: false,
        onLicenseOpen: () => set({isLicenseOpen: true}),
        onLicenseClose: () => {
            set({isLicenseOpen: false})
        },
        isAssetOpen: false,
        onAssetClose: () => set({isAssetOpen: false}),
        onAssetOpen: () => {


            set({isAssetOpen: true})
        },
        isAccessoryOpen: false,
        onAccessoryOpen: () => set({isAccessoryOpen: true}),
        onAccessoryClose: () => {
            set({isAccessoryOpen: false})
        },


    }), {name: 'kit_store',}));
