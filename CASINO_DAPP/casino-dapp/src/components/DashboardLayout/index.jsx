import React, { /*useState, */ useEffect } from "react";
import Head from 'next/head';
import DashboardSidebar from "./sidebar";
import DashboardTopBar from "./topbar";

const Index = ({ /*isMobile,*/ title, component }) => {
    
    useEffect(() => {
        setTimeout(() => {
            if(typeof window !== 'undefined' && window && window.toggleSidenav) {
                window.toggleSidenav('close');
            }
        }, 1000);
    }, []);

    return (
        <div className='g-sidenav-show  bg-gray-100'>
            <Head>
                <link id="pagestyle" href="/assets/css/soft-ui-dashboard.css?v=1.0.7" rel="stylesheet" />
            </Head>
            <div>
                <DashboardSidebar />
                <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                    <DashboardTopBar title={title} />

                    { component }
                </main>
            </div>
        </div>
    );
};

export default Index;
