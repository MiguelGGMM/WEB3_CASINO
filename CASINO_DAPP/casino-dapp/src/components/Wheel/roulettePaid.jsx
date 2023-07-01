
import Roulette from './roulette';

const COLOR = ['#fbd91e'];
const pointer = 'assets/img/spin/roulette-pointer-gold.png';

const RoulettePaid = ({bet, onWin, ROULETTE_OPTIONS}) => {
    const __props = {
        ROULETTE_OPTIONS: ROULETTE_OPTIONS,
        COLOR:COLOR,
        bet:bet,
        onWin:onWin,
        pointer:pointer
    }

    return (
    <>
        <Roulette _props={__props} />
    </>
    )
}

export default RoulettePaid;