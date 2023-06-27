import { prizeType } from '../ts/const';
import rouletteConfig from './rouletteConfig';
import contractConfig from './contractConfig';
import * as types from './types';

const createOption = (
    _option: types.customDollarPrizeSubtypeKeys | types.prizeTypeKeys, 
    _bgColor: string, 
    _textColor: string, 
    _uri: string, 
    _offsetY: types.offsetYType, 
    _prizeType: types.prizeTypeValues, 
    _prizeSubtype: types.customDollarPrizeSubtypeValues | 0
    ) : types.optionType => {
    return  {
        option: _option,
        style: { backgroundColor: _bgColor, textColor: _textColor },
        image: { uri: _uri, offsetY: _offsetY, ...({} as types.imageTypeBasic) },
        prizeType: _prizeType,
        prizeSubtype: _prizeSubtype
    }
}

const getOptions = () : types.optionType[] => {
    return (Object.keys(prizeType) as types.prizeTypeKeys[])
    .map(k => {
        if(prizeType[k] != prizeType.customPrizeDollarAmount && prizeType[k] != prizeType.NFT) {
            const oc = rouletteConfig.options[prizeType[k]];
            return createOption(
                k,
                oc.styleOption.backgroundColor,
                oc.styleOption.textColor,
                oc.url,
                oc.offsetY,
                prizeType[k],
                0
            );
        }
    }).concat(
        (Object.keys(contractConfig.customDollarPrizeSubtype) as types.customDollarPrizeSubtypeKeys[]).map(k => {
            const oc = rouletteConfig.optionsCustom[contractConfig.customDollarPrizeSubtype[k]];
            return createOption(
                k,
                oc.styleOption.backgroundColor,
                oc.styleOption.textColor,
                oc.url,
                oc.offsetY,
                prizeType.customPrizeDollarAmount,
                contractConfig.customDollarPrizeSubtype[k]
            );
        })
    ).filter(x => x != undefined) as types.optionType[];
}

export default getOptions;