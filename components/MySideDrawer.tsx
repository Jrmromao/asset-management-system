'use client'
import React, { useState } from 'react';
import RegisterForm from "@/components/forms/RegisterForm";

// import library components or create your custom styles

function SideDrawer() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDrawer = () => setIsOpen(!isOpen);

    return (
        <>
            <button onClick={toggleDrawer}>Open Drawer</button>
            <div className={`sidedrawer ${isOpen ? 'open' : ''}`}>

            </div>
            {isOpen && <div className="overlay" onClick={toggleDrawer} />}
        </>
    );
}

export default SideDrawer;
