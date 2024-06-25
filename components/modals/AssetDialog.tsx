import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog"
import AssetForm from "@/components/forms/AssetForm";

interface IProps {
    open: boolean
    onOpenChange: () => void
}

export function AssetModal({open, onOpenChange }: IProps) {

    return (
        <div className={'bg-red-500'}>

        <Dialog open={open} onOpenChange={onOpenChange}>
            {/*<DialogTrigger asChild>*/}
            {/*    <Button variant="outline">Add Asset</Button>*/}
            {/*</DialogTrigger>*/}
            <DialogContent className="sm:max-w-[725px]">
                <DialogHeader>
                    <DialogTitle>Add a new asset</DialogTitle>
                    <DialogDescription>
                        Add a new asset to your account.
                    </DialogDescription>
                </DialogHeader>
                <AssetForm/>
            </DialogContent>
        </Dialog>
        </div>

    )
}
