import { useEffect, useRef, useState } from "react";
import "./App.css";
import useWeb3 from "./hooks/web3.hooks";
import DAO from "./DAO";

function App() {
    const [wallet, web3, contract] = useWeb3();
    const [contracts, setContracts] = useState([]);
    const [titles, setTitles] = useState([]);
    const [title, setTitle] = useState("");
    const [daoContract, setDaoContract] = useState("");
    const inputRef = useRef();

    useEffect(() => {
        if (contract) {
            runContracts();
        }
    }, [contract]);

    const runContracts = async () => {
        const newContracts = await contract.methods.getContracts().call();
        const newTitles = await contract.methods.getTitles().call();
        setContracts(newContracts);
        setTitles(newTitles);
        console.log(newContracts);
        console.log(newTitles);
    };

    const createDAO = async () => {
        if (inputRef.current.value.length < 1) {
            return alert("DAO 이름을 입력해주세요.");
        }

        await contract.methods
            .createContract(inputRef.current.value)
            .send({ from: wallet });
        runContracts();
        inputRef.current.value = "";
    };

    return (
        <div className="App">
            {daoContract ? (
                <DAO
                    title={title}
                    daoContract={daoContract}
                    setDaoContract={setDaoContract}
                    web3={web3}
                    wallet={wallet}
                />
            ) : (
                <></>
            )}
            <input ref={inputRef} />
            <button onClick={createDAO}>DAO 생성</button>
            <div className="contracts">
                {titles.map((title, idx) => (
                    <button
                        key={`${title}-${idx}`}
                        onClick={() => {
                            setTitle(title);
                            setDaoContract(contracts[idx]);
                        }}
                    >
                        {title} 접속하기
                    </button>
                ))}
            </div>
        </div>
    );
}

export default App;
