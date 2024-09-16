import {create} from "zustand"
import {persist} from "zustand/middleware";
import produce from 'immer';
import {getAll, insert, remove} from '@/lib/actions/statusLabel.actions';
import {Actions} from "@/lib/stores/store";

interface IStatusLabelStore {
    statusLabels: StatusLabel[];
    loading: boolean;
    create: (user: StatusLabel) => void;
    // update: (id: string, data: StatusLabel) => void;
    findById: (id: string) => StatusLabel | null;
    delete: (id: string) => void;
    getAll: () => void;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
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
        // update: (id: string, updatedUser: User) => {
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
        delete: (id: string) => {
            set(
                produce((state) => {
                    remove(id).then(() => {
                            state.statusLabels = state.statusLabels.filter((a: User) => a.id !== id)
                        }
                    ).catch(error => console.error(error))

                })
            );
        },
        findById: (id: string) => {
            const statusLabel = get().statusLabels.find((statusLabel) => statusLabel.id === id);
            if (!statusLabel) return null
            return statusLabel;
        },

        isOpen: false,
        onOpen: () => set({isOpen: true}),
        onClose: () => set({isOpen: false}),

    }), {name: 'user_store',}));
