import React, { useRef, useState, useCallback, useEffect } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";

const Confetti = ({fireConfettiTrigger}: any) => {

    const refAnimationCenter : any = useRef(null);
    const refAnimationLaterals: any = useRef(null);

    const getInstanceAnimationCenter = useCallback((instance: any) => {
        refAnimationCenter.current = instance;
    }, []);

    const getInstanceAnimationLaterals = useCallback((instance: any) => {
        refAnimationLaterals.current = instance;
    }, []);

    const canvasStyles = {
        position: "fixed" as `${"fixed"}`,
        pointerEvents: "none" as `${"none"}`,
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: 999999
    };

    const canvasStyles2 = {
        position: "fixed" as `${"fixed"}`,
        pointerEvents: "none" as `${"none"}`,
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: 999999
    };

    function getAnimationSettings(angle: any, originX: any) {
        return {
            particleCount: 200,
            angle,
            spread: 55,
            origin: { x: originX },
            colors: ["#bb0000", "#ffffff"]
        };
    }

    const makeShot = useCallback((particleRatio: any, opts: any) => {
        refAnimationCenter.current &&
        refAnimationCenter.current({
                ...opts,
                origin: { y: 0.7 },
                particleCount: Math.floor(200 * particleRatio)
        });
    }, []);

    const fireConfetti = useCallback(() => {
        makeShot(0.25, {
          spread: 26,
          startVelocity: 55
        });
    
        makeShot(0.2, {
          spread: 60
        });
    
        makeShot(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8
        });
    
        makeShot(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.2
        });
    
        makeShot(0.1, {
          spread: 120,
          startVelocity: 45
        });

        // Lateral confettis
        if (refAnimationLaterals.current) {
            setTimeout(() => {
                refAnimationLaterals.current(getAnimationSettings(60, 0));
                refAnimationLaterals.current(getAnimationSettings(120, 1));
            }, 500);
        }
    }, [makeShot]);

    useEffect(() => {
        if(fireConfettiTrigger) {
            fireConfetti();
        }
    },[fireConfettiTrigger]);

    return (
        <>
            <div>
                <ReactCanvasConfetti refConfetti={getInstanceAnimationCenter} style={canvasStyles} />
                <ReactCanvasConfetti refConfetti={getInstanceAnimationLaterals} style={canvasStyles2} />
            </div>
        </>
    )
}

export default Confetti