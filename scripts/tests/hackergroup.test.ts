import { expect } from 'chai'
import { deploy } from '../helpers/deploy'
import { ISemaphoreDeploymentData, SemaphoreProof } from '../types/types'
import { createProofForIdendity } from '../helpers/createProofForIdendity'
import { ethers } from 'ethers'
import { BigNumberToSignal } from '../helpers/convertsignal'

// to use this test you should first setup the contracts using
// 1. deploy_sempahore
// 2. create groups
// 3. store groups

let hackergroup
let semaphoreAddress
let proof: SemaphoreProof
let _paymentChainSelector = '16015286601757825753'
let _receiver = ethers.Wallet.createRandom().address
let cid
const router = ethers.Wallet.createRandom() // some random address uses instead of the CCIP router

describe('Hackergroup', function () {
    it('Deploys hackergroup', async function () {
        const semaphore_deployment = await remix.call('fileManager', 'readFile', 'build/semaphore_deployment.json')
        const semaphore_deployment_data: ISemaphoreDeploymentData = JSON.parse(semaphore_deployment)
        semaphoreAddress = semaphore_deployment_data.semaphoreAddress
        hackergroup = await deploy('HackerGroup', [semaphore_deployment_data.semaphoreAddress, router.address])
        console.log('deploy done ', hackergroup.address)
        expect(hackergroup.address).to.not.null
    })

    it('Gets the Semaphore adddress', async function () {
        const address = await hackergroup.semaphore()
        console.log(address)
        expect(address).to.equal(semaphoreAddress)
    })

    it('Creates a valid proof for onchain validating with semaphore', async function () {
        const n = ethers.BigNumber.from(ethers.utils.randomBytes(32))
        cid = BigNumberToSignal(n)
        proof = await createProofForIdendity(cid, '0', false)
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

        // get the first group from the file
        const groups = JSON.parse(await remix.call('fileManager', 'readFile', './build/groups.json'))
        const group_id = groups[0].group_id

        const n = ethers.BigNumber.from(ethers.utils.randomBytes(32))
        cid = BigNumberToSignal(n)
        // signal is 0, meaning we create a new bug
        proof = await await createProofForIdendity(cid, '0', true, null, groups[0].members[0])


        console.log('using proof ...', group_id, proof.merkleTreeRoot, proof.signal, proof.nullifierHash, proof.externalNullifier, proof.proof)
        const result = await hackergroup.submit(group_id, proof.merkleTreeRoot, proof.signal, proof.nullifierHash, proof.externalNullifier, proof.proof, _paymentChainSelector, _receiver)
        console.log('verification by hackergroup...')
        console.log(result)
        expect(result.hash).to.not.null
    })


    it('Fetches the bug associated with the cid', async function(){
        console.log('fetching ....', proof.externalNullifier)
        const result = await hackergroup.bugs(proof.externalNullifier)
        console.log(result)
        expect(result[0]).to.equal(proof.externalNullifier)
    })


    it('Submit a new valid approval proof by the second member of the group', async function () {

        // get the first group from the file
        const groups = JSON.parse(await remix.call('fileManager', 'readFile', './build/groups.json'))
        const group_id = groups[0].group_id

        // signal is 1, meaning we approve the bug
        proof = await createProofForIdendity(cid, '1', true, null, groups[0].members[1])
        // get the first group from the file

        console.log('using proof ...', group_id, proof.merkleTreeRoot, proof.signal, proof.nullifierHash, proof.externalNullifier, proof.proof)
        const result = await hackergroup.submit(group_id, proof.merkleTreeRoot, proof.signal, proof.nullifierHash, proof.externalNullifier, proof.proof, _paymentChainSelector, _receiver)
        console.log('verification by hackergroup...')
        console.log(result)
        expect(result.hash).to.not.null
    })


    it('Fetches the bug associated with the cid', async function(){
        const result = await hackergroup.approvals(proof.externalNullifier)
        console.log(result)
        expect(result).to.equal(1)
    })
})
