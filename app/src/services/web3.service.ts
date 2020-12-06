import { default as Web3 } from "web3";
import { AppConfig } from "../app.config";
import Tx from "ethereumjs-tx";

export class Web3Service {

    public getWeb3(): Web3 {
        return new Web3(AppConfig.URL_NODE);
    }

    public getContractInstance(contractAbi: any, contractAddress: string): any {
        const web3 = this.getWeb3();
        return new web3.eth.Contract(contractAbi, contractAddress);
    }

    public createAccount(): any {
        const web3 = this.getWeb3();
        return web3.eth.accounts.create(web3.utils.randomHex(32));
    }

    public getOwner(): Promise<string> {
        const web3 = this.getWeb3();
        return web3.eth.getAccounts().then(accounts => accounts[0]);
    }

    public numberToWei(amount: number): string {
        const web3 = this.getWeb3();
        return web3.utils.toWei(amount.toString(), "ether");
    }

    public weiToNumber(amount: string): number {
        const web3 = this.getWeb3();
        const wei = web3.utils.fromWei(amount.toString(), "ether");
        return parseInt(wei);
    }

    public singTx(user: any, contractAddress: string, encodeAbi: string): Promise<any> {
        const web3 = this.getWeb3();
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

}