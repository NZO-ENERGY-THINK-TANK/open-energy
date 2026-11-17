import InstalledCapacityChart from './charts/InstalledCapacityChart'
import FacilitySizeChart from './charts/FacilitySizeChart'

export default function FacilitiesSection() {
  return <>
    <h2 className="px-5 pb-[52px] text-2xl font-extrabold text-[#276E4E] md:px-[60px] md:text-[34px]">מתקני ייצור מחוברים</h2>
    <div className="flex flex-col gap-10 rounded-[20px] border border-[#DEDEDE]/70 bg-[#FDFBF6] px-5 py-5 md:rounded-[40px] md:px-[60px] md:py-[50px]">
      <InstalledCapacityChart />
      <FacilitySizeChart />
    </div>
  </>
}
