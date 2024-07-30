import AnimatedAcounter from './AnimatedAcounter';
import DoughntChart from './DoughntChart';

const TotalBalanceBox = ({ accounts = [], totalBanks, totalCurrentBalance }:    { accounts: any[], totalBanks: number, totalCurrentBalance: number }) => {
    return (
        <section className='total-balance'>
            <div className='total-balance-chart'>

                <DoughntChart accounts={accounts} />
                </div>
            
                <div className='flex flex-col gap-6'>
                    <h2 className='header-2'>
                        Bank Accounts: {totalBanks}
                    </h2>
                    <div className='flex flex-col gap-2'>
                        <p className='total-balance-label'>
                            Total Currednt Balance
                        </p>
                        <div className='total-balance-ammount flex-center gap-2'>
                            <AnimatedAcounter amount={totalCurrentBalance} />                            
                    </div>
                    </div>
                </div>
        </section>
    )
}

export default TotalBalanceBox