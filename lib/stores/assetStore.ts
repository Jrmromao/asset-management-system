import {create} from "zustand"
import {persist} from "zustand/middleware";
import produce from 'immer';
import {get as fetch, create as insert, remove, update} from '@/lib/actions/assets.actions';


interface IAssetStore {
    assets: Asset[];
    loading: boolean;
    create: (asset: Asset) => void;
    update: (id: string, updatedAsset: Asset) => Promise<Asset>;
    delete: (id: string) => Promise<void>;
    findById: (id: string) => Promise<Asset | null>;
    getAll: () => void;
}


export const useAssetStore = create(persist<IAssetStore>(
    (set, get) => ({
        assets: [],
        loading: false,

        getAll: async () => {
            set({loading: true});
            fetch().then(assets => {
                set({assets});
            }).catch(error => {
                set({assets: [], loading: false});
                console.error("Error fetching assets:", error);
                set({loading: false});
            });
        },

        create: async (asset: Asset) => {
            try {
                await insert(asset);
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

        update: async (id: string, updatedAsset: Asset) => {
            try {
                set(
                    produce((state) => {
                        update(updatedAsset, id).then(() => {
                                state.assets = state.assets.filter((a: Asset) => a.id !== id)
                            }
                        ).catch(error => console.log(error))
                        const index = state.assets.findIndex((asset: Asset) => asset.id === id);
                        if (index !== -1) {
                            state.assets[index] = updatedAsset;
                        }
                    })
                );
                return updatedAsset;
            } catch (error) {
                throw error
            }
        },

        delete: async (id: string) => {
            set(
                produce((state) => {
                    try {
                        remove(id); // 'await' the Promise returned by 'remove'
                        state.assets = state.assets.filter((a: Asset) => a.id !== id);
                    } catch (error) {
                        console.error(error);
                        // Optionally, you can re-throw the error here if you want to handle it at a higher level
                        // throw error;
                    }
                })
            );
        },

        findById: async (id: string) => {
            const existingAsset = get().assets.find(asset => asset.id === id);
            if (existingAsset) return existingAsset;

            if (!get().loading) {
                set({loading: true});
                try {
                    const fetchedAssets = await fetch();
                    set({assets: fetchedAssets, loading: false});

                    return fetchedAssets.find((asset: Asset) => asset.id === id) || null;
                } catch (error) {
                    set({loading: false});
                    console.error("Error fetching assets:", error);
                    return null;
                }
            } else {
                await new Promise(resolve => setTimeout(resolve, 500)); // Wait a bit
                return get().findById(id);
            }
        },

    }), {name: 'asset_store',}));
