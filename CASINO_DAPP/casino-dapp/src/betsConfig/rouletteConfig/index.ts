import { prizeType } from '../../ts/const'
import contractConfig from '../contractConfig'
import { optionPropsLeft } from '../types'

const options: { [key: number]: optionPropsLeft } = {
  [prizeType.none]: {
    url: 'assets/img/spin/lose-gold.png',
    styleOption: { backgroundColor: '#f13742', textColor: 'white' },
    offsetY: 150,
  },
  [prizeType.x2reward]: {
    url: 'assets/img/spin/x2.png',
    styleOption: { backgroundColor: '#4097b7', textColor: 'white' },
    offsetY: 150,
  },
  [prizeType.x5reward]: {
    url: 'assets/img/spin/x5.png',
    styleOption: { backgroundColor: '#7aceec', textColor: 'white' },
    offsetY: 150,
  },
  [prizeType.x10reward]: {
    url: 'assets/img/spin/x10.png',
    styleOption: { backgroundColor: '#4c5bc8', textColor: 'white' },
    offsetY: 150,
  },
  [prizeType.freeSpin]: {
    url: 'assets/img/spin/free-gold.png',
    styleOption: { backgroundColor: '#36af20', textColor: 'black' },
    offsetY: 150,
  },
  [prizeType.customPrizeDollarAmount]: {
    //Ignored -> optionsCustom
    url: 'assets/img/spin/lose-gold.png',
    styleOption: { backgroundColor: '#f13742', textColor: 'white' },
    offsetY: 150,
  },
  [prizeType.NFT]: {
    //Ignored, unused
    url: 'assets/img/spin/lose-gold.png',
    styleOption: { backgroundColor: '#f13742', textColor: 'white' },
    offsetY: 150,
  },
}
const optionsCustom: { [key: number]: optionPropsLeft } = {
  [contractConfig.customDollarPrizeSubtype['1$']]: {
    url: 'assets/img/spin/1.png',
    styleOption: { backgroundColor: '#a162cf', textColor: 'white' },
    offsetY: 170,
  },
  [contractConfig.customDollarPrizeSubtype['2$']]: {
    url: 'assets/img/spin/2.png',
    styleOption: { backgroundColor: '#ffac24', textColor: 'white' },
    offsetY: 170,
  },
}

const rouletteConfig = {
  options: options,
  optionsCustom: optionsCustom,
}

export default rouletteConfig
