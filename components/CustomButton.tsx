import React from 'react'
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {cn} from "@/lib/utils";
import Image from "next/image";
import {ChevronRightIcon} from "@radix-ui/react-icons"
import {IconType} from 'react-icons';


interface CustomButtonProps {
    size?: "sm" | "lg" | "default" | "icon" | null | undefined
    variant?: "link" | "default" | "outline" | "ghost" | "destructive" | "secondary" | null | undefined
    action?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
    value: string
    Icon: IconType;
    className?: string
    disabled?: boolean

}

const CustomButton = ({size = 'sm', variant, action, value, Icon, className, disabled}: CustomButtonProps) => {
    return (
        <div>
            <Button variant={variant} size={size} onClick={action}
                    disabled={disabled}
                    className={cn("flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 ", className)}>
                <Icon className="w-4 h-4 mr-2"/>
                <span>{value}</span>
            </Button>
        </div>
    )
}
export default CustomButton
