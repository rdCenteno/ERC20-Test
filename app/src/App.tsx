import React from "react";
import "./App.css";
import { AppConfig } from "./app.config";
import { default as Web3 } from "web3";
import axios from "axios";

const USER_NAME = "USER";

class App extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            users: new Map<string, Account>(),
            usersId: new Array<string>(),
            contract: ""
        };
        this.createUser = this.createUser.bind(this);
    }

    createUser() {
        let usersId = this.state.usersId;
        let usersList = this.state.users;
        const userId = usersId.length + 1;
        const newUser = USER_NAME + userId;
        console.log("Creating new user", newUser);
        const web3 = this.getWeb3();
        const newAccount = web3.eth.accounts.create(web3.utils.randomHex(32));
        console.log("The new user address is: ", newAccount.address);
        usersList.set(newUser, newAccount);
        usersId.push(newUser)
        this.setState({ users: usersList, usersId: usersId });
    }

    componentDidMount(): Promise<void> {
        const web3 = this.getWeb3();
        return axios({ url: AppConfig.CONTRACT_NAME, method: "GET" ,responseType: "json"})
        .then(response => {
            const contractAbi = response.data.abi;
            const contractAddress = response.data.networks[AppConfig.NET_ID].address;
            const contract = new web3.eth.Contract(contractAbi, contractAddress);
            console.log("The contract instance is initilized", contract);
            this.setState({ contract: contract });
        });
    }

    getWeb3(): Web3 {
        return new Web3(AppConfig.URL_NODE);
    }



    render() {
        const users = this.state.usersId;

        const showList = users.length > 0;

        return (
            <div className="app-container">

                <div className="main-container">

                    <div className="button-container">
                        <button className="btn" onClick={this.createUser}>CREATE NEW USER</button>
                    </div>

                    {showList && <div className="list-container">
                        <h2>List of Users: </h2>
                        <React.Fragment>
                            <ul>
                                {users.map((userName: string) => {
                                    return <li key={userName}> {userName}</li>
                                })}
                            </ul>
                        </React.Fragment>
                    </div>}


                </div>

            </div>
        );
    }
}

export default App;
