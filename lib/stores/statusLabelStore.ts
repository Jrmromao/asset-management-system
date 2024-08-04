import {create} from "zustand"
import {persist} from "zustand/middleware";
import produce from 'immer';
import {getAll, insert, remove} from '@/lib/actions/statusLabel.actions';

interface IStatusLabelStore {
    statusLabels: StatusLabel[];
    loading: boolean;
    create: (user: StatusLabel) => void;
    // update: (id: number, data: StatusLabel) => void;
    findById: (id: number) => StatusLabel | null;
    delete: (id: number) => void;
    getAll: () => void;
}


export const useStatusLabelStore = create(persist<IStatusLabelStore>(
    (set, get) => ({
        statusLabels: [],
        loading: false,

        getAll: async () => {
            set({loading: true});
            getAll().then(result => {
                set({statusLabels: result});
            }).catch(error => {
                set({statusLabels: [], loading: false});
                console.error("Error fetching users:", error);
                set({loading: false});
            });
        },
        create: async (data: StatusLabel) => {
            try {
                await insert(data).then(_ =>{
                    set(
                        produce((state) => {
                            state.statusLabels.push(data);
                        })
                    );
                })
            } catch (error) {
                console.error("Error creating user:", error);
                throw error;
            }
        },
        // update: (id: number, updatedUser: User) => {
        //     set(
        //         produce((state) => {
        //
        //             update(updatedUser, id).then(() => {
        //                 const index = state.users.findIndex((user: User) => user.id === id);
        //                 if (index !== -1) {
        //                     state.users[index] = updatedUser;
        //                 }
        //             }).catch(error => console.error(error))
        //         })
        //     );
        // },
        delete: (id: number) => {
            set(
                produce((state) => {
                    remove(id).then(() => {
                            state.statusLabels = state.statusLabels.filter((a: User) => a.id !== id)
                        }
                    ).catch(error => console.error(error))

                })
            );
        },
        findById: (id: number) => {
            const statusLabel = get().statusLabels.find((statusLabel) => statusLabel.id === id);
            if (!statusLabel) return null
            return statusLabel;
        },

    }), {name: 'user_store',}));
