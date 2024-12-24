import {create} from "zustand"
import {persist} from "zustand/middleware";
import produce from 'immer';
import {get as fetch, create as insert, remove, update} from '@/lib/actions/accessory.actions';

interface IAccessoryStore {
    accessories: Accessory[];
    loading: boolean;
    create: (asset: Accessory) => void;
    update: (id: string, data: Accessory) => void;
    delete: (id: string) => Promise<void>;
    findById: (id: string) => Accessory | null;
    getAll: () => void;
}


export const useAccessoryStore = create(persist<IAccessoryStore>(
    (set, get) => ({
        accessories: [],
        loading: false,
        getAll: async () => {
            set({loading: true});
            fetch().then(accessories => {
                set({accessories: accessories});
            }).catch(error => {
                set({accessories: [], loading: false});
                console.error("Error fetching assets:", error);
                set({loading: false});
            });
        },
        create: async (accessory: Accessory) => {
            try {
                // await insert(accessory);
                set(
                    produce((state) => {
                        state.accessories.push(accessory);
                    })
                );
                return accessory;
            } catch (error) {
                console.error("Error creating asset:", error);
                throw error;
            }
        },
        update: (id: string, data: Accessory) => {
            set(
                produce((state) => {

                    update(data, id).then(() => {
                        const index = state.accessories.findIndex((accessory: Accessory) => accessory.id === id);
                        if (index !== -1) {
                            state.accessories[index] = data;
                        }
                    }).catch(error => console.log(error))
                })
            );
        },
        delete: async (id: string) => {
            try {
                await remove(id);
                set(produce((state) => {
                    state.accessories = state.accessories.filter((a: Asset) => a.id !== id);
                }));
            } catch (error) {
                console.error(error);
            }
        },
        findById: (id: string) => {

            const accessory = get().accessories.find((accessory: Accessory) => accessory.id === id);
            if (!accessory) return null

            return accessory;
        },

    }), {name: 'accessory_store',}));
