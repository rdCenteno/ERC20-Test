import React from "react";
import "./App.css";
import { AppConfig } from "./app.config";
import axios from "axios";
import { Web3Service } from "./services/web3.service";
import { IProps, IState, User} from "./model/app.model";

const USER_NAME = "USER";

class App extends React.Component<IProps, IState> {

    constructor(props: any) {
        super(props);
        this.state = {
            users: new Map<string, User>(),
            usersId: new Array<string>(),
            contract: "",
            owner: "",
            contractAddress: "",
            userSelected: "USER1",
            balance: 0,
            isTranferAvailable: false,
            sender: "USER1",
            recipient: "USER1",
            amount: 0,
            web3Service: new Web3Service()
        };

        this.createUser = this.createUser.bind(this);
        this.addBalance = this.addBalance.bind(this);
        this.updateUserBalance = this.updateUserBalance.bind(this);
        this.transfer = this.transfer.bind(this);
        this.addBalanceEvent = this.addBalanceEvent.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.handleAddChange = this.handleAddChange.bind(this);
        this.handleSenderChange = this.handleSenderChange.bind(this);
        this.handleRecipientChange = this.handleRecipientChange.bind(this);
        this.handleAmountChange = this.handleAmountChange.bind(this);
        this.transferEvent = this.transferEvent.bind(this);
    }

    componentDidMount(): Promise<void> {
        const web3Service = new Web3Service();
        let contract: any;
        let contractAddress: string;
        return axios({ url: AppConfig.CONTRACT_NAME, method: "GET", responseType: "json" })
            .then(response => {
                const contractAbi = response.data.abi;
                contractAddress = response.data.networks[AppConfig.NET_ID].address;
                contract = web3Service.getContractInstance(contractAbi, contractAddress);
                console.log("The contract instance is initilized", contract);
                return web3Service.getOwner();
            }).then((ownerAddress: string) => {
                this.setState({ contract: contract, owner: ownerAddress, contractAddress: contractAddress, web3Service: web3Service });
            })
    }

    createUser() {
        const web3Service = this.state.web3Service;
        let usersId = this.state.usersId;
        let users = this.state.users;
        const userId = usersId.length + 1;
        const newUserId = USER_NAME + userId;
        console.log("Creating new user", newUserId);
        const newAccount = web3Service.createAccount();
        const newUser: User = { account: newAccount, balance: 0 };
        console.log("The new user address is: ", newAccount.address);
        users.set(newUserId, newUser);
        usersId.push(newUserId)
        this.setState({ users: users, usersId: usersId });
    }

    addBalance(userId: string, balance: number): Promise<void> {
        const contract = this.state.contract;
        const web3Service = this.state.web3Service;
        const userAddress = this.state.users.get(userId)!.account.address;
        return web3Service.getOwner().then((ownerAddress: string) => {
            const owner = ownerAddress;
            return contract.methods.addBalanceToUser(userAddress, balance).send({ from: owner });
        }).then(() => {
            return this.updateUserBalance(userId);
        }).catch((error: Error) => {
            console.log("Error adding balance: ", error);
        })
    }

    transfer(sender: string, recipient: string, amount: number) {
        const web3Service = this.state.web3Service;
        const contract = this.state.contract;
        const recipientAddress = this.state.users.get(recipient)!.account.address;
        const encodeAbi = contract.methods.transfer(recipientAddress, web3Service.numberToWei(amount)).encodeABI();
        return web3Service.singTx(this.state.users.get(sender)!.account, this.state.contractAddress, encodeAbi)
            .then(() => {
                return this.updateUserBalance(sender);
            }).then(() => {
                return this.updateUserBalance(recipient);
            }).catch((error: Error) => {
                console.log("Error in transfer: ", error);
            })
    }

    updateUserBalance(userId: string): Promise<void> {
        const web3Service = this.state.web3Service;
        let users = this.state.users;
        let user = users.get(userId)!;
        const contract = this.state.contract;
        return contract.methods.balanceOf(user.account.address).call()
            .then((res: string) => {
                console.log("Updating user balance: ", userId);
                user.balance = web3Service.weiToNumber(res);
                users.set(userId, user);
                this.setState({ users: users, isTranferAvailable: true });
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

    handleSenderChange(event: any) {
        this.setState({ sender: event.target.value });
    }

    handleRecipientChange(event: any) {
        this.setState({ recipient: event.target.value });
    }

    handleAmountChange(event: any) {
        this.setState({ amount: event.target.value });
    }

    addBalanceEvent(event: any) {
        const user = this.state.userSelected;
        const balance = this.state.balance;
        if(user && balance > 0) {
            console.log("The user requested to add balance, ", user);
            this.addBalance(user, balance);
        }
    }

    transferEvent(event: any) {
        const sender = this.state.sender;
        const recipient = this.state.recipient;
        const amountToTransfer = this.state.amount;
        if(sender && recipient && amountToTransfer > 0) {
            if(this.state.users.get(sender)!.balance >= amountToTransfer) {
                this.transfer(sender, recipient, amountToTransfer);
            } else {
                console.log("The requested amount to trasnfer is bigger than the user owns");
            }
        } else {
            console.log("Not able to make the transfer, missing");
        }
    }

    render() {
        const users = this.state.usersId;
        const usersData = this.state.users;
        const numberOfUsers = users.length;
        const isTranferAvailable = this.state.isTranferAvailable;

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

                    {isTranferAvailable &&
                        <div>
                            <h1>TRANSFER</h1>

                            <h2>Sender</h2>
                            <div className="select-container">
                                <select onChange={this.handleSenderChange} className="custom-select">
                                    {users.map((userName: string) => {
                                        return <option value={userName}> {userName} </option>
                                    })}
                                </select>
                            </div>

                            <h2>Recipient</h2>
                            <div className="select-container">
                                <select onChange={this.handleRecipientChange} className="custom-select">
                                    {users.map((userName: string) => {
                                        return <option value={userName}> {userName} </option>
                                    })}
                                </select>
                            </div>

                            <div className="amount-container">
                                <label htmlFor="">Amount to transfer: </label>
                                <input type="number" min="0" name="amount" value={this.state.amount} onChange={this.handleAmountChange}/>
                            </div>

                            <button className="btn" onClick={this.transferEvent}>TRANSFER</button>


                        </div>
                    }



                </div>

            </div>
        );
    }
}

export default App;
