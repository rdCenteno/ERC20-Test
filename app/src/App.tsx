import React from "react";
import "./App.css";
import { AppConfig } from "./app.config";
import { default as Web3 } from "web3";
import axios from "axios";
import Tx from "ethereumjs-tx";

const USER_NAME = "USER";
const MULTIPLIER = 1000000000000000000;

interface IProps {
}

interface IState {
    users: Map<string, User>;
    usersId: Array<string>;
    web3: Web3;
    contract: any;
    owner: string;
    contractAddress: string;
    userSelected: string;
    balance: number;
}

interface User {
    account: any;
    balance: number;
}

class App extends React.Component<IProps, IState> {

    constructor(props: any) {
        super(props);
        this.state = {
            users: new Map<string, User>(),
            usersId: new Array<string>(),
            web3: new Web3(),
            contract: "",
            owner: "",
            contractAddress: "",
            userSelected: "USER1",
            balance: 0
        };
        this.createUser = this.createUser.bind(this);
        this.addBalance = this.addBalance.bind(this);
        this.updateUserBalance = this.updateUserBalance.bind(this);
        this.transfer = this.transfer.bind(this);
        this.addBalanceEvent = this.addBalanceEvent.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.handleAddChange = this.handleAddChange.bind(this);
    }

    componentDidMount(): Promise<void> {
        const web3 = this.getWeb3();
        let contract: any;
        let contractAddress: string;
        return axios({ url: AppConfig.CONTRACT_NAME, method: "GET", responseType: "json" })
            .then(response => {
                const contractAbi = response.data.abi;
                contractAddress = response.data.networks[AppConfig.NET_ID].address;
                contract = new web3.eth.Contract(contractAbi, contractAddress);
                console.log("The contract instance is initilized", contract);
                return web3.eth.getAccounts();
            }).then(accounts => {
                const owner = accounts[0];
                this.setState({ contract: contract, owner: owner, contractAddress: contractAddress, web3: web3 });
            })
    }

    createUser() {
        const web3 = this.state.web3;
        let usersId = this.state.usersId;
        let users = this.state.users;
        const userId = usersId.length + 1;
        const newUserId = USER_NAME + userId;
        console.log("Creating new user", newUserId);
        const newAccount = web3.eth.accounts.create(web3.utils.randomHex(32));
        const newUser: User = { account: newAccount, balance: 0 };
        console.log("The new user address is: ", newAccount.address);
        users.set(newUserId, newUser);
        usersId.push(newUserId)
        this.setState({ users: users, usersId: usersId });
    }

    addBalance(userId: string, balance: number): Promise<void> {
        const contract = this.state.contract;
        const web3 = this.state.web3;
        const userAddress = this.state.users.get(userId)!.account.address;
        return web3.eth.getAccounts().then(accounts => {
            const owner = accounts[0];
            return contract.methods.addBalanceToUser(userAddress, balance).send({ from: owner });
        }).then(() => {
            return this.updateUserBalance(userId);
        }).catch((error: Error) => {
            console.log("Error adding balance: ", error);
        })
    }

    transfer(sender: string, recipient: string, amount: number) {
        const web3 = this.state.web3;
        const contract = this.state.contract;
        const recipientAddress = this.state.users.get(recipient)!.account.address;
        const weiAmount = web3.utils.toWei(amount.toString(), "ether");
        const encodeAbi = contract.methods.transfer(recipientAddress, weiAmount).encodeABI();
        return this.singTx(sender, encodeAbi)
            .then(() => {
                return this.updateUserBalance(sender);
            }).then(() => {
                return this.updateUserBalance(sender);
            }).catch((error: Error) => {
                console.log("Error in transfer: ", error);
            })

    }

    updateUserBalance(userId: string): Promise<void> {
        let users = this.state.users;
        let user = users.get(userId)!;
        const contract = this.state.contract;
        return contract.methods.balanceOf(user.account.address).call()
            .then((res: string) => {
                console.log("The initial value is ", userId);
                user.balance = parseInt(res) / MULTIPLIER;
                users.set(userId, user);
                this.setState({ users: users });
            }).catch((error: Error) => {
                console.log("Error in updating the user balance: ", error);
            });
    }

    handleSelectChange(event: any) {
        this.setState({ userSelected: event.target.value });
    }

    handleAddChange(event: any) {
        this.setState({ balance: event.target.value });
    }

    addBalanceEvent(event: any) {
        const user = this.state.userSelected;
        const balance = this.state.balance;
        if(user && balance > 0) {
            console.log("The user requested to add balance, ", user);
            this.addBalance(user, balance);
        }
    }

    getWeb3(): Web3 {
        return new Web3(AppConfig.URL_NODE);
    }

    singTx(userId: string, encodeAbi: string): Promise<any> {
        const web3 = this.state.web3;
        const user = this.state.users.get(userId)!.account;
        const contractAddress = this.state.contractAddress;
        return web3.eth.getTransactionCount(user.address, "pending")
            .then(nonceValue => {
                const nonce = "0x" + (nonceValue).toString(16);
                const rawtx = {
                    from: user.address,
                    nonce: nonce,
                    gasPrice: 0,
                    gasLimit: 6721975,
                    to: contractAddress,
                    data: encodeAbi
                };
                const tx = new Tx(rawtx);
                let priv = user.privateKey.substring(2);
                let privateKey = Buffer.from(priv, "hex");
                tx.sign(privateKey);

                let raw = "0x" + tx.serialize().toString("hex");
                return web3.eth.sendSignedTransaction(raw);
            }).then(transactionReceipt => {
                console.log("Transaction Receipt: ", transactionReceipt);
                return transactionReceipt;
            }).catch(e => {
                console.log("Error in sendTx: ", e);
                return null;
            });

    }

    render() {
        const users = this.state.usersId;
        const usersData = this.state.users;
        const numberOfUsers = users.length;

        return (
            <div className="app-container">

                <div className="main-container">

                    {numberOfUsers < 10 &&
                    <div className="button-container">
                        <button className="btn" onClick={this.createUser}>CREATE NEW USER</button>
                    </div>
                    }

                    {numberOfUsers > 0 &&
                    <div className="users-container">

                        <div className="list-container">
                            <h2>List of Users</h2>
                            <React.Fragment>
                                <ul>
                                    {users.map((userName: string) => {
                                        return <li key={userName}> {userName}: {usersData.get(userName)!.balance} </li>
                                    })}
                                </ul>
                            </React.Fragment>
                        </div>

                        <div className="balance-container">
                            <h2>ADD BALANCE TO USER</h2>
                            <div>
                                <label htmlFor="">Add Balance: </label>
                                <input type="number" min="0" name="balanceToAdd" value={this.state.balance} onChange={this.handleAddChange}/>
                            </div>
                            <div className="select-container">
                                <select value={this.state.userSelected} onChange={this.handleSelectChange} className="custom-select">
                                    {users.map((userName: string) => {
                                        return <option value={userName}> {userName} </option>
                                    })}
                                </select>
                            </div>
                            <button className="btn" onClick={this.addBalanceEvent}>ADD BALANCE</button>
                        </div>
                    </div>
                    
                    }




                </div>

            </div>
        );
    }
}

export default App;
