import dynamic from 'next/dynamic'
import React from 'react'
import DashboardHome from '../components/DashboardLayout/home'

const DashboardLayout = dynamic(() => import('../components/DashboardLayout'), {
  ssr: false,
})

const DashboardPage = () => {
  return (
    <DashboardLayout
      title={'Web3 Casino | Dapp'}
      component={<DashboardHome />}
    />
  )
}

export default DashboardPage
