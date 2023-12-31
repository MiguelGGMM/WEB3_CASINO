type configType = {
  NEXT_PUBLIC_PROJECT_ID: string
  NEXT_PUBLIC_CHAIN_ID: number
  NEXT_PUBLIC_DEFAULT_NODE: string
  NEXT_PUBLIC_CASINOADR: string
  NEXT_PUBLIC_ROULETTEADR: string
  NEXT_PUBLIC_SMADR: string
  NEXT_PUBLIC_PROFITSADR: string
  NEXT_PUBLIC_BETSADR: string
}

const config: configType = {
  NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID ?? '',
  NEXT_PUBLIC_CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? ''),
  NEXT_PUBLIC_DEFAULT_NODE: process.env.NEXT_PUBLIC_DEFAULT_NODE ?? '',
  NEXT_PUBLIC_CASINOADR: process.env.NEXT_PUBLIC_CASINOADR ?? '',
  NEXT_PUBLIC_ROULETTEADR: process.env.NEXT_PUBLIC_ROULETTEADR ?? '',
  NEXT_PUBLIC_SMADR: process.env.NEXT_PUBLIC_SMADR ?? '',
  NEXT_PUBLIC_PROFITSADR: process.env.NEXT_PUBLIC_PROFITSADR ?? '',
  NEXT_PUBLIC_BETSADR: process.env.NEXT_PUBLIC_BETSADR ?? '',
}

export default config
