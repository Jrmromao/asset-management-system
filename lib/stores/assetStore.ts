import {create} from "zustand"
import {persist} from "zustand/middleware";


export type Actions = {

}


export const useAssetStore = create<Actions>()(persist(set => ({

    }), {name: "asset_store"})
)