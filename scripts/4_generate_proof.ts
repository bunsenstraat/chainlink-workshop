import { createProofForIdendity } from './helpers/createProofForIdendity'
import { SemaphoreProof } from './types/types'
;(async () => {
    try {
        const proof: SemaphoreProof = await createProofForIdendity('hackegroup' + Date.now(), 'QmcuCKyokk9Z6f65ADAADNiS2R2xCjfRkv7mYBSWDwtA7M', true, null, null, null, 1)
    } catch (e) {
        console.log(e.message)
    }
})()
