import "./Proposal.css";

export default function Proposal({ web3, state, proposal }) {
    return (
        <div className="proposal">
            <div className="title">
                <div
                    className={`state-${parseInt(
                        web3.utils.fromWei(proposal.state, "wei")
                    )}`}
                >
                    {state[parseInt(web3.utils.fromWei(proposal.state, "wei"))]}
                </div>
                {proposal.title}
            </div>
            <div>{proposal.text}</div>
            <div>{parseInt(web3.utils.fromWei(proposal.votes, "wei"))}</div>
        </div>
    );
}
