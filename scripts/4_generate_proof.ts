import { Group } from '@semaphore-protocol/group'
import { generateProof, verifyProof } from '@semaphore-protocol/proof'
import { Identity } from '@semaphore-protocol/identity'
import { utils } from 'ethers'
;(async () => {
    const topic = 'some top322323ic333'
    const message = 'I vote yes'
    // get the first group from the file
    const groups = JSON.parse(
        await remix.call('fileManager', 'readFile', './build/groups.json'),
    )

    /* reconstruct the group to use in the Sempaphore proof 
    / this will also create the merkle tree internally in the grouo
    / but you will need to have all the members to do this
    */
    const group = new Group(groups[0].group_id, 20, groups[0].members)

    // create idendity from the first member of the group
    const identities = JSON.parse(
        await remix.call('fileManager', 'readFile', './build/identities.json'),
    )
    console.log('using identity... ')
    console.log(identities[0].commitment)
    const identity = new Identity(identities[0].data)

    const signal = utils.formatBytes32String(message)
    const externalNullifier = utils.formatBytes32String(topic)

    console.log('Creating proof')
    /* this was & zkey was taken from https://www.trusted-setup-pse.org/ for a tree depth of 20 only!!
    / generate your own zkeys and wasm files or store them on IPFS
    / the snarkjs implementation that drives this function needs a URL withour CORS limitations, that is why we use IPFS
    */
    const fullProof = await generateProof(
        identity,
        group,
        externalNullifier,
        signal,
        {
            zkeyFilePath:
                'https://ipfs-cluster.ethdevops.io/ipfs/QmYQU3F6MpxhwAjGLMrcf7Xt2u5PyuS1wrV1Upy1M8xGhL',
            wasmFilePath:
                'https://ipfs-cluster.ethdevops.io/ipfs/QmQ8oN5nydG5MwQtxZBVUW5b3E2n41kcbXYUi9wPLFEfqq',
        },
    )
    console.log('Proof created')
    console.log(fullProof)

    // write it to the filesystem
    await remix.call(
        'fileManager',
        'setFile',
        './build/proof.json',
        JSON.stringify(fullProof, null, '\t'),
    )

    console.log('verifying proof off chain...')
    const result = await verifyProof(fullProof, 20)

    console.log(result)

})()
