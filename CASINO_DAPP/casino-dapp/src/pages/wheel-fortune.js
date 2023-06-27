import dynamic from "next/dynamic";
import React from "react";
import WheelLayout from "../components/Wheel";

const DashboardLayout = dynamic(() => import("../components/DashboardLayout"), {
    ssr: false,
});

const DashboardBridgePage = () => {
    return (
        <DashboardLayout
            title={'Wheel of Fortune'}
            component={
                <WheelLayout />
            }
        />
    );
};

export default DashboardBridgePage;