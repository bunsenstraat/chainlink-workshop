import { createProofForIdendity } from './helpers/createProofForIdendity'
import { SemaphoreProof } from './types/types'
;(async () => {
    try {
        const proof: SemaphoreProof = await createProofForIdendity('QmcuCKyokk9Z6f65ADAADNiS2R2xCjfRkv7mYBSWDwtA7E', '0', true, null, null, null, 1)
    } catch (e) {
        console.log(e.message)
    }
})()
