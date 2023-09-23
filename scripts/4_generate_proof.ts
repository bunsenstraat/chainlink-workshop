import { createProofForIdendity } from './helpers/createProofForIdendity'
import { SemaphoreProof } from './types/types'
import { ethers } from 'ethers'
import { BigNumberToSignal } from './helpers/convertsignal'
;(async () => {
    try {
        const n = ethers.BigNumber.from(ethers.utils.randomBytes(32))
        const cid = BigNumberToSignal(n)
        const proof: SemaphoreProof = await createProofForIdendity(cid, '0', true)
    } catch (e) {
        console.log(e.message)
    }
})()
