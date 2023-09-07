import { ethers, BigNumber } from 'ethers'
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree"
import { poseidon } from "circomlibjs" // v0.0.8
const snarkjs = require('snarkjs');

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
    const r1cs = "http://127.0.0.1:8081/ipfs/QmbMk4ksBYLQzJ6TiZfzaALF8W11xvB8Wz6a2GrG9oDrXW";
    const wasm = "http://127.0.0.1:8081/ipfs/QmUbpEvHHKaHEqYLjhn93S8rEsUGeqiTYgRjGPk7g8tBbz";     
     
    const zkey_final = {
      type: "mem",
      data: new Uint8Array(JSON.parse(await remix.call('fileManager', 'readFile', './zk/build/zk_setup.txt')))
    }
    const wtns = { type: "mem" };   

    const vKey = JSON.parse(await remix.call('fileManager', 'readFile', './zk/build/verification_key.json'))
  
    // build list of identity commitments
    const secrets = []
    const identityCommitments = []
    for (let k = 0; k < 10; k++) {      
      const identityTrapdoor = BigInt(ethers.utils.hexlify(ethers.utils.randomBytes(32)))
      const identityNullifier = BigInt(ethers.utils.hexlify(ethers.utils.randomBytes(32)))
      secrets.push({identityTrapdoor, identityNullifier})
  
      const secret = poseidon([identityNullifier, identityTrapdoor])
      const identityCommitment = poseidon([secret])
      identityCommitments.push(identityCommitment)
    }
    console.log('incremental tree')
    
    let tree
    try {
      tree = new IncrementalMerkleTree(poseidon, 20, BigInt(0), 2, identityCommitments) // Binary tree.
    } catch (e) {
      console.error(e.message)
      return
    }

    let proof1 = tree.createProof(5)

    // test unknown commitment
    const identityTrapdoor2 = BigInt(ethers.utils.hexlify(ethers.utils.randomBytes(32)))
    const identityNullifier2 = BigInt(ethers.utils.hexlify(ethers.utils.randomBytes(32)))

    console.log('prepare signals')
    
    const signals = {
            identityTrapdoor: identityTrapdoor2, // secrets[5].identityTrapdoor,
            identityNullifier: identityNullifier2, // secrets[5].identityNullifier,
            treePathIndices: proof1.pathIndices,
            treeSiblings: proof1.siblings,
            externalNullifier: hash(42),
            signalHash: hash(ethers.utils.formatBytes32String("Hello World"))
        }
    
    console.log('calculate')
    await snarkjs.wtns.calculate(signals, wasm, wtns);
    
    console.log('check')
    await snarkjs.wtns.check(r1cs, wtns, logger);
    

    console.log('prove')
    const { proof, publicSignals } = await snarkjs.groth16.prove(zkey_final, wtns);
    
    const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    console.log('zk proof validity', verified);
    proof1.root.toString() === publicSignals[0] ? console.log('merkle proof valid') : console.log('merkle proof invalid')
    
  } catch (e) {
    console.error(e.message)
  }
})()