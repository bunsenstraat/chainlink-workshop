import { createProofForIdendity } from './helpers/createProofForIdendity'
import { SemaphoreProof } from './types/types'
import { ethers } from 'ethers'
import { BigNumberToSignal } from './helpers/convertsignal'
;(async () => {
    try {
        const cid =   await remix.call('fileManager', 'readFile', './build/cid_submit.txt')
        console.log('cid', cid)
        const proof: SemaphoreProof = await createProofForIdendity(cid, '1', true, '/data/proof_approve.json')
      
    } catch (e) {
        console.log(e.message)
    }
})()
