import React from "react";
import "./App.css";
import { AppConfig } from "./app.config";
import { default as Web3 } from "web3";

const USER_NAME = "USER";

class App extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            users: new Map<string, Account>(),
            usersId: new Array<string>()
        };
        this.createUser = this.createUser.bind(this);
    }

    createUser() {
        let usersId = this.state.usersId;
        let usersList = this.state.users;
        const userId = usersId.length + 1;
        const newUser = USER_NAME + userId;
        console.log("Creating new user", newUser);
        const web3 = new Web3(AppConfig.URL_NODE);
        const newAccount = web3.eth.accounts.create(web3.utils.randomHex(32));
        console.log("The new user address is: ", newAccount.address);
        usersList.set(newUser, newAccount);
        usersId.push(newUser)
        this.setState({ users: usersList, usersId: usersId });
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
