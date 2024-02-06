// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./DAO.sol";

contract Factory {
    DAO[] public DAOs;
    string[] public titles;

    // 내 조직을 구성하기 위한 컨트랙트 배포
    function createContract(string memory _title) public {
        DAO newDAO = new DAO(msg.sender);
        DAOs.push(newDAO);
        titles.push(_title);
    }

    function getContracts() public view returns (DAO[] memory) {
        return DAOs;
    }

    function getTitles() public view returns (string[] memory) {
        return titles;
    }
}