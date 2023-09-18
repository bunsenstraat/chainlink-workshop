import { ethers } from 'ethers'
import { Identity } from "@semaphore-protocol/identity"

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
            const group_id = ethers.BigNumber.from(ethers.utils.randomBytes(32))
            const admin = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'
            const sempahore_contract_address = '0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47'

            // create a new group in Semaphore
            await createGroup(sempahore_contract_address, admin , group_id)

            // create some random identities
            for (let i = 0; i <= 1; i++) {
                const identity = new Identity()
                const { trapdoor, nullifier, commitment } = identity
                identities.push({
                    trapdoor: trapdoor.toString(),
                    nullifier: nullifier.toString(),
                    commitment: commitment.toString()
                })
                commmitments.push(commitment.toString())
            }


            // store them so we can use them in our dApp
            await remix.call('fileManager', 'setFile', './zk/build/identities.json', JSON.stringify([identities], null, '\t'))

            // add them all to the group
            await addMembers(sempahore_contract_address, admin, group_id, commmitments)

            // verify we added them
            await verifyMemberCount(sempahore_contract_address, admin, group_id, commmitments.length)


        } catch (e) {
            console.error(e.message)
        }
    })()
