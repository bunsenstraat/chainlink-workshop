import { ethers, utils } from 'ethers'
import { BigNumberToSignal } from '../helpers/convertsignal'
;(async () => {

    const n = ethers.BigNumber.from(ethers.utils.randomBytes(32))
    const cid = BigNumberToSignal(n)
})()