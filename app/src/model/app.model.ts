import { Web3Service } from "../services/web3.service";
import { default as Web3 } from "web3";


export interface IProps {
}

export interface IState {
    users: Map<string, User>;
    usersId: Array<string>;
    web3: Web3;
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