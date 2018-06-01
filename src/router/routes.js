
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
      { path: 'deploy', component: () => import('pages/contract-deploy') },
      { path: 'add', component: () => import('pages/contract-add') },
      { path: 'view', component: () => import('pages/contract-view') },
      { path: 'my', component: () => import('pages/contract-my') }
    ]
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
