import { ethers, BigNumber } from 'ethers'
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree"
import { poseidon } from "circomlibjs" // v0.0.8
const snarkjs = require('snarkjs');
import { Identity } from '@semaphore-protocol/identity'
import { utils } from 'ethers'

const logger = {
  info: (...args) => console.log(...args),
  debug: (...args) => console.log(...args)
};

/**
 * Creates a keccak256 hash of a message compatible with the SNARK scalar modulus.
 * @param message The message to be hashed.
 * @returns The message digest.
 */
function hash(message: any): bigint {
    message = BigNumber.from(message).toTwos(256).toHexString()
    message = ethers.utils.zeroPad(message, 32)
    return BigInt(ethers.utils.keccak256(message)) >> BigInt(8)
}

(async () => {
  try {
    const topic = 'some top322323ic333'
    const message = 'I vote yes'
    // get the first group from the file
    const groups = JSON.parse(
        await remix.call('fileManager', 'readFile', './build/groups.json'),
    )

    // create idendity from the first member of the group
    const identities = JSON.parse(
        await remix.call('fileManager', 'readFile', './build/identities.json'),
    )
    console.log('using identity... ')
    console.log(identities[0].commitment)
    const identity = new Identity(identities[0].data)

    const signal = utils.formatBytes32String(message)
    const externalNullifier = utils.formatBytes32String(topic)

    // USE ZK TRUSTED SETUP 

    const r1cs = "https://ipfs-cluster.ethdevops.io/ipfs/QmbMk4ksBYLQzJ6TiZfzaALF8W11xvB8Wz6a2GrG9oDrXW";
    const wasm = "https://ipfs-cluster.ethdevops.io/ipfs/QmUbpEvHHKaHEqYLjhn93S8rEsUGeqiTYgRjGPk7g8tBbz";     
     
    const zkey_final = {
      type: "mem",
      data: new Uint8Array(JSON.parse(await remix.call('fileManager', 'readFile', './zk/build/zk_setup.txt')))
    }
    const wtns = { type: "mem" };   

    const vKey = JSON.parse(await remix.call('fileManager', 'readFile', './zk/build/verification_key.json'))
  
    // build list of identity commitments
    const identityCommitments = groups[0].members

    console.log('new incremental merkle tree')
    
    let tree
    try {
      tree = new IncrementalMerkleTree(poseidon, 20, BigInt(0), 2, identityCommitments) // Binary tree.
    } catch (e) {
      console.error(e.message)
      return
    }



    let proof1 = tree.createProof(0)

    console.log('prepare signals')
    
    const signals = {
            identityTrapdoor: identity.trapdoor,
            identityNullifier: identity.nullifier,
            treePathIndices: proof1.pathIndices,
            treeSiblings: proof1.siblings,
            externalNullifier: externalNullifier,
            signalHash: signal
        }
    
    console.log('calculate')
    await snarkjs.wtns.calculate(signals, wasm, wtns);
    
    console.log('check')
    await snarkjs.wtns.check(r1cs, wtns, logger);
    

    console.log('prove')
    const { proof, publicSignals } = await snarkjs.groth16.prove(zkey_final, wtns);

    console.log(proof, publicSignals)
    
    const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    console.log('zk proof validity', verified);
    proof1.root.toString() === publicSignals[0] ? console.log('merkle proof valid') : console.log('merkle proof invalid')
    
  } catch (e) {
    console.error(e.message)
  }
})()