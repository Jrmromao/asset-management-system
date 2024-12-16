import {create} from "zustand"
import {persist} from "zustand/middleware";
import produce from 'immer';
import {get as fetch, create as insert, remove, update, unassign} from '@/lib/actions/assets.actions';


interface IAssetStore {
    assets: Asset[];
    loading: boolean;
    create: (asset: Asset) => Promise<Asset>;
    update: (id: string, updatedAsset: Asset) => Promise<Asset>;
    delete: (id: string) => Promise<void>;
    findById: (id: string) => Promise<Asset | null>;
    getAll: () => void;
    isAssignOpen: boolean;
    onAssignOpen: () => void;
    onAssignClose: () => void;
    unassign: (assetId: string) => Promise<void>;
    assign: (assetId: string, userId: string) => void;
}


export const useAssetStore = create(persist<IAssetStore>(
    (set, get) => ({
        assets: [],
        loading: false,
        isAssignOpen: false,
        getAll: async () => {
            set({loading: true});
            fetch().then(assets => {
                set({assets: assets.data});
            }).catch(error => {
                set({assets: [], loading: false});
                console.error("Error fetching assets:", error);
                set({loading: false});
            });
        },
        create: async (asset: Asset) => {
            try {
                // await insert(asset);
                // set(
                //     produce((state) => {
                //         state.assets.push(asset);
                //     })
                // );
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
                        updatedAsset.id = id
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
                    return get().assets.find((asset: Asset) => asset.id === id) || null;
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
        onAssignOpen: () => set({isAssignOpen: true}),
        onAssignClose: () => set({isAssignOpen: false}),
        unassign: async (assetId: string) => {
            await unassign(assetId)
        },
        assign: (assetId: string, userId: string) => {
            set(
                produce((state) => {
                    // Find the index of the asset to update
                    const assetIndex = state.assets.findIndex((asset: Asset) => asset.id === assetId);

                    if (assetIndex !== -1) {
                        // Update the assigneeId directly
                        state.assets[assetIndex].assigneeId = userId;
                    } else {
                        console.error("Asset not found!");
                        // Optionally, you can throw an error or handle it in a more user-friendly way
                    }
                })
            );
        },
    }), {name: 'asset_store',}));
