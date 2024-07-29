import {create} from "zustand"
import {persist} from "zustand/middleware";
import produce from 'immer';
import {getAll, insert, findById, update} from '@/lib/actions/license.actions';

interface IAssetStore {
    licenses: License[];
    loading: boolean;
    createLicense: (asset: License) => void;
    updateLicense: (id: number, updatedAsset: License) => void;
    // deleteLicense: (id: number) => void;
    getLicenseById: (id: number) => License | null;
    fetchLicenses: () => void;
}


export const useLicenseStore = create(persist<IAssetStore>(
    (set, get) => ({
        licenses: [],
        loading: false,

        fetchLicenses: async () => {
            set({loading: true});
            getAll().then(licenses => {
                set({licenses});
            }).catch(error => {
                set({licenses: [], loading: false});
                console.error("Error fetching assets:", error);
                set({loading: false});
            });
        },

        createLicense: async (license: License) => {
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


        updateLicense: (id: number, updatedLicense: License) => {
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


        getLicenseById: (id: number) => {

            const license = get().licenses.find((license) => license.id === id);
            if (!license) return null

            return license;
        },

    }), {name: 'asset_store',}));
