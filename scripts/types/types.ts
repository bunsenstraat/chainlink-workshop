export interface ISemaphoreDeploymentData {
    semaphoreAddress: string,
    verifierAddress: string
}

export interface IGroup {
    group_id: number
    members: IGroupMember[]
}

export interface IGroupMember {
    commmitment: number
}