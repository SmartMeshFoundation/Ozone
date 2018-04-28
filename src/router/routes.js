
export default [
  {
    path: '/', redirect: '/splash'
  },
  {
    path: '/splash',
    component: () => import('pages/splash')
  },
  {
    path: '/dashboard', redirect: '/wallet'
  },
  {
    path: '/wallet',
    component: () => import('layouts/default'),
    children: [
      { path: '', component: () => import('pages/wallet') },
      { path: 'account/:address', component: () => import('pages/account') }
    ]
  },
  {
    path: '/transfer',
    component: () => import('layouts/default'),
    children: [
      { path: '', component: () => import('pages/transfer') },
      { path: 'account/:address', component: () => import('pages/transfer') }
    ]
  },
  {
    path: '/contract',
    component: () => import('layouts/default'),
    children: [
      { path: 'deploy', component: () => import('pages/contract-deploy') }
    ]
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
