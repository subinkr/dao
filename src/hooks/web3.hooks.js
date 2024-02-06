import { useEffect, useState } from "react";
import Factory from "../contracts/artifacts/Factory.json";
import Web3 from "web3";

export default function useWeb3() {
    const [wallet, setWallet] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);

    useEffect(() => {
        const newWeb3 = new Web3(window.ethereum);
        const newContract = new newWeb3.eth.Contract(
            Factory.abi,
            "0xB8cD5643C644cAE6445b36e00a14C72df1eaefa1"
        );

        setWeb3(newWeb3);
        setContract(newContract);
        runWallet();
    }, []);

    const runWallet = async () => {
        const wallets = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        setWallet(wallets[0]);
    };

    return [wallet, web3, contract];
}
