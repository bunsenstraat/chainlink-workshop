import { ethers } from 'ethers'
import { CompilationResult, SourceWithTarget } from '@remixproject/plugin-api'

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
    libraries?: { [key: string]: any },
): Promise<ethers.Contract> => {
    console.log(`deploying ${contractName}`)

    const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()

    // internal Remix method that resolves the artifacts and links the libraries
    let factory = await ethers.getContractFactory(contractName as any, null, {
        signer,
        libraries,
    } as any)

    const contract = await factory.deploy(...args)

    // The contract is NOT deployed yet; we must wait until it is mined
    await contract.deployed()

    return contract
}

;(async () => {
    try {
        remix.off('solidity', 'compilationFinished')
        remix.on('solidity', 'compilationFinished', async (fileName: string, source: any, languageVersion: string, data: any) => {
            console.log('compiled ' + fileName)
        })

        console.log('compiling')

        await remix.call(
            'solidity',
            'compile' as any,
            'semaphore/contracts/Semaphore.sol',
        )

        setTimeout(async () => {
            await remix.call(
                'solidity',
                'compile' as any,
                'semaphore/contracts/base/SemaphoreVerifier.sol',
            )
            setTimeout(async () => {
                const pairing = await deploy('Pairing', [])

                console.log(pairing.address)

                const verifier = await deploy('SemaphoreVerifier', [], {
                    Pairing: pairing.address,
                })

                const verifierAddress = verifier.address

                const poseidonT3 = await deploy('PoseidonT3', [])
                console.log('PoseidonT3 at', poseidonT3.address)

                const incrementalBinaryTree = await deploy(
                    'IncrementalBinaryTree',
                    [],
                    {
                        'poseidon-solidity/PoseidonT3.sol:PoseidonT3':
                            poseidonT3.address,
                    },
                )
                console.log(
                    'IncrementalBinaryTree at',
                    incrementalBinaryTree.address,
                )

                if (!verifierAddress)
                    throw new Error(
                        "verifier address shouldn't be null, the semaphore needs it...",
                    )
                const semaphore = await deploy('Semaphore', [verifierAddress], {
                    IncrementalBinaryTree: incrementalBinaryTree.address,
                })
                console.log('Semaphore addres: ', semaphore.address)

                await remix.call('fileManager', 'setFile', './build/semaphore_deployment.json', JSON.stringify({semaphoreAddress: semaphore.address, verifierAddress}, null, '\t'))

                remix.off('solidity', 'compilationFinished')
            }, 10000)
        }, 10000)
    } catch (e) {
        console.error(e.message)
    }
})()
