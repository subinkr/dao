import { useEffect, useRef, useState } from "react";
import "./DAO.css";
import DAOsol from "./contracts/artifacts/DAO.json";
import Proposal from "./Proposal";

export default function DAO({
    title,
    web3,
    daoContract,
    setDaoContract,
    wallet,
}) {
    const propTitleRef = useRef();
    const propTextRef = useRef();
    const [contract, setContract] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [owner, setOwner] = useState(null);
    const [member, setMember] = useState(null);
    const [members, setMembers] = useState(null);
    const [waitJoin, setWaitJoin] = useState(null);
    const [requestJoins, setRequestJoins] = useState([]);
    const state = ["승인 대기중", "투표중", "투표 종료"];

    useEffect(() => {
        const newContract = new web3.eth.Contract(DAOsol.abi, daoContract);
        setContract(newContract);
    }, []);

    useEffect(() => {
        if (contract) {
            runProposal();
        }
    }, [contract]);

    useEffect(() => {
        if (contract) {
            if (!member) {
                runWaitJoin();
            } else if (wallet === owner) {
                runRequestJoins();
            }
        }
    }, [member]);

    const runWaitJoin = async () => {
        const newWaitJoin = await contract.methods
            .waitJoin()
            .call({ from: wallet });
        setWaitJoin(newWaitJoin);
    };

    const runRequestJoins = async () => {
        const newRequestJoins = await contract.methods
            .getRequestJoins()
            .call({ from: wallet });
        setRequestJoins(newRequestJoins);
    };

    const runProposal = async () => {
        const newProposals = await contract.methods.getProposals().call();
        const newMember = await contract.methods
            .getMember()
            .call({ from: wallet });
        const newMembers = await contract.methods.getMembers().call();
        const newOwner = await contract.methods.owner().call();
        setProposals(newProposals);
        setMember(newMember);
        setMembers(newMembers);
        setOwner(newOwner.toLowerCase());
    };

    const proposal = async () => {
        if (
            propTitleRef.current.value.length < 1 ||
            propTextRef.current.value.length < 1
        ) {
            return alert("제안 양식을 모두 채워주세요.");
        }
        await contract.methods
            .createProposal(
                propTitleRef.current.value,
                propTextRef.current.value
            )
            .send({ from: wallet });
        propTitleRef.current.value = "";
        propTextRef.current.value = "";
        runProposal();
    };

    const startVote = async (idx) => {
        await contract.methods.startVote(idx).send({ from: wallet });
    };

    const vote = async (idx) => {
        await contract.methods.vote(idx).send({ from: wallet });
    };

    const endVote = async (idx) => {
        await contract.methods.endVote(idx).send({ from: wallet });
    };

    const requestJoin = async () => {
        await contract.methods.requestJoin().send({ from: wallet });
    };

    const accept = async (idx) => {
        await contract.methods.setMembers(idx).send({ from: wallet });
        runRequestJoins();
    };

    if (!contract || member === null) return "loading";

    return (
        <div className="dao-area">
            <div>{title}에 오신 것을 환영합니다!</div>
            {wallet === owner &&
                requestJoins.map((address, idx) => (
                    <div key={address} className="request">
                        <div>{address}</div>
                        <button onClick={() => accept(idx)}>수락</button>
                    </div>
                ))}
            {member ? (
                <>
                    <div className="propose">
                        <input ref={propTitleRef} placeholder="제안 제목" />
                        <input ref={propTextRef} placeholder="제안 내용" />
                        <button onClick={proposal}>제안하기</button>
                    </div>
                    <div className="proposals">
                        {proposals.map((proposal, idx) => {
                            return (
                                <div key={idx}>
                                    {parseInt(
                                        web3.utils.fromWei(
                                            proposal.state,
                                            "wei"
                                        )
                                    ) === 0 && owner === wallet ? (
                                        <>
                                            <Proposal
                                                web3={web3}
                                                state={state}
                                                proposal={proposal}
                                            />
                                            <button
                                                className="proposal-button"
                                                onClick={() => startVote(idx)}
                                            >
                                                투표 개시
                                            </button>
                                        </>
                                    ) : parseInt(
                                          web3.utils.fromWei(
                                              proposal.state,
                                              "wei"
                                          )
                                      ) >= 1 ? (
                                        <>
                                            <Proposal
                                                web3={web3}
                                                state={state}
                                                proposal={proposal}
                                            />
                                            {parseInt(
                                                web3.utils.fromWei(
                                                    proposal.state,
                                                    "wei"
                                                )
                                            ) === 1 ? (
                                                <>
                                                    {wallet === owner &&
                                                    parseInt(
                                                        web3.utils.fromWei(
                                                            proposal.votes,
                                                            "wei"
                                                        )
                                                    ) >=
                                                        members.length / 2 ? (
                                                        <div className="button-wrapper">
                                                            <button
                                                                className="left-proposal-button"
                                                                onClick={() =>
                                                                    vote(idx)
                                                                }
                                                            >
                                                                투표하기
                                                            </button>
                                                            <button
                                                                className="right-proposal-button"
                                                                onClick={() =>
                                                                    endVote(idx)
                                                                }
                                                            >
                                                                투표 종료
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="proposal-button"
                                                            onClick={() =>
                                                                vote(idx)
                                                            }
                                                        >
                                                            투표하기
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="end-button">
                                                    투표종료
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : waitJoin ? (
                <div>승인 대기 중</div>
            ) : (
                <button onClick={requestJoin}>참가신청</button>
            )}
            <button onClick={() => setDaoContract(false)}>닫기</button>
        </div>
    );
}
