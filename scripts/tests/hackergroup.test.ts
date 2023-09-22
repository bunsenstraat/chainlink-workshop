import { expect } from 'chai'
import { deploy } from '../helpers/deploy'
import { ISemaphoreDeploymentData, SemaphoreProof } from '../types/types'
import { createProofForIdendity } from '../helpers/createProofForIdendity'
import { ethers } from 'ethers'

// to use this test you should first setup the contracts using
// 1. deploy_sempahore
// 2. create groups
// 3. store groups

let hackergroup
let semaphoreAddress
let proof: SemaphoreProof
let _paymentChainSelector = '16015286601757825753'
let _receiver = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'

describe('Hackergroup', function () {
    it('Deploys hackergroup', async function () {
        console.log('compiling')
        remix.off('solidity', 'compilationFinished')
        await remix.call('solidity', 'compile' as any, 'contracts/hackergroup.sol')

        const semaphore_deployment = await remix.call('fileManager', 'readFile', 'build/semaphore_deployment.json')
        const semaphore_deployment_data: ISemaphoreDeploymentData = JSON.parse(semaphore_deployment)
        semaphoreAddress = semaphore_deployment_data.semaphoreAddress
        hackergroup = await deploy('HackerGroup', [semaphore_deployment_data.semaphoreAddress])
        console.log('deploy done ', hackergroup.address)
        expect(hackergroup.address).to.not.null
    })

    it('Gets the Semaphore adddress', async function () {
        const address = await hackergroup.semaphore()
        console.log(address)
        expect(address).to.equal(semaphoreAddress)
    })

    it('Creates a valid proof for onchain validating with semaphore', async function () {
        proof = await createProofForIdendity('hackergroup' + Date.now(), 'QmcuCKyokk9Z6f65ADAADNiS2R2xCjfRkv7mYBSWDwtA7M', false, null, null, null, 1)
    })

    it('Validates proof on chain', async function () {
        const semaphore_deployment = await remix.call('fileManager', 'readFile', 'build/semaphore_deployment.json')
        const semaphore_deployment_data: ISemaphoreDeploymentData = JSON.parse(semaphore_deployment)
        const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()

        const sempahore_contract_address = semaphore_deployment_data.semaphoreAddress

        const contract = await ethers.getContractAt('Semaphore', sempahore_contract_address, signer)

        console.log('verifying proof on chain...')
        console.log(proof)

        // get the first group from the file
        const groups = JSON.parse(await remix.call('fileManager', 'readFile', './build/groups.json'))
        const group_id = groups[0].group_id
        console.log('using proof ...', group_id, proof.merkleTreeRoot, proof.signal, proof.nullifierHash, proof.externalNullifier, proof.proof)

        const result = await contract.verifyProof(group_id, proof.merkleTreeRoot, proof.signal, proof.nullifierHash, proof.externalNullifier, proof.proof)
        console.log('verification...')
        console.log(result)
        expect(result.hash).to.not.null
    })

    it('Submit a new valid proof for onchain validating with hackergroup', async function () {
        proof = await createProofForIdendity('hackergroup' + Date.now(), 'QmcuCKyokk9Z6f65ADAADNiS2R2xCjfRkv7mYBSWDwtA7M', false, null, null, null, 1)
        // get the first group from the file
        const groups = JSON.parse(await remix.call('fileManager', 'readFile', './build/groups.json'))
        const group_id = groups[0].group_id

        console.log('using proof ...', group_id, proof.merkleTreeRoot, proof.signal, proof.nullifierHash, proof.externalNullifier, proof.proof)
        const result = await hackergroup.submitBug(group_id, proof.merkleTreeRoot, proof.signal, proof.nullifierHash, proof.externalNullifier, proof.proof, _paymentChainSelector, _receiver)
        console.log('verification by hackergroup...')
        console.log(result)
        expect(result.hash).to.not.null
    })

    it('Fetches the bug associated with the signal', async function(){
        const result = await hackergroup.bugs(proof.signal)
        console.log(result)
        expect(result[0]).to.equal(proof.signal)
    })

    it('Submit a new valid approval proof', async function () {
        proof = await createProofForIdendity('hackergroup' + Date.now(), 'QmcuCKyokk9Z6f65ADAADNiS2R2xCjfRkv7mYBSWDwtA7M', false, null, null, null, 1)
        // get the first group from the file
        const groups = JSON.parse(await remix.call('fileManager', 'readFile', './build/groups.json'))
        const group_id = groups[0].group_id

        console.log('using proof ...', group_id, proof.merkleTreeRoot, proof.signal, proof.nullifierHash, proof.externalNullifier, proof.proof)
        const result = await hackergroup.approveBug(group_id, proof.merkleTreeRoot, proof.signal, proof.nullifierHash, proof.externalNullifier, proof.proof, _paymentChainSelector, _receiver)
        console.log('verification by hackergroup...')
        console.log(result)
        expect(result.hash).to.not.null
    })

    it('Fetches the bug associated with the signal', async function(){
        const result = await hackergroup.approvals(proof.signal)
        console.log(result)
        expect(result).to.equal(1)
    })
})
