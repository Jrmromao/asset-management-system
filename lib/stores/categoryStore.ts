import {create} from "zustand"
import {persist} from "zustand/middleware";
import produce from 'immer';
import {insert, getCategories, remove} from '@/lib/actions/category.actions';

interface ICategoryStore {
    categories: Category[];
    loading: boolean;
    createCat: (category: Category) => Promise<Category>;
    delete: (id: string) => void;
    getAll: () => void;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}


export const useCategoryStore = create(persist<ICategoryStore>(
    (set, get) => ({
        categories: [],
        loading: false,

        getAll: async () => {
            set({loading: true});
            getCategories().then(categories => {
                set({categories});
            }).catch(error => {
                set({categories: [], loading: false});
                console.error("Error fetching assets:", error);
                set({loading: false});
            });
        },
        createCat: async (category: Category) => {
            try {

                await insert(category);
                set(
                    produce((state) => {
                        state.assets.push(category);
                    })
                );
                return category;
            } catch (error) {
                console.error("Error creating asset:", error);
                throw error;
            }
        },
        delete: (id: string) => {
            set(
                produce((state) => {

                    remove(id).then(() => {
                            state.assets = state.assets.filter((a: Asset) => a.id !== id)
                        }
                    ).catch(error => console.log(error))

                })
            );
        },
        isOpen: false,
        onOpen: () => set({isOpen: true}),
        onClose: () => {
            console.log("closed")
            set({isOpen: false})
        },

    }), {name: 'category_store',}));
