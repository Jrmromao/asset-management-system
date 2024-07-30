import {create} from "zustand"
import {persist} from "zustand/middleware";
import produce from 'immer';
import {getAll, insert, findById, update} from '@/lib/actions/user.actions';

interface IUserStore {
    users: User[];
    loading: boolean;
    create: (asset: User) => void;
    update: (id: number, updatedAsset: User) => void;
    findById: (id: string) => User | null;
    getAll: () => void;
}


export const usePeopleStore = create(persist<IUserStore>(
    (set, get) => ({
        users: [],
        loading: false,

        getAll: async () => {
            set({loading: true});
            getAll().then(users => {
                set({users});
            }).catch(error => {
                set({users: [], loading: false});
                console.error("Error fetching assets:", error);
                set({loading: false});
            });
        },



//  model User {
//     id          Int        @id @default(autoincrement())
//     email       String     @unique
//     createdAt   DateTime   @default(now())
//     updatedAt   DateTime   @updatedAt
//     roleId      Int
//     companyId   Int
//     firstName   String
//     lastName    String
//     phoneNumber String     @unique
//     auditLogs   AuditLog[]
//     company     Company    @relation(fields: [companyId], references: [id])
//     role        Role       @relation(fields: [roleId], references: [id])
// }


create: async (user: User) => {
            try {
                await insert({
                        roleId: 1,
                        companyId:1,
                        email: 'Joao@email',
                        firstName:'Kpsp',
                        lastName: 'Romao',
                        phoneNumber: '123456789',
                    }
                );
                set(
                    produce((state) => {
                        state.users.push(user);
                    })
                );
                return user;
            } catch (error) {
                console.error("Error creating asset:", error);
                throw error;
            }
        },


        update: (id: number, updatedUser: User) => {
            set(
                produce((state) => {

                    update(updatedUser, id).then(() => {
                        const index = state.users.findIndex((asset: Asset) => asset.id === id);
                        if (index !== -1) {
                            state.assets[index] = updatedUser;
                        }
                    }).catch(error => console.log(error))
                })
            );
        },


        findById: (id: string) => {

            const user = get().users.find((user) => user.id === id);
            if (!user) return null

            return user;
        },

    }), {name: 'asset_store',}));
