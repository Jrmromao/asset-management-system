import {create} from "zustand"
import {persist} from "zustand/middleware";
import produce from 'immer';
import {getAll, insert, update, remove} from '@/lib/actions/license.actions';

interface ILicenseStore {
    licenses: License[];
    loading: boolean;
    create: (asset: License) => void;
    update: (id: number, updatedAsset: License) => void;
    delete: (id: number) => Promise<void>;
    findById: (id: number) => License | null;
    getAll: () => void;
}


export const useLicenseStore = create(persist<ILicenseStore>(
    (set, get) => ({
        licenses: [],
        loading: false,

        getAll: async () => {
            set({loading: true});
            getAll().then(licenses => {
                set({licenses});
            }).catch(error => {
                set({licenses: [], loading: false});
                console.error("Error fetching assets:", error);
                set({loading: false});
            });
        },

        create: async (license: License) => {
            try {

                await insert(license);
                set(
                    produce((state) => {
                        state.licenses.push(license);
                    })
                );
                return license;
            } catch (error) {
                console.error("Error creating asset:", error);
                throw error;
            }
        },

        update: (id: number, updatedLicense: License) => {
            set(
                produce((state) => {

                    update(updatedLicense, id).then(() => {
                        const index = state.assets.findIndex((asset: Asset) => asset.id === id);
                        if (index !== -1) {
                            state.assets[index] = updatedLicense;
                        }
                    }).catch(error => console.log(error))
                })
            );
        },

        findById: (id: number) => {

            const license = get().licenses.find((license) => license.id === id);
            if (!license) return null

            return license;
        },

        delete: async (id: number) => {
                await remove(id).then(_ => {
                    set(produce((state) => {
                        state.licenses = state.licenses?.filter((a: Asset) => a.id !== id);
                    }));
                }).catch(error => {
                    throw error
                });
        },

    }), {name: 'asset_store',}));
