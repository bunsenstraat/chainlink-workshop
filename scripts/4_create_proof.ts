import { Group } from "@semaphore-protocol/group"
;(async () => {

    // get the first group from the file
    const groups = JSON.parse(await remix.call('fileManager', 'readFile', './build/groups.json'))

    const group = new Group(1)

    console.log(JSON.stringify(group))

    // query the contract to get the group

    // get the first member



})()