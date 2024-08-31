import {create} from "zustand"
import {persist} from "zustand/middleware";
import produce from 'immer';
import {getAll, insert, update, remove} from '@/lib/actions/user.actions';

interface IUserStore {
    users: User[];
    loading: boolean;
    create: (user: User) => void;
    update: (id: string, updatedUser: User) => void;
    findById: (id: string) => User | null;
    delete: (id: string) => void;
    getAll: () => void;
}


export const useUserStore = create(persist<IUserStore>(
    (set, get) => ({
        users: [],
        loading: false,

        getAll: async () => {
            set({loading: true});
            getAll().then(users => {
                set({users});
            }).catch(error => {
                set({users: [], loading: false});
                console.error("Error fetching users:", error);
                set({loading: false});
            });
        },
        create: async (data: User) => {
            try {
                await insert(data).then(_ =>{
                    set(
                        produce((state) => {
                            state.users.push(data);
                        })
                    );
                })
            } catch (error) {
                console.error("Error creating user:", error);
                throw error;
            }
        },
        update: (id: string, updatedUser: User) => {
            set(
                produce((state) => {

                    update(updatedUser, id).then(() => {
                        const index = state.users.findIndex((user: User) => user.id === id);
                        if (index !== -1) {
                            state.users[index] = updatedUser;
                        }
                    }).catch(error => console.error(error))
                })
            );
        },
        delete: (id: string) => {
            set(
                produce((state) => {
                    remove(id).then(() => {
                            state.users = state.users.filter((a: User) => a.id !== id)
                        }
                    ).catch(error => console.error(error))

                })
            );
        },
        findById: (id: string) => {
            const user = get().users.find((user) => user.id === id);
            if (!user) return null
            return user;
        },

    }), {name: 'user_store',}));
