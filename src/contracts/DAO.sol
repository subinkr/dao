// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract DAO {
    // 생태계에 참여해서 거버넌스 토큰 취득
    // 조직을 구성한 컨트랙트 배포자가 멤버를 추가
    address public owner;
    // 멤버 상태변수
    address[] private members;
    mapping(address => bool) private member;
    address[] private requestJoins;
    uint private requestJoinsCount;
    mapping(address => bool) private requestJoinMap;
    // 참여한 멤버의 인원 수
    uint private memberCount;
    // 이 조직에서 제안한 제안을 담을 상태변수
    Proposal[] public proposals;
    // 제안에 멤버들이 참여했는지
    mapping(address => mapping(uint => bool)) private voted;

    constructor(address _owner) {
        // factory contract에서 조직을 만든 사람이 조직의 주인
        owner = _owner;
        // 조직 대표도 멤버로 추가
        member[_owner] = true;
        memberCount++;
    }

    enum State {
        loading,
        start,
        end
    }

    // 제안 객체
    struct Proposal {
        string title; // 제목
        string text; // 내용
        uint votes; // 투표 수
        State state; // 제안이 실행중인지
        bool execute; // 승인 및 거부
    }

    modifier onlyMember() {
        require(member[msg.sender], "Not member");
        _;
    }

    modifier onlyNotMember() {
        require(!member[msg.sender], "Already Joined");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier alreadyVote(uint _index) {
        require(!voted[msg.sender][_index]);
        _;
    }

    function getProposals() public view returns (Proposal[] memory) {
        return proposals;
    }

    function getMembers() public view returns (address[] memory) {
        return members;
    }

    function getMember() public view returns (bool) {
        return member[msg.sender];
    }

    function requestJoin() public onlyNotMember {
        requestJoins.push(msg.sender);
        requestJoinsCount++;
        requestJoinMap[msg.sender] = true;
    }

    function waitJoin() public view onlyNotMember returns(bool) {
        return requestJoinMap[msg.sender];
    }

    function getRequestJoins() public view onlyOwner returns (address[] memory) {
        return requestJoins;
    }

    function setMembers(uint _index) public onlyOwner {
        // 멤버 추가
        member[requestJoins[_index]] = true;
        // 인원 증가
        memberCount++;
        // 가입 요청자 수정
        requestJoins[_index] = requestJoins[requestJoinsCount - 1];
        requestJoinsCount--;
        requestJoins.pop();
        
    }

    // 제안
    // 제안자, 내용
    function createProposal(string memory _title, string memory _text) public onlyMember {
        proposals.push(Proposal(_title, _text, 0, State.loading, false));
    }

    // 투표
    // 어떤 제안을 투표할지
    function vote(uint _index) public onlyMember alreadyVote(_index) {
        // 투표 대상 제안 로드
        Proposal storage _proposal = proposals[_index];
        require(_proposal.state == State.start);
        // 재투표 불가능
        voted[msg.sender][_index] = true;
        // 투표 진행
        proposals[_index].votes++;
    }

    // 조직 대표가 제안을 확인하고 투표를 진행 상태로 전환
    function startVote(uint _index) public onlyOwner {
        proposals[_index].state = State.start;
    }

    // 조직 대표가 투표 종료
    function endVote(uint _index) public onlyOwner {
        Proposal storage _proposal = proposals[_index];
        require(_proposal.state == State.start);
        require(_proposal.votes > memberCount / 2);
        // 고민하는 사람이나 제안이 마음에 안들어서 투표를 안하면
        // 제안 거부
        proposals[_index].execute = true;
        proposals[_index].state = State.end;
    }
}