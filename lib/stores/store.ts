import {create} from "zustand"
import {persist} from "zustand/middleware";


export type Actions = {
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
}


export const useDialogStore = create<Actions>()(persist(set => ({

        isOpen: false,
        onOpen: () => set({isOpen: true}),
        onClose: () => set({isOpen: false}),
    }), {name: "dialog_store"})
)