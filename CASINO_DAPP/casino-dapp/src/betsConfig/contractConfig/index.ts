const betsEnabled = ['10', '25'] as const;
const customDollarPriceEnabled = ['1$', '2$'] as const;
const customDollarPrizeSubtype = {
    [customDollarPriceEnabled[0]]: 4, // Value numbers depends on contract config...
    [customDollarPriceEnabled[1]]: 5
} as const;

const contractConfig = {
    betsEnabled: betsEnabled,
    customDollarPrizeSubtype : customDollarPrizeSubtype,
    customDollarPriceEnabled: customDollarPriceEnabled
} as const;

export default contractConfig;