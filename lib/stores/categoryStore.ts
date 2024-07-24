import {create} from "zustand"
import {persist} from "zustand/middleware";
import produce from 'immer';
import {createCategory, getCategories, remove} from '@/lib/actions/category.actions';

interface ICategoryStore {
    categories: Category[];
    loading: boolean;
    createCategory: (category: Category) => void;
    deleteCategory: (id: number) => void;
    fetchCategories: () => void;
}


export const useCategoryStore = create(persist<ICategoryStore>(
    (set, get) => ({
        categories: [],
        loading: false,

        fetchCategories: async () => {
            set({loading: true});
            getCategories().then(categories => {
                set({categories});
            }).catch(error => {
                set({categories: [], loading: false});
                console.error("Error fetching assets:", error);
                set({loading: false});
            });
        },
        createCategory: async (category: Category) => {
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
        deleteCategory: (id: number) => {
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
