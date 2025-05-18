import localFont from 'next/font/local'

export const sfProRounded = localFont({
  src: [
    {
      path: '../../public/fonts/SFRounded-Ultralight.woff',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/SFRounded-Thin.woff',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/fonts/SFRounded-Light.woff',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/SFRounded-Regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/SFRounded-Medium.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/SFRounded-Semibold.woff',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/SFRounded-Bold.woff',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/SFRounded-Heavy.woff',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/SFRounded-Black.woff',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-sf-pro-rounded',
});