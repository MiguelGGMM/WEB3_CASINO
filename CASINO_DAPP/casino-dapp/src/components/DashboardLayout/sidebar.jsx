import React from "react";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import CommonService from "../../services/CommonService";
import { notify } from "react-notify-toast";
import config from "../../../src/config";
//Images
import siderbarIcon from "@assets/img/sidebar-icon.png";
import siderbarRoulette from "@assets/img/sidebar-roulette.jpg";
import siderbarBlackjack from "@assets/img/sidebar-blackjack.jpg";
import ethLogo from "@assets/img/eth-logo.png";

const DashboardSidebar = ({}) => {
    const router = useRouter();

    const isActive = (path) => {
        return path == router.pathname;
    }

    const [tokenPrice, setTokenPrice] = React.useState(0);
    const loadTokenPrice = async () => {
        CommonService.getETHPrice().then(_tokenPrice => {
            setTokenPrice(_tokenPrice);
        });        
    }

    React.useEffect(() => {
        loadTokenPrice();
    }, []);

    return (
        <aside
            className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start tw-ml-6 bg-white"
            id="sidenav-main"
            data-color="primary">
            <div className="sidenav-header">
                <div
                    className="navbar-brand m-0">
                        <a onClick={() => {
                                router.push(`/`)
                            }} title="Home" alt="Home">
                            <Image className="navbar-brand-img tw-h-3/4 tw-w-3/4" src={siderbarIcon} alt="sidebarIcon"/>
                        </a>
                </div>
            </div>
            <div
                className="collapse navbar-collapse  w-auto tw-mt-28"
                id="sidenav-collapse-main">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <div className="nav-link-text ms-1 tw-text-gray-500 tw-pl-8 tw-mt-4">
                            GAMBLE GAMES
                        </div>
                    </li>     
                    <li className={ "nav-item tw-pt-4 tw-relative" }>
                        <a
                            className={`nav-link ${isActive('/wheel-fortune')}`}
                            onClick={() => {
                                router.push(`/wheel-fortune`)
                            }}>
                            <div className="icon icon-shape icon-sm shadow border-radius-md bg-white-2 text-center me-2 d-flex align-items-center justify-content-center tw-w-8 tw-h-8">
                            <Image src={siderbarRoulette} className="navbar-brand-img h-100" alt="rouletteLogo"/>    
                            </div>
                            <span className="nav-link-text ms-1">
                                Wheel of Fortune</span>
                        </a>
                    </li>                      
                    <li className="nav-item disabled tw-relative">
                        <a
                            onClick={() => {
                                notify.show('Coming soon. Stay tuned!', 'warning', 3000);
                            }}
                            className="nav-link btn-tooltip"
                            data-bs-toggle="tooltip"
                            data-bs-placement="bottom"
                            title="Under Development"
                            data-container="body"
                            data-animation="true">
                            <div className="icon icon-shape icon-sm shadow border-radius-md bg-white-2 text-center me-2 d-flex align-items-center justify-content-center tw-w-8 tw-h-8">
                            <Image src={siderbarBlackjack} className="navbar-brand-img h-100" alt="blackjackLogo"/>    
                            </div>
                            <span className="nav-link-text ms-1 tw-relative">
                                Blackjack
                            </span>
                        </a>
                    </li>
                </ul>
            </div>
            <div className="sidenav-footer mx-3 ">
                <div className="position-absolute tw-pt-1">
                    <div className="card-body text-start p-3 w-100">
                        <div className="docs-info tw-align-text-center">
                            <a
                                href={`https://app.sushi.com/swap?outputCurrency=ETH&chainId=${config.NEXT_PUBLIC_CHAIN_ID}`}
                                target="_blank"
                                className="btn btn-warning btn-sm tw-min-w-max mb-0 tw-text-black">
                                Buy $ETH
                            </a>
                            { tokenPrice > 0 && 
                                <div className="tw-flex-row tw-flex tw-pt-2 align-items-center tw-pl-1 p-3">
                                    <div className="col-2 tw-pr-1">
                                        <Image className="h-100 w-100 tw-pr-1 tw-align-text-top" src={ethLogo} alt="ethLogo"/>
                                    </div>
                                    <div className="tw-text-sm col-2">
                                        ${tokenPrice}
                                    </div>                                                                
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default DashboardSidebar;