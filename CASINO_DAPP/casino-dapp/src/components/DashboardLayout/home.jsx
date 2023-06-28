import React from 'react';
import { useRouter } from 'next/navigation';
import { notify } from 'react-notify-toast';
//import '../../../public/assets/css/tailwind.css';

const DashboardHome = ({}) => {
    const router = useRouter();

    return (
        <div className="container-fluid py-4">
            <div className="row justify-content-center">
                <div className="col-xl-4-0 col-6 mb-xl-0 mb-4">
                    <div 
                        onClick={() => {
                            router.push(`/wheel-fortune`)
                        }}>
                        <div className="card-body cursor-pointer">
                            <div className="row align-items-center justify-content-center d-flex overflow-hidden">
                                <div className="col-md-12 align-items-center justify-content-center d-flex tw-p-0">
                                    <p className="text-sm mb-0 font-weight-bold text-center">
                                        <div className="object-cover overflow-hidden w-100 h-100">
                                            <img className="navbar-brand-img pb-1 tw-max-w-lg tw-max-h-lg h-100 w-100" src="../assets/img/roulette_1.jpg" alt="roulette"/>
                                        </div>                                                                                        
                                        <span id="roulette-text" style={{ fontSize: '1.2em', color: '#ffd700', fontWeight: 600 }}>Wheel of Fortune</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-4-0 col-6 mb-xl-0 mb-4 opacity-3">
                    <div
                        onClick={() => {
                            notify.show(`Coming soon. Stay tuned!`, "warning", 3000);
                        }}>
                        <div className="card-body" style={{ cursor: 'not-allowed' }}>
                            <div className="row align-items-center justify-content-center d-flex overflow-hidden">
                                <div className="col-md-12 align-items-center justify-content-center d-flex tw-p-0">
                                    <p className="text-sm mb-0 font-weight-bold text-center">
                                        <div className="object-cover overflow-hidden w-100 h-100">
                                            <img className="navbar-brand-img pb-1 tw-max-w-lg tw-max-h-lg h-100 w-100" id="blackjack" src="../assets/img/blackjack_game_1.jpg" alt="blackjack"/>                                            
                                        </div>
                                        <span id="blackjack-text" style={{ fontSize: '1.2em', color: '#ffd700', fontWeight: 600}}>Blackjack</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>          
            </div>

            <div className="row mt-4" id="menu1">
                <div className="col-lg-7 mb-lg-0 mb-4">
                    <div className="card bg-gradient-primary">
                        <div className="card-body p-3">
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="d-flex flex-column h-100 text-center">
                                        <h5 className="font-weight-bolder tw-mb-2" style={{color:'#ffffff'}}>
                                            Welcome to the WEB3 CASINO!
                                        </h5>
                                        <p className='tw-mb-1' style={{color:'#8b959e'}}>
                                        <span id="span-welcome">
                                            The objective of this <b><u><a href={'https://github.com/MiguelGGMM/WEB3_CASINO'} target='_blank'>project</a></u></b> is to exemplify how blockchain technology can be used to build a totally 
                                            transparent open source web3 casino, rid of owner priviledges, using trustfully third party services for randomizing bets and get price of
                                            tokens. Using smart contracts designed and deployed on arbitrum blockchain and leading edge technology like react, next, bootstrap, tailwind and
                                            open source web3 libraries that allows user authenticate himself, retrive contract data and sign transactions in order to perform bets.
                                        </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="footer pt-3  ">
                <div className="container-fluid">
                    <div className="row align-items-center justify-content-lg-between">
                        <div className="col-lg-6 mb-lg-0 mb-4" style={{ padding:'0' }}>
                            <div className="copyright text-center text-sm text-muted text-lg-start">
                            © 2023{" "}
                                <a href="https://github.com/MiguelGGMM/WEB3_CASINO"
                                    className="text-muted"
                                    target="_blank" style={{ marginLeft: 3, marginRight: 3 }}>
                                    🎰 WEB3 CASINO 🎰
                                </a>
                                by<a href="https://github.com/MiguelGGMM"
                                    className="font-weight-bold text-muted"
                                    target="_blank" style={{ marginLeft: 3, marginRight: 3 }}>MiguelGGMM
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer> 
        </div>
    );
}

export default DashboardHome;