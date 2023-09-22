import { Group } from '@semaphore-protocol/group'
import { generateProof, verifyProof } from '@semaphore-protocol/proof'
import { Identity } from '@semaphore-protocol/identity'
import { BigNumber, utils } from 'ethers'
import { SignalToBigNumber } from '../helpers/convertsignal'
import { SemaphoreProof } from '../types/types'

export const createProofForIdendity = async (_topic: string, _message: string, writeProof: boolean = true, _prooffile?: string, _indendity?: Identity, _group?: Group, _indendity_index?: number, _groupIndex?: number): Promise<SemaphoreProof> => {
    if (!_message || !_topic) throw new Error('message and topic not set')

    const topic = _topic
    const message = _message

    console.log('topic', topic)
    console.log('message', message)
    // get the first group from the file
    const groups = JSON.parse(await remix.call('fileManager', 'readFile', './build/groups.json'))

    /* reconstruct the group to use in the Sempaphore proof 
        / this will also create the merkle tree internally in the grouo
        / but you will need to have all the members to do this
        */
    const group = _group || new Group(groups[_groupIndex || 0].group_id, 20, groups[_groupIndex || 0].members)

    // create idendity from the first member of the group
    const identities = JSON.parse(await remix.call('fileManager', 'readFile', './build/identities.json'))
    console.log('using identity... ')
    console.log(identities[_indendity_index || 0].commitment)
    const identity = _indendity || new Identity(identities[_indendity_index || 0].data)

    const signal = SignalToBigNumber(message)
    const externalNullifier = utils.formatBytes32String(topic)

    console.log('Creating proof with semaphore')
    /* this was & zkey was taken from https://www.trusted-setup-pse.org/ for a tree depth of 20 only!!
        / generate your own zkeys and wasm files or store them on IPFS
        / the snarkjs implementation that drives this function needs a URL withour CORS limitations, that is why we use IPFS
        */
    const fullProof: SemaphoreProof = await generateProof(identity, group, externalNullifier, signal, {
        zkeyFilePath: 'https://ipfs-cluster.ethdevops.io/ipfs/QmYQU3F6MpxhwAjGLMrcf7Xt2u5PyuS1wrV1Upy1M8xGhL',
        wasmFilePath: 'https://ipfs-cluster.ethdevops.io/ipfs/QmQ8oN5nydG5MwQtxZBVUW5b3E2n41kcbXYUi9wPLFEfqq',
    })
    console.log('Proof created')
    console.log(JSON.stringify(fullProof, null, '\t'))

    // write it to the filesystem
    if (writeProof) {
        await remix.call('fileManager', 'setFile', _prooffile || './build/proof.json', JSON.stringify(fullProof, null, '\t'))
    }
    console.log('verifying proof off chain...')
    const result = await verifyProof(fullProof, 20)

    console.log(result)

    return fullProof
}
