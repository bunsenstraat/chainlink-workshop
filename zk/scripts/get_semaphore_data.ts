import { SemaphoreSubgraph } from "@semaphore-protocol/data"



;(async () => {

    const semaphoreSubgraph = new SemaphoreSubgraph()
    const groupIds = await semaphoreSubgraph.getGroupIds()

    console.log(groupIds)

})()