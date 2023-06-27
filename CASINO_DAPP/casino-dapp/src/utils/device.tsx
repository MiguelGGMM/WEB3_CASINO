import {
    isBrowser as isBrowserDetect,
    isMobile as isMobileDetect
} from 'react-device-detect';

const isBrowser = () => {
    return isBrowserDetect;
}

const isMobile = () => {
    return isMobile;
}

export const getOS = () => {
    // @ts-ignore
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    // @ts-ignore
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "unknown";
}