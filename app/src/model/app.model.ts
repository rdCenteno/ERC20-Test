import { Web3Service } from "../services/web3.service";


export interface IProps {
}

export interface IState {
    users: Map<string, User>;
    usersId: Array<string>;
    contract: any;
    owner: string;
    contractAddress: string;
    userSelected: string;
    balance: number;
    isTranferAvailable: boolean,
    sender: string,
    recipient: string,
    amount: number,
    web3Service: Web3Service
}

export interface User {
    account: any;
    balance: number;
}