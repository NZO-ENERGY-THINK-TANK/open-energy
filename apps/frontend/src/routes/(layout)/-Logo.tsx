import openEnergyLogo from '@/assets/brand/open-energy-logo.png'

export default function Logo() {
  return (
    <img
      src={openEnergyLogo}
      alt="אנרגיה פתוחה — NZO"
      width={140}
      height={56}
      className="h-auto w-[60px] md:h-[56px] md:w-[140px]"
    />
  );
}
