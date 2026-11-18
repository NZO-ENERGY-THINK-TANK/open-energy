import ProductionMixChart from './charts/ProductionMixChart'
import RenewableShareChart from './charts/RenewableShareChart'

export default function ProductionSection() {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-[#DEDEDE]/70 bg-[#FDFBF6] px-5 py-5 md:rounded-[40px] md:px-[60px] md:py-[50px]">
      <h2 className="text-2xl font-extrabold text-[#276E4E] md:text-[34px]">
        ייצור אנרגיות מתחדשות
      </h2>
      <div className="flex flex-col gap-10">
        <ProductionMixChart />
        <RenewableShareChart />
      </div>
    </div>
  )
}
