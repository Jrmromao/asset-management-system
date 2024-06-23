'use client'
import React, { useState } from 'react';
import AuthForm from "@/components/forms/AuthForm";
import AssetForm from "@/components/forms/AssetForm";

// import library components or create your custom styles

function SideDrawer() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDrawer = () => setIsOpen(!isOpen);

    return (
        <>
            <button onClick={toggleDrawer}>Open Drawer</button>
            <div className={`sidedrawer ${isOpen ? 'open' : ''}`}>
                <AssetForm/>
            </div>
            {isOpen && <div className="overlay" onClick={toggleDrawer} />}
        </>
    );
}

export default SideDrawer;
