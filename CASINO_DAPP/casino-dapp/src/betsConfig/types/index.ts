import { prizeType } from '../../ts/const';
import contractConfig from '../contractConfig';

export type prizeTypeKeys = keyof typeof prizeType;
export type prizeTypeValues = typeof prizeType[prizeTypeKeys];

export type customDollarPrizeSubtypeKeys = keyof typeof contractConfig.customDollarPrizeSubtype;
export type customDollarPrizeSubtypeValues = typeof contractConfig.customDollarPrizeSubtype[customDollarPrizeSubtypeKeys];

export type styleOption = { backgroundColor: string, textColor: string }
export interface imageTypeBasic { optionsSize: 1, offsetX: 0, sizeMultiplier: 1, landscape: false };
export type offsetYType = 150 | 170;
export type imageType = { uri: string, offsetY: offsetYType } & imageTypeBasic;
export type optionPropsLeft = { url: string, styleOption: styleOption, offsetY: offsetYType  }
export interface optionType { 
    option: customDollarPrizeSubtypeKeys | prizeTypeKeys,
    style: styleOption,
    image: imageType,
    prizeType: prizeTypeValues,
    prizeSubtype: customDollarPrizeSubtypeValues | 0
};
