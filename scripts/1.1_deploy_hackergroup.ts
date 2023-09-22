import { ethers } from 'ethers'
import { deploy } from './helpers/deploy'
import { ISemaphoreDeploymentData } from './types/types'
import { CompilationResult, SourceWithTarget } from '@remixproject/plugin-api'
;(async () => {
    try {
        remix.off('solidity', 'compilationFinished')
        remix.on('solidity', 'compilationFinished', async (fileName: string, source: any, languageVersion: string, data: any) => {
            console.log('compiled ' + fileName)
        })

        console.log('compiling')

        await remix.call('solidity', 'compile' as any, 'contracts/hackergroup.sol')

        const semaphore_deployment = await remix.call('fileManager', 'readFile', 'build/semaphore_deployment.json')
        const semaphore_deployment_data: ISemaphoreDeploymentData = JSON.parse(semaphore_deployment)

        setTimeout(async () => {
            deploy('HackerGroup', [semaphore_deployment_data.semaphoreAddress])
        }, 2000)
    } catch (e) {
        console.error(e.message)
    }
})()
