import {create} from "zustand"
import {persist} from "zustand/middleware";
import produce from 'immer';
import {get as fetch} from '@/lib/actions/role.actions';

interface IAssetStore {
    roles: Role[];
    loading: boolean;
    create: (asset: Asset) => void;
    // update: (id: number, role: Role) => void;
    // delete: (id: number) => void;
    // findById: (id: number) => Role | null;
    getAll: () => void;
}

export const useRoleStore = create(persist<IAssetStore>(
    (set, get) => ({
        roles: [],
        loading: false,

        getAll: async () => {
            set({loading: true});


            fetch().then(roles => {
                set({roles});
            }).catch(error => {
                set({roles: [], loading: false});
                console.error("Error fetching assets:", error);
                set({loading: false});
            });
        },

        create: async (asset: Asset) => {
            try {

                set(
                    produce((state) => {
                        state.assets.push(asset);
                    })
                );
                return asset;
            } catch (error) {
                console.error("Error creating asset:", error);
                throw error;
            }
        },

        findById: (id: number) => {
            const role = get().roles.find((asset) => asset.id === id);
            if (!role) return null
            return role;
        },

    }), {name: 'role_store',}));
