import { Group } from '@semaphore-protocol/group'
import { generateProof, verifyProof } from '@semaphore-protocol/proof'
import { Identity } from '@semaphore-protocol/identity'
import { ethers } from 'ethers'
import { ISemaphoreDeploymentData } from './types'
;(async () => {
    try {
        const semaphore_deployment = await remix.call(
            'fileManager',
            'readFile',
            'build/semaphore_deployment.json',
        )
        const semaphore_deployment_data: ISemaphoreDeploymentData =
            JSON.parse(semaphore_deployment)
        const signer = new ethers.providers.Web3Provider(
            web3Provider,
        ).getSigner()

        const sempahore_contract_address =
            semaphore_deployment_data.semaphoreAddress

        const contract = await ethers.getContractAt(
            'Semaphore',
            sempahore_contract_address,
            signer,
        )

        // load a proof
        const proof = JSON.parse(
            await remix.call('fileManager', 'readFile', 'build/proof.json'),
        )

        console.log('verifying proof on chain...')
        console.log(proof)

        // get the first group from the file
        const groups = JSON.parse(
            await remix.call('fileManager', 'readFile', './build/groups.json'),
        )
        const group_id = groups[0].group_id
        console.log(
            'using proof ...',
            group_id,
            proof.merkleTreeRoot,
            proof.signal,
            proof.nullifierHash,
            proof.externalNullifier,
            proof.proof,
        )

        const result = await contract.verifyProof(
            group_id,
            proof.merkleTreeRoot,
            proof.signal,
            proof.nullifierHash,
            proof.externalNullifier,
            proof.proof,
        )

        console.log(result)
    } catch (e) {
        console.log(e.message)
    }
})()
