import {create} from "zustand"
import {persist} from "zustand/middleware";
import produce from 'immer';
import {createCategory, getCategories, remove} from '@/lib/actions/category.actions';

interface ICategoryStore {
    categories: Category[];
    loading: boolean;
    create: (category: Category) => void;
    delete: (id: number) => void;
    getAll: () => void;
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
        create: async (category: Category) => {
            try {
                await createCategory(category);
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
        delete: (id: number) => {
            set(
                produce((state) => {

                    remove(id).then(() => {
                            state.assets = state.assets.filter((a: Asset) => a.id !== id)
                        }
                    ).catch(error => console.log(error))

                })
            );
        },

    }), {name: 'category_store',}));
