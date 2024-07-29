import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog"
import AssetForm from "@/components/forms/asset/AssetForm";
import {Progress} from "@/components/ui/progress";
import FormContainer from "@/components/forms/asset/Container";

interface IProps {
    open: boolean
    onOpenChange: () => void
}

export function AssetDialog({open, onOpenChange }: IProps) {

    return (
        <div className={"asset-dialog"}>
            <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[725px]">

                <Progress value={4} />
                <DialogHeader>
                    <DialogTitle>Add a new asset</DialogTitle>
                    <DialogDescription>
                        Add a new asset to your account.
                    </DialogDescription>
                </DialogHeader>
                <FormContainer/>
            </DialogContent>
        </Dialog>
        </div>

    )
}
