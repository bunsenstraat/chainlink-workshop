import { Identity } from "@semaphore-protocol/identity"

const identities = [];


(async () => {
  try {
    for(let i=0; i<=10; i++){ 
        const identity = new Identity()
        const { trapdoor, nullifier, commitment } = identity
        identities.push({
            trapdoor: trapdoor.toString(),
            nullifier: nullifier.toString(),
            commitment: commitment.toString()
        })
    }
    await remix.call('fileManager', 'setFile', './zk/build/identities.json', JSON.stringify([identities]) )
  } catch (e) {
    console.error(e.message)
  }
})()