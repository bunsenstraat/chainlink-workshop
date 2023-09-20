import { ethers } from 'ethers'
import { Identity } from "@semaphore-protocol/identity"
import { ISemaphoreDeploymentData } from './types'

const identities = [];
const commmitments = []

const createGroup = async (sempahore_contract_address: any, admin: any, group_id: number) => {
    const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()
    const contract = await ethers.getContractAt('Semaphore', sempahore_contract_address, signer)
    console.log('creating semaphore group')
    await contract["createGroup(uint256,uint256,address)"](group_id, '20', admin)
    console.log('group created ', group_id)
}

const addMembers = async (sempahore_contract_address: any, admin: any, group_id: number, members: string[]) => {
    const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()
    const contract = await ethers.getContractAt('Semaphore', sempahore_contract_address, signer)
    console.log('adding members to group')
    await contract.addMembers(group_id, members)
    console.log('members added')
}


const verifyMemberCount = async (sempahore_contract_address: any, admin: any, group_id: number, memberCount: number) => {
    const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()
    const contract = await ethers.getContractAt('Semaphore', sempahore_contract_address, signer)
    console.log('counting members in group')
    const count = await contract.getNumberOfMerkleTreeLeaves(group_id)
    
    if(memberCount !== count.toNumber()) {
        console.error('Members not added')
    }else{
        console.log('Members added correctly')
    }
}


    ; (async () => {
        try {

            const semaphore_deployment = await remix.call('fileManager', 'readFile', 'build/semaphore_deployment.json')
            const semaphore_deployment_data:ISemaphoreDeploymentData  = JSON.parse(semaphore_deployment)

            const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()

            console.log(semaphore_deployment_data.semaphoreAddress)
            
 
            const admin = await signer.getAddress()
            const sempahore_contract_address = semaphore_deployment_data.semaphoreAddress

            // create a new group in Semaphore
            const group_id = ethers.BigNumber.from(ethers.utils.randomBytes(32))
            await createGroup(sempahore_contract_address, admin , group_id)

            // create some random identities
            for (let i = 0; i <= 1; i++) {
                const identity = new Identity()
                const { trapdoor, nullifier, commitment } = identity
                identities.push({
                    trapdoor: trapdoor.toString(), 
                    nullifier: nullifier.toString(),
                    commitment: commitment.toString(),
                    data: identity.toString(), 
                    group_id
                })
                commmitments.push(commitment.toString())
            }


            // store them so we can use them in our dApp, it contains secrets, not for production use
            await remix.call('fileManager', 'setFile', './build/identities.json', JSON.stringify(identities, null, '\t'))

            // add them all to the group
            await addMembers(sempahore_contract_address, admin, group_id, commmitments)

            // verify we added them
            await verifyMemberCount(sempahore_contract_address, admin, group_id, commmitments.length)

            
        } catch (e) {
            console.error(e.message)
        }
    })()
