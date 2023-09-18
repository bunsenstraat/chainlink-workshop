import { ethers } from 'ethers'

/**
 * Deploy the given contract
 * @param {string} contractName name of the contract to deploy
 * @param {Array<any>} args list of constructor' parameters
 * @param {Number} accountIndex account index from the exposed account
 * @return {Contract} deployed contract
 */
const deploy = async (
    contractName: string,
    args: Array<any>,
    libraries?: { [key: string]: any }
): Promise<ethers.Contract> => {
    console.log(`deploying ${contractName}`)
      
    const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()

    let factory = await ethers.getContractFactory(contractName as any, null, {
        signer,
        libraries
    } as any)
    
    const contract = await factory.deploy(...args)

    // The contract is NOT deployed yet; we must wait until it is mined
    await contract.deployed()
    
    return contract
}

//0x9d83e140330758a8fFD07F8Bd73e86ebcA8a5692

;(async () => {
    try {
        const verifierAddress = ''

        const poseidonT3 = await deploy('PoseidonT3', [])
        console.log('PoseidonT3 at', poseidonT3.address)
        
        const incrementalBinaryTree = await deploy('IncrementalBinaryTree', [], { 'poseidon-solidity/PoseidonT3.sol:PoseidonT3': poseidonT3.address } )
        console.log('IncrementalBinaryTree at', incrementalBinaryTree.address)
        
        if (!verifierAddress) throw new Error("verifier address shouldn't be null, the semaphore needs it...")
        const semaphore = await deploy('Semaphore', [verifierAddress], { IncrementalBinaryTree: incrementalBinaryTree.address  })
        console.log('Semaphore', semaphore.address)
    } catch (e) {
        console.error(e.message)
    }    
})()
