import React from "react";
import ConnectWallet from "../ConnectWallet/ConnectWallet";
//import '../../../public/assets/css/tailwind.css';

const DashboardTopBar = ({ title }) => {
    //const classes = useStyles();
    return (
        <nav
            className="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl"
            id="navbarBlur"
            navbar-scroll="true">
            <div className="topbar container-fluid py-1 px-0">
                <nav aria-label="breadcrumb">
                    <div className="tw-flex tw-flex-row tw-justify-center tw-items-center tw-gap-2">
                        <img
                            className="w-100 tw-max-h-[40px] tw-max-w-[30px]"
                            src="../assets/img/casino_icon_with_black_background_3.png"
                            alt="logo"
                        />
                        <div className="font-weight-bolder mb-0 gradient-orange-text tw-max-w-[80%]"><span>{ title }</span></div>
                    </div>
                </nav>
                <div
                    className="collapse navbar-collapse mt-sm-0 mt-2 me-md-0 me-sm-4"
                    id="navbar">
                    <div className="ms-md-auto pe-md-3 d-flex align-items-center">
                    </div>
                    <ul className="navbar-nav  justify-content-end">
                        <li className="nav-item d-flex align-items-center">
                            <ConnectWallet />                        
                        </li>
                        <li className="nav-item d-xl-none ps-3 d-flex align-items-center">
                            <a
                                href="javascript:;"
                                className="nav-link text-body p-0"
                                id="iconNavbarSidenav">
                                <div className="sidenav-toggler-inner" onClick={() => {
                                    if(window && window.toggleSidenav) {
                                        window.toggleSidenav()
                                    }
                                }}>
                                    <i className="sidenav-toggler-line" />
                                    <i className="sidenav-toggler-line" />
                                    <i className="sidenav-toggler-line" />
                                </div>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default DashboardTopBar;
