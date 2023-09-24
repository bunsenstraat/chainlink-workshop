import { ethers, BigNumber } from 'ethers'
import { ISemaphoreDeploymentData, IGroup, IGroupMember } from './types'
;(async () => {
    const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()
    console.log(await signer.getAddress())
    const signerAddress = await signer.getAddress()

    const contract = await ethers.getContractAt('HackerGroup', '0xEc29164D68c4992cEdd1D386118A47143fdcF142', signer)

    //console.log(contract.filters)

    let eventFilter = contract.filters.bugCreated()
    let bugs = await contract.queryFilter(eventFilter)

    console.log('bugs created')
    console.log(JSON.stringify(bugs, null, '\t'))

    eventFilter = contract.filters.bugApproved()
    bugs = await contract.queryFilter(eventFilter)

    console.log('bugs approved')
    console.log(JSON.stringify(bugs, null, '\t'))

    eventFilter = contract.filters.bugRejected()
    bugs = await contract.queryFilter(eventFilter)

     console.log('bugs rejected')
    console.log(JSON.stringify(bugs, null, '\t'))
})()
